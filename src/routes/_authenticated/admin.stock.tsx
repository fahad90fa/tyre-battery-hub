import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/stock")({
  component: StockAdmin,
});

type PurchaseLine = { product_id: string; quantity: number; unit_cost: number };

const emptyLine = (): PurchaseLine => ({ product_id: "", quantity: 1, unit_cost: 0 });

function StockAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [merchantId, setMerchantId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [lines, setLines] = useState<PurchaseLine[]>([emptyLine()]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [{ data: r }, { data: p }, { data: m }] = await Promise.all([
      supabase.from("stock_purchases").select("*, products(product_name)").order("date", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("products").select("id, product_name, quantity_in_stock, purchase_price"),
      supabase.from("merchants").select("id, name, account_no").order("name"),
    ]);
    setRows(r ?? []); setProducts(p ?? []); setMerchants(m ?? []);
  };
  useEffect(() => { load(); }, []);

  const setLine = (i: number, patch: Partial<PurchaseLine>) =>
    setLines((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  // Instantly create a brand-new product from the picker (first-time arrivals).
  const createProduct = async (i: number, name: string) => {
    const { data, error } = await supabase.from("products")
      .insert({ product_name: name, quantity_in_stock: 0, purchase_price: 0, selling_price: 0 })
      .select().maybeSingle();
    if (error) return toast.error(error.message);
    if (data) {
      setProducts((ps) => [...ps, data]);
      setLine(i, { product_id: data.id });
      toast.success(`New product "${name}" added — you can edit it any time in Products`);
    }
  };

  const total = lines.reduce((a, l) => a + (Number(l.quantity) || 0) * (Number(l.unit_cost) || 0), 0);

  const add = async () => {
    if (!merchantId) return toast.error("Select the merchant this stock was purchased from");
    const valid = lines.filter((l) => l.product_id && Number(l.quantity) > 0);
    if (valid.length === 0) return toast.error("Add at least one product line");
    if (lines.some((l) => !l.product_id && (Number(l.quantity) || 0) * (Number(l.unit_cost) || 0) > 0))
      return toast.error("Select a product for every filled item line");
    if (valid.some((l) => !(Number(l.unit_cost) > 0)))
      return toast.error("Enter a unit cost for every item line");
    const supplier = supplierName || merchants.find((m) => m.id === merchantId)?.name || "";
    const validTotal = valid.reduce((a, l) => a + Number(l.quantity) * Number(l.unit_cost), 0);

    setSaving(true);
    try {
      const ref = "PUR-" + Date.now();
      const { error } = await supabase.from("stock_purchases").insert(valid.map((l) => ({
        date, supplier_name: supplier, product_id: l.product_id,
        quantity: Number(l.quantity), purchase_price: Number(l.unit_cost),
        reference: ref, merchant_id: merchantId,
      })));
      if (error) return toast.error(error.message);

      // Aggregate per product so the same product on two lines adds both quantities.
      const byProduct = new Map<string, { qty: number; unit_cost: number }>();
      for (const l of valid) {
        const cur = byProduct.get(l.product_id);
        byProduct.set(l.product_id, { qty: (cur?.qty ?? 0) + Number(l.quantity), unit_cost: Number(l.unit_cost) });
      }
      for (const [productId, { qty, unit_cost }] of byProduct) {
        const prod = products.find((p) => p.id === productId);
        if (prod) {
          const { error: updErr } = await supabase.from("products").update({
            quantity_in_stock: prod.quantity_in_stock + qty,
            purchase_price: unit_cost,
            last_purchase_date: date,
          }).eq("id", productId);
          if (updErr) toast.error(`Stock count update failed for ${prod.product_name}: ${updErr.message}`);
        }
      }

      const detail = valid.map((l) => {
        const p = products.find((x) => x.id === l.product_id);
        return `${p?.product_name ?? "?"} × ${l.quantity} @ ${money(l.unit_cost)}`;
      }).join("; ");
      const { error: ledErr } = await supabase.from("merchant_ledger").insert({
        merchant_id: merchantId, entry_type: "purchase", amount: validTotal,
        reference: ref, note: detail, entry_date: date,
      });
      if (ledErr) toast.error(`Stock saved but ledger entry failed: ${ledErr.message}`);

      toast.success(`Purchase of ${valid.length} item${valid.length > 1 ? "s" : ""} (${money(validTotal)}) recorded`);
      setLines([emptyLine()]); setSupplierName(""); setMerchantId("");
      setDate(new Date().toISOString().slice(0, 10));
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Stock Purchases">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-sm space-y-3">
          <div className="font-semibold">Log purchase from merchant</div>
          <div className="space-y-1.5"><Label>Merchant <span className="text-destructive">*</span></Label>
            <SearchableSelect
              options={merchants.map((m) => ({ value: m.id, label: m.name, hint: m.account_no ?? undefined }))}
              value={merchantId}
              onValueChange={(v) => {
                const m = merchants.find((x) => x.id === v);
                setMerchantId(v);
                if (!supplierName) setSupplierName(m?.name ?? "");
              }}
              placeholder="Select merchant"
              searchPlaceholder="Search merchant by name or ID..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label>Purchase date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5"><Label>Supplier</Label>
              <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
            </div>
          </div>

          <div className="rounded-xl border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items purchased</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setLines([...lines, emptyLine()])}>
                <Plus className="h-4 w-4 mr-1" /> Add item
              </Button>
            </div>
            {lines.map((l, i) => (
              <div key={i} className="space-y-1.5 border-b last:border-0 pb-2 last:pb-0">
                <div className="flex gap-1.5 items-center">
                  <div className="flex-1 min-w-0">
                    <SearchableSelect
                      options={products.map((p) => ({ value: p.id, label: p.product_name, hint: `stock ${p.quantity_in_stock}` }))}
                      value={l.product_id}
                      onValueChange={(v) => setLine(i, { product_id: v })}
                      placeholder="Product"
                      searchPlaceholder="Search or type new product name..."
                      onCreate={(name) => createProduct(i, name)}
                      createLabel="Add new product"
                    />
                  </div>
                  {lines.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => setLines(lines.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <Input type="number" placeholder="Qty" value={l.quantity || ""} onChange={(e) => setLine(i, { quantity: Number(e.target.value) })} />
                  <Input type="number" placeholder="Unit cost" value={l.unit_cost || ""} onChange={(e) => setLine(i, { unit_cost: Number(e.target.value) })} />
                  <div className="grid place-items-center text-xs font-semibold text-muted-foreground">
                    {money((Number(l.quantity) || 0) * (Number(l.unit_cost) || 0))}
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-1 border-t">
              <span className="text-muted-foreground">Total</span>
              <b>{money(total)}</b>
            </div>
          </div>

          <Button onClick={add} className="w-full" disabled={saving}>
            {saving ? "Saving..." : `Add stock (${money(total)})`}
          </Button>
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-card shadow-sm overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Date</th><th className="p-3">Ref</th><th className="p-3">Supplier</th><th className="p-3">Product</th><th className="p-3">Qty</th><th className="p-3">Unit cost</th><th className="p-3">Total</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 whitespace-nowrap">{shortDate(r.date)}</td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{r.reference ?? "—"}</td>
                  <td className="p-3">{r.supplier_name}</td>
                  <td className="p-3">{r.products?.product_name ?? "—"}</td>
                  <td className="p-3">{r.quantity}</td>
                  <td className="p-3">{money(r.purchase_price)}</td>
                  <td className="p-3 font-semibold">{money(Number(r.purchase_price) * r.quantity)}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No purchases yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
