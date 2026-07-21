/**
 * Percentage-based price adjustment: products carry a retail/base price and
 * a bill can add or deduct a percentage per transaction.
 * pct is signed: +10 adds 10%, -5 deducts 5%.
 */
export const applyPct = (base: number, pct: number) =>
  Math.round(base * (1 + (Number(pct) || 0) / 100));

/** Reverse: what percentage turns `base` into `price` (1 decimal). */
export const impliedPct = (base: number, price: number) =>
  base > 0 ? Math.round((price / base - 1) * 1000) / 10 : 0;
