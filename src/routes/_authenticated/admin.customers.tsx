import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate } from "@/lib/format";
import { PAYMENT_METHODS, methodLabel, summarizeMethods, paymentStatus } from "@/lib/payments";
import { applyPct } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: CustomersAdmin,
});

type PayLine = { method: string; amount: number };

const emptyForm = {
  customer_name: "",
  client_id: "",
  product_id: "",
  quantity_purchased: 1,
  total_price: 0,
  pct: 0,
  due_date: "",
};

function CustomersAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [payLines, setPayLines] = useState<PayLine[]>([{ method: "cash", amount: 0 }]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: r }, { data: p }, { data: c }] = await Promise.all([
      supabase.from("customer_purchases").select("*, products(product_name)").order("created_at", { ascending: false }),
      supabase.from("products").select("id, product_name, selling_price, purchase_price, quantity_in_stock"),
      supabase.from("clients").select("id, name, account_no, current_balance").order("name"),
    ]);
    setRows(r ?? []); setProducts(p ?? []); setClients(c ?? []);
  };
  useEffect(() => { load(); }, []);

  const total = Number(form.total_price) || 0;
  const paid = payLines.reduce((a, l) => a + (Number(l.amount) || 0), 0);
  const remaining = Math.max(0, total - paid);
  const status = paymentStatus(total, paid);

  const setLine = (i: number, patch: Partial<PayLine>) =>
    setPayLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const add = async () => {
    if (!form.product_id) return toast.error("Select a product");
    if (paid > total) return toast.error("Payments exceed the total amount");
    if (remaining > 0 && !form.client_id)
      return toast.error("Credit (udhar) sale — link a customer account so the balance is tracked");
    const prod = products.find((p) => p.id === form.product_id);
    const qty = Number(form.quantity_purchased) || 1;
    const activeLines = payLines.filter((l) => Number(l.amount) > 0);
    const custName = form.customer_name?.trim() ||
      (form.client_id ? clients.find((c) => c.id === form.client_id)?.name ?? "Walk-in customer" : "Walk-in customer");

    setSaving(true);
    try {
      const { error } = await supabase.from("customer_purchases").insert({
        customer_name: custName, product_id: form.product_id,
        quantity_purchased: qty, total_price: total,
        cost_price: prod?.purchase_price ?? null,
        payment_method: summarizeMethods(activeLines.map((l) => l.method)),
        payment_status: status,
        payment_due_date: remaining > 0 && form.due_date ? form.due_date : null,
      });
      if (error) return toast.error(error.message);

      if (prod) {
        await supabase.from("products")
          .update({ quantity_in_stock: Math.max(0, prod.quantity_in_stock - qty) })
          .eq("id", prod.id);
      }

      const invId = "INV-" + Date.now();
      const { data: inv, error: invErr } = await supabase.from("invoices").insert({
        invoice_id: invId, customer_name: custName, total_amount: total,
        payment_method: summarizeMethods(activeLines.map((l) => l.method)),
        payment_status: status,
        client_id: form.client_id || null,
        due_date: remaining > 0 && form.due_date ? form.due_date : null,
      }).select().maybeSingle();
      if (invErr) return toast.error(invErr.message);

      if (inv) {
        await supabase.from("invoice_items").insert({
          invoice_id: inv.id, product_id: form.product_id, product_name: prod?.product_name ?? "",
          quantity: qty,
          unit_price: prod && Number(prod.selling_price) > 0 ? prod.selling_price : (qty > 0 ? total / qty : total),
          total_price: total, cost_price: prod?.purchase_price ?? null,
        });
        if (activeLines.length > 0) {
          await supabase.from("invoice_payments").insert(
            activeLines.map((l) => ({ invoice_id: inv.id, amount: Number(l.amount), method: l.method })),
          );
        }
      }

      if (form.client_id) {
        await supabase.from("client_ledger").insert({
          client_id: form.client_id, entry_type: "sale", amount: total,
          reference: invId, note: `${prod?.product_name ?? ""} × ${qty}`,
        });
        if (activeLines.length > 0) {
          await supabase.from("client_ledger").insert(
            activeLines.map((l) => ({
              client_id: form.client_id, entry_type: "payment", amount: Number(l.amount),
              method: l.method, reference: invId, note: `Paid at sale (${methodLabel(l.method)})`,
            })),
          );
        }
      }

      toast.success(
        remaining > 0
          ? `Sale recorded — ${money(remaining)} udhar added to account (${invId})`
          : `Sale recorded + invoice ${invId}`,
      );
      setForm(emptyForm);
      setPayLines([{ method: "cash", amount: 0 }]);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the sale");
    } finally {
      setSaving(false);
    }
  };

  const cash = rows.filter((r) => r.payment_status === "paid");
  const credit = rows.filter((r) => r.payment_status !== "paid");

  return (
    <AdminShell title="Customer Sales">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-sm space-y-3">
          <div className="font-semibold">Record sale</div>
          <div className="space-y-1.5"><Label>Customer name (optional — walk-in by default)</Label><Input placeholder="Walk-in customer" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Customer account {remaining > 0 && <span className="text-destructive">*</span>}</Label>
            <SearchableSelect
              options={clients.map((c) => ({
                value: c.id,
                label: `${c.account_no ? `${c.account_no} · ` : ""}${c.name}`,
                hint: Number(c.current_balance) > 0 ? `owes ${money(c.current_balance)}` : undefined,
              }))}
              value={form.client_id}
              onValueChange={(v) => {
                const c = clients.find((x) => x.id === v);
                setForm({ ...form, client_id: v, customer_name: form.customer_name || (c?.name ?? "") });
              }}
              placeholder="— (required for udhar)"
              searchPlaceholder="Search by ID, name..."
            />
          </div>
          <div className="space-y-1.5"><Label>Product</Label>
            <SearchableSelect
              options={products.map((p) => ({
                value: p.id, label: p.product_name,
                hint: `${money(p.selling_price)} · ${p.quantity_in_stock} in stock`,
              }))}
              value={form.product_id}
              onValueChange={(v) => {
                const p = products.find((x) => x.id === v);
                setForm({ ...form, product_id: v, total_price: p && Number(p.selling_price) > 0 ? applyPct(p.selling_price * form.quantity_purchased, form.pct) : 0 });
              }}
              placeholder="Select product"
              searchPlaceholder="Search or type new product name..."
              onCreate={async (name) => {
                const { data, error } = await supabase.from("products")
                  .insert({ product_name: name, quantity_in_stock: 0, purchase_price: 0, selling_price: 0 })
                  .select().maybeSingle();
                if (error) return toast.error(error.message);
                if (data) {
                  setProducts((ps: any[]) => [...ps, data]);
                  setForm((f: any) => ({ ...f, product_id: data.id, total_price: 0 }));
                  toast.success(`New product "${name}" added — set its price in the Total box`);
                }
              }}
              createLabel="Add new product"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label>Qty</Label><Input type="number" value={form.quantity_purchased} onChange={(e) => {
              const qty = Number(e.target.value);
              const p = products.find((x) => x.id === form.product_id);
              setForm({ ...form, quantity_purchased: qty, total_price: p && Number(p.selling_price) > 0 ? applyPct(p.selling_price * qty, form.pct) : form.total_price });
            }} /></div>
            <div className="space-y-1.5"><Label>Adjust % (+/−, manual)</Label><Input type="number" placeholder="0" value={form.pct || ""} onChange={(e) => {
              const pct = Number(e.target.value) || 0;
              const p = products.find((x) => x.id === form.product_id);
              setForm({ ...form, pct, total_price: p && Number(p.selling_price) > 0 ? applyPct(p.selling_price * form.quantity_purchased, pct) : form.total_price });
            }} /></div>
          </div>
          <div className="space-y-1.5"><Label>Total (Rs)</Label><Input type="number" className="font-semibold" value={form.total_price} onChange={(e) => setForm({ ...form, total_price: Number(e.target.value) })} /></div>
          {form.pct !== 0 && form.product_id && (() => {
            const p = products.find((x) => x.id === form.product_id);
            return p && Number(p.selling_price) > 0 ? (
              <div className="text-[11px] text-muted-foreground -mt-1">
                Retail {p.selling_price.toLocaleString()} × {form.quantity_purchased} {form.pct > 0 ? "+" : ""}{form.pct}% = {form.total_price.toLocaleString()}
              </div>
            ) : null;
          })()}

          <div className="rounded-xl border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label>Payments received now</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPayLines([...payLines, { method: "cash", amount: 0 }])}>
                <Plus className="h-4 w-4 mr-1" /> Split
              </Button>
            </div>
            {payLines.map((l, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Select value={l.method} onValueChange={(v) => setLine(i, { method: v })}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="Amount" value={l.amount || ""} onChange={(e) => setLine(i, { amount: Number(e.target.value) })} />
                {payLines.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => setPayLines(payLines.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <div className="flex justify-between text-xs pt-1">
              <span className="text-muted-foreground">Paid: <b className="text-foreground">{money(paid)}</b></span>
              <span className={remaining > 0 ? "text-orange-500 font-semibold" : "text-green-600 font-semibold"}>
                {remaining > 0 ? `Udhar: ${money(remaining)}` : "Fully paid"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setPayLines([{ method: payLines[0]?.method ?? "cash", amount: total }])}>
                Full payment
              </Button>
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => {
                const others = payLines.slice(0, -1).reduce((a, l) => a + (Number(l.amount) || 0), 0);
                setLine(payLines.length - 1, { amount: Math.max(0, total - others) });
              }}>
                Rest here
              </Button>
            </div>
          </div>

          {remaining > 0 && (
            <div className="space-y-1.5">
              <Label>Due date (for udhar)</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
          )}

          <Button onClick={add} className="w-full" disabled={saving}>
            {saving ? "Saving..." : remaining > 0 ? `Record credit sale (${money(remaining)} due)` : "Record sale"}
          </Button>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="paid">
            <TabsList>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="credit">Credit / Udhar</TabsTrigger>
            </TabsList>
            <TabsContent value="paid"><SalesTable rows={cash} /></TabsContent>
            <TabsContent value="credit"><SalesTable rows={credit} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminShell>
  );
}

function SalesTable({ rows }: { rows: any[] }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="rounded-2xl bg-card shadow-sm overflow-x-auto mt-3">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
          <tr><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Product</th><th className="p-3">Qty</th><th className="p-3">Total</th><th className="p-3">Method</th><th className="p-3">Status</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const overdue = r.payment_status !== "paid" && r.payment_due_date && r.payment_due_date < today;
            return (
              <tr key={r.id} className="border-t">
                <td className="p-3">{shortDate(r.purchase_date)}</td>
                <td className="p-3">{r.customer_name}</td>
                <td className="p-3">{r.products?.product_name ?? "—"}</td>
                <td className="p-3">{r.quantity_purchased}</td>
                <td className="p-3 font-semibold">{money(r.total_price)}</td>
                <td className="p-3 text-muted-foreground">{r.payment_method}</td>
                <td className="p-3">
                  <span className={r.payment_status === "paid" ? "text-green-600" : overdue ? "text-destructive font-semibold" : "text-orange-500"}>
                    {overdue ? "overdue" : r.payment_status}
                  </span>
                  {r.payment_due_date && r.payment_status !== "paid" && (
                    <div className="text-[10px] text-muted-foreground">due {shortDate(r.payment_due_date)}</div>
                  )}
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No sales.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
