import { toast } from "sonner";

/**
 * Supabase (PostgREST) caps every response at 1,000 rows and says nothing
 * when it does — a page that loads a whole table silently loses the newest
 * rows once the table grows past that. Page through instead.
 *
 * `build(from, to)` must return the query for one page, with a stable
 * total order (add `.order("id")` as a tiebreak) so pages never overlap.
 * A page that fails is announced, so a short list is never mistaken for
 * the whole table; a row shifted across a page boundary by a concurrent
 * write is de-duplicated by id.
 */
export async function fetchAll<T = any>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  pageSize = 1000,
): Promise<{ data: T[]; error: { message: string } | null }> {
  const out: T[] = [];
  const seen = new Set<string>();
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build(from, from + pageSize - 1);
    if (error) {
      toast.error(`Could not load all records (${error.message}) — figures may be incomplete`);
      return { data: out, error };
    }
    for (const row of data ?? []) {
      const id = (row as { id?: string | number } | null)?.id;
      if (id != null) { if (seen.has(String(id))) continue; seen.add(String(id)); }
      out.push(row);
    }
    if (!data || data.length < pageSize) return { data: out, error: null };
  }
}
