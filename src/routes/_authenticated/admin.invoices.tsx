import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { printArea } from "@/lib/print";
import { money, shortDate, localToday, localDateOf } from "@/lib/format";
import { PAYMENT_METHODS, methodLabel, paymentStatus } from "@/lib/payments";
import { sumMoney, toPaisa } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Printer, EyeOff, Undo2 } from "lucide-react";
import { Letterhead } from "@/components/admin/Letterhead";

export const Route = createFileRoute("/_authenticated/admin/invoices")({
  component: InvoicesAdmin,
});

function InvoicesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [payments, setPayments] = useState<Record<string, any[]>>({});
  const [open, setOpen] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [client, setClient] = useState<any>(null);
  const [tab, setTab] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [payForm, setPayForm] = useState({ method: "cash", amount: 0 });
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnQty, setReturnQty] = useState<Record<string, number>>({});
  const [refundCash, setRefundCash] = useState(true);
  const [processing, setProcessing] = useState(false);

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
  const today = localToday();
  const isCancelled = (inv: any) => inv.payment_status === "cancelled";
  const isOverdue = (inv: any) => !isCancelled(inv) && balanceOf(inv) > 0 && inv.due_date && inv.due_date < today;

  const filtered = useMemo(() => {
    let list = rows;
    if (dateFilter) list = list.filter((r) => localDateOf(r.created_at) === dateFilter);
    if (tab === "outstanding") return list.filter((r) => !isCancelled(r) && balanceOf(r) > 0);
    if (tab === "overdue") return list.filter(isOverdue);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, payments, tab, dateFilter]);

  const totals = useMemo(() => ({
    outstanding: rows.reduce((a, r) => a + (isCancelled(r) ? 0 : balanceOf(r)), 0),
    overdueCount: rows.filter(isOverdue).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [rows, payments]);

  const viewReq = useRef(0);
  const view = async (inv: any) => {
    setOpen(inv);
    setItems([]);
    setClient(null);
    setPayForm({ method: "cash", amount: Math.max(0, Number(inv.total_amount) - paidOf(inv)) });
    const req = ++viewReq.current;
    const [{ data }, clientRes] = await Promise.all([
      supabase.from("invoice_items").select("*").eq("invoice_id", inv.id),
      inv.client_id
        ? supabase.from("clients").select("id, name, account_no, current_balance").eq("id", inv.client_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    if (req === viewReq.current) { setItems(data ?? []); setClient(clientRes.data ?? null); }
  };

  const addPayment = async () => {
    if (!open) return;
    const amount = Number(payForm.amount);
    if (!amount || amount <= 0) return toast.error("Amount required");
    const balance = balanceOf(open);
    if (amount > balance) return toast.error(`Amount exceeds balance (${money(balance)})`);

    const { error } = await supabase.from("invoice_payments").insert({
      invoice_id: open.id, amount, method: payForm.method, payment_date: localToday(),
    });
    if (error) return toast.error(error.message);

    const newStatus = paymentStatus(Number(open.total_amount), paidOf(open) + amount);
    await supabase.from("invoices").update({ payment_status: newStatus }).eq("id", open.id);

    if (open.client_id) {
      await supabase.from("client_ledger").insert({
        client_id: open.client_id, entry_type: "payment", amount,
        method: payForm.method, reference: open.invoice_id,
        note: `Recovery (${methodLabel(payForm.method)})`, entry_date: localToday(),
      });
    }
    toast.success(`Payment of ${money(amount)} recorded`);
    await load();
    setOpen({ ...open, payment_status: newStatus });
    setPayForm({ method: "cash", amount: 0 });
  };

  // ---- Returns / cancellation -------------------------------------------
  // Returning items puts them back in stock, credits the customer's account,
  // shrinks the invoice, and (optionally) books the cash refund — so stock,
  // khaata and daily cash all stay truthful. Returning everything cancels
  // the invoice.
  const openReturn = () => {
    setReturnQty(Object.fromEntries(items.map((it) => [it.id, it.quantity])));
    setRefundCash(true);
    setReturnOpen(true);
  };

  const retLines = items
    .map((it) => ({ it, ret: Math.min(Math.max(0, Math.floor(Number(returnQty[it.id]) || 0)), it.quantity) }))
    .filter((l) => l.ret > 0);
  const returnValue = sumMoney(retLines.map((l) => l.ret * Number(l.it.unit_price)));
  const newTotal = Math.max(0, toPaisa(Number(open?.total_amount ?? 0) - returnValue));
  const paidSoFar = open ? paidOf(open) : 0;
  const refundDue = Math.max(0, toPaisa(paidSoFar - newTotal));

  const processReturn = async () => {
    if (!open || retLines.length === 0) return toast.error("Enter a quantity to return");
    setProcessing(true);
    try {
      // 1. Put the returned quantities back into stock (fresh counts, so a
      //    sale made meanwhile isn't overwritten).
      for (const l of retLines) {
        if (!l.it.product_id) continue;
        const { data: prod } = await supabase.from("products")
          .select("quantity_in_stock").eq("id", l.it.product_id).maybeSingle();
        if (prod) {
          await supabase.from("products")
            .update({ quantity_in_stock: (Number(prod.quantity_in_stock) || 0) + l.ret })
            .eq("id", l.it.product_id);
        }
      }

      // 2. Shrink or remove the invoice lines.
      for (const l of retLines) {
        const left = l.it.quantity - l.ret;
        if (left <= 0) {
          await supabase.from("invoice_items").delete().eq("id", l.it.id);
        } else {
          await supabase.from("invoice_items")
            .update({ quantity: left, total_price: toPaisa(left * Number(l.it.unit_price)) })
            .eq("id", l.it.id);
        }
      }

      // 3. The invoice itself: cancelled when nothing is left.
      const newStatus = newTotal <= 0 ? "cancelled" : paymentStatus(newTotal, paidSoFar);
      const { error: invErr } = await supabase.from("invoices")
        .update({ total_amount: newTotal, payment_status: newStatus }).eq("id", open.id);
      if (invErr) return toast.error(invErr.message);

      // 4. Sales history: negative rows dated on the sale day, so reports
      //    and the dashboard net the return out of that day's figures.
      const saleDay = localDateOf(open.created_at) || localToday();
      await supabase.from("customer_purchases").insert(retLines.map((l) => ({
        customer_name: open.customer_name, product_id: l.it.product_id,
        quantity_purchased: -l.ret, total_price: -toPaisa(l.ret * Number(l.it.unit_price)),
        cost_price: l.it.cost_price, payment_method: "return", payment_status: "paid",
        purchase_date: saleDay,
      })));

      // 5. Account customers: credit the khaata for the returned value.
      if (open.client_id) {
        await supabase.from("client_ledger").insert({
          client_id: open.client_id, entry_type: "credit", amount: returnValue,
          reference: open.invoice_id,
          note: `Return: ${retLines.map((l) => `${l.it.product_name} × ${l.ret}`).join("; ")}`,
          entry_date: localToday(),
        });
      }

      // 6. If they had paid more than what's left, hand the cash back and
      //    book it, so the daily closing shows the money going out.
      if (refundDue > 0 && refundCash) {
        await supabase.from("expenses").insert({
          expense_type: "Customer refund", amount: refundDue,
          notes: `Refund for return on ${open.invoice_id} (${open.customer_name})`,
          date_of_expense: localToday(),
        });
        if (open.client_id) {
          await supabase.from("client_ledger").insert({
            client_id: open.client_id, entry_type: "debit", amount: refundDue,
            reference: open.invoice_id, note: "Cash refunded for returned items",
            entry_date: localToday(),
          });
        }
      }

      toast.success(newTotal <= 0
        ? `Invoice ${open.invoice_id} cancelled — stock restored${refundDue > 0 && refundCash ? `, ${money(refundDue)} refunded` : ""}`
        : `Return recorded — invoice now ${money(newTotal)}, stock restored`);
      setReturnOpen(false);
      await load();
      const { data: fresh } = await supabase.from("invoices").select("*").eq("id", open.id).maybeSingle();
      if (fresh) view(fresh); else setOpen(null);
    } finally {
      setProcessing(false);
    }
  };

  const cost = items.reduce((a, it) => a + Number(it.cost_price ?? 0) * it.quantity, 0);
  const hasCost = items.some((it) => it.cost_price != null);
  const profit = Number(open?.total_amount ?? 0) - cost;
  const openPaid = open ? paidOf(open) : 0;
  const openBalance = open ? balanceOf(open) : 0;
  // The account's standing before this bill; adding this bill's balance on
  // top gives the total the customer owes right now.
  const accountTotal = client ? Number(client.current_balance) || 0 : 0;
  const previousBalance = client ? toPaisa(accountTotal - openBalance) : 0;

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
        <div className="flex items-center gap-2 flex-wrap">
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-40" />
          {dateFilter && (
            <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>All dates</Button>
          )}
          <div className="text-sm ml-2">
            Total receivable: <b className={totals.outstanding > 0 ? "text-orange-500" : "text-green-600"}>{money(totals.outstanding)}</b>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card shadow-sm overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Invoice</th><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Amount</th><th className="p-3">Paid</th><th className="p-3">Balance</th><th className="p-3">Method</th><th className="p-3">Status</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const bal = balanceOf(r);
              const overdue = isOverdue(r);
              const cancelled = isCancelled(r);
              return (
                <tr key={r.id} className={`border-t hover:bg-muted/50 cursor-pointer ${cancelled ? "opacity-60" : ""}`} onClick={() => view(r)}>
                  <td className="p-3 font-mono">{r.invoice_id}</td>
                  <td className="p-3">{shortDate(r.created_at)}</td>
                  <td className="p-3">{r.customer_name}</td>
                  <td className="p-3 font-semibold">{money(r.total_amount)}</td>
                  <td className="p-3 text-green-600">{money(paidOf(r))}</td>
                  <td className={`p-3 font-semibold ${bal > 0 ? "text-orange-500" : "text-muted-foreground"}`}>{bal > 0 ? money(bal) : "—"}</td>
                  <td className="p-3 text-muted-foreground">{r.payment_method}</td>
                  <td className="p-3">
                    <span className={cancelled ? "text-destructive font-semibold" : r.payment_status === "paid" ? "text-green-600" : overdue ? "text-destructive font-semibold" : "text-orange-500"}>
                      {cancelled ? "cancelled" : overdue ? "overdue" : r.payment_status}
                    </span>
                    {r.due_date && bal > 0 && !cancelled && <div className="text-[10px] text-muted-foreground">due {shortDate(r.due_date)}</div>}
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

          {/* Customer-facing section — this is what gets printed, on letterhead */}
          <div className="print-area text-sm space-y-2">
            <Letterhead docTitle="Invoice" docNo={open?.invoice_id ?? ""} date={open?.created_at} />
            {open && isCancelled(open) && (
              <div className="rounded-lg border-2 border-destructive text-destructive font-black text-center py-1.5 uppercase tracking-widest">
                Cancelled — items returned
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Customer</span>
              <span>{open?.customer_name}{client?.account_no ? ` (${client.account_no})` : ""}</span>
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
              <span>This invoice</span><span>{money(open?.total_amount)}</span>
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
            {client && (
              // Full account position, so the customer can read everything
              // they owe straight off the invoice.
              <div className="pt-2 border-t space-y-1">
                <div className="text-xs uppercase text-muted-foreground">Account summary — {client.name}</div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Previous balance (other bills)</span><span className="text-foreground">{money(previousBalance)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>This invoice balance</span><span className="text-foreground">{money(openBalance)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-1">
                  <span>Total outstanding</span>
                  <span className={accountTotal > 0 ? "text-orange-500" : "text-green-600"}>{money(accountTotal)}</span>
                </div>
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

          {open && !isCancelled(open) && openBalance > 0 && (
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

          <div className="flex gap-2 mt-2 print:hidden">
            {open && !isCancelled(open) && items.length > 0 && (
              <Button variant="outline" className="flex-1 text-destructive hover:text-destructive" onClick={openReturn}>
                <Undo2 className="h-4 w-4 mr-2" /> Return / cancel
              </Button>
            )}
            <Button className="flex-1" onClick={() => printArea()}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Return / cancel dialog */}
      <Dialog open={returnOpen} onOpenChange={(v) => !v && setReturnOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Return items — {open?.invoice_id}</DialogTitle></DialogHeader>
          <div className="text-xs text-muted-foreground">
            Returned quantities go straight back into stock, the customer's account is
            credited, and returning everything cancels the invoice. Wrong bill? Leave
            all quantities as they are and confirm — that cancels it completely.
          </div>
          <div className="space-y-2">
            {items.map((it) => (
              <div key={it.id} className="rounded-xl border p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{it.product_name}</div>
                  <div className="text-xs text-muted-foreground">
                    Sold {it.quantity} @ {money(it.unit_price)}
                  </div>
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase">Return qty</Label>
                  <Input type="number" min={0} max={it.quantity} value={returnQty[it.id] ?? 0}
                         onChange={(e) => setReturnQty((m) => ({ ...m, [it.id]: Number(e.target.value) }))} />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-muted/40 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Return value</span><b>{money(returnValue)}</b></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Invoice after return</span><b>{money(newTotal)}</b></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Already paid</span><b className="text-green-600">{money(paidSoFar)}</b></div>
            {refundDue > 0 && (
              <div className="flex justify-between font-semibold text-orange-500">
                <span>Refund due to customer</span><span>{money(refundDue)}</span>
              </div>
            )}
          </div>
          {refundDue > 0 && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={refundCash} onCheckedChange={(v) => setRefundCash(v === true)} />
              <span>
                Refund <b>{money(refundDue)}</b> in cash now (recorded as money out today).
                {open?.client_id ? " Untick to leave it as credit on the account." : ""}
              </span>
            </label>
          )}
          <Button className="w-full" variant={newTotal <= 0 ? "destructive" : "default"}
                  onClick={processReturn} disabled={processing || retLines.length === 0}>
            {processing ? "Processing..."
              : newTotal <= 0 ? `Cancel invoice & restock ${retLines.reduce((a, l) => a + l.ret, 0)} item(s)`
              : `Return ${retLines.reduce((a, l) => a + l.ret, 0)} item(s) — ${money(returnValue)}`}
          </Button>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
