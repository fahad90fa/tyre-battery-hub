import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { printArea } from "@/lib/print";
import { money, shortDate, localToday, localDateOf } from "@/lib/format";
import { methodLabel } from "@/lib/payments";
import { sumMoney } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Lock, Printer, TrendingUp, TrendingDown, Wallet, HandCoins, Banknote, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/closing")({
  component: DailyClosing,
});

function DailyClosing() {
  const [date, setDate] = useState(() => localToday());
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return localDateOf(d);
  }, []);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [ledgerPays, setLedgerPays] = useState<any[]>([]);
  const [merchantPays, setMerchantPays] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [closing, setClosing] = useState<any>(null);
  const [invDay, setInvDay] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [cashInHand, setCashInHand] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    // Only the chosen day's invoices — fetching the whole table risked the
    // API row cap silently dropping today's sales once history grew.
    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T00:00:00`);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Sales come from INVOICES (the one record every sale creates) so the
    // figures can never be blank because a secondary table missed a row.
    const [invR, ipR, lpR, mpR, exR, clR, histR] = await Promise.all([
      // Cancelled (returned) invoices are no longer sales.
      supabase.from("invoices").select("id, invoice_id, customer_name, total_amount, created_at, client_id")
        .gte("created_at", dayStart.toISOString()).lt("created_at", dayEnd.toISOString())
        .neq("payment_status", "cancelled"),
      supabase.from("invoice_payments").select("*, invoices(invoice_id, customer_name, created_at, client_id)").eq("payment_date", date),
      supabase.from("client_ledger").select("*, clients(name)").eq("entry_type", "payment").eq("entry_date", date),
      supabase.from("merchant_ledger").select("*, merchants(name)").eq("entry_type", "payment").eq("entry_date", date),
      supabase.from("expenses").select("*").eq("date_of_expense", date),
      supabase.from("daily_closings").select("*").eq("closing_date", date).maybeSingle(),
      supabase.from("daily_closings").select("*").order("closing_date", { ascending: false }).limit(14),
    ]);
    // A failed query must never read as "Rs 0" — say what broke instead.
    setLoadError([invR.error, ipR.error, lpR.error, mpR.error, exR.error, clR.error, histR.error]
      .filter(Boolean).map((e) => e!.message).join(" · "));
    const inv = invR.data, lp = lpR.data, cl = clR.data;
    setInvoices(inv ?? []);
    setPayments(ipR.data ?? []); setLedgerPays(lp ?? []); setMerchantPays(mpR.data ?? []); setExpenses(exR.data ?? []);
    setClosing(cl ?? null); setHistory(histR.data ?? []);
    setCashInHand(cl?.cash_in_hand != null ? String(cl.cash_in_hand) : "");
    setNotes(cl?.notes ?? "");

    // Which day each referenced invoice was raised — tells a same-day sale
    // payment apart from the recovery of an older bill.
    const refs = [...new Set((lp ?? [])
      .map((l: any) => l.reference)
      .filter((r: any) => typeof r === "string" && r.startsWith("INV")))] as string[];
    if (refs.length === 0) { setInvDay({}); return; }
    const { data: refInv, error: refErr } = await supabase.from("invoices").select("invoice_id, created_at").in("invoice_id", refs);
    // Without these dates every ledger payment would read as a recovery —
    // append to the banner (functional update: the batch errors are queued).
    if (refErr) setLoadError((prev) => [prev, `Invoice dates for the recovery check: ${refErr.message}`].filter(Boolean).join(" · "));
    setInvDay(Object.fromEntries((refInv ?? []).map((i) => [i.invoice_id, localDateOf(i.created_at)])));
  };

  useEffect(() => { load(); }, [date]);

  const t = useMemo(() => {
    // --- SALES (what was billed today) ---
    const netSales = sumMoney(invoices.map((i) => i.total_amount));

    // --- MONEY IN (one row per real payment, never counted twice) ---
    // Walk-in bills are settled through invoice_payments; account customers
    // are settled through their ledger (their invoice_payments rows are only
    // allocation records), so each rupee is counted exactly once.
    const walkInPays = payments.filter((p) => !p.invoices?.client_id);
    const cashIn = [
      ...walkInPays.map((p) => ({
        amount: Number(p.amount), method: p.method as string,
        who: p.invoices?.customer_name ?? "Walk-in", ref: p.invoices?.invoice_id as string | undefined,
        // A recovery is a payment against a bill raised on an EARLIER day.
        isRecovery: localDateOf(p.invoices?.created_at) !== date,
      })),
      ...ledgerPays.map((l) => {
        const ref = typeof l.reference === "string" && l.reference.startsWith("INV") ? l.reference : null;
        const day = ref ? invDay[ref] : undefined;
        return {
          amount: Number(l.amount), method: (l.method ?? "cash") as string,
          who: l.clients?.name ?? "Customer", ref: l.reference as string | undefined,
          isRecovery: !(day && day === date),
        };
      }),
    ];
    const totalCashIn = sumMoney(cashIn.map((r) => r.amount));
    const recoveryRows = cashIn.filter((r) => r.isRecovery);
    const recoveries = sumMoney(recoveryRows.map((r) => r.amount));
    // Cash sales = collected today against today's bills; the rest is credit.
    const cashSales = Math.min(netSales, totalCashIn - recoveries);
    const creditSales = Math.max(0, netSales - cashSales);

    const byMethod: Record<string, number> = {};
    cashIn.forEach((r) => { byMethod[r.method] = sumMoney([byMethod[r.method] ?? 0, r.amount]); });
    // Recoveries split the same way, so a cash recovery lands in the day's
    // cash and a bank-transfer recovery under bank — never mixed together.
    const recByMethod: Record<string, number> = {};
    recoveryRows.forEach((r) => { recByMethod[r.method] = sumMoney([recByMethod[r.method] ?? 0, r.amount]); });
    const totalExpenses = sumMoney(expenses.map((e) => e.amount));
    const merchantOut = sumMoney(merchantPays.map((m) => m.amount));
    return {
      netSales, cashSales, creditSales, recoveries, totalCashIn,
      totalExpenses, merchantOut,
      netCash: sumMoney([totalCashIn, -totalExpenses, -merchantOut]),
      byMethod, recByMethod, allIn: cashIn, recoveryRows,
    };
  }, [invoices, payments, ledgerPays, merchantPays, expenses, invDay, date]);

  const closeDay = async () => {
    setSaving(true);
    try {
      const payload = {
        closing_date: date,
        net_sales: t.netSales, cash_sales: t.cashSales, credit_sales: t.creditSales,
        recoveries: t.recoveries, total_cash_in: t.totalCashIn,
        merchant_payments: t.merchantOut,
        expenses: t.totalExpenses, net_cash: t.netCash,
        cash_in_hand: cashInHand === "" ? null : Number(cashInHand),
        notes: notes || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = closing
        ? await supabase.from("daily_closings").update(payload).eq("id", closing.id)
        : await supabase.from("daily_closings").insert(payload);
      if (error) return toast.error(error.message);
      toast.success(closing ? `Closing for ${shortDate(date)} updated` : `Day ${shortDate(date)} closed & saved`);
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Daily Closing">
      {/* The date is fully manual: close today, yesterday, or any date —
          every figure on the page follows whatever is picked here. */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap print:hidden">
        <div className="flex items-end gap-2 flex-wrap">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Closing date — pick any day</Label>
            <Input type="date" value={date} max={localToday()} onChange={(e) => e.target.value && setDate(e.target.value)} className="w-44" />
          </div>
          <Button variant={date === yesterday ? "default" : "outline"} size="sm" onClick={() => setDate(yesterday)}>Yesterday</Button>
          <Button variant={date === localToday() ? "default" : "outline"} size="sm" onClick={() => setDate(localToday())}>Today</Button>
        </div>
        <div className="flex items-center gap-2">
          {closing && <span className="text-xs rounded-full bg-green-600/10 text-green-600 px-3 py-1 font-semibold">Closed ✓</span>}
          <Button variant="outline" onClick={() => printArea()}><Printer className="h-4 w-4 mr-2" /> Print report</Button>
        </div>
      </div>
      {date !== localToday() && (
        <div className="mb-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm print:hidden">
          You are viewing and closing <b>{shortDate(date)}</b>, not today. All figures and the saved report belong to that date.
        </div>
      )}
      {loadError && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive print:hidden">
          Some figures could not be loaded, so the totals below may be incomplete: {loadError}
        </div>
      )}

      <div className="print-area space-y-4">
        <div className="hidden print:block text-center border-b-2 border-foreground pb-2">
          <div className="text-lg font-black">MT&B HOUSE — Daily Closing Report</div>
          <div className="text-sm">{shortDate(date)}</div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi icon={TrendingUp} label="Net sales" value={money(t.netSales)} />
          <Kpi icon={Banknote} label="Cash sales" value={money(t.cashSales)} green />
          <Kpi icon={CreditCard} label="Credit (udhar) sales" value={money(t.creditSales)} accent={t.creditSales > 0} />
          <Kpi icon={HandCoins} label="Recoveries (old udhar)" value={money(t.recoveries)} green />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Kpi icon={Wallet} label="Total amount in" value={money(t.totalCashIn)} green />
          <Kpi icon={TrendingDown} label="Merchant payments" value={money(t.merchantOut)} accent={t.merchantOut > 0} />
          <Kpi icon={TrendingDown} label="Expenses" value={money(t.totalExpenses)} accent={t.totalExpenses > 0} />
          <Kpi icon={Wallet} label="Net amount (in − out)" value={money(t.netCash)} green={t.netCash >= 0} accent={t.netCash < 0} />
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Total amount in — by method</div>
            <div className="mt-1 space-y-0.5">
              {Object.keys(t.byMethod).length === 0
                ? <div className="text-xs text-muted-foreground">No payments</div>
                : Object.entries(t.byMethod).map(([m, v]) => (
                  <div key={m}>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{methodLabel(m)}</span><b>{money(v)}</b>
                    </div>
                    {t.recByMethod[m] > 0 && (
                      <div className="flex justify-between text-[10px] text-green-600">
                        <span>of which recoveries</span><span>{money(t.recByMethod[m])}</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title={`Sales (${invoices.length})`}>
            {invoices.length === 0 ? <Empty /> : invoices.map((i) => (
              <Row key={i.id}
                   left={<>{i.customer_name}<div className="text-[10px] text-muted-foreground font-mono">{i.invoice_id}</div></>}
                   right={<span>{money(i.total_amount)}</span>} />
            ))}
          </Card>
          <Card title={`Payments received (${t.allIn.length})`}>
            {t.allIn.length === 0 ? <Empty /> : t.allIn.map((p, i) => (
              <Row key={i}
                   left={<>{p.who ?? "Walk-in"}<div className="text-[10px] text-muted-foreground">{methodLabel(p.method)}{p.ref ? ` · ${p.ref}` : ""}{p.isRecovery ? " · recovery of an older bill" : " · today's sale"}</div></>}
                   right={<span className="text-green-600">{money(p.amount)}</span>} />
            ))}
          </Card>
          {/* Every recovery of the day, spelt out like the expenses list:
              who paid, how, against which bill, and how much. */}
          <Card title={`Recoveries (${t.recoveryRows.length}) — ${money(t.recoveries)}`}>
            {t.recoveryRows.length === 0 ? <Empty /> : (
              <>
                {t.recoveryRows.map((r, i) => (
                  <Row key={i}
                       left={<>{r.who ?? "Customer"}<div className="text-[10px] text-muted-foreground">{methodLabel(r.method)}{r.ref ? ` · ${r.ref}` : ""} · {shortDate(date)}</div></>}
                       right={<span className="text-green-600">{money(r.amount)}</span>} />
                ))}
                <div className="pt-2">
                  <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">Received by method</div>
                  {Object.entries(t.recByMethod).map(([m, v]) => (
                    <div key={m} className="flex justify-between text-xs py-0.5">
                      <span className="text-muted-foreground">{methodLabel(m)}</span>
                      <b className="text-green-600">{money(v)}</b>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
          <Card title={`Merchant payments (${merchantPays.length})`}>
            {merchantPays.length === 0 ? <Empty /> : merchantPays.map((m) => (
              <Row key={m.id}
                   left={<>{m.merchants?.name ?? "Merchant"}<div className="text-[10px] text-muted-foreground">{methodLabel(m.method ?? "cash")}{m.reference ? ` · ${m.reference}` : ""}</div></>}
                   right={<span className="text-orange-500">−{money(m.amount)}</span>} />
            ))}
          </Card>
          <Card title={`Expenses (${expenses.length})`}>
            {expenses.length === 0 ? <Empty /> : expenses.map((e) => (
              <Row key={e.id}
                   left={<>{e.expense_type}{e.notes ? <div className="text-[10px] text-muted-foreground">{e.notes}</div> : null}</>}
                   right={<span className="text-destructive">{money(e.amount)}</span>} />
            ))}
          </Card>
        </div>
      </div>

      <div className="mt-4 grid lg:grid-cols-2 gap-4 print:hidden">
        <div className="rounded-2xl bg-card p-5 shadow-sm space-y-3">
          <div className="font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4 text-gold" /> {closing ? "Update closing" : "Close the day"} — {shortDate(date)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Closing date</Label>
              <Input type="date" value={date} max={localToday()} onChange={(e) => e.target.value && setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5"><Label>Cash in hand (counted)</Label>
              <Input type="number" value={cashInHand} onChange={(e) => setCashInHand(e.target.value)} placeholder={String(t.netCash)} />
            </div>
            <div className="rounded-xl bg-primary/5 p-3 col-span-2">
              <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Difference vs net cash</div>
              <div className={`text-lg font-black ${cashInHand === "" ? "text-muted-foreground" : Number(cashInHand) - t.netCash === 0 ? "text-green-600" : "text-destructive"}`}>
                {cashInHand === "" ? "—" : money(Number(cashInHand) - t.netCash)}
              </div>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything unusual today..." />
          </div>
          <Button className="w-full" onClick={closeDay} disabled={saving}>
            {saving ? "Saving..." : `${closing ? "Update closing for" : "Close & save"} ${shortDate(date)}`}
          </Button>
        </div>

        <div className="rounded-2xl bg-card shadow-sm overflow-x-auto h-fit">
          <div className="p-4 font-semibold border-b">Previous closings</div>
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Date</th><th className="p-3">Sales</th><th className="p-3">Amount in</th><th className="p-3">Expenses</th><th className="p-3">Net</th><th className="p-3">In hand</th></tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-t hover:bg-muted/40 cursor-pointer" onClick={() => setDate(h.closing_date)}>
                  <td className="p-3">{shortDate(h.closing_date)}</td>
                  <td className="p-3 font-semibold">{money(h.net_sales)}</td>
                  <td className="p-3 text-green-600">{money(h.total_cash_in)}</td>
                  <td className="p-3 text-orange-500">{money(h.expenses)}</td>
                  <td className={`p-3 font-semibold ${Number(h.net_cash) >= 0 ? "text-green-600" : "text-destructive"}`}>{money(h.net_cash)}</td>
                  <td className="p-3">{h.cash_in_hand != null ? money(h.cash_in_hand) : "—"}</td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No closings saved yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}

function Kpi({ icon: Icon, label, value, green, accent }: { icon: any; label: string; value: string; green?: boolean; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
        <Icon className={`h-4 w-4 ${accent ? "text-orange-500" : green ? "text-green-600" : "text-primary"}`} />
      </div>
      <div className={`text-xl font-black mt-1 ${accent ? "text-orange-500" : green ? "text-green-600" : ""}`}>{value}</div>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="font-semibold text-sm mb-2">{title}</div>
      <div className="max-h-72 overflow-y-auto divide-y">{children}</div>
    </div>
  );
}
function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return <div className="flex items-center justify-between py-1.5 text-sm gap-2"><div className="min-w-0">{left}</div><div className="font-semibold whitespace-nowrap">{right}</div></div>;
}
function Empty() {
  return <div className="text-xs text-muted-foreground py-4 text-center">Nothing recorded.</div>;
}
