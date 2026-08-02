export const money = (n: number | string | null | undefined) => {
  const v = typeof n === "string" ? Number(n) : n ?? 0;
  return "Rs " + ((v ?? 0) + 0).toLocaleString("en-PK", { maximumFractionDigits: 0 });
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
