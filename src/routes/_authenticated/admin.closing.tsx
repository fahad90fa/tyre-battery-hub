import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate } from "@/lib/format";
import { methodLabel } from "@/lib/payments";
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
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sales, setSales] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [ledgerPays, setLedgerPays] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [closing, setClosing] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [cashInHand, setCashInHand] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: s }, { data: ip }, { data: lp }, { data: ex }, { data: cl }, { data: hist }] = await Promise.all([
      supabase.from("customer_purchases").select("*, products(product_name)").eq("purchase_date", date).order("created_at"),
      supabase.from("invoice_payments").select("*, invoices(invoice_id, customer_name, created_at)").eq("payment_date", date),
      supabase.from("client_ledger").select("*, clients(name)").eq("entry_type", "payment").eq("entry_date", date),
      supabase.from("expenses").select("*").eq("date_of_expense", date),
      supabase.from("daily_closings").select("*").eq("closing_date", date).maybeSingle(),
      supabase.from("daily_closings").select("*").order("closing_date", { ascending: false }).limit(14),
    ]);
    setSales(s ?? []); setPayments(ip ?? []); setLedgerPays(lp ?? []); setExpenses(ex ?? []);
    setClosing(cl ?? null); setHistory(hist ?? []);
    setCashInHand(cl?.cash_in_hand != null ? String(cl.cash_in_hand) : "");
    setNotes(cl?.notes ?? "");
  };
  useEffect(() => { load(); }, [date]);

  const t = useMemo(() => {
    const netSales = sales.reduce((a, s) => a + Number(s.total_price), 0);
    const cashSales = sales.filter((s) => s.payment_status === "paid").reduce((a, s) => a + Number(s.total_price), 0);
    const creditSales = netSales - cashSales;

    // Manual khaata payments that don't belong to an invoice payment row.
    const manualPays = ledgerPays.filter((l) => !l.reference || !String(l.reference).startsWith("INV-"));
    const allIn = [
      ...payments.map((p) => ({ amount: Number(p.amount), method: p.method as string, who: p.invoices?.customer_name, ref: p.invoices?.invoice_id, isRecovery: (p.invoices?.created_at ?? "").slice(0, 10) !== date })),
      ...manualPays.map((l) => ({ amount: Number(l.amount), method: (l.method ?? "cash") as string, who: l.clients?.name, ref: l.reference, isRecovery: true })),
    ];
    const totalCashIn = allIn.reduce((a, r) => a + r.amount, 0);
    const recoveries = allIn.filter((r) => r.isRecovery).reduce((a, r) => a + r.amount, 0);
    const byMethod: Record<string, number> = {};
    allIn.forEach((r) => { byMethod[r.method] = (byMethod[r.method] ?? 0) + r.amount; });
    const totalExpenses = expenses.reduce((a, e) => a + Number(e.amount), 0);
    return {
      netSales, cashSales, creditSales, recoveries, totalCashIn,
      totalExpenses, netCash: totalCashIn - totalExpenses, byMethod, allIn,
    };
  }, [sales, payments, ledgerPays, expenses, date]);

  const closeDay = async () => {
    setSaving(true);
    try {
      const payload = {
        closing_date: date,
        net_sales: t.netSales, cash_sales: t.cashSales, credit_sales: t.creditSales,
        recoveries: t.recoveries, total_cash_in: t.totalCashIn,
        expenses: t.totalExpenses, net_cash: t.netCash,
        cash_in_hand: cashInHand === "" ? null : Number(cashInHand),
        notes: notes || null,
        updated_at: new Date().toISOString(),
      };
      const { error } = closing
        ? await supabase.from("daily_closings").update(payload).eq("id", closing.id)
        : await supabase.from("daily_closings").insert(payload);
      if (error) return toast.error(error.message);
      toast.success(closing ? "Closing updated" : `Day ${shortDate(date)} closed`);
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Daily Closing">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap print:hidden">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
        <div className="flex items-center gap-2">
          {closing && <span className="text-xs rounded-full bg-green-600/10 text-green-600 px-3 py-1 font-semibold">Closed ✓</span>}
          <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" /> Print report</Button>
        </div>
      </div>

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi icon={Wallet} label="Total cash in" value={money(t.totalCashIn)} green />
          <Kpi icon={TrendingDown} label="Expenses" value={money(t.totalExpenses)} accent={t.totalExpenses > 0} />
          <Kpi icon={Wallet} label="Net cash (in − out)" value={money(t.netCash)} green={t.netCash >= 0} accent={t.netCash < 0} />
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Received by method</div>
            <div className="mt-1 space-y-0.5">
              {Object.keys(t.byMethod).length === 0
                ? <div className="text-xs text-muted-foreground">No payments</div>
                : Object.entries(t.byMethod).map(([m, v]) => (
                  <div key={m} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{methodLabel(m)}</span><b>{money(v)}</b>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card title={`Sales (${sales.length})`}>
            {sales.length === 0 ? <Empty /> : sales.map((s) => (
              <Row key={s.id}
                   left={<>{s.products?.product_name ?? "—"} × {s.quantity_purchased}<div className="text-[10px] text-muted-foreground">{s.customer_name}</div></>}
                   right={<span className={s.payment_status === "paid" ? "text-green-600" : "text-orange-500"}>{money(s.total_price)}</span>} />
            ))}
          </Card>
          <Card title={`Payments received (${t.allIn.length})`}>
            {t.allIn.length === 0 ? <Empty /> : t.allIn.map((p, i) => (
              <Row key={i}
                   left={<>{p.who ?? "Walk-in"}<div className="text-[10px] text-muted-foreground">{methodLabel(p.method)}{p.ref ? ` · ${p.ref}` : ""}{p.isRecovery ? " · recovery" : ""}</div></>}
                   right={<span className="text-green-600">{money(p.amount)}</span>} />
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
          <div className="font-semibold flex items-center gap-2"><Lock className="h-4 w-4 text-gold" /> {closing ? "Update closing" : "Close the day"}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Cash in hand (counted)</Label>
              <Input type="number" value={cashInHand} onChange={(e) => setCashInHand(e.target.value)} placeholder={String(t.netCash)} />
            </div>
            <div className="rounded-xl bg-primary/5 p-3">
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
            {saving ? "Saving..." : closing ? "Update closing report" : "Close the day & save report"}
          </Button>
        </div>

        <div className="rounded-2xl bg-card shadow-sm overflow-x-auto h-fit">
          <div className="p-4 font-semibold border-b">Previous closings</div>
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Date</th><th className="p-3">Sales</th><th className="p-3">Cash in</th><th className="p-3">Expenses</th><th className="p-3">Net</th><th className="p-3">In hand</th></tr>
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
