export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "Easypaisa" },
  { value: "bank", label: "Bank transfer" },
  { value: "card", label: "Card" },
  { value: "scrap", label: "Scrap" },
  { value: "other", label: "Other" },
] as const;

export const methodLabel = (v: string | null | undefined) =>
  PAYMENT_METHODS.find((m) => m.value === v)?.label ?? (v || "—");

/** Summarise split payments as e.g. "Cash + JazzCash" for the invoice row —
 *  always in PAYMENT_METHODS order, the same canonical order the database
 *  trigger writes, so receipt, list and stored label never disagree. */
export const summarizeMethods = (methods: string[]) => {
  const rank = (v: string) => { const i = PAYMENT_METHODS.findIndex((m) => m.value === v); return i < 0 ? 99 : i; };
  const uniq = [...new Set(methods)].sort((a, b) => rank(a) - rank(b));
  if (uniq.length === 0) return "unpaid";
  return uniq.map(methodLabel).join(" + ");
};

export const paymentStatus = (total: number, paid: number): "paid" | "partial" | "unpaid" => {
  if (paid <= 0) return "unpaid";
  if (paid >= total) return "paid";
  return "partial";
};
