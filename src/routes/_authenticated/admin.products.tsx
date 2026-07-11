import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsAdmin,
});

const empty = { product_name: "", description: "", image_url: "", category_id: "", subcategory_id: "", brand_id: "",
  quantity_in_stock: 0, purchase_price: 0, selling_price: 0 };

function ProductsAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [{ data: p }, { data: c }, { data: s }, { data: b }] = await Promise.all([
      supabase.from("products").select("*, categories(name), brands(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
      supabase.from("subcategories").select("id, name, category_id"),
      supabase.from("brands").select("id, name"),
    ]);
    setRows(p ?? []); setCats(c ?? []); setSubs(s ?? []); setBrands(b ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...form,
      category_id: form.category_id || null,
      subcategory_id: form.subcategory_id || null,
      brand_id: form.brand_id || null,
      quantity_in_stock: Number(form.quantity_in_stock),
      purchase_price: Number(form.purchase_price),
      selling_price: Number(form.selling_price),
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing)
      : await supabase.from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Product updated" : "Product created");
    setOpen(false); setEditing(null); setForm(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const edit = (r: any) => {
    setEditing(r.id);
    setForm({ ...empty, ...r, category_id: r.category_id ?? "", subcategory_id: r.subcategory_id ?? "", brand_id: r.brand_id ?? "" });
    setOpen(true);
  };

  return (
    <AdminShell title="Products">
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(empty); }}>
              <Plus className="h-4 w-4 mr-2" /> Add product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} product</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Product name" full><Input value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} /></Field>
              <Field label="Category">
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v, subcategory_id: "" })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Subcategory">
                <Select value={form.subcategory_id} onValueChange={(v) => setForm({ ...form, subcategory_id: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{subs.filter((s) => s.category_id === form.category_id).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Brand">
                <Select value={form.brand_id} onValueChange={(v) => setForm({ ...form, brand_id: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Image URL" full><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></Field>
              <Field label="Purchase price"><Input type="number" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} /></Field>
              <Field label="Selling price"><Input type="number" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} /></Field>
              <Field label="Stock qty"><Input type="number" value={form.quantity_in_stock} onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })} /></Field>
              <Field label="Description" full><Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            </div>
            <Button className="w-full mt-2" onClick={save}>Save</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Brand</th>
              <th className="p-3">Stock</th><th className="p-3">Price</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.product_name}</td>
                <td className="p-3 text-muted-foreground">{r.categories?.name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{r.brands?.name ?? "—"}</td>
                <td className="p-3">{r.quantity_in_stock}</td>
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
