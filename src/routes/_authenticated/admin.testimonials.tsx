import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { shortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageSquareQuote, Plus, Star, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: TestimonialsAdmin,
});

const blank = { customer_name: "", message: "", rating: 5 };

/** Customer reviews shown on the website's home page. */
function TestimonialsAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.customer_name.trim() || !form.message.trim()) return toast.error("Name and review are required");
    setSaving(true);
    try {
      const { error } = await supabase.from("testimonials").insert({
        customer_name: form.customer_name.trim(), message: form.message.trim(),
        rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
      });
      if (error) return toast.error(error.message);
      toast.success("Review added — it now shows on the website");
      setForm(blank); load();
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id: string) => {
    if (!confirm("Remove this review from the website?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <AdminShell title="Testimonials (website)">
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-card p-5 shadow-sm space-y-3">
          <div className="font-semibold flex items-center gap-2"><MessageSquareQuote className="h-4 w-4 text-gold" /> Add a customer review</div>
          <div className="space-y-1.5"><Label>Customer name</Label>
            <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Review</Label>
            <Textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Rating (1–5)</Label>
            <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></div>
          <Button className="w-full" onClick={add} disabled={saving}><Plus className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Add review"}</Button>
          <div className="text-xs text-muted-foreground">Reviews appear in the rotating testimonials section on the home page, newest first.</div>
        </div>
        <div className="lg:col-span-3 rounded-2xl bg-card shadow-sm divide-y">
          {rows.map((r) => (
            <div key={r.id} className="p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold flex items-center gap-2">
                  {r.customer_name}
                  <span className="inline-flex text-gold">{[...Array(Math.min(5, Math.max(0, Number(r.rating) || 0)))].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{r.message}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{shortDate(r.created_at)}</div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          {rows.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No reviews yet — the website shows two sample reviews until you add your own.</div>}
        </div>
      </div>
    </AdminShell>
  );
}
