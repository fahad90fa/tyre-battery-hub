import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate, localToday } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/expenses")({
  component: ExpensesAdmin,
});

function ExpensesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ expense_type: "", amount: 0, notes: "", date: localToday() });

  const load = async () => {
    const { data } = await supabase.from("expenses").select("*")
      .order("date_of_expense", { ascending: false }).order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.expense_type || !form.amount) return toast.error("Fill required fields");
    const { error } = await supabase.from("expenses").insert({
      expense_type: form.expense_type, amount: Number(form.amount),
      notes: form.notes, date_of_expense: form.date,
    });
    if (error) return toast.error(error.message);
    setForm({ expense_type: "", amount: 0, notes: "", date: form.date });
    toast.success("Expense added"); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    await supabase.from("expenses").delete().eq("id", id); load();
  };

  // Group day by day — each date gets its own block with a daily total.
  const byDay = useMemo(() => {
    const map = new Map<string, any[]>();
    rows.forEach((r) => {
      const d = r.date_of_expense ?? "—";
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(r);
    });
    return [...map.entries()];
  }, [rows]);

  const today = localToday();
  const total = rows.reduce((s, r) => s + Number(r.amount), 0);
  const todayTotal = rows.filter((r) => r.date_of_expense === today).reduce((s, r) => s + Number(r.amount), 0);

  const dayLabel = (d: string) => {
    if (d === today) return `Today — ${shortDate(d)}`;
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (d === y.toISOString().slice(0, 10)) return `Yesterday — ${shortDate(d)}`;
    return shortDate(d);
  };

  return (
    <AdminShell title="Expenses">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card p-5 shadow-sm space-y-3 h-fit">
          <div className="font-semibold">Add expense</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1.5"><Label>Amount (Rs)</Label>
              <Input type="number" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-1.5"><Label>Type</Label><Input value={form.expense_type} onChange={(e) => setForm({ ...form, expense_type: e.target.value })} placeholder="Rent, Utilities, Chai..." /></div>
          <div className="space-y-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <Button onClick={add} className="w-full">Add expense</Button>
          <div className="pt-3 border-t text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Today's expenses</span><b className="text-orange-500">{money(todayTotal)}</b></div>
            <div className="flex justify-between"><span className="text-muted-foreground">All-time total</span><b>{money(total)}</b></div>
          </div>
        </div>

        <div className="lg:col-span-2 min-w-0 space-y-4">
          {byDay.length === 0 && (
            <div className="rounded-2xl bg-card p-10 text-center text-muted-foreground shadow-sm">No expenses yet.</div>
          )}
          {byDay.map(([day, list]) => {
            const dayTotal = list.reduce((s, r) => s + Number(r.amount), 0);
            return (
              <div key={day} className="rounded-2xl bg-card shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/60 border-b">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <CalendarDays className="h-4 w-4 text-gold" /> {dayLabel(day)}
                    <span className="text-xs font-normal text-muted-foreground">({list.length} entr{list.length > 1 ? "ies" : "y"})</span>
                  </div>
                  <div className="font-bold text-orange-500">{money(dayTotal)}</div>
                </div>
                <div className="divide-y">
                  {list.map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{r.expense_type}</div>
                        {r.notes && <div className="text-xs text-muted-foreground truncate">{r.notes}</div>}
                        <div className="text-[10px] text-muted-foreground">{shortDate(r.date_of_expense)}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-semibold">{money(r.amount)}</span>
                        <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
