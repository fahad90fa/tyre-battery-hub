import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/expenses")({
  component: ExpensesAdmin,
});

function ExpensesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ expense_type: "", amount: 0, notes: "" });

  const load = async () => {
    const { data } = await supabase.from("expenses").select("*").order("date_of_expense", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.expense_type || !form.amount) return toast.error("Fill required fields");
    const { error } = await supabase.from("expenses").insert({ ...form, amount: Number(form.amount) });
    if (error) return toast.error(error.message);
    setForm({ expense_type: "", amount: 0, notes: "" }); toast.success("Expense added"); load();
  };
  const remove = async (id: string) => { await supabase.from("expenses").delete().eq("id", id); load(); };

  const total = rows.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <AdminShell title="Expenses">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-sm space-y-3">
          <div className="font-semibold">Add expense</div>
          <div className="space-y-1.5"><Label>Type</Label><Input value={form.expense_type} onChange={(e) => setForm({ ...form, expense_type: e.target.value })} placeholder="Rent, Utilities..." /></div>
          <div className="space-y-1.5"><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
          <div className="space-y-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <Button onClick={add} className="w-full">Add</Button>
          <div className="pt-3 border-t text-sm">
            Total expenses: <span className="font-bold">{money(total)}</span>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl bg-card shadow-sm overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Amount</th><th className="p-3">Notes</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{shortDate(r.date_of_expense)}</td>
                  <td className="p-3">{r.expense_type}</td>
                  <td className="p-3 font-semibold">{money(r.amount)}</td>
                  <td className="p-3 text-muted-foreground">{r.notes ?? ""}</td>
                  <td className="p-3 text-right"><Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No expenses yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
