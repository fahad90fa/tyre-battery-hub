import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/stock")({
  component: StockAdmin,
});

function StockAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ supplier_name: "", merchant_id: "", product_id: "", quantity: 1, purchase_price: 0 });

  const load = async () => {
    const [{ data: r }, { data: p }, { data: m }] = await Promise.all([
      supabase.from("stock_purchases").select("*, products(product_name)").order("date", { ascending: false }),
      supabase.from("products").select("id, product_name, quantity_in_stock, purchase_price"),
      supabase.from("merchants").select("id, name").order("name"),
    ]);
    setRows(r ?? []); setProducts(p ?? []); setMerchants(m ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.product_id || !form.supplier_name) return toast.error("Fill all fields");
    const qty = Number(form.quantity), price = Number(form.purchase_price);
    const { error } = await supabase.from("stock_purchases").insert({
      supplier_name: form.supplier_name, product_id: form.product_id, quantity: qty, purchase_price: price,
    });
    if (error) return toast.error(error.message);
    const prod = products.find((p) => p.id === form.product_id);
    if (prod) {
      await supabase.from("products").update({
        quantity_in_stock: prod.quantity_in_stock + qty,
        purchase_price: price,
        last_purchase_date: new Date().toISOString().slice(0, 10),
      }).eq("id", form.product_id);
    }
    if (form.merchant_id) {
      await supabase.from("merchant_ledger").insert({
        merchant_id: form.merchant_id, entry_type: "purchase", amount: qty * price,
        reference: `Stock: ${prod?.product_name ?? ""}`, note: `Qty ${qty} @ ${price}`,
      });
    }
    toast.success("Stock added");
    setForm({ supplier_name: "", merchant_id: "", product_id: "", quantity: 1, purchase_price: 0 });
    load();
  };

  return (
    <AdminShell title="Stock Purchases">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-sm space-y-3">
          <div className="font-semibold">Log purchase from supplier</div>
          <div className="space-y-1.5"><Label>Supplier</Label><Input value={form.supplier_name} onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Link merchant (optional)</Label>
            <Select value={form.merchant_id} onValueChange={(v) => setForm({ ...form, merchant_id: v })}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{merchants.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Product</Label>
            <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.product_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label>Qty</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>Unit cost</Label><Input type="number" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: Number(e.target.value) })} /></div>
          </div>
          <Button onClick={add} className="w-full">Add stock</Button>
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Date</th><th className="p-3">Supplier</th><th className="p-3">Product</th><th className="p-3">Qty</th><th className="p-3">Cost</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{shortDate(r.date)}</td>
                  <td className="p-3">{r.supplier_name}</td>
                  <td className="p-3">{r.products?.product_name ?? "—"}</td>
                  <td className="p-3">{r.quantity}</td>
                  <td className="p-3 font-semibold">{money(r.purchase_price)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No purchases yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
