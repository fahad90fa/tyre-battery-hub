import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/format";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Package, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

const COLORS = ["#F59E0B", "#2563EB", "#10B981", "#EF4444", "#8B5CF6"];

function CountUp({ n, prefix = "" }: { n: number; prefix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let s = 0;
    const step = n / 40;
    const iv = setInterval(() => { s += step; if (s >= n) { setV(n); clearInterval(iv); } else setV(Math.floor(s)); }, 20);
    return () => clearInterval(iv);
  }, [n]);
  return <span>{prefix}{v.toLocaleString()}</span>;
}

function Dashboard() {
  const [stats, setStats] = useState({ stockValue: 0, todaySales: 0, expenses: 0, profit: 0, outOfStock: 0 });
  const [stockByCat, setStockByCat] = useState<any[]>([]);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [topSold, setTopSold] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: products }, { data: sales }, { data: expenses }, { data: cats }] = await Promise.all([
        supabase.from("products").select("id, product_name, quantity_in_stock, purchase_price, selling_price, category_id"),
        supabase.from("customer_purchases").select("total_price, purchase_date, product_id, quantity_purchased"),
        supabase.from("expenses").select("amount, date_of_expense"),
        supabase.from("categories").select("id, name"),
      ]);
      const p = products ?? [], s = sales ?? [], e = expenses ?? [], c = cats ?? [];
      const stockValue = p.reduce((a, x) => a + Number(x.purchase_price) * x.quantity_in_stock, 0);
      const todaySales = s.filter((x) => x.purchase_date === today).reduce((a, x) => a + Number(x.total_price), 0);
      const totalExp = e.reduce((a, x) => a + Number(x.amount), 0);
      const totalRev = s.reduce((a, x) => a + Number(x.total_price), 0);
      const outOfStock = p.filter((x) => x.quantity_in_stock <= 0).length;
      setStats({ stockValue, todaySales, expenses: totalExp, profit: totalRev - totalExp, outOfStock });

      const catMap = Object.fromEntries(c.map((x) => [x.id, x.name]));
      setStockByCat(c.map((cat) => ({
        name: cat.name,
        stock: p.filter((x) => x.category_id === cat.id).reduce((a, x) => a + x.quantity_in_stock, 0),
      })).filter((x) => x.stock > 0));

      const byDay: Record<string, number> = {};
      s.forEach((x) => { byDay[x.purchase_date] = (byDay[x.purchase_date] ?? 0) + Number(x.total_price); });
      setSalesTrend(Object.entries(byDay).sort(([a],[b]) => a.localeCompare(b)).slice(-14).map(([d, v]) => ({ date: d.slice(5), sales: v })));

      const bySales: Record<string, number> = {};
      s.forEach((x) => { if (x.product_id) bySales[x.product_id] = (bySales[x.product_id] ?? 0) + x.quantity_purchased; });
      const nameMap = Object.fromEntries(p.map((x) => [x.id, x.product_name]));
      setTopSold(Object.entries(bySales).sort((a,b) => b[1]-a[1]).slice(0,5).map(([id, qty]) => ({ name: nameMap[id] ?? "—", value: qty })));
    })();
  }, []);

  const cards = [
    { label: "Total Stock Value", value: stats.stockValue, icon: Package, color: "text-primary" },
    { label: "Today's Sales", value: stats.todaySales, icon: DollarSign, color: "text-green-600" },
    { label: "Total Expenses", value: stats.expenses, icon: TrendingUp, color: "text-orange-500" },
    { label: "Profit / Loss", value: stats.profit, icon: TrendingUp, color: stats.profit >= 0 ? "text-green-600" : "text-destructive" },
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase text-muted-foreground tracking-wider">{c.label}</div>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div className={`text-2xl font-black mt-2 ${c.color}`}>
              <CountUp n={Math.abs(Math.round(c.value))} prefix="Rs " />
            </div>
          </motion.div>
        ))}
      </div>

      {stats.outOfStock > 0 && (
        <div className="mt-4 rounded-xl bg-destructive/10 text-destructive px-4 py-3 flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" /> {stats.outOfStock} product{stats.outOfStock > 1 ? "s" : ""} out of stock.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <Chart title="Sales trend (last 14 days)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v: any) => money(v)} />
              <Line type="monotone" dataKey="sales" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="In-stock by category">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stockByCat}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="stock" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Top-selling products">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={topSold} dataKey="value" nameKey="name" outerRadius={90} label>
                {topSold.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Expenses vs Revenue">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[
              { name: "Revenue", value: stats.todaySales + stats.profit + stats.expenses },
              { name: "Expenses", value: stats.expenses },
              { name: "Profit", value: stats.profit },
            ]}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v: any) => money(v)} />
              <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>
      </div>
    </AdminShell>
  );
}

function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm">
      <div className="font-semibold mb-4">{title}</div>
      {children}
    </div>
  );
}
