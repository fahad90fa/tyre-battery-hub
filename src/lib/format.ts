/** Rupees, with paise shown only when the amount actually has them.
 *  Rs 12,500 stays "Rs 12,500"; 26139.6 prints as "Rs 26,139.60" instead of
 *  being silently rounded to Rs 26,140. */
export const money = (n: number | string | null | undefined) => {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  const decimals = Number.isInteger(v) ? 0 : 2;
  return "Rs " + v.toLocaleString("en-PK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const shortDate = (s: string | Date | null | undefined) => {
  if (!s) return "—";
  const d = typeof s === "string" ? new Date(s) : s;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

/** Today's date in the DEVICE's local timezone (YYYY-MM-DD) — never UTC.
 *  Using toISOString() shifted dates before 5 AM Pakistan time. */
export const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Local (device timezone) date of a timestamp — use instead of
 *  `ts.slice(0,10)`, which yields the UTC date and is a day behind for
 *  Pakistan-morning records. */
export const localDateOf = (ts: string | Date | null | undefined) => {
  if (!ts) return "";
  const d = typeof ts === "string" ? new Date(ts) : ts;
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
