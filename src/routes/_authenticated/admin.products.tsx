import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, localDateOf } from "@/lib/format";
import { inStockFirst } from "@/lib/pricing";
import { isTracked, stockOf } from "@/lib/stock";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { fetchAll } from "@/lib/fetchAll";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsAdmin,
});

// Exactly the columns this form is allowed to write. Stock is deliberately
// absent: the database owns products.quantity_in_stock (purchases, invoice
// lines and stock_adjustments move it through triggers), so this page only
// ever books an adjustment row, never the number itself.
type ProductForm = {
  product_name: string; description: string; image_url: string;
  category_id: string; subcategory_id: string; brand_id: string;
  purchase_price: number | string; selling_price: number | string;
  // Off for services, trade-ins and consumables that are sold without ever
  // being booked in — they are always sellable and never "out of stock".
  track_stock: boolean;
  // Website visibility: featured products and "deal of the day" items.
  is_featured: boolean; is_deal: boolean; deal_end_date: string;
};
const empty: ProductForm = { product_name: "", description: "", image_url: "", category_id: "", subcategory_id: "", brand_id: "",
  purchase_price: 0, selling_price: 0, track_stock: true, is_featured: false, is_deal: false, deal_end_date: "" };

const ADJUST_REASONS = ["Physical count", "Damaged or expired", "Returned to merchant", "Correction"] as const;

function ProductsAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [form, setForm] = useState<ProductForm>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // Create: units on the shelf right now (booked as an "Opening count").
  const [openingStock, setOpeningStock] = useState("");
  // Edit: the live count when the dialog opened, and the count the owner
  // actually found — the difference becomes a stock_adjustments row.
  const [currentStock, setCurrentStock] = useState(0);
  const [counted, setCounted] = useState("");
  // Only a count the owner actually typed is booked — opening and saving the
  // dialog for a price change must never touch stock.
  const [countTouched, setCountTouched] = useState(false);
  const countTouchedRef = useRef(false);
  useEffect(() => { countTouchedRef.current = countTouched; }, [countTouched]);
  const [reason, setReason] = useState<string>(ADJUST_REASONS[0]);
  const [note, setNote] = useState("");

  const load = async () => {
    const [{ data: p }, { data: c }, { data: s }, { data: b }] = await Promise.all([
      fetchAll((a, b) => supabase.from("products").select("*, categories(name), brands(name)").order("created_at", { ascending: false }).order("id").range(a, b)),
      supabase.from("categories").select("id, name"),
      supabase.from("subcategories").select("id, name, category_id"),
      supabase.from("brands").select("id, name"),
    ]);
    // In-stock products first, out-of-stock at the end; newest first within
    // each group (the order this table always used).
    setRows(inStockFirst(p ?? [], (a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")));
    setCats(c ?? []); setSubs(s ?? []); setBrands(b ?? []);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEditing(null); setForm(empty); setOpeningStock("");
    setCurrentStock(0); setCounted(""); setCountTouched(false); setReason(ADJUST_REASONS[0]); setNote("");
  };

  const save = async () => {
    if (saving) return; // a double tap must not create the product twice
    setSaving(true);
    try { await persist(); } finally { setSaving(false); }
  };

  // The counted figure as a whole number; blank means "unchanged".
  const countedN = counted.trim() === "" ? currentStock : Math.round(Number(counted) || 0);
  const stockDelta = form.track_stock && countTouched ? countedN - currentStock : 0;

  const persist = async () => {
    const name = form.product_name.trim().replace(/\s+/g, " ");
    if (!name) return toast.error("Product name required");
    const payload = {
      product_name: name,
      description: form.description?.trim() || null,
      image_url: form.image_url || null,
      category_id: form.category_id || null,
      subcategory_id: form.subcategory_id || null,
      brand_id: form.brand_id || null,
      purchase_price: Number(form.purchase_price) || 0,
      // The shop price is whole rupees — no paisa figures on the shelf.
      selling_price: Math.round(Number(form.selling_price) || 0),
      track_stock: form.track_stock !== false,
      is_featured: !!form.is_featured,
      is_deal: !!form.is_deal,
      // A deal runs through the end of the chosen day (form holds YYYY-MM-DD).
      deal_end_date: form.is_deal && form.deal_end_date
        ? new Date(`${form.deal_end_date}T23:59:59`).toISOString() : null,
    };
    const describe = (e: { code?: string; message: string }) =>
      e.code === "23505" ? "A product with this name already exists" : e.message;

    if (editing) {
      if (stockDelta !== 0 && countedN < 0) return toast.error("Counted stock cannot be negative");
      const { data, error } = await supabase.from("products").update(payload).eq("id", editing).select("id").maybeSingle();
      if (error) return toast.error(describe(error));
      if (!data) return toast.error("Product not found — refresh the page");
      if (form.track_stock && countTouched && counted.trim() !== "") {
        // The database books the difference to the LIVE ledger figure in one
        // statement, so a sale made since this page was opened cannot skew it.
        const { data: delta, error: adjErr } = await supabase.rpc("stock_set_count", {
          _product: editing, _counted: countedN, _reason: reason, _note: note.trim() || null,
        });
        if (adjErr) {
          // The product details are saved; refresh so a retry starts from them.
          await load();
          return toast.error(`Product saved, but the stock count failed: ${adjErr.message}`);
        }
        const d = Number(delta) || 0;
        toast.success(d === 0
          ? "Product updated — stock already matched the count"
          : `Product updated — stock ${d > 0 ? "+" : ""}${d} (${reason}), now ${countedN}`);
      } else {
        toast.success("Product updated");
      }
    } else {
      const opening = form.track_stock ? Math.round(Number(openingStock) || 0) : 0;
      if (opening < 0) return toast.error("Opening stock cannot be negative");
      const { data, error } = await supabase.from("products").insert({ ...payload, quantity_in_stock: 0 }).select("id").maybeSingle();
      if (error) return toast.error(describe(error));
      if (!data) return toast.error("Could not create product");
      if (opening > 0) {
        const { error: adjErr } = await supabase.from("stock_adjustments").insert({
          product_id: data.id, delta: opening, reason: "Opening count", note: "Entered on the Products page",
        });
        // The product now exists, so a retry would hit the duplicate-name
        // check — close, and point at the edit dialog for the count.
        if (adjErr) toast.error(`Product created, but its opening stock was not saved — edit it and adjust the stock: ${adjErr.message}`);
        else toast.success(`Product created with ${opening} in stock`);
      } else {
        toast.success("Product created");
      }
    }
    setOpen(false); startNew(); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  // Only the editable columns go into the form — never the embedded
  // categories/brands objects, id or created_at (PostgREST rejects them).
  const edit = (r: any) => {
    setEditing(r.id);
    setForm({
      product_name: r.product_name ?? "", description: r.description ?? "", image_url: r.image_url ?? "",
      category_id: r.category_id ?? "", subcategory_id: r.subcategory_id ?? "", brand_id: r.brand_id ?? "",
      purchase_price: r.purchase_price ?? 0, selling_price: r.selling_price ?? 0,
      track_stock: isTracked(r),
      is_featured: !!r.is_featured, is_deal: !!r.is_deal,
      // Keep the local calendar day in the form; the stored value is an instant.
      deal_end_date: r.deal_end_date ? (localDateOf(r.deal_end_date) || String(r.deal_end_date).slice(0, 10)) : "",
    });
    const stock = stockOf(r);
    setCurrentStock(stock); setCounted(String(stock)); setCountTouched(false); setReason(ADJUST_REASONS[0]); setNote("");
    setOpeningStock("");
    setOpen(true);
    // The list may be minutes old: show the live figure.
    supabase.from("products").select("quantity_in_stock").eq("id", r.id).maybeSingle().then(({ data }) => {
      if (!data) return;
      const live = stockOf(data);
      setCurrentStock(live);
      if (!countTouchedRef.current) setCounted(String(live));
    });
  };

  return (
    <AdminShell title="Products">
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={startNew}>
              <Plus className="h-4 w-4 mr-2" /> Add product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} product</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Product name" full><Input value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} /></Field>
              <Field label="Category">
                <SearchableSelect
                  options={cats.map((c) => ({ value: c.id, label: c.name }))}
                  value={form.category_id}
                  onValueChange={(v) => setForm({ ...form, category_id: v, subcategory_id: "" })}
                  placeholder="—" searchPlaceholder="Search category..."
                />
              </Field>
              <Field label="Subcategory">
                <SearchableSelect
                  options={subs.filter((s) => s.category_id === form.category_id).map((s) => ({ value: s.id, label: s.name }))}
                  value={form.subcategory_id}
                  onValueChange={(v) => setForm({ ...form, subcategory_id: v })}
                  placeholder="—" searchPlaceholder="Search subcategory..."
                />
              </Field>
              <Field label="Brand">
                <SearchableSelect
                  options={brands.map((b) => ({ value: b.id, label: b.name }))}
                  value={form.brand_id}
                  onValueChange={(v) => setForm({ ...form, brand_id: v })}
                  placeholder="—" searchPlaceholder="Search brand..."
                />
              </Field>
              <Field label="Product image" full><ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} /></Field>
              <Field label="Purchase price — merchant cost (Rs)"><Input type="number" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} /></Field>
              <Field label="Selling price — shop price (Rs)"><Input type="number" step="1" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} /></Field>
              <div className="col-span-2">
                <label className="flex items-start gap-2 cursor-pointer text-sm">
                  <Checkbox className="mt-0.5" checked={form.track_stock} onCheckedChange={(v) => setForm({ ...form, track_stock: v === true })} />
                  <span>Track stock — untick for services, trade-ins and consumables that are sold without being booked in</span>
                </label>
              </div>

              {!form.track_stock ? (
                <div className="col-span-2 text-xs text-muted-foreground rounded-lg bg-muted/40 px-3 py-2">
                  Not stock-tracked: always sellable, never shown as out of stock, no counts to keep.
                </div>
              ) : editing ? (
                <div className="col-span-2 rounded-xl border p-3 space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Current stock</div>
                      <div className="font-semibold">
                        {currentStock > 0 ? (
                          <span>{currentStock} in stock</span>
                        ) : (
                          <span className="text-destructive">
                            Out of stock{currentStock < 0 ? ` (${-currentStock} oversold — book the purchase)` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-[11px] text-muted-foreground max-w-xs">
                      Arrivals are booked on the Stock Purchases page and sales take units off automatically.
                      Use the count below only to correct what is on the shelf.
                    </div>
                  </div>
                  <div className="text-sm font-semibold">Adjust stock</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Counted stock">
                      <Input type="number" step="1" min="0" value={counted} onChange={(e) => { setCounted(e.target.value); setCountTouched(true); }} />
                    </Field>
                    <Field label="Reason">
                      <Select value={reason} onValueChange={setReason}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ADJUST_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Note (optional)" full>
                      <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. 2 tyres found damaged in the store room" />
                    </Field>
                  </div>
                  <div className="text-xs">
                    {stockDelta === 0
                      ? <span className="text-muted-foreground">No stock change.</span>
                      : <span className={stockDelta > 0 ? "text-green-600 font-semibold" : "text-destructive font-semibold"}>
                          Saving will record {stockDelta > 0 ? "+" : ""}{stockDelta} ({reason}) — stock becomes {countedN}.
                        </span>}
                  </div>
                </div>
              ) : (
                <Field label="Opening stock (units on the shelf now)">
                  <Input type="number" step="1" min="0" placeholder="0" value={openingStock} onChange={(e) => setOpeningStock(e.target.value)} />
                </Field>
              )}

              <Field label="Show on website" full>
                <div className="flex flex-wrap gap-5 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={!!form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v === true })} /> Featured product
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={!!form.is_deal} onCheckedChange={(v) => setForm({ ...form, is_deal: v === true })} /> Deal of the day
                  </label>
                </div>
              </Field>
              {form.is_deal && (
                <Field label="Deal ends on">
                  <Input type="date" value={form.deal_end_date || ""}
                         onChange={(e) => setForm({ ...form, deal_end_date: e.target.value })} />
                </Field>
              )}
              <Field label="Description" full><Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
            <Button className="w-full mt-2" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl bg-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Brand</th>
              <th className="p-3">Stock</th><th className="p-3">Price</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-3">
                    {r.image_url ? (
                      <img src={r.image_url} alt="" className="h-10 w-10 rounded object-cover border" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted border" />
                    )}
                    <span>{r.product_name}</span>
                    {r.is_deal && <span className="ml-2 text-[10px] rounded-full bg-gold/15 text-amber-700 px-2 py-0.5 font-semibold">Deal</span>}
                    {r.is_featured && <span className="ml-1 text-[10px] rounded-full bg-primary/10 text-primary px-2 py-0.5 font-semibold">Featured</span>}
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{r.categories?.name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{r.brands?.name ?? "—"}</td>
                <td className="p-3">
                  {!isTracked(r) ? (
                    <span className="text-muted-foreground text-xs">Not tracked</span>
                  ) : stockOf(r) > 0 ? stockOf(r) : (
                    <span className="inline-block whitespace-nowrap text-[10px] rounded-full bg-destructive/10 text-destructive px-2 py-0.5 font-semibold">
                      Out of stock{stockOf(r) < 0 ? ` · ${-stockOf(r)} oversold` : ""}
                    </span>
                  )}
                </td>
                <td className="p-3 font-semibold">{money(r.selling_price)}</td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => edit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? "col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
