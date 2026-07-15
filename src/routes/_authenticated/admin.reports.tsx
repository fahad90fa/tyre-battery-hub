import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/format";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: Reports,
});

/** "2026-07" for a Date */
const ym = (d: Date) => d.toISOString().slice(0, 7);
const monthName = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};

function Reports() {
  const [month, setMonth] = useState(ym(new Date()));
  const [sales, setSales] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [ledgerPays, setLedgerPays] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: ip }, { data: lp }, { data: ex }, { data: p }] = await Promise.all([
        supabase.from("customer_purchases").select("*, products(product_name)"),
        supabase.from("invoice_payments").select("amount, method, payment_date"),
        supabase.from("client_ledger").select("amount, method, entry_date, reference").eq("entry_type", "payment"),
        supabase.from("expenses").select("amount, date_of_expense"),
        supabase.from("products").select("id, product_name, quantity_in_stock"),
      ]);
      setSales(s ?? []); setPayments(ip ?? []); setLedgerPays(lp ?? []);
      setExpenses(ex ?? []); setProducts(p ?? []);
    })();
  }, []);

  // Recovered = payments recorded against invoices + manual khaata recoveries
  // added directly in a client ledger (those don't reference an INV- number, so
  // they aren't double-counted with invoice_payments).
  const allRecovered = useMemo(() => [
    ...payments.map((p) => ({ amount: Number(p.amount), date: p.payment_date as string, method: p.method as string })),
    ...ledgerPays
      .filter((l) => !l.reference || !String(l.reference).startsWith("INV-"))
      .map((l) => ({ amount: Number(l.amount), date: l.entry_date as string, method: (l.method ?? "cash") as string })),
  ], [payments, ledgerPays]);

  const monthOptions = useMemo(() => {
    const opts: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) opts.push(ym(new Date(now.getFullYear(), now.getMonth() - i, 15)));
    return opts;
  }, []);

  const mSales = sales.filter((s) => (s.purchase_date ?? "").startsWith(month));
  const mRecovered = allRecovered.filter((r) => (r.date ?? "").startsWith(month));
  const mExpenses = expenses.filter((e) => (e.date_of_expense ?? "").startsWith(month));

  const totalSales = mSales.reduce((a, s) => a + Number(s.total_price), 0);
  const totalRecovered = mRecovered.reduce((a, r) => a + r.amount, 0);
  const totalExpenses = mExpenses.reduce((a, e) => a + Number(e.amount), 0);
  const totalCost = mSales.reduce((a, s) => a + Number(s.cost_price ?? 0) * Number(s.quantity_purchased ?? 1), 0);
  const grossProfit = totalSales - totalCost;

  // Daily series for the selected month
  const daily = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const days = new Date(y, m, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const key = `${month}-${String(i + 1).padStart(2, "0")}`;
      return {
        day: String(i + 1),
        sales: mSales.filter((s) => s.purchase_date === key).reduce((a, s) => a + Number(s.total_price), 0),
        recovered: mRecovered.filter((r) => r.date === key).reduce((a, r) => a + r.amount, 0),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, sales, allRecovered]);

  // 12-month trend
  const monthly = useMemo(() => monthOptions.slice().reverse().map((key) => ({
    month: monthName(key),
    sales: sales.filter((s) => (s.purchase_date ?? "").startsWith(key)).reduce((a, s) => a + Number(s.total_price), 0),
    recovered: allRecovered.filter((r) => (r.date ?? "").startsWith(key)).reduce((a, r) => a + r.amount, 0),
  })), [monthOptions, sales, allRecovered]);

  const bySales: Record<string, number> = {};
  mSales.forEach((s) => { const n = s.products?.product_name ?? "—"; bySales[n] = (bySales[n] ?? 0) + s.quantity_purchased; });
  const most = Object.entries(bySales).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, qty]) => ({ name, qty }));
  const outStock = products.filter((p) => p.quantity_in_stock <= 0);

  return (
    <AdminShell title="Monthly Reports">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">Report month:</div>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {monthOptions.map((m) => <SelectItem key={m} value={m}>{monthName(m)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Kpi label="Total sales" v={money(totalSales)} />
        <Kpi label="Amount recovered" v={money(totalRecovered)} green />
        <Kpi label="Gross profit" v={money(grossProfit)} green={grossProfit >= 0} accent={grossProfit < 0} />
        <Kpi label="Expenses" v={money(totalExpenses)} />
        <Kpi label="Orders" v={String(mSales.length)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title={`Sales trend — ${monthName(month)} (daily)`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" fontSize={10} interval={2} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v: any) => money(v)} />
              <Bar dataKey="sales" name="Sales" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title={`Payment collection — ${monthName(month)} (daily)`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" fontSize={10} interval={2} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v: any) => money(v)} />
              <Bar dataKey="recovered" name="Recovered" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Sales vs recovery — last 12 months">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" fontSize={10} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v: any) => money(v)} />
              <Legend />
              <Line type="monotone" dataKey="sales" name="Sales" stroke="#2563EB" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="recovered" name="Recovered" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title={`Most sold — ${monthName(month)}`}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={most}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="qty" name="Units" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Out-of-stock products">
          <ul className="text-sm space-y-1 max-h-64 overflow-y-auto">
            {outStock.length === 0 ? <li className="text-muted-foreground">All products in stock.</li> :
              outStock.map((p) => <li key={p.id} className="flex justify-between border-b py-1"><span>{p.product_name}</span><span className="text-destructive">0</span></li>)}
          </ul>
        </Card>
        <Card title={`Summary — ${monthName(month)}`}>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between border-b pb-2"><span>Total sales</span><b>{money(totalSales)}</b></li>
            <li className="flex justify-between border-b pb-2"><span>Cost of goods sold</span><b>{money(totalCost)}</b></li>
            <li className="flex justify-between border-b pb-2"><span>Gross profit</span><b className={grossProfit >= 0 ? "text-green-600" : "text-destructive"}>{money(grossProfit)}</b></li>
            <li className="flex justify-between border-b pb-2"><span>Payments recovered</span><b className="text-green-600">{money(totalRecovered)}</b></li>
            <li className="flex justify-between border-b pb-2"><span>Expenses</span><b className="text-orange-500">{money(totalExpenses)}</b></li>
            <li className="flex justify-between"><span>Net (recovered − expenses)</span><b className={totalRecovered - totalExpenses >= 0 ? "text-green-600" : "text-destructive"}>{money(totalRecovered - totalExpenses)}</b></li>
          </ul>
        </Card>
      </div>
    </AdminShell>
  );
}

function Kpi({ label, v, accent, green }: { label: string; v: string; accent?: boolean; green?: boolean }) {
  return <div className="rounded-2xl bg-card p-5 shadow-sm">
    <div className="text-xs uppercase text-muted-foreground tracking-wider">{label}</div>
    <div className={`text-2xl font-bold mt-2 ${accent ? "text-destructive" : green ? "text-green-600" : ""}`}>{v}</div>
  </div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl bg-card p-5 shadow-sm"><div className="font-semibold mb-4">{title}</div>{children}</div>;
}
