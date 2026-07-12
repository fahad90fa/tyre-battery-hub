import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Copy, Search } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/templates")({
  component: TemplatesAdmin,
});

const empty = { name: "", description: "", category_id: "", image_url: "", default_price: 0, notes: "" };

function TemplatesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from("templates").select("*, categories(name)").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
    ]);
    setRows(t ?? []); setCats(c ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name?.trim()) return toast.error("Name required");
    const payload = { ...form, category_id: form.category_id || null, default_price: Number(form.default_price || 0) };
    const { error } = editing
      ? await supabase.from("templates").update(payload).eq("id", editing)
      : await supabase.from("templates").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Created");
    setOpen(false); setEditing(null); setForm(empty); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete template?")) return;
    await supabase.from("templates").delete().eq("id", id); load();
  };
  const edit = (r: any) => { setEditing(r.id); setForm({ ...empty, ...r, category_id: r.category_id ?? "" }); setOpen(true); };

  const useTemplate = async (t: any) => {
    const { error } = await supabase.from("products").insert({
      product_name: t.name, description: t.description, image_url: t.image_url,
      category_id: t.category_id, selling_price: t.default_price, purchase_price: 0, quantity_in_stock: 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Product created from template");
  };

  const filtered = rows.filter((r) => !q || (r.name + " " + (r.categories?.name ?? "")).toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminShell title="Templates">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(empty); }}><Plus className="h-4 w-4 mr-2" /> Add template</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} template</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" full><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Category">
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Default price"><Input type="number" value={form.default_price} onChange={(e) => setForm({ ...form, default_price: e.target.value })} /></Field>
              <Field label="Image" full><ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} /></Field>
              <Field label="Description" full><Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
              <Field label="Notes" full><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            </div>
            <Button className="w-full mt-2" onClick={save}>Save</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Template</th><th className="p-3">Category</th><th className="p-3">Default price</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-3">
                    {r.image_url ? <img src={r.image_url} alt="" className="h-10 w-10 rounded object-cover border" /> : <div className="h-10 w-10 rounded bg-muted border" />}
                    <span>{r.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{r.categories?.name ?? "—"}</td>
                <td className="p-3 font-semibold">{money(r.default_price)}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" title="Create product" onClick={() => useTemplate(r)}><Copy className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => edit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-muted-foreground">No templates yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={`space-y-1.5 ${full ? "col-span-2" : ""}`}><Label>{label}</Label>{children}</div>;
}
