import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate } from "@/lib/format";
import { methodLabel } from "@/lib/payments";
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
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!invoiceRef) { setInv(null); setItems([]); setPayments([]); setNotFound(false); return; }
    (async () => {
      const { data: invoice } = await supabase.from("invoices").select("*").eq("invoice_id", invoiceRef).maybeSingle();
      if (!invoice) { setNotFound(true); return; }
      setInv(invoice);
      const [{ data: it }, { data: pays }] = await Promise.all([
        supabase.from("invoice_items").select("*").eq("invoice_id", invoice.id),
        supabase.from("invoice_payments").select("*").eq("invoice_id", invoice.id).order("payment_date"),
      ]);
      setItems(it ?? []); setPayments(pays ?? []);
    })();
  }, [invoiceRef]);

  const paid = payments.reduce((a, p) => a + Number(p.amount), 0);
  const balance = inv ? Math.max(0, Number(inv.total_amount) - paid) : 0;

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
            <div className="flex justify-between text-muted-foreground">
              <span>Customer</span><span className="text-foreground">{inv.customer_name}</span>
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
              <span>Total</span><span>{money(inv.total_amount)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid</span><span>{money(paid)}</span>
            </div>
            <div className={`flex justify-between font-semibold ${balance > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
              <span>Balance due</span><span>{balance > 0 ? money(balance) : "—"}</span>
            </div>
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
            <Button variant="outline" className="w-full mt-2 print:hidden" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
