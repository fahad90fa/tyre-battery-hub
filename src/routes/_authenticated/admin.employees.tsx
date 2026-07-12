import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/employees")({
  component: EmployeesAdmin,
});

const empty = { name: "", phone: "", email: "", cnic: "", position: "", salary: 0, joining_date: "", status: "active", notes: "" };

function EmployeesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name?.trim()) return toast.error("Name required");
    const payload = { ...form, salary: Number(form.salary || 0), joining_date: form.joining_date || null };
    const { error } = editing
      ? await supabase.from("employees").update(payload).eq("id", editing)
      : await supabase.from("employees").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Created");
    setOpen(false); setEditing(null); setForm(empty); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this employee?")) return;
    await supabase.from("employees").delete().eq("id", id);
    load();
  };
  const edit = (r: any) => { setEditing(r.id); setForm({ ...empty, ...r, joining_date: r.joining_date ?? "" }); setOpen(true); };
  const toggle = async (r: any) => {
    await supabase.from("employees").update({ status: r.status === "active" ? "inactive" : "active" }).eq("id", r.id);
    load();
  };

  const filtered = rows.filter((r) => !q || (r.name + " " + (r.position ?? "") + " " + (r.phone ?? "")).toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminShell title="Employees">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search employees..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(empty); }}><Plus className="h-4 w-4 mr-2" /> Add employee</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} employee</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" full><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Position"><Input value={form.position ?? ""} onChange={(e) => setForm({ ...form, position: e.target.value })} /></Field>
              <Field label="Salary"><Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} /></Field>
              <Field label="Phone"><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Email"><Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="CNIC"><Input value={form.cnic ?? ""} onChange={(e) => setForm({ ...form, cnic: e.target.value })} /></Field>
              <Field label="Joining date"><Input type="date" value={form.joining_date ?? ""} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} /></Field>
              <Field label="Status" full>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Notes" full><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            </div>
            <Button className="w-full mt-2" onClick={save}>Save</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Position</th><th className="p-3">Phone</th><th className="p-3">Salary</th><th className="p-3">Joined</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3 text-muted-foreground">{r.position ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{r.phone ?? "—"}</td>
                <td className="p-3 font-semibold">{money(r.salary)}</td>
                <td className="p-3">{r.joining_date ? shortDate(r.joining_date) : "—"}</td>
                <td className="p-3"><Badge variant={r.status === "active" ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggle(r)}>{r.status}</Badge></td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => edit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No employees.</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={`space-y-1.5 ${full ? "col-span-2" : ""}`}><Label>{label}</Label>{children}</div>;
}
