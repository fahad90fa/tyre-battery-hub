import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate } from "@/lib/format";
import { methodLabel } from "@/lib/payments";
import { HandCoins, Store, TrendingDown, Wallet, CalendarDays } from "lucide-react";

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

  useEffect(() => {
    (async () => {
      const [{ data: ip }, { data: lp }, { data: mp }, { data: ex }] = await Promise.all([
        supabase.from("invoice_payments").select("*, invoices(invoice_id, customer_name, created_at)").order("payment_date", { ascending: false }),
        supabase.from("client_ledger").select("*, clients(name, account_no)").eq("entry_type", "payment").order("entry_date", { ascending: false }),
        supabase.from("merchant_ledger").select("*, merchants(name, account_no)").eq("entry_type", "payment").order("entry_date", { ascending: false }),
        supabase.from("expenses").select("*").order("date_of_expense", { ascending: false }),
      ]);
      setInvPays(ip ?? []); setLedgerPays(lp ?? []); setMerchantPays(mp ?? []); setExpenses(ex ?? []);
    })();
  }, []);

  const flows: Flow[] = useMemo(() => {
    const out: Flow[] = [];
    // Money in from invoices: same-day sale payments vs recoveries of old udhar.
    invPays.forEach((p) => {
      const saleDay = (p.invoices?.created_at ?? "").slice(0, 10);
      const isRecovery = saleDay && saleDay !== p.payment_date;
      out.push({
        key: `ip-${p.id}`, date: p.payment_date,
        kind: isRecovery ? "recovery" : "sale-payment",
        who: p.invoices?.customer_name ?? "Walk-in",
        detail: `${methodLabel(p.method)}${p.invoices?.invoice_id ? ` · ${p.invoices.invoice_id}` : ""}`,
        amount: Number(p.amount),
      });
    });
    // Manual khaata recoveries recorded directly in a customer ledger.
    ledgerPays
      .filter((l) => !l.reference || !String(l.reference).startsWith("INV-"))
      .forEach((l) => out.push({
        key: `lp-${l.id}`, date: l.entry_date,
        kind: "recovery",
        who: l.clients ? `${l.clients.account_no ? `${l.clients.account_no} · ` : ""}${l.clients.name}` : "Customer",
        detail: `${methodLabel(l.method ?? "cash")}${l.note ? ` · ${l.note}` : ""}`,
        amount: Number(l.amount),
      }));
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
  }, [invPays, ledgerPays, merchantPays, expenses]);

  const byDay = useMemo(() => {
    const map = new Map<string, Flow[]>();
    flows.forEach((f) => {
      const d = f.date ?? "—";
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(f);
    });
    return [...map.entries()].slice(0, 45);
  }, [flows]);

  const today = new Date().toISOString().slice(0, 10);
  const t = useMemo(() => {
    const todayFlows = flows.filter((f) => f.date === today);
    return {
      recToday: todayFlows.filter((f) => f.kind === "recovery").reduce((a, f) => a + f.amount, 0),
      inToday: todayFlows.filter((f) => f.amount > 0).reduce((a, f) => a + f.amount, 0),
      merToday: Math.abs(todayFlows.filter((f) => f.kind === "merchant-payment").reduce((a, f) => a + f.amount, 0)),
      expToday: Math.abs(todayFlows.filter((f) => f.kind === "expense").reduce((a, f) => a + f.amount, 0)),
      netToday: todayFlows.reduce((a, f) => a + f.amount, 0) + 0,
    };
  }, [flows, today]);

  const KIND: Record<Flow["kind"], { label: string; cls: string }> = {
    "recovery": { label: "Recovery (udhar)", cls: "bg-green-600/10 text-green-600" },
    "sale-payment": { label: "Sale payment", cls: "bg-primary/10 text-primary" },
    "merchant-payment": { label: "Merchant payment", cls: "bg-orange-500/10 text-orange-500" },
    "expense": { label: "Expense", cls: "bg-destructive/10 text-destructive" },
  };

  const dayLabel = (d: string) => {
    if (d === today) return `Today — ${shortDate(d)}`;
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (d === y.toISOString().slice(0, 10)) return `Yesterday — ${shortDate(d)}`;
    return shortDate(d);
  };

  return (
    <AdminShell title="Recoveries / Cash Flow">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <Kpi icon={HandCoins} label="Recoveries today" value={money(t.recToday)} green />
        <Kpi icon={Wallet} label="Total in today" value={money(t.inToday)} green />
        <Kpi icon={Store} label="Merchant payments today" value={money(t.merToday)} accent={t.merToday > 0} />
        <Kpi icon={TrendingDown} label="Expenses today" value={money(t.expToday)} accent={t.expToday > 0} />
        <Kpi icon={Wallet} label="Net today" value={money(t.netToday)} green={t.netToday >= 0} accent={t.netToday < 0} />
      </div>

      <div className="space-y-4">
        {byDay.length === 0 && (
          <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground shadow-sm">No cash movements yet.</div>
        )}
        {byDay.map(([day, list]) => {
          const dayIn = list.filter((f) => f.amount > 0).reduce((a, f) => a + f.amount, 0);
          const dayOut = Math.abs(list.filter((f) => f.amount < 0).reduce((a, f) => a + f.amount, 0));
          return (
            <div key={day} className="rounded-2xl bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-muted/60 border-b flex-wrap gap-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <CalendarDays className="h-4 w-4 text-gold" /> {dayLabel(day)}
                </div>
                <div className="text-xs flex gap-3">
                  <span className="text-green-600 font-semibold">In {money(dayIn)}</span>
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
