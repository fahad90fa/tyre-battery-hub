import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { printArea } from "@/lib/print";
import { money, shortDate } from "@/lib/format";
import { methodLabel } from "@/lib/payments";
import { toPaisa } from "@/lib/pricing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Letterhead } from "@/components/admin/Letterhead";
import { Printer } from "lucide-react";

/**
 * Read-only invoice detail popup, opened from ledger entries / pending
 * invoice lists. Looks the invoice up by its human reference (INV-...).
 */
export function InvoiceQuickView({ invoiceRef, onClose }: { invoiceRef: string | null; onClose: () => void }) {
  const [inv, setInv] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [client, setClient] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!invoiceRef) { setInv(null); setItems([]); setPayments([]); setClient(null); setNotFound(false); return; }
    (async () => {
      const { data: invoice } = await supabase.from("invoices").select("*").eq("invoice_id", invoiceRef).maybeSingle();
      if (!invoice) { setNotFound(true); return; }
      setInv(invoice);
      const [{ data: it }, { data: pays }, clientRes] = await Promise.all([
        supabase.from("invoice_items").select("*").eq("invoice_id", invoice.id),
        supabase.from("invoice_payments").select("*").eq("invoice_id", invoice.id).order("payment_date"),
        invoice.client_id
          ? supabase.from("clients").select("id, name, account_no, current_balance").eq("id", invoice.client_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      setItems(it ?? []); setPayments(pays ?? []); setClient(clientRes.data ?? null);
    })();
  }, [invoiceRef]);

  const paid = payments.reduce((a, p) => a + Number(p.amount), 0);
  const balance = inv ? Math.max(0, Number(inv.total_amount) - paid) : 0;
  const cancelled = inv?.payment_status === "cancelled";
  // The account's standing before this bill, so the printed invoice shows
  // the complete position: previous balance + this bill = total outstanding.
  const accountTotal = client ? Number(client.current_balance) || 0 : 0;
  const previousBalance = client ? toPaisa(accountTotal - balance) : 0;

  return (
    <Dialog open={!!invoiceRef} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Invoice {invoiceRef}</DialogTitle></DialogHeader>
        {notFound && (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No invoice found for reference {invoiceRef}.
          </div>
        )}
        {inv && (
          <div className="print-area text-sm space-y-2">
            <Letterhead docTitle="Invoice" docNo={inv.invoice_id} date={inv.created_at} />
            {cancelled && (
              <div className="rounded-lg border-2 border-destructive text-destructive font-black text-center py-1.5 uppercase tracking-widest">
                Cancelled — items returned
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Customer</span>
              <span className="text-foreground">{inv.customer_name}{client?.account_no ? ` (${client.account_no})` : ""}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Purchase date</span><span className="text-foreground">{shortDate(inv.created_at)}</span>
            </div>
            {inv.due_date && balance > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Due date</span><span className="text-orange-500 font-medium">{shortDate(inv.due_date)}</span>
              </div>
            )}
            <table className="w-full mt-3 border-t">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2">Item</th><th className="text-center">Qty</th><th className="text-right">Price</th><th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="py-2">{it.product_name}</td>
                    <td className="text-center">{it.quantity}</td>
                    <td className="text-right">{money(it.unit_price)}</td>
                    <td className="text-right font-medium">{money(it.total_price)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No item details on this invoice.</td></tr>
                )}
              </tbody>
            </table>
            <div className="flex justify-between pt-3 border-t font-bold">
              <span>This invoice</span><span>{money(inv.total_amount)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid</span><span>{money(paid)}</span>
            </div>
            <div className={`flex justify-between font-semibold ${balance > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
              <span>Balance due</span><span>{balance > 0 ? money(balance) : "—"}</span>
            </div>
            {client && (
              <div className="pt-2 border-t space-y-1">
                <div className="text-xs uppercase text-muted-foreground">Account summary — {client.name}</div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Previous balance (other bills)</span><span className="text-foreground">{money(previousBalance)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>This invoice balance</span><span className="text-foreground">{money(balance)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-1">
                  <span>Total outstanding</span>
                  <span className={accountTotal > 0 ? "text-orange-500" : "text-green-600"}>{money(accountTotal)}</span>
                </div>
              </div>
            )}
            {payments.length > 0 && (
              <div className="pt-2 border-t">
                <div className="text-xs uppercase text-muted-foreground mb-1">Payment history</div>
                {payments.map((p) => (
                  <div key={p.id} className="flex justify-between text-xs py-0.5">
                    <span>{shortDate(p.payment_date)} — {methodLabel(p.method)}</span>
                    <span>{money(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-2 print:hidden" onClick={() => printArea()}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
