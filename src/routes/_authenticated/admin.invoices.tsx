import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate } from "@/lib/format";
import { PAYMENT_METHODS, methodLabel, paymentStatus } from "@/lib/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Printer, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/invoices")({
  component: InvoicesAdmin,
});

function InvoicesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [payments, setPayments] = useState<Record<string, any[]>>({});
  const [open, setOpen] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [payForm, setPayForm] = useState({ method: "cash", amount: 0 });

  const load = async () => {
    const [{ data: inv }, { data: pays }] = await Promise.all([
      supabase.from("invoices").select("*").order("created_at", { ascending: false }),
      supabase.from("invoice_payments").select("*").order("payment_date"),
    ]);
    setRows(inv ?? []);
    const byInv: Record<string, any[]> = {};
    (pays ?? []).forEach((p) => { (byInv[p.invoice_id] ??= []).push(p); });
    setPayments(byInv);
  };
  useEffect(() => { load(); }, []);

  const paidOf = (inv: any) => (payments[inv.id] ?? []).reduce((a, p) => a + Number(p.amount), 0);
  const balanceOf = (inv: any) => Math.max(0, Number(inv.total_amount) - paidOf(inv));
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = (inv: any) => balanceOf(inv) > 0 && inv.due_date && inv.due_date < today;

  const filtered = useMemo(() => {
    if (tab === "outstanding") return rows.filter((r) => balanceOf(r) > 0);
    if (tab === "overdue") return rows.filter(isOverdue);
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, payments, tab]);

  const totals = useMemo(() => ({
    outstanding: rows.reduce((a, r) => a + balanceOf(r), 0),
    overdueCount: rows.filter(isOverdue).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [rows, payments]);

  const view = async (inv: any) => {
    setOpen(inv);
    setPayForm({ method: "cash", amount: Math.max(0, Number(inv.total_amount) - paidOf(inv)) });
    const { data } = await supabase.from("invoice_items").select("*").eq("invoice_id", inv.id);
    setItems(data ?? []);
  };

  const addPayment = async () => {
    if (!open) return;
    const amount = Number(payForm.amount);
    if (!amount || amount <= 0) return toast.error("Amount required");
    const balance = balanceOf(open);
    if (amount > balance) return toast.error(`Amount exceeds balance (${money(balance)})`);

    const { error } = await supabase.from("invoice_payments").insert({
      invoice_id: open.id, amount, method: payForm.method,
    });
    if (error) return toast.error(error.message);

    const newStatus = paymentStatus(Number(open.total_amount), paidOf(open) + amount);
    await supabase.from("invoices").update({ payment_status: newStatus }).eq("id", open.id);

    if (open.client_id) {
      await supabase.from("client_ledger").insert({
        client_id: open.client_id, entry_type: "payment", amount,
        method: payForm.method, reference: open.invoice_id,
        note: `Recovery (${methodLabel(payForm.method)})`,
      });
    }
    toast.success(`Payment of ${money(amount)} recorded`);
    await load();
    setOpen({ ...open, payment_status: newStatus });
    setPayForm({ method: "cash", amount: 0 });
  };

  const cost = items.reduce((a, it) => a + Number(it.cost_price ?? 0) * it.quantity, 0);
  const hasCost = items.some((it) => it.cost_price != null);
  const profit = Number(open?.total_amount ?? 0) - cost;
  const openPaid = open ? paidOf(open) : 0;
  const openBalance = open ? balanceOf(open) : 0;

  return (
    <AdminShell title="Invoices">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
            <TabsTrigger value="overdue">Overdue{totals.overdueCount > 0 ? ` (${totals.overdueCount})` : ""}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="text-sm">
          Total receivable: <b className={totals.outstanding > 0 ? "text-orange-500" : "text-green-600"}>{money(totals.outstanding)}</b>
        </div>
      </div>

      <div className="rounded-2xl bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Invoice</th><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Amount</th><th className="p-3">Paid</th><th className="p-3">Balance</th><th className="p-3">Method</th><th className="p-3">Status</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const bal = balanceOf(r);
              const overdue = isOverdue(r);
              return (
                <tr key={r.id} className="border-t hover:bg-muted/50 cursor-pointer" onClick={() => view(r)}>
                  <td className="p-3 font-mono">{r.invoice_id}</td>
                  <td className="p-3">{shortDate(r.created_at)}</td>
                  <td className="p-3">{r.customer_name}</td>
                  <td className="p-3 font-semibold">{money(r.total_amount)}</td>
                  <td className="p-3 text-green-600">{money(paidOf(r))}</td>
                  <td className={`p-3 font-semibold ${bal > 0 ? "text-orange-500" : "text-muted-foreground"}`}>{bal > 0 ? money(bal) : "—"}</td>
                  <td className="p-3 text-muted-foreground">{r.payment_method}</td>
                  <td className="p-3">
                    <span className={r.payment_status === "paid" ? "text-green-600" : overdue ? "text-destructive font-semibold" : "text-orange-500"}>
                      {overdue ? "overdue" : r.payment_status}
                    </span>
                    {r.due_date && bal > 0 && <div className="text-[10px] text-muted-foreground">due {shortDate(r.due_date)}</div>}
                  </td>
                  <td className="p-3"><Button variant="ghost" size="sm">View</Button></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">No invoices here.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-xl print:shadow-none max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Invoice {open?.invoice_id}</DialogTitle></DialogHeader>

          {/* Customer-facing section — this is what gets printed */}
          <div id="invoice-print" className="text-sm space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Customer</span><span>{open?.customer_name}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Date</span><span>{shortDate(open?.created_at)}</span>
            </div>
            <table className="w-full mt-4 border-t">
              <thead><tr className="text-left text-xs uppercase text-muted-foreground"><th className="py-2">Item</th><th>Qty</th><th className="text-right">Total</th></tr></thead>
              <tbody>{items.map((it) => (
                <tr key={it.id} className="border-t"><td className="py-2">{it.product_name}</td><td>{it.quantity}</td><td className="text-right">{money(it.total_price)}</td></tr>
              ))}</tbody>
            </table>
            <div className="flex justify-between pt-3 border-t font-bold text-base">
              <span>Total</span><span>{money(open?.total_amount)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid</span><span>{money(openPaid)}</span>
            </div>
            {openBalance > 0 && (
              <div className="flex justify-between font-semibold text-orange-500">
                <span>Balance due{open?.due_date ? ` (by ${shortDate(open.due_date)})` : ""}</span>
                <span>{money(openBalance)}</span>
              </div>
            )}
            {(payments[open?.id] ?? []).length > 0 && (
              <div className="pt-2 border-t">
                <div className="text-xs uppercase text-muted-foreground mb-1">Payments</div>
                {(payments[open?.id] ?? []).map((p) => (
                  <div key={p.id} className="flex justify-between text-xs py-0.5">
                    <span>{shortDate(p.payment_date)} — {methodLabel(p.method)}</span>
                    <span>{money(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Internal section — never printed, admin only */}
          <div className="print:hidden rounded-xl border border-dashed p-3 text-sm space-y-1 bg-muted/40">
            <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground tracking-wider">
              <EyeOff className="h-3.5 w-3.5" /> Internal — hidden from customer
            </div>
            {hasCost ? (
              <>
                <div className="flex justify-between"><span>Cost (purchase price)</span><span>{money(cost)}</span></div>
                <div className="flex justify-between font-semibold">
                  <span>Profit</span>
                  <span className={profit >= 0 ? "text-green-600" : "text-destructive"}>
                    {money(profit)} ({open?.total_amount > 0 ? Math.round((profit / open.total_amount) * 100) : 0}%)
                  </span>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground text-xs">No cost data recorded for this invoice (older sale).</div>
            )}
          </div>

          {openBalance > 0 && (
            <div className="print:hidden rounded-xl border p-3 space-y-2">
              <Label className="text-xs uppercase text-muted-foreground tracking-wider">Record payment (recovery)</Label>
              <div className="flex gap-2">
                <Select value={payForm.method} onValueChange={(v) => setPayForm({ ...payForm, method: v })}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" value={payForm.amount || ""} placeholder="Amount"
                       onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })} />
                <Button onClick={addPayment}>Add</Button>
              </div>
            </div>
          )}

          <Button className="w-full mt-2 print:hidden" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
