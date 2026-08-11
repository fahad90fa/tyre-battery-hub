import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { printArea } from "@/lib/print";
import { money, shortDate, localToday } from "@/lib/format";
import { PAYMENT_METHODS, methodLabel } from "@/lib/payments";
import { matchesQuery } from "@/lib/search";
import { allocatePaymentToInvoices } from "@/lib/allocate";
import { InvoiceQuickView } from "@/components/admin/InvoiceQuickView";
import { PurchaseQuickView } from "@/components/admin/PurchaseQuickView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, BookOpen, Printer, Search, Wallet, Users, AlertTriangle } from "lucide-react";

export type PartyKind = "merchants" | "clients";
const LEDGER_TABLE: Record<PartyKind, "merchant_ledger" | "client_ledger"> = {
  merchants: "merchant_ledger",
  clients: "client_ledger",
};
const FK: Record<PartyKind, "merchant_id" | "client_id"> = {
  merchants: "merchant_id",
  clients: "client_id",
};
const TYPES: Record<PartyKind, { value: string; label: string }[]> = {
  merchants: [
    { value: "purchase", label: "Purchase (they credit us)" },
    { value: "credit", label: "Credit / opening" },
    { value: "payment", label: "Payment made" },
    { value: "debit", label: "Debit adjustment" },
  ],
  clients: [
    { value: "sale", label: "Sale / udhar (they owe us)" },
    { value: "payment", label: "Payment received" },
    { value: "credit", label: "Credit / refund" },
    { value: "debit", label: "Debit adjustment" },
  ],
};
// Entry types that INCREASE the account balance (rest decrease it).
const INCREASES: Record<PartyKind, string[]> = {
  merchants: ["purchase", "credit"],
  clients: ["sale", "debit"],
};
// Short, plain-language name for a ledger row.
const SHORT_LABEL: Record<string, string> = {
  sale: "Sale (udhar)",
  purchase: "Purchase",
  payment: "Payment",
  credit: "Credit",
  debit: "Debit adjustment",
};
const shortLabel = (t: string) => SHORT_LABEL[t] ?? t;

const empty = { name: "", phone: "", email: "", address: "", cnic: "", opening_balance: 0, notes: "" };

