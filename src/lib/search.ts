/**
 * Order-independent, multi-word matching for live searches and pickers.
 * "bandalayar 12 evergreen" matches "Evergreen Bandalayar 12/70" — every
 * typed word must appear somewhere in the text, in any order.
 */
export const matchesQuery = (text: string | null | undefined, query: string | null | undefined) => {
  const q = (query ?? "").trim().toLowerCase();
  if (!q) return true;
  const t = (text ?? "").toLowerCase();
  return q.split(/\s+/).every((word) => t.includes(word));
};
