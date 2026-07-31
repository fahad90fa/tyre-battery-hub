/**
 * Percentage-based price adjustment: products carry a company/base price and
 * a bill can add or deduct a percentage per transaction.
 * pct is signed: +10 adds 10%, -5 deducts 5%.
 *
 * Precision: computed to 2 decimals (paise) using integer math so that
 * values like 12,500 never drift to 12,499 from floating-point rounding.
 */
export const applyPct = (base: number, pct: number) => {
  const b = Number(base) || 0;
  const p = Number(pct) || 0;
  // work in paise to avoid float error, e.g. 12500 * 1.1 -> 13750 exactly
  return Math.round(b * 100 * (1 + p / 100)) / 100;
};

/** Reverse: what percentage turns `base` into `price` (1 decimal). */
export const impliedPct = (base: number, price: number) =>
  base > 0 ? Math.round((price / base - 1) * 1000) / 10 : 0;