export function PartyManager({ kind, title }: { kind: PartyKind; title: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<any>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [ledgerFor, setLedgerFor] = useState<any | null>(null);
  const [overdueByParty, setOverdueByParty] = useState<Record<string, number>>({});

  const load = async () => {
    const { data } = await supabase.from(kind).select("*").order("name");
    setRows(data ?? []);
    if (kind === "clients") {
      const today = localToday();
      const { data: inv } = await supabase.from("invoices")
        .select("client_id, due_date, payment_status")
        .neq("payment_status", "paid").neq("payment_status", "cancelled")
        .not("client_id", "is", null);
      const map: Record<string, number> = {};
      (inv ?? []).forEach((i) => {
        if (i.client_id && i.due_date && i.due_date < today) map[i.client_id] = (map[i.client_id] ?? 0) + 1;
      });
      setOverdueByParty(map);
    }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name?.trim()) return toast.error("Name required");
    const payload = { ...form, opening_balance: Number(form.opening_balance || 0) };
    const { error } = editing
      ? await supabase.from(kind).update(payload).eq("id", editing)
      : await supabase.from(kind).insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Created");
    setOpen(false); setEditing(null); setForm(empty); load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this record and its ledger?")) return;
    const { error } = await supabase.from(kind).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };
  const edit = (r: any) => { setEditing(r.id); setForm({ ...empty, ...r }); setOpen(true); };

  // Search matches every typed word in any order; the list is sorted so
  // open balances come first (smallest on top) and cleared (zero-balance)
  // accounts sink to the bottom out of the way.
  const filtered = rows
    .filter((r) => matchesQuery(
      [r.account_no, r.name, r.phone, r.email, r.cnic, r.address].filter(Boolean).join(" "), q))
    .sort((a, b) => {
      const balA = Number(a.current_balance) || 0;
      const balB = Number(b.current_balance) || 0;
      const openA = balA > 0, openB = balB > 0;
      if (openA !== openB) return openA ? -1 : 1;
      if (openA) return balA - balB;
      return (a.name ?? "").localeCompare(b.name ?? "");
    });

  const outstanding = rows.reduce((a, r) => a + Math.max(0, Number(r.current_balance)), 0);
  const withBalance = rows.filter((r) => Number(r.current_balance) > 0).length;
  const overdueTotal = Object.values(overdueByParty).reduce((a, n) => a + n, 0);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Kpi icon={Wallet} label={kind === "clients" ? "Total receivable (udhar)" : "Total payable"} value={money(outstanding)} accent={outstanding > 0} />
        <Kpi icon={Users} label="Accounts" value={String(rows.length)} />
        <Kpi icon={BookOpen} label="With open balance" value={String(withBalance)} />
        {kind === "clients" && <Kpi icon={AlertTriangle} label="Overdue invoices" value={String(overdueTotal)} accent={overdueTotal > 0} />}
      </div>

      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search by ID, name, phone, address...`} value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm(empty); }}>
              <Plus className="h-4 w-4 mr-2" /> Add {title.slice(0, -1).toLowerCase()}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} {title.slice(0, -1).toLowerCase()}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Name" full><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Phone"><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
              <Field label="Email"><Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="CNIC"><Input value={form.cnic ?? ""} onChange={(e) => setForm({ ...form, cnic: e.target.value })} /></Field>
              <Field label="Opening balance"><Input type="number" value={form.opening_balance} onChange={(e) => setForm({ ...form, opening_balance: e.target.value })} /></Field>
              <Field label="Address" full><Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
              <Field label="Notes" full><Textarea value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            </div>
            <Button className="w-full mt-2" onClick={save}>Save</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl bg-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-3">ID</th><th className="p-3">Name</th><th className="p-3">Phone</th>
              <th className="p-3">Address</th><th className="p-3">Balance</th><th className="p-3">Added</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t hover:bg-muted/40 cursor-pointer" onClick={() => setLedgerFor(r)}>
                <td className="p-3 font-mono text-xs font-semibold text-primary whitespace-nowrap">{r.account_no ?? "—"}</td>
                <td className="p-3 font-medium">
                  {r.name}
                  {overdueByParty[r.id] > 0 && (
                    <span className="ml-2 text-[10px] rounded-full bg-destructive/10 text-destructive px-2 py-0.5">
                      {overdueByParty[r.id]} overdue
                    </span>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">{r.phone ?? "—"}</td>
                <td className="p-3 text-muted-foreground max-w-[180px] truncate">{r.address ?? "—"}</td>
                <td className={`p-3 font-semibold ${Number(r.current_balance) > 0 ? "text-orange-500" : "text-green-600"}`}>{money(r.current_balance)}</td>
                <td className="p-3">{shortDate(r.created_at)}</td>
                <td className="p-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" title="Ledger" onClick={() => setLedgerFor(r)}><BookOpen className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => edit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Nothing here yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <Sheet open={!!ledgerFor} onOpenChange={(o) => !o && setLedgerFor(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {ledgerFor && (
            <>
              <SheetHeader>
                <SheetTitle>
                  Ledger — {ledgerFor.name}
                  {ledgerFor.account_no && (
                    <span className="ml-2 font-mono text-xs font-semibold text-primary align-middle">{ledgerFor.account_no}</span>
                  )}
                </SheetTitle>
                {(ledgerFor.phone || ledgerFor.address) && (
                  <div className="text-xs text-muted-foreground">
                    {[ledgerFor.phone, ledgerFor.address].filter(Boolean).join(" · ")}
                  </div>
                )}
              </SheetHeader>
              <LedgerView party={ledgerFor} kind={kind} onChanged={load} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

const blankEntry = (kind: PartyKind) => ({
  entry_type: TYPES[kind][0].value, amount: 0, method: "cash",
  reference: "", note: "", entry_date: localToday(),
});

function LedgerView({ party, kind, onChanged }: { party: any; kind: PartyKind; onChanged: () => void }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(() => blankEntry(kind));
  const [current, setCurrent] = useState<number>(party.current_balance);
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([]);
  const [viewInvoice, setViewInvoice] = useState<string | null>(null);
  const [viewPurchase, setViewPurchase] = useState<string | null>(null);

  const load = async () => {
    const { data: e } = await (supabase.from(LEDGER_TABLE[kind]) as any)
      .select("*").eq(FK[kind], party.id)
      .order("entry_date", { ascending: false }).order("created_at", { ascending: false });
    setEntries(e ?? []);
    const { data: p } = await supabase.from(kind).select("current_balance").eq("id", party.id).maybeSingle();
    if (p) setCurrent(Number(p.current_balance));
    if (kind === "clients") {
      const { data: inv } = await supabase.from("invoices")
        .select("id, invoice_id, total_amount, due_date, payment_status, created_at")
        .eq("client_id", party.id).neq("payment_status", "paid").neq("payment_status", "cancelled")
        .order("due_date", { ascending: true, nullsFirst: false });
      setOverdueInvoices(inv ?? []);
    }
  };
  useEffect(() => { load(); }, [party.id]);

  const add = async () => {
    if (!form.amount || Number(form.amount) <= 0) return toast.error("Amount required");
    const isPayment = form.entry_type === "payment";
    const entryDate = form.entry_date || localToday();
    const { error } = await (supabase.from(LEDGER_TABLE[kind]) as any).insert({
      entry_type: form.entry_type, amount: Number(form.amount),
      method: isPayment ? form.method : null,
      reference: form.reference, note: form.note,
      entry_date: entryDate,
      [FK[kind]]: party.id,
    });
    if (error) return toast.error(error.message);
    if (kind === "clients" && isPayment) {
      const touched = await allocatePaymentToInvoices(party.id, Number(form.amount), form.method, entryDate);
      if (touched > 0) toast.success(`Payment applied to ${touched} invoice${touched > 1 ? "s" : ""} automatically`);
    }
    setForm(blankEntry(kind));
    setAddOpen(false);
    toast.success(`${shortLabel(form.entry_type)} of ${money(Number(form.amount))} recorded on ${shortDate(entryDate)}`);
    load(); onChanged();
  };
  const del = async (id: string) => {
    if (!confirm("Remove this entry?")) return;
    await (supabase.from(LEDGER_TABLE[kind]) as any).delete().eq("id", id);
    load(); onChanged();
  };

  // Running balance: walk oldest → newest starting from the opening balance.
  const withRunning = useMemo(() => {
    const asc = [...entries].reverse();
    let bal = Number(party.opening_balance ?? 0);
    const map: Record<string, number> = {};
    asc.forEach((e) => {
      bal += INCREASES[kind].includes(e.entry_type) ? Number(e.amount) : -Number(e.amount);
      map[e.id] = bal;
    });
    return map;
  }, [entries, kind, party.opening_balance]);

  const totalUp = entries.filter((e) => INCREASES[kind].includes(e.entry_type)).reduce((a, e) => a + Number(e.amount), 0);
  const totalDown = entries.filter((e) => !INCREASES[kind].includes(e.entry_type)).reduce((a, e) => a + Number(e.amount), 0);
  const today = localToday();
  const isPaymentType = form.entry_type === "payment";

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-primary/5 p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{kind === "clients" ? "Total sales / udhar" : "Total purchases"}</div>
          <div className="text-lg font-black">{money(totalUp + Number(party.opening_balance ?? 0))}</div>
        </div>
        <div className="rounded-xl bg-primary/5 p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{kind === "clients" ? "Total recovered" : "Total paid"}</div>
          <div className="text-lg font-black text-green-600">{money(totalDown)}</div>
        </div>
        <div className="rounded-xl bg-primary/5 p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Balance due</div>
          <div className={`text-lg font-black ${current > 0 ? "text-orange-500" : "text-green-600"}`}>{money(current)}</div>
        </div>
      </div>

      {kind === "clients" && overdueInvoices.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <div className="text-xs font-semibold text-destructive mb-2">Pending invoices</div>
          {overdueInvoices.map((i) => (
            <button key={i.id} onClick={() => setViewInvoice(i.invoice_id)}
                    className="w-full flex items-center justify-between gap-3 text-xs py-2 border-b last:border-0 hover:bg-destructive/10 rounded px-1 -mx-1 text-left">
              <span className="min-w-0">
                <span className="block font-mono underline decoration-dotted truncate">{i.invoice_id}</span>
                <span className="block text-muted-foreground">
                  {shortDate(i.created_at)}
                  {" · "}
                  <span className={i.due_date && i.due_date < today ? "text-destructive font-semibold" : ""}>
                    {i.due_date ? (i.due_date < today ? `overdue ${shortDate(i.due_date)}` : `due ${shortDate(i.due_date)}`) : "no due date"}
                  </span>
                </span>
              </span>
              <span className="font-bold whitespace-nowrap">{money(i.total_amount)}</span>
            </button>
          ))}
          <div className="text-[10px] text-muted-foreground mt-1">Tap an invoice to see its full details.</div>
        </div>
      )}

      {/* One button instead of a permanent form — keeps the account clean to
          read and to screenshot. Everything (sale, payment, credit, debit)
          lives inside the dialog. */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="font-semibold text-sm">Transaction history</div>
        <div className="flex items-center gap-2">
          <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (o) setForm(blankEntry(kind)); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add entry</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Add entry — {party.name}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>What is this entry?</Label>
                  <Select value={form.entry_type} onValueChange={(v) => setForm({ ...form, entry_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES[kind].map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Amount</Label>
                  <Input type="number" step="any" autoFocus value={form.amount || ""}
                         onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={form.entry_date}
                         onChange={(e) => setForm({ ...form, entry_date: e.target.value })} />
                </div>
                {isPaymentType && (
                  <div className="col-span-2 space-y-1.5">
                    <Label>Paid by</Label>
                    <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="col-span-2 space-y-1.5">
                  <Label>Reference <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input value={form.reference} placeholder="Invoice / slip number"
                         onChange={(e) => setForm({ ...form, reference: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
              </div>
              <Button className="w-full mt-1" onClick={add}>Save entry</Button>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={() => printArea()}>
            <Printer className="h-4 w-4 mr-1.5" /> Print
          </Button>
        </div>
      </div>

      <div className="print-area rounded-xl border overflow-hidden">
        <div className="hidden print:block border-b-2 border-black pb-2 mb-3">
          <div className="text-lg font-black">MT&B HOUSE — Account Ledger</div>
          <div className="text-sm">
            {party.name}{party.account_no ? ` (${party.account_no})` : ""} · Balance due {money(current)}
          </div>
        </div>

        {/* Screen: one clean, readable card per transaction. */}
        <div className="divide-y print:hidden">
          {entries.map((e) => {
            const up = INCREASES[kind].includes(e.entry_type);
            const hasInvoice = kind === "clients" && typeof e.reference === "string" && e.reference.startsWith("INV");
            const hasPurchase = kind === "merchants" && typeof e.reference === "string" && e.reference.startsWith("PUR");
            const clickable = hasInvoice || hasPurchase;
            return (
              <div key={e.id}
                   className={`px-3 py-3 sm:px-4 ${clickable ? "cursor-pointer hover:bg-muted/40" : ""}`}
                   onClick={() => { if (hasInvoice) setViewInvoice(e.reference); if (hasPurchase) setViewPurchase(e.reference); }}
                   title={clickable ? "Open full details" : undefined}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${up ? "bg-orange-500/10 text-orange-500" : "bg-green-600/10 text-green-600"}`}>
                        {shortLabel(e.entry_type)}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {shortDate(e.entry_date ?? e.created_at)}
                      </span>
                    </div>
                    <div className="text-sm">
                      {e.method ? <span className="font-medium">{methodLabel(e.method)}</span> : null}
                      {e.method && e.reference ? <span className="text-muted-foreground"> · </span> : null}
                      {e.reference
                        ? <span className={`font-mono text-xs ${clickable ? "text-primary underline decoration-dotted" : "text-muted-foreground"}`}>{e.reference}</span>
                        : null}
                      {!e.method && !e.reference ? <span className="text-muted-foreground text-xs">No reference</span> : null}
                    </div>
                    {e.note && <div className="text-xs text-muted-foreground">{e.note}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-base font-black whitespace-nowrap ${up ? "text-orange-500" : "text-green-600"}`}>
                      {up ? "+" : "−"}{money(e.amount)}
                    </div>
                    <div className="text-[11px] text-muted-foreground whitespace-nowrap">
                      Balance {money(withRunning[e.id] ?? 0)}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 mt-0.5 text-muted-foreground"
                            onClick={(ev) => { ev.stopPropagation(); del(e.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
          {entries.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No entries yet.</div>}
        </div>

        {/* Print: the same rows as a compact table, which reads better on paper. */}
        <table className="hidden print:table w-full text-sm">
          <thead className="text-xs uppercase text-left border-b">
            <tr><th className="p-2">Date</th><th className="p-2">Type</th><th className="p-2">Method</th><th className="p-2">Ref</th><th className="p-2 text-right">Amount</th><th className="p-2 text-right">Balance</th></tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const up = INCREASES[kind].includes(e.entry_type);
              return (
                <tr key={e.id} className="border-t">
                  <td className="p-2 whitespace-nowrap">{shortDate(e.entry_date ?? e.created_at)}</td>
                  <td className="p-2">{shortLabel(e.entry_type)}{e.note ? <div className="text-[10px]">{e.note}</div> : null}</td>
                  <td className="p-2">{e.method ? methodLabel(e.method) : "—"}</td>
                  <td className="p-2 font-mono text-xs">{e.reference || "—"}</td>
                  <td className="p-2 text-right whitespace-nowrap">{up ? "+" : "−"}{money(e.amount)}</td>
                  <td className="p-2 text-right whitespace-nowrap">{money(withRunning[e.id] ?? 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <InvoiceQuickView invoiceRef={viewInvoice} onClose={() => setViewInvoice(null)} />
      <PurchaseQuickView purchaseRef={viewPurchase} onClose={() => setViewPurchase(null)} />
    </div>
  );
}

function Kpi({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
        <Icon className={`h-4 w-4 ${accent ? "text-orange-500" : "text-primary"}`} />
      </div>
      <div className={`text-xl font-black mt-1 ${accent ? "text-orange-500" : ""}`}>{value}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
