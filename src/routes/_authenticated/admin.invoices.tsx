import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/invoices")({
  component: InvoicesAdmin,
});

function InvoicesAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const view = async (inv: any) => {
    setOpen(inv);
    const { data } = await supabase.from("invoice_items").select("*").eq("invoice_id", inv.id);
    setItems(data ?? []);
  };

  return (
    <AdminShell title="Invoices">
      <div className="rounded-2xl bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <tr><th className="p-3">Invoice</th><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Amount</th><th className="p-3">Method</th><th className="p-3">Status</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-muted/50 cursor-pointer" onClick={() => view(r)}>
                <td className="p-3 font-mono">{r.invoice_id}</td>
                <td className="p-3">{shortDate(r.created_at)}</td>
                <td className="p-3">{r.customer_name}</td>
                <td className="p-3 font-semibold">{money(r.total_amount)}</td>
                <td className="p-3">{r.payment_method}</td>
                <td className="p-3"><span className={r.payment_status === "paid" ? "text-green-600" : "text-destructive"}>{r.payment_status}</span></td>
                <td className="p-3"><Button variant="ghost" size="sm">View</Button></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">No invoices yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-lg print:shadow-none">
          <DialogHeader><DialogTitle>Invoice {open?.invoice_id}</DialogTitle></DialogHeader>
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
          </div>
          <Button className="w-full mt-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
