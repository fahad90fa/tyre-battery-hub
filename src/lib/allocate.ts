import { supabase } from "@/integrations/supabase/client";
import { paymentStatus } from "@/lib/payments";
import { toast } from "sonner";

/**
 * Spread an account payment over the client's outstanding invoices (oldest
 * first) so invoice statuses flip to paid/partial automatically. Used by the
 * account ledger, the Recovery page and anywhere else a khaata payment is
 * recorded. Returns how many invoices were touched, or -1 on a query error.
 */
export async function allocatePaymentToInvoices(
  clientId: string,
  amount: number,
  method: string,
  payDate: string,
): Promise<number> {
  const { data: invs, error } = await supabase.from("invoices")
    .select("id, invoice_id, total_amount, payment_status, created_at")
    .eq("client_id", clientId)
    .neq("payment_status", "paid")
    .neq("payment_status", "cancelled")
    .order("created_at");
  if (error) {
    toast.error(`Payment saved, but invoice statuses could not be updated: ${error.message}`);
    return -1;
  }
  if (!invs?.length) return 0;
  const ids = invs.map((i) => i.id);
  const { data: pays } = await supabase.from("invoice_payments").select("invoice_id, amount").in("invoice_id", ids);
  let remaining = amount;
  let touched = 0;
  for (const inv of invs) {
    if (remaining <= 0) break;
    const paid = (pays ?? []).filter((x) => x.invoice_id === inv.id).reduce((a, x) => a + Number(x.amount), 0);
    const bal = Number(inv.total_amount) - paid;
    if (bal <= 0) {
      await supabase.from("invoices").update({ payment_status: "paid" }).eq("id", inv.id);
      continue;
    }
    const alloc = Math.min(bal, remaining);
    const { error: payErr } = await supabase.from("invoice_payments").insert({
      invoice_id: inv.id, amount: alloc, method, payment_date: payDate,
      note: "Auto-allocated from account payment",
    });
    if (payErr) {
      toast.error(`Payment saved, but marking invoice ${inv.invoice_id} paid failed: ${payErr.message}`);
      break;
    }
    await supabase.from("invoices").update({
      payment_status: paymentStatus(Number(inv.total_amount), paid + alloc),
    }).eq("id", inv.id);
    remaining -= alloc;
    touched++;
  }
  return touched;
}
