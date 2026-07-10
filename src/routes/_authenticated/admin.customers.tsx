import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: CustomersAdmin,
});

function CustomersAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({ customer_name: "", product_id: "", quantity_purchased: 1, total_price: 0, payment_method: "cash", payment_status: "paid" });

  const load = async () => {
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from("customer_purchases").select("*, products(product_name)").order("purchase_date", { ascending: false }),
      supabase.from("products").select("id, product_name, selling_price, quantity_in_stock"),
    ]);
    setRows(r ?? []); setProducts(p ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.customer_name || !form.product_id) return toast.error("Fill required fields");
    const prod = products.find((p) => p.id === form.product_id);
    const total = form.total_price || (prod ? prod.selling_price * form.quantity_purchased : 0);
    const { error } = await supabase.from("customer_purchases").insert({
      ...form, quantity_purchased: Number(form.quantity_purchased), total_price: Number(total),
    });
    if (error) return toast.error(error.message);
    if (prod) await supabase.from("products").update({ quantity_in_stock: Math.max(0, prod.quantity_in_stock - form.quantity_purchased) }).eq("id", prod.id);
    // auto-invoice
    const invId = "INV-" + Date.now();
    const { data: inv } = await supabase.from("invoices").insert({
      invoice_id: invId, customer_name: form.customer_name, total_amount: total,
      payment_method: form.payment_method, payment_status: form.payment_status,
    }).select().maybeSingle();
    if (inv) await supabase.from("invoice_items").insert({
      invoice_id: inv.id, product_id: form.product_id, product_name: prod?.product_name ?? "",
      quantity: form.quantity_purchased, unit_price: prod?.selling_price ?? total, total_price: total,
    });
    toast.success("Sale recorded + invoice " + invId);
    setForm({ customer_name: "", product_id: "", quantity_purchased: 1, total_price: 0, payment_method: "cash", payment_status: "paid" });
    load();
  };

  const cash = rows.filter((r) => r.payment_method === "cash");
  const debit = rows.filter((r) => r.payment_method === "debit");

  return (
    <AdminShell title="Customer Sales">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-sm space-y-3">
          <div className="font-semibold">Record sale</div>
          <div className="space-y-1.5"><Label>Customer name</Label><Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Product</Label>
            <Select value={form.product_id} onValueChange={(v) => {
              const p = products.find((x) => x.id === v);
              setForm({ ...form, product_id: v, total_price: p ? p.selling_price * form.quantity_purchased : 0 });
            }}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.product_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label>Qty</Label><Input type="number" value={form.quantity_purchased} onChange={(e) => setForm({ ...form, quantity_purchased: Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>Total</Label><Input type="number" value={form.total_price} onChange={(e) => setForm({ ...form, total_price: Number(e.target.value) })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label>Method</Label>
              <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="debit">Debit / Khaata</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={form.payment_status} onValueChange={(v) => setForm({ ...form, payment_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="paid">Paid</SelectItem><SelectItem value="unpaid">Unpaid</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={add} className="w-full">Record sale</Button>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="cash">
            <TabsList><TabsTrigger value="cash">Cash</TabsTrigger><TabsTrigger value="debit">Debit / Khaata</TabsTrigger></TabsList>
            <TabsContent value="cash"><SalesTable rows={cash} /></TabsContent>
            <TabsContent value="debit"><SalesTable rows={debit} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminShell>
  );
}

function SalesTable({ rows }: { rows: any[] }) {
  return (
    <div className="rounded-2xl bg-card shadow-sm overflow-hidden mt-3">
      <table className="w-full text-sm">
        <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
          <tr><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Product</th><th className="p-3">Qty</th><th className="p-3">Total</th><th className="p-3">Status</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3">{shortDate(r.purchase_date)}</td>
              <td className="p-3">{r.customer_name}</td>
              <td className="p-3">{r.products?.product_name ?? "—"}</td>
              <td className="p-3">{r.quantity_purchased}</td>
              <td className="p-3 font-semibold">{money(r.total_price)}</td>
              <td className="p-3"><span className={r.payment_status === "paid" ? "text-green-600" : "text-destructive"}>{r.payment_status}</span></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No sales.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
