/**
 * Supabase (PostgREST) caps every response at 1,000 rows and says nothing
 * when it does — a page that loads a whole table silently loses the newest
 * rows once the table grows past that. Page through instead.
 *
 * `build(from, to)` must return the query for one page, with a stable
 * total order (add `.order("id")` as a tiebreak) so pages never overlap.
 */
export async function fetchAll<T = any>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  pageSize = 1000,
): Promise<{ data: T[]; error: { message: string } | null }> {
  const out: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build(from, from + pageSize - 1);
    if (error) return { data: out, error };
    out.push(...(data ?? []));
    if (!data || data.length < pageSize) return { data: out, error: null };
  }
}
