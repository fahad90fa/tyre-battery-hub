import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate, localToday, localDateOf } from "@/lib/format";
import { methodLabel } from "@/lib/payments";
import { sumMoney } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HandCoins, Store, TrendingDown, TrendingUp, Wallet, CalendarDays, Banknote, CreditCard, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/recoveries")({
  component: Recoveries,
});

type Flow = {
  key: string;
  date: string;
  kind: "recovery" | "sale-payment" | "merchant-payment" | "expense";
  who: string;
  detail: string;
  amount: number; // positive = in, negative = out
};

function Recoveries() {
  const [invPays, setInvPays] = useState<any[]>([]);
  const [ledgerPays, setLedgerPays] = useState<any[]>([]);
  const [merchantPays, setMerchantPays] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [invDateMap, setInvDateMap] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState<"all" | "recovery" | "in" | "out">("all");
  const [month, setMonth] = useState("");            // "" = every month

  const load = async () => {
    setLoading(true);
    const [ipR, lpR, mpR, exR, slR] = await Promise.all([
      supabase.from("invoice_payments").select("*, invoices(invoice_id, customer_name, created_at, client_id)").order("payment_date", { ascending: false }),
      supabase.from("client_ledger").select("*, clients(name, account_no)").eq("entry_type", "payment").order("entry_date", { ascending: false }),
      supabase.from("merchant_ledger").select("*, merchants(name, account_no)").eq("entry_type", "payment").order("entry_date", { ascending: false }),
      supabase.from("expenses").select("*").order("date_of_expense", { ascending: false }),
      supabase.from("invoices").select("id, invoice_id, customer_name, total_amount, created_at, client_id").order("created_at", { ascending: false }),
    ]);
    // Never show an empty page when a query actually failed.
    setLoadError([ipR.error, lpR.error, mpR.error, exR.error, slR.error]
      .filter(Boolean).map((e) => e!.message).join(" · "));
    setInvPays(ipR.data ?? []); setLedgerPays(lpR.data ?? []); setMerchantPays(mpR.data ?? []);
    setExpenses(exR.data ?? []); setSales(slR.data ?? []);
    setInvDateMap(Object.fromEntries((slR.data ?? []).map((i: any) => [i.invoice_id, localDateOf(i.created_at)])));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const flows: Flow[] = useMemo(() => {
    const out: Flow[] = [];
    // Money in from invoices: same-day sale payments vs recoveries of old udhar.
    // Walk-in invoice payments only — account customers are counted via
    // their ledger, so allocation rows against their invoices are skipped.
    invPays.filter((p) => !p.invoices?.client_id).forEach((p) => {
      const saleDay = localDateOf(p.invoices?.created_at);
      const isRecovery = saleDay && saleDay !== p.payment_date;
      out.push({
        key: `ip-${p.id}`, date: p.payment_date,
        kind: isRecovery ? "recovery" : "sale-payment",
        who: p.invoices?.customer_name ?? "Walk-in",
        detail: `${methodLabel(p.method)}${p.invoices?.invoice_id ? ` · ${p.invoices.invoice_id}` : ""}`,
        amount: Number(p.amount),
      });
    });
    // Every account (ledger) payment; same-day sale payments vs recoveries.
    ledgerPays.forEach((l) => {
      const ref = typeof l.reference === "string" && l.reference.startsWith("INV-") ? l.reference : null;
      const saleDay = ref ? invDateMap[ref] : undefined;
      out.push({
        key: `lp-${l.id}`, date: l.entry_date,
        kind: saleDay && saleDay === l.entry_date ? "sale-payment" : "recovery",
        who: l.clients ? `${l.clients.account_no ? `${l.clients.account_no} · ` : ""}${l.clients.name}` : "Customer",
        detail: [methodLabel(l.method ?? "cash"), l.reference, l.note].filter(Boolean).join(" · "),
        amount: Number(l.amount),
      });
    });
    // Money out: payments we made to merchants.
    merchantPays.forEach((m) => out.push({
      key: `mp-${m.id}`, date: m.entry_date,
      kind: "merchant-payment",
      who: m.merchants ? `${m.merchants.account_no ? `${m.merchants.account_no} · ` : ""}${m.merchants.name}` : "Merchant",
      detail: `${methodLabel(m.method ?? "cash")}${m.reference ? ` · ${m.reference}` : ""}`,
      amount: -Number(m.amount),
    }));
    // Money out: expenses.
    expenses.forEach((e) => out.push({
      key: `ex-${e.id}`, date: e.date_of_expense,
      kind: "expense",
      who: e.expense_type,
      detail: e.notes ?? "",
      amount: -Number(e.amount),
    }));
    return out.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  }, [invPays, ledgerPays, merchantPays, expenses, invDateMap]);

  // Sales are NOT cash flow — billed amounts, kept separate from recoveries.
  const salesByDay = useMemo(() => {
    const map = new Map<string, { net: number; cash: number; credit: number }>();
    sales.forEach((inv) => {
      const d = localDateOf(inv.created_at);
      if (!d) return;
      const cur = map.get(d) ?? { net: 0, cash: 0, credit: 0 };
      cur.net += Number(inv.total_amount) || 0;
      map.set(d, cur);
    });
    // Cash sales = money taken on the same day the bill was raised.
    flows.forEach((f) => {
      if (f.kind !== "sale-payment") return;
      const cur = map.get(f.date);
      if (cur) cur.cash += f.amount;
    });
    map.forEach((v) => { v.cash = Math.min(v.net, v.cash); v.credit = Math.max(0, v.net - v.cash); });
    return map;
  }, [sales, flows]);

  // Day-by-day record, exactly like the expenses book: every movement filed
  // under the date it happened, newest day first.
  const byDay = useMemo(() => {
    const keep = (f: Flow) => {
      if (month && !(f.date ?? "").startsWith(month)) return false;
      if (show === "recovery") return f.kind === "recovery";
      if (show === "in") return f.amount > 0;
      if (show === "out") return f.amount < 0;
      return true;
    };
    const map = new Map<string, Flow[]>();
    flows.filter(keep).forEach((f) => {
      const d = f.date ?? "—";
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(f);
    });
    return [...map.entries()].slice(0, 120);
  }, [flows, show, month]);

  // Totals for whatever range is on screen (a month, or everything).
  const rangeTotals = useMemo(() => {
    const inRange = flows.filter((f) => !month || (f.date ?? "").startsWith(month));
    return {
      recovered: sumMoney(inRange.filter((f) => f.kind === "recovery").map((f) => f.amount)),
      count: inRange.filter((f) => f.kind === "recovery").length,
      days: new Set(inRange.filter((f) => f.kind === "recovery").map((f) => f.date)).size,
    };
  }, [flows, month]);

  const today = localToday();
  const t = useMemo(() => {
    const todayFlows = flows.filter((f) => f.date === today);
    const todaySales = salesByDay.get(today) ?? { net: 0, cash: 0, credit: 0 };
    return {
      // Sales (not cash flow)
      netSales: todaySales.net,
      cashSales: todaySales.cash,
      creditSales: todaySales.credit,
      // Cash flow
      recToday: sumMoney(todayFlows.filter((f) => f.kind === "recovery").map((f) => f.amount)),
      salePayToday: sumMoney(todayFlows.filter((f) => f.kind === "sale-payment").map((f) => f.amount)),
      inToday: sumMoney(todayFlows.filter((f) => f.amount > 0).map((f) => f.amount)),
      merToday: Math.abs(sumMoney(todayFlows.filter((f) => f.kind === "merchant-payment").map((f) => f.amount))),
      expToday: Math.abs(sumMoney(todayFlows.filter((f) => f.kind === "expense").map((f) => f.amount))),
      netToday: sumMoney(todayFlows.map((f) => f.amount)),
    };
  }, [flows, salesByDay, today]);

  const KIND: Record<Flow["kind"], { label: string; cls: string }> = {
    "recovery": { label: "Recovery (udhar)", cls: "bg-green-600/10 text-green-600" },
    "sale-payment": { label: "Sale payment", cls: "bg-primary/10 text-primary" },
    "merchant-payment": { label: "Merchant payment", cls: "bg-orange-500/10 text-orange-500" },
    "expense": { label: "Expense", cls: "bg-destructive/10 text-destructive" },
  };

  const dayLabel = (d: string) => {
    if (d === today) return `Today — ${shortDate(d)}`;
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (d === localDateOf(y)) return `Yesterday — ${shortDate(d)}`;
    return shortDate(d);
  };

  return (
    <AdminShell title="Recoveries / Cash Flow">
      <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Today's sales</div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Kpi icon={TrendingUp} label="Net sales" value={money(t.netSales)} />
        <Kpi icon={Banknote} label="Cash sales" value={money(t.cashSales)} green />
        <Kpi icon={CreditCard} label="Credit (udhar) sales" value={money(t.creditSales)} accent={t.creditSales > 0} />
      </div>

      <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Today's cash flow</div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <Kpi icon={HandCoins} label="Recoveries (old udhar only)" value={money(t.recToday)} green />
        <Kpi icon={Banknote} label="Today's sale payments" value={money(t.salePayToday)} />
        <Kpi icon={Wallet} label="Total amount in" value={money(t.inToday)} green />
        <Kpi icon={Store} label="Merchant payments" value={money(t.merToday)} accent={t.merToday > 0} />
        <Kpi icon={TrendingDown} label="Expenses" value={money(t.expToday)} accent={t.expToday > 0} />
      </div>

      {/* Day-wise record — same idea as the expenses book */}
      <div className="rounded-2xl bg-card p-3 shadow-sm mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 flex-wrap">
          {([
            ["all", "Everything"],
            ["recovery", "Recoveries only"],
            ["in", "Money in"],
            ["out", "Money out"],
          ] as const).map(([v, label]) => (
            <button key={v} onClick={() => setShow(v)}
                    className={`text-xs rounded-full px-3 py-1.5 font-semibold transition ${
                      show === v ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-1">Month</span>
        <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-8 w-40 text-xs" />
        {month && <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setMonth("")}>Clear month</Button>}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Recovered {month ? `in ${month}` : "in total"}:{" "}
            <b className="text-green-600">{money(rangeTotals.recovered)}</b>
            {rangeTotals.count > 0 && ` · ${rangeTotals.count} payment${rangeTotals.count > 1 ? "s" : ""} over ${rangeTotals.days} day${rangeTotals.days > 1 ? "s" : ""}`}
          </span>
          <Button variant="outline" size="sm" className="h-8" onClick={load} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive mb-4">
          Could not load some records: {loadError}
        </div>
      )}

      <div className="space-y-4">
        {byDay.length === 0 && !loading && (
          <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground shadow-sm">
            {show === "recovery"
              ? `No recoveries recorded${month ? " in this month" : " yet"}. A recovery is a payment received against a bill raised on an earlier day.`
              : `No cash movements${month ? " in this month" : " yet"}.`}
          </div>
        )}
        {byDay.map(([day, list]) => {
          const dayIn = sumMoney(list.filter((f) => f.amount > 0).map((f) => f.amount));
          const dayOut = Math.abs(sumMoney(list.filter((f) => f.amount < 0).map((f) => f.amount)));
          const dayRec = sumMoney(list.filter((f) => f.kind === "recovery").map((f) => f.amount));
          const daySales = salesByDay.get(day);
          return (
            <div key={day} className="rounded-2xl bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-muted/60 border-b flex-wrap gap-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <CalendarDays className="h-4 w-4 text-gold" /> {dayLabel(day)}
                </div>
                <div className="text-xs flex gap-3 flex-wrap">
                  {daySales && <span className="text-muted-foreground">Sales {money(daySales.net)}</span>}
                  <span className="text-green-600 font-semibold">Recovered {money(dayRec)}</span>
                  <span className="text-green-600">In {money(dayIn)}</span>
                  <span className="text-orange-500 font-semibold">Out {money(dayOut)}</span>
                  <span className={`font-bold ${dayIn - dayOut >= 0 ? "text-green-600" : "text-destructive"}`}>Net {money(dayIn - dayOut)}</span>
                </div>
              </div>
              <div className="divide-y">
                {list.map((f) => (
                  <div key={f.key} className="flex items-center justify-between px-4 py-2.5 gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${KIND[f.kind].cls}`}>{KIND[f.kind].label}</span>
                        <span className="text-sm font-medium truncate">{f.who}</span>
                      </div>
                      {f.detail && <div className="text-xs text-muted-foreground truncate mt-0.5">{f.detail}</div>}
                    </div>
                    <div className={`font-bold whitespace-nowrap ${f.amount >= 0 ? "text-green-600" : "text-orange-500"}`}>
                      {f.amount >= 0 ? "+" : "−"}{money(Math.abs(f.amount))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
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
