import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesAdmin,
});

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function CategoriesAdmin() {
  const [cats, setCats] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState<Record<string, string>>({});

  const load = async () => {
    const [{ data: c }, { data: s }] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("subcategories").select("*"),
    ]);
    setCats(c ?? []); setSubs(s ?? []);
  };
  useEffect(() => { load(); }, []);

  const addCat = async () => {
    if (!newCat.trim()) return;
    const { error } = await supabase.from("categories").insert({
      name: newCat.toUpperCase(), slug: slugify(newCat), display_order: cats.length + 1,
    });
    if (error) return toast.error(error.message);
    setNewCat(""); load();
  };
  const delCat = async (id: string) => {
    if (!confirm("Delete category and all subcategories?")) return;
    await supabase.from("categories").delete().eq("id", id); load();
  };
  const addSub = async (cid: string) => {
    const name = newSub[cid]?.trim();
    if (!name) return;
    const { error } = await supabase.from("subcategories").insert({ category_id: cid, name, slug: slugify(name) });
    if (error) return toast.error(error.message);
    setNewSub({ ...newSub, [cid]: "" }); load();
  };
  const delSub = async (id: string) => { await supabase.from("subcategories").delete().eq("id", id); load(); };

  return (
    <AdminShell title="Categories">
      <div className="max-w-3xl space-y-4">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <div className="font-semibold mb-3">Add category</div>
          <div className="flex gap-2">
            <Input placeholder="Category name" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
            <Button onClick={addCat}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          </div>
        </div>

        {cats.map((c) => (
          <div key={c.id} className="rounded-2xl bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-bold">{c.name}</div>
              <Button variant="ghost" size="icon" onClick={() => delCat(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <div className="mt-3 space-y-2">
              {subs.filter((s) => s.category_id === c.id).map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm py-1 border-t">
                  <span>{s.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => delSub(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Input placeholder="New subcategory" value={newSub[c.id] ?? ""} onChange={(e) => setNewSub({ ...newSub, [c.id]: e.target.value })} />
                <Button onClick={() => addSub(c.id)} size="sm">Add</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
