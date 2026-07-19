import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { money, shortDate } from "@/lib/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Detail popup for a multi-item merchant purchase (PUR-... reference),
 * opened from the merchant ledger. Shows every item bought that day.
 */
export function PurchaseQuickView({ purchaseRef, onClose }: { purchaseRef: string | null; onClose: () => void }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!purchaseRef) { setItems([]); return; }
    (async () => {
      const { data } = await supabase.from("stock_purchases")
        .select("*, products(product_name)")
        .eq("reference", purchaseRef)
        .order("created_at");
      setItems(data ?? []);
    })();
  }, [purchaseRef]);

  const total = items.reduce((a, it) => a + Number(it.purchase_price) * it.quantity, 0);

  return (
    <Dialog open={!!purchaseRef} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Purchase {purchaseRef}</DialogTitle></DialogHeader>
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No item details recorded for this purchase (older entry).
          </div>
        ) : (
          <div className="text-sm space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Date</span><span className="text-foreground">{shortDate(items[0].date)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Supplier</span><span className="text-foreground">{items[0].supplier_name}</span>
            </div>
            <table className="w-full mt-3 border-t">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2">Item</th><th className="text-center">Qty</th><th className="text-right">Unit cost</th><th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="py-2">{it.products?.product_name ?? "—"}</td>
                    <td className="text-center">{it.quantity}</td>
                    <td className="text-right">{money(it.purchase_price)}</td>
                    <td className="text-right font-medium">{money(Number(it.purchase_price) * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between pt-3 border-t font-bold">
              <span>Total</span><span>{money(total)}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
