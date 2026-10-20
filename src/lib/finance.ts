import { supabase } from "@/integrations/supabase/client";
import { fetchAll } from "@/lib/fetchAll";
import { toast } from "sonner";

// Monthly profit & loss, shared by the dashboard card and the Reports page
// so both always show the same figures.
//
// Sources: invoices + invoice_items (the one record every sale creates;
// returns shrink them in place), expenses, and stock_adjustments for stock
// written off as damaged or expired.
//
// Rs 1 lines are not sales: the shop rings stock out through the POS on
// Rs 1 bills ("Stock Manage", "Claim clear"). They carry the full cost of
// the units, so counting them would show a huge fake loss. They are left out
// of revenue and cost and reported separately as stock removed.

export type MonthPnL = {
  month: string; // YYYY-MM
  /** Billed sales, net of returns, excluding Rs 1 stock-out lines. */
  revenue: number;
  /** Cost of the goods sold (cost price at the time of sale × quantity). */
  cogs: number;
  grossProfit: number;
  /** Gross profit as a share of revenue (0–1), null without revenue. */
  grossMargin: number | null;
  /** Running costs for the month (refunds excluded: returns already reduce revenue). */
  expenses: number;
  expensesByType: { type: string; amount: number }[];
  refundsExcluded: number;
  /** Stock written off as damaged or expired, at purchase price. */
  writeOffs: number;
  /** Gross profit − expenses − write-offs. Negative = net loss. */
  netProfit: number;
  /** Lines sold below their cost (already inside gross profit, so already in net profit). */
  belowCostLoss: number;
  /**
   * Money lost in the month: below-cost sales + write-offs, or the whole net
   * loss when that is bigger. Never negative. Equals
   * belowCostLoss + writeOffs + otherLoss. Both of the first two are already
   * inside net profit, so a net loss is never added on top of them.
   */
  totalLoss: number;
  /**
   * The part of a net loss not explained by below-cost sales and write-offs
   * (e.g. expenses the month's profitable sales did not cover). 0 without a
   * net loss, or when those two account for all of it.
   */
  otherLoss: number;
  /** Revenue on lines with no recorded cost (shows as 100% margin). */
  uncostedRevenue: number;
  /** Rs 1 stock-out bills: units and their cost, not counted as sales. */
  stockOutUnits: number;
  stockOutCost: number;
  invoiceCount: number;
  /** Set when a query failed: the figures above are then incomplete. */
  error: string | null;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Local-time start of a month and of the next one. */
export function monthBounds(month: string) {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  return { start, end, startDay: iso(start), endDay: iso(end) };
}

/** "Oct 2026" for "2026-10". */
export const monthLabel = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
};

const isStockOutLine = (it: { unit_price?: number | string | null }) => Number(it.unit_price) <= 1;

/**
 * `quiet` keeps background refreshes from toasting on a failed fetch; the
 * result's `error` says the figures are incomplete either way.
 */
export async function loadMonthPnL(month: string, opts: { quiet?: boolean } = {}): Promise<MonthPnL> {
  const { start, end, startDay, endDay } = monthBounds(month);

  const [{ data: invoices, error: invErr }, { data: expenses, error: expErr }, adj] = await Promise.all([
    fetchAll((a, b) => supabase.from("invoices")
      .select("id, total_amount, payment_status, invoice_items(quantity, unit_price, total_price, cost_price)")
      .gte("created_at", start.toISOString()).lt("created_at", end.toISOString())
      .or("payment_status.is.null,payment_status.neq.cancelled")
      .order("id").range(a, b), 1000, opts),
    fetchAll((a, b) => supabase.from("expenses")
      .select("id, amount, expense_type")
      .gte("date_of_expense", startDay).lt("date_of_expense", endDay)
      .order("id").range(a, b), 1000, opts),
    supabase.from("stock_adjustments")
      .select("delta, products(purchase_price)")
      .eq("reason", "Damaged or expired").lt("delta", 0)
      .gte("created_at", start.toISOString()).lt("created_at", end.toISOString()),
  ]);

  let billed = 0, stockOutRevenue = 0, cogs = 0, belowCost = 0, uncosted = 0;
  let stockOutUnits = 0, stockOutCost = 0, invoiceCount = 0;
  for (const inv of (invoices ?? []) as any[]) {
    const items: any[] = inv.invoice_items ?? [];
    const allStockOut = items.length > 0 && items.every(isStockOutLine);
    if (!allStockOut) invoiceCount++;
    billed += Number(inv.total_amount) || 0;
    for (const it of items) {
      const qty = Number(it.quantity) || 0;
      const total = Number(it.total_price) || 0;
      const cost = (Number(it.cost_price) || 0) * qty;
      if (isStockOutLine(it)) {
        stockOutRevenue += total; stockOutUnits += qty; stockOutCost += cost;
        continue;
      }
      cogs += cost;
      if (cost > 0) belowCost += Math.max(0, cost - total);
      else uncosted += total;
    }
  }
  const revenue = billed - stockOutRevenue;

  let expenseTotal = 0, refunds = 0;
  const byType = new Map<string, { label: string; amount: number }>();
  for (const e of (expenses ?? []) as any[]) {
    const amount = Number(e.amount) || 0;
    const label = String(e.expense_type ?? "Other").trim() || "Other";
    const key = label.toLowerCase().replace(/\s+/g, " ");
    if (key.includes("refund")) { refunds += amount; continue; }
    expenseTotal += amount;
    const cur = byType.get(key);
    byType.set(key, { label: cur?.label ?? label, amount: (cur?.amount ?? 0) + amount });
  }
  const expensesByType = [...byType.values()]
    .sort((a, b) => b.amount - a.amount)
    .map((t) => ({ type: t.label, amount: r2(t.amount) }));

  // A missing table (database not yet updated) simply means no write-offs.
  // Any other failure is reported: the write-offs are then unknown, not Rs 0.
  const adjMissing = adj.error?.code === "42P01" || adj.error?.code === "PGRST205";
  const adjErr = adj.error && !adjMissing ? adj.error : null;
  if (adjErr && !opts.quiet) toast.error(`Could not load all records (${adjErr.message}) — figures may be incomplete`);
  let writeOffs = 0;
  if (!adj.error) {
    for (const a of (adj.data ?? []) as any[]) {
      writeOffs += -Number(a.delta) * (Number(a.products?.purchase_price) || 0);
    }
  }

  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expenseTotal - writeOffs;
  // Below-cost sales and write-offs are already inside net profit: a net loss
  // bigger than both adds only its unexplained remainder (otherLoss). Parts
  // are rounded first so they always add up to the total shown.
  const belowCostR = r2(belowCost), writeOffsR = r2(writeOffs), netProfitR = r2(netProfit);
  const otherLoss = r2(Math.max(0, -netProfitR - belowCostR - writeOffsR));
  return {
    month,
    revenue: r2(revenue),
    cogs: r2(cogs),
    grossProfit: r2(grossProfit),
    grossMargin: revenue > 0 ? grossProfit / revenue : null,
    expenses: r2(expenseTotal),
    expensesByType,
    refundsExcluded: r2(refunds),
    writeOffs: writeOffsR,
    netProfit: netProfitR,
    belowCostLoss: belowCostR,
    // = max(belowCost + writeOffs, −netProfit), never negative
    totalLoss: r2(belowCostR + writeOffsR + otherLoss),
    otherLoss,
    uncostedRevenue: r2(uncosted),
    stockOutUnits,
    stockOutCost: r2(stockOutCost),
    invoiceCount,
    error: invErr?.message ?? expErr?.message ?? adjErr?.message ?? null,
  };
}
