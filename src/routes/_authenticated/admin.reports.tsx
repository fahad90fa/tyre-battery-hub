import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: Reports,
});

function Reports() {
  const [range, setRange] = useState("month");
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from("customer_purchases").select("*, products(product_name)"),
        supabase.from("products").select("id, product_name, quantity_in_stock"),
      ]);
      setSales(s ?? []); setProducts(p ?? []);
    })();
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    const cut = range === "day" ? 86400000 : range === "week" ? 7*86400000 : range === "month" ? 30*86400000 : 365*86400000;
    return sales.filter((s) => new Date(s.purchase_date).getTime() > now - cut);
  }, [sales, range]);

  const bySales: Record<string, number> = {};
  filtered.forEach((s) => { const n = s.products?.product_name ?? "—"; bySales[n] = (bySales[n] ?? 0) + s.quantity_purchased; });
  const most = Object.entries(bySales).sort((a,b) => b[1]-a[1]).slice(0, 10).map(([name, qty]) => ({ name, qty }));
  const least = Object.entries(bySales).sort((a,b) => a[1]-b[1]).slice(0, 10).map(([name, qty]) => ({ name, qty }));
  const inStock = products.filter((p) => p.quantity_in_stock > 0);
  const outStock = products.filter((p) => p.quantity_in_stock <= 0);
  const revenue = filtered.reduce((a, s) => a + Number(s.total_price), 0);

  return (
    <AdminShell title="Reports">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">Filter by period:</div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi label="Revenue" v={money(revenue)} />
        <Kpi label="Orders" v={String(filtered.length)} />
        <Kpi label="In-stock" v={String(inStock.length)} />
        <Kpi label="Out-of-stock" v={String(outStock.length)} accent={outStock.length > 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card title="Most sold">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={most}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="qty" fill="#F59E0B" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Least sold">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={least}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="qty" fill="#2563EB" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Out-of-stock products">
          <ul className="text-sm space-y-1 max-h-64 overflow-y-auto">
            {outStock.length === 0 ? <li className="text-muted-foreground">All products in stock.</li> :
              outStock.map((p) => <li key={p.id} className="flex justify-between border-b py-1"><span>{p.product_name}</span><span className="text-destructive">0</span></li>)}
          </ul>
        </Card>
        <Card title="In-stock products">
          <ul className="text-sm space-y-1 max-h-64 overflow-y-auto">
            {inStock.map((p) => <li key={p.id} className="flex justify-between border-b py-1"><span>{p.product_name}</span><span>{p.quantity_in_stock}</span></li>)}
          </ul>
        </Card>
      </div>
    </AdminShell>
  );
}

function Kpi({ label, v, accent }: { label: string; v: string; accent?: boolean }) {
  return <div className="rounded-2xl bg-card p-5 shadow-sm">
    <div className="text-xs uppercase text-muted-foreground tracking-wider">{label}</div>
    <div className={`text-2xl font-bold mt-2 ${accent ? "text-destructive" : ""}`}>{v}</div>
  </div>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl bg-card p-5 shadow-sm"><div className="font-semibold mb-4">{title}</div>{children}</div>;
}
