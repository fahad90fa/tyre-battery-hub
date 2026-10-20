import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { money, shortDate, localToday, localDateOf } from "@/lib/format";
import { PAYMENT_METHODS, methodLabel, paymentStatus } from "@/lib/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/employees")({
  component: EmployeesAdmin,
});

const empty = { name: "", phone: "", email: "", cnic: "", position: "", salary: 0, joining_date: "", status: "active", notes: "" };

type Payment = Tables<"salary_payments">;
type PayStatus = "paid" | "partial" | "unpaid";
type MonthState = { due: number; paid: number; remaining: number; status: PayStatus; eligible: boolean; rows: Payment[] };

// ── Payroll months are "YYYY-MM", always in the device's local calendar ──
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthParts = (m: string) => { const [y, mo] = m.split("-").map(Number); return [y, mo] as const; };
const addMonths = (m: string, k: number) => { const [y, mo] = monthParts(m); return ym(new Date(y, mo - 1 + k, 1)); };
const monthLabel = (m: string) => { const [y, mo] = monthParts(m); return `${MONTHS[mo - 1]} ${y}`; };
const monthEnd = (m: string) => { const [y, mo] = monthParts(m); return localDateOf(new Date(y, mo, 0)); };
const round2 = (n: number) => Math.round(n * 100) / 100;
const firstName = (name: string | null | undefined) => String(name ?? "").trim().split(/\s+/)[0]?.toLowerCase() ?? "";
// Salaries are not paid in scrap.
const SALARY_METHODS = PAYMENT_METHODS.filter((m) => m.value !== "scrap");

/** One employee's salary for one month: due is the salary recorded with that
 *  month's payments (a later raise does not rewrite an old month), else the
 *  current salary. Due = active and joined by the month's end, or paid. */
function monthState(e: any, m: string, rows: Payment[]): MonthState {
  const paid = round2(rows.reduce((s, p) => s + Number(p.amount), 0));
  const recorded = rows.reduce((mx, p) => Math.max(mx, Number(p.salary_due) || 0), 0);
  const due = round2(rows.length > 0 && recorded > 0 ? recorded : Number(e.salary) || 0);
  const eligible = rows.length > 0 || (e.status === "active" && (!e.joining_date || e.joining_date <= monthEnd(m)));
  return { due, paid, remaining: Math.max(round2(due - paid), 0), status: paymentStatus(due, paid), eligible, rows };
}

const STATUS_STYLE: Record<PayStatus, string> = {
  paid: "bg-green-600/10 text-green-700 hover:bg-green-600/20",
  partial: "bg-amber-500/15 text-amber-800 hover:bg-amber-500/25",
  unpaid: "bg-muted text-muted-foreground hover:bg-muted/70",
};
const STATUS_LABEL: Record<PayStatus, string> = { paid: "Paid", partial: "Partial", unpaid: "Unpaid" };
const DOT_STYLE: Record<PayStatus, string> = { paid: "bg-green-600", partial: "bg-amber-500", unpaid: "bg-muted-foreground/30" };

type Candidate = { id: string; expense_type: string; amount: number; notes: string | null; date_of_expense: string };
const emptyPay = { amount: "", date: "", method: "cash", notes: "", expense: "" };

function EmployeesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // payroll
  const thisMonth = localToday().slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [pays, setPays] = useState<Payment[]>([]);
  const [payErr, setPayErr] = useState<string | null>(null);
  const [pay, setPay] = useState<{ emp: any; month: string; mode: "pay" | "unpay" } | null>(null);
  const [payForm, setPayForm] = useState(emptyPay);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [busy, setBusy] = useState(false);
  const payReq = useRef(0);
  const candReq = useRef(0);

  const load = async () => {
    const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
    if (error) toast.error(`Could not load employees (${error.message})`);
    setRows(data ?? []);
  };
  // The selected month and the five before it (for the history dots).
  const loadPay = async () => {
    const req = ++payReq.current;
    const { data, error } = await supabase.from("salary_payments").select("*")
      .gte("month", addMonths(month, -5)).lte("month", month)
      .order("paid_date").order("created_at").order("id");
    if (req !== payReq.current) return; // a newer month was picked meanwhile
    if (error) { setPayErr(error.message); setPays([]); return; }
    setPayErr(null); setPays(data ?? []);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { loadPay(); }, [month]);

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
  const remove = async (r: any) => {
    if (!confirm(
      `Delete ${r.name}?\n\nTheir payroll history (every month's salary payments and Paid/Unpaid status) is deleted with them. ` +
      `Salary expenses already in Expenses stay, so Daily Closing and Reports do not change.`,
    )) return;
    const { error } = await supabase.from("employees").delete().eq("id", r.id);
    if (error) return toast.error(`Could not delete ${r.name}: ${error.message}`);
    toast.success(`${r.name} deleted`);
    load(); loadPay();
  };
  const edit = (r: any) => { setEditing(r.id); setForm({ ...empty, ...r, joining_date: r.joining_date ?? "" }); setOpen(true); };
  const toggle = async (r: any) => {
    const { error } = await supabase.from("employees").update({ status: r.status === "active" ? "inactive" : "active" }).eq("id", r.id);
    if (error) return toast.error(error.message);
    load();
  };

  const filtered = rows.filter((r) => !q || (r.name + " " + (r.position ?? "") + " " + (r.phone ?? "")).toLowerCase().includes(q.toLowerCase()));

  // ── payroll figures ──
  const byEmpMonth = useMemo(() => {
    const map = new Map<string, Payment[]>();
    pays.forEach((p) => {
      const k = `${p.employee_id}|${p.month}`;
      const list = map.get(k);
      if (list) list.push(p); else map.set(k, [p]);
    });
    return map;
  }, [pays]);
  const stateOf = (e: any, m: string) => monthState(e, m, byEmpMonth.get(`${e.id}|${m}`) ?? []);
  const last6 = useMemo(() => [5, 4, 3, 2, 1, 0].map((k) => addMonths(month, -k)), [month]);

  const summary = useMemo(() => {
    const s = { due: 0, paid: 0, covered: 0, outstanding: 0, nPaid: 0, nPartial: 0, nUnpaid: 0, people: 0 };
    rows.forEach((e) => {
      const st = monthState(e, month, byEmpMonth.get(`${e.id}|${month}`) ?? []);
      if (!st.eligible) return;
      s.people++;
      s.due += st.due; s.paid += st.paid;
      s.covered += Math.min(st.paid, st.due); s.outstanding += st.remaining;
      if (st.status === "paid") s.nPaid++; else if (st.status === "partial") s.nPartial++; else s.nUnpaid++;
    });
    return { ...s, due: round2(s.due), paid: round2(s.paid), covered: round2(s.covered), outstanding: round2(s.outstanding) };
  }, [rows, byEmpMonth, month]);
  const paidPct = summary.due > 0 ? Math.round((summary.covered / summary.due) * 100) : 0;

  // ── pay / unpay dialog ──
  const today = localToday();
  const loadCandidates = async (e: any, m: string) => {
    const req = ++candReq.current;
    setCandidates(null);
    const first = firstName(e.name);
    const [y, mo] = monthParts(m);
    const from = localDateOf(new Date(y, mo - 1, 1 - 45));
    const to = localDateOf(new Date(y, mo, 45));
    if (!first) { setCandidates([]); return; }
    const { data: exps, error } = await supabase.from("expenses").select("id, expense_type, amount, notes, date_of_expense")
      .gte("date_of_expense", from).lte("date_of_expense", to)
      .order("date_of_expense", { ascending: false }).order("id");
    if (req !== candReq.current) return;
    if (error) { toast.error(`Could not look up expenses (${error.message})`); setCandidates([]); return; }
    const matches = (exps ?? []).filter((x) =>
      Number(x.amount) > 0 && `${x.expense_type ?? ""} ${x.notes ?? ""}`.toLowerCase().includes(first)) as Candidate[];
    if (matches.length === 0) { setCandidates([]); return; }
    const { data: linked, error: linkErr } = await supabase.from("salary_payments").select("expense_id")
      .in("expense_id", matches.map((x) => x.id));
    if (req !== candReq.current) return;
    if (linkErr) { toast.error(`Could not check linked expenses (${linkErr.message})`); setCandidates([]); return; }
    const taken = new Set((linked ?? []).map((l) => l.expense_id));
    setCandidates(matches.filter((x) => !taken.has(x.id)));
  };
  const openPay = (e: any, m: string = month, mode?: "pay" | "unpay") => {
    if (payErr) return toast.error("Payroll is not set up yet — run the payroll migration in Supabase first.");
    const st = stateOf(e, m);
    setPayForm({ ...emptyPay, amount: st.remaining > 0 ? String(st.remaining) : "", date: localToday() });
    setPay({ emp: e, month: m, mode: mode ?? (st.status === "paid" ? "unpay" : "pay") });
    loadCandidates(e, m);
  };
  const payState = pay ? stateOf(pay.emp, pay.month) : null;
  const linkedExpense = candidates?.find((c) => c.id === payForm.expense) ?? null;

  const submitPay = async () => {
    if (!pay || busy) return;
    const amount = Number(payForm.amount);
    if (!payForm.expense) {
      if (!(amount > 0)) return toast.error("Enter the amount paid");
      if (!payForm.date) return toast.error("Pick the date it was paid");
    }
    setBusy(true);
    const notes = payForm.notes.trim() || null;
    const { error } = await supabase.rpc("salary_mark_paid", payForm.expense
      ? { _employee: pay.emp.id, _month: pay.month, _expense: payForm.expense, _notes: notes }
      : { _employee: pay.emp.id, _month: pay.month, _amount: amount, _paid_date: payForm.date, _method: payForm.method, _notes: notes });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (payForm.expense) {
      toast.success(`Linked ${money(linkedExpense?.amount)} as ${pay.emp.name}'s ${monthLabel(pay.month)} salary`);
    } else {
      toast.success(`${pay.emp.name}: ${money(amount)} paid for ${monthLabel(pay.month)} — added to Expenses`);
      if (payForm.date < today) toast.info(`If ${shortDate(payForm.date)} is already closed, open Daily Closing for that day and click "Update closing".`);
    }
    setPay(null); loadPay();
  };
  const submitUnpay = async () => {
    if (!pay || busy) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("salary_mark_unpaid", { _employee: pay.emp.id, _month: pay.month });
    setBusy(false);
    if (error) return toast.error(error.message);
    const n = Number(data ?? 0);
    toast.success(`${pay.emp.name}: ${monthLabel(pay.month)} marked unpaid (${n} payment${n === 1 ? "" : "s"} removed)`);
    setPay(null); loadPay();
  };

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

      {/* Payroll for the selected month: due vs paid vs outstanding */}
      <section className="rounded-2xl bg-card shadow-sm p-4 mb-4 space-y-4" aria-labelledby="payroll-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="payroll-heading" className="font-semibold">Payroll — {monthLabel(month)}</h2>
            <p className="text-xs text-muted-foreground">Click a salary status in the table to mark it Paid or Unpaid.</p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Input type="month" aria-label="Payroll month" className="w-40" value={month}
              onChange={(e) => { if (MONTH_RE.test(e.target.value)) setMonth(e.target.value); }} />
            <Button variant="outline" size="icon" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight className="h-4 w-4" /></Button>
            {month !== thisMonth && <Button variant="ghost" size="sm" onClick={() => setMonth(thisMonth)}>This month</Button>}
          </div>
        </div>

        {payErr ? (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>Payroll could not be loaded ({payErr}). If this is new, run <code>supabase/migrations/20261020000100_payroll.sql</code> in the Supabase SQL editor, then reload.</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Payroll due" value={money(summary.due)} hint={`${summary.people} employee${summary.people === 1 ? "" : "s"}`} />
              <Stat label="Paid" value={money(summary.paid)} hint={`${paidPct}% of payroll due`} tone="green" />
              <Stat label="Outstanding" value={money(summary.outstanding)} hint={`${summary.nUnpaid + summary.nPartial} not fully paid`} tone="orange" />
              <Stat label="Employees paid" value={`${summary.nPaid} of ${summary.people}`} hint={`${summary.nPartial} partial · ${summary.nUnpaid} unpaid`} />
            </div>
            {summary.due > 0 ? (
              <div className="space-y-1.5">
                <div className="flex h-3 rounded-full bg-muted overflow-hidden" role="img"
                  aria-label={`${monthLabel(month)}: ${money(summary.covered)} of ${money(summary.due)} paid (${paidPct}%), ${money(summary.outstanding)} outstanding`}>
                  <div className="h-full bg-green-600 transition-all" style={{ width: `${paidPct}%` }} />
                  <div className="h-full bg-orange-400 transition-all" style={{ width: `${100 - paidPct}%` }} />
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-600" aria-hidden />Paid {money(summary.covered)} ({paidPct}%)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-orange-400" aria-hidden />Outstanding {money(summary.outstanding)} ({100 - paidPct}%)</span>
                </div>
                {summary.paid > summary.covered && (
                  <div className="text-[11px] text-muted-foreground">Includes {money(round2(summary.paid - summary.covered))} paid above salary (advances/extra).</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No salary due for {monthLabel(month)}.</div>
            )}
          </>
        )}
      </section>

      <div className="rounded-2xl bg-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">Name</th><th className="p-3">Position</th><th className="p-3">Phone</th><th className="p-3">Salary</th>
              <th className="p-3">Joined</th><th className="p-3">Status</th><th className="p-3">{monthLabel(month)} salary</th>
              <th className="p-3">Last 6 months</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const st = stateOf(r, month);
              const last = st.rows[st.rows.length - 1];
              return (
                <tr key={r.id} className="border-t">
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3 text-muted-foreground">{r.position ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{r.phone ?? "—"}</td>
                  <td className="p-3 font-semibold">{money(r.salary)}</td>
                  <td className="p-3">{r.joining_date ? shortDate(r.joining_date) : "—"}</td>
                  <td className="p-3"><Badge variant={r.status === "active" ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggle(r)}>{r.status}</Badge></td>
                  <td className="p-3">
                    {payErr ? <span className="text-muted-foreground">—</span> : !st.eligible ? (
                      <button type="button" onClick={() => openPay(r)}
                        className="rounded-lg border border-dashed px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
                        title={`Not due for ${monthLabel(month)} — click to record a payment anyway`}>
                        Not due
                      </button>
                    ) : (
                      <button type="button" onClick={() => openPay(r)}
                        className={`inline-flex flex-col items-start rounded-lg px-2.5 py-1 text-left transition-colors ${STATUS_STYLE[st.status]}`}
                        aria-label={`${r.name}, ${monthLabel(month)}: ${STATUS_LABEL[st.status]}, ${money(st.paid)} of ${money(st.due)} paid. ${st.status === "paid" ? "Click to mark unpaid" : "Click to mark paid"}`}>
                        <span className="text-xs font-semibold">{STATUS_LABEL[st.status]}</span>
                        <span className="text-[10px] font-normal">
                          {st.status === "unpaid" ? `${money(st.due)} due`
                            : st.status === "partial" ? `${money(st.paid)} of ${money(st.due)} · ${shortDate(last?.paid_date)}`
                            : `${money(st.paid)} · ${shortDate(last?.paid_date)}`}
                        </span>
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    {!payErr && (
                      <div className="flex items-center gap-1.5">
                        {last6.map((m) => {
                          const ms = stateOf(r, m);
                          const label = ms.eligible ? `${STATUS_LABEL[ms.status]}${ms.paid ? ` ${money(ms.paid)}` : ""}` : "Not due";
                          return (
                            <button key={m} type="button" onClick={() => setMonth(m)}
                              title={`${monthLabel(m)}: ${label}`} aria-label={`${monthLabel(m)}: ${label}. Show this month`}
                              className={`h-3 w-3 rounded-full ${ms.eligible ? DOT_STYLE[ms.status] : "border border-muted-foreground/40"} ${m === month ? "ring-2 ring-primary ring-offset-1 ring-offset-card" : ""}`} />
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${r.name}`} onClick={() => edit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${r.name}`} onClick={() => remove(r)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">No employees.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!pay} onOpenChange={(o) => { if (!o) setPay(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {pay && payState && pay.mode === "pay" && (
            <>
              <DialogHeader>
                <DialogTitle>Pay {pay.emp.name} — {monthLabel(pay.month)}</DialogTitle>
                <DialogDescription>
                  Salary due {money(payState.due)} · paid so far {money(payState.paid)} · remaining <b>{money(payState.remaining)}</b>
                </DialogDescription>
              </DialogHeader>

              {payState.rows.length > 0 && <PaymentList rows={payState.rows} />}

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium mb-1">Already entered in Expenses?</legend>
                {candidates === null ? (
                  <div className="text-xs text-muted-foreground">Looking for expenses that mention “{firstName(pay.emp.name)}”…</div>
                ) : candidates.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    No unlinked expense mentions “{firstName(pay.emp.name)}” within 45 days of {monthLabel(pay.month)} — a new expense will be added.
                  </div>
                ) : (
                  <div className="rounded-xl border divide-y max-h-56 overflow-y-auto">
                    <RadioRow checked={!payForm.expense} onSelect={() => setPayForm({ ...payForm, expense: "" })}>
                      <span className="font-medium">No — record a new payment</span>
                      <span className="block text-[11px] text-muted-foreground">Adds a “Salary — {pay.emp.name.trim()}” expense</span>
                    </RadioRow>
                    {candidates.map((x) => (
                      <RadioRow key={x.id} checked={payForm.expense === x.id} onSelect={() => setPayForm({ ...payForm, expense: x.id })}>
                        <span className="flex justify-between gap-2">
                          <span className="font-medium truncate">{x.expense_type}</span>
                          <span className="font-semibold shrink-0">{money(x.amount)}</span>
                        </span>
                        <span className="block text-[11px] text-muted-foreground truncate">{shortDate(x.date_of_expense)}{x.notes ? ` · ${x.notes}` : ""}</span>
                      </RadioRow>
                    ))}
                  </div>
                )}
              </fieldset>

              {linkedExpense ? (
                <div className="rounded-xl bg-muted/60 p-3 text-xs space-y-1">
                  <div>
                    <b>{money(linkedExpense.amount)}</b> paid on <b>{shortDate(linkedExpense.date_of_expense)}</b> (“{linkedExpense.expense_type}”) will count as {pay.emp.name}'s {monthLabel(pay.month)} salary.
                  </div>
                  <div className="text-muted-foreground">No new expense is created, so Expenses and Daily Closing stay exactly as they are.</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Amount (Rs)">
                    <Input type="number" min={0} value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
                  </Field>
                  <Field label="Date paid">
                    <Input type="date" value={payForm.date} onChange={(e) => setPayForm({ ...payForm, date: e.target.value })} />
                  </Field>
                  <Field label="Paid by" full>
                    <Select value={payForm.method} onValueChange={(v) => setPayForm({ ...payForm, method: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SALARY_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  {payState.remaining > 0 && Number(payForm.amount) > payState.remaining && (
                    <div className="col-span-2 text-[11px] text-muted-foreground">
                      More than the {money(payState.remaining)} remaining — the extra is recorded as an advance in {monthLabel(pay.month)}.
                    </div>
                  )}
                  {payForm.date && payForm.date < today && (
                    <div className="col-span-2 flex items-start gap-2 rounded-lg bg-amber-500/10 p-2 text-[11px] text-amber-900">
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>The expense goes on {shortDate(payForm.date)}. If that day's Daily Closing is already saved it will be out of date until you open it and click “Update closing”.</span>
                    </div>
                  )}
                </div>
              )}
              <Field label="Notes (optional)">
                <Input value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} placeholder="e.g. advance, final settlement" />
              </Field>

              <DialogFooter className="gap-2 sm:gap-2">
                {payState.rows.length > 0 && (
                  <Button variant="ghost" onClick={() => setPay({ ...pay, mode: "unpay" })}>Mark unpaid…</Button>
                )}
                <Button onClick={submitPay} disabled={busy}>
                  {busy ? "Saving..." : linkedExpense ? "Link expense as salary" : `Mark paid${Number(payForm.amount) > 0 ? ` · ${money(payForm.amount)}` : ""}`}
                </Button>
              </DialogFooter>
            </>
          )}

          {pay && payState && pay.mode === "unpay" && (
            <>
              <DialogHeader>
                <DialogTitle>Mark unpaid for {monthLabel(pay.month)}?</DialogTitle>
                <DialogDescription>
                  {payState.rows.length === 0
                    ? `${pay.emp.name} has no payment recorded for ${monthLabel(pay.month)}.`
                    : `${pay.emp.name}'s ${payState.rows.length} payment${payState.rows.length === 1 ? "" : "s"} for ${monthLabel(pay.month)} (${money(payState.paid)}) will be removed.`}
                </DialogDescription>
              </DialogHeader>
              {payState.rows.length > 0 && <PaymentList rows={payState.rows} showEffect />}
              <div className="text-xs text-muted-foreground space-y-1.5">
                <p>Salary expenses that payroll added are deleted from Expenses and from that day's Daily Closing (a day already closed needs “Update closing”).</p>
                <p>Expenses you typed in Expenses yourself and linked stay there — that cash really went out — they just stop counting as this month's salary.</p>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => setPay({ ...pay, mode: "pay" })}>Record another payment</Button>
                {payState.rows.length > 0 && (
                  <Button variant="destructive" onClick={submitUnpay} disabled={busy}>{busy ? "Removing..." : "Mark unpaid"}</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function PaymentList({ rows, showEffect }: { rows: Payment[]; showEffect?: boolean }) {
  return (
    <div className="rounded-xl border divide-y text-xs">
      {rows.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="min-w-0">
            <div className="font-medium">{shortDate(p.paid_date)} · {methodLabel(p.method)}</div>
            <div className="text-[11px] text-muted-foreground truncate">
              {p.expense_created
                ? (showEffect ? "Added by payroll — removed from Expenses" : "Added to Expenses by payroll")
                : (showEffect ? "Typed in Expenses — stays there" : "Linked to an expense typed by hand")}
              {p.notes ? ` · ${p.notes}` : ""}
            </div>
          </div>
          <div className="font-semibold shrink-0">{money(p.amount)}</div>
        </div>
      ))}
    </div>
  );
}

function RadioRow({ checked, onSelect, children }: { checked: boolean; onSelect: () => void; children: React.ReactNode }) {
  return (
    <label className={`flex items-start gap-2 px-3 py-2 text-xs cursor-pointer ${checked ? "bg-primary/5" : "hover:bg-muted/50"}`}>
      <input type="radio" name="salary-expense-link" className="mt-0.5" checked={checked} onChange={onSelect} />
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "green" | "orange" }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className={`text-lg font-black mt-0.5 ${tone === "green" ? "text-green-600" : tone === "orange" ? "text-orange-500" : ""}`}>{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={`space-y-1.5 ${full ? "col-span-2" : ""}`}><Label>{label}</Label>{children}</div>;
}
