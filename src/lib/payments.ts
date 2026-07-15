export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "Easypaisa" },
  { value: "bank", label: "Bank transfer" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
] as const;

export const methodLabel = (v: string | null | undefined) =>
  PAYMENT_METHODS.find((m) => m.value === v)?.label ?? (v || "—");

/** Summarise split payments as e.g. "JazzCash + Cash" for the invoice row. */
export const summarizeMethods = (methods: string[]) => {
  const uniq = [...new Set(methods)];
  if (uniq.length === 0) return "unpaid";
  return uniq.map(methodLabel).join(" + ");
};

export const paymentStatus = (total: number, paid: number): "paid" | "partial" | "unpaid" => {
  if (paid <= 0) return "unpaid";
  if (paid >= total) return "paid";
  return "partial";
};
