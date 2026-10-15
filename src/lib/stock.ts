// Stock helpers shared by the admin screens and the website.
//
// products.quantity_in_stock is kept by the database from the ledgers
// (stock purchases in, sale lines out, counts/corrections) — the app never
// writes it. It can sit below zero when units were sold before their
// purchase was booked; every screen shows that as "Out of stock".

export type StockFields = { quantity_in_stock?: number | null; track_stock?: boolean | null };

/** Units on hand. */
export const stockOf = (p: StockFields) => Number(p.quantity_in_stock) || 0;

/**
 * Services, trade-ins and consumables that are sold without ever being
 * booked in (battery charging, wheel balancing, old tyres taken in) are not
 * stock-tracked: always sellable, never "out of stock".
 */
export const isTracked = (p: StockFields) => p.track_stock !== false;

/** Sellable / showable as available right now. */
export const inStock = (p: StockFields) => !isTracked(p) || stockOf(p) > 0;

/** Units sold before their purchase was booked (tracked products only). */
export const oversold = (p: StockFields) => (isTracked(p) && stockOf(p) < 0 ? -stockOf(p) : 0);

/** Short label for lists: "7 left", "Out of stock" or "Not tracked". */
export const stockLabel = (p: StockFields) =>
  !isTracked(p) ? "Not tracked" : stockOf(p) > 0 ? `${stockOf(p)} left` : "Out of stock";
