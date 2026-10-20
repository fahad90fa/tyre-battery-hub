-- Product clean-up: sold-out junk out of the database, history kept.
--
-- Sold-out products cluttered every list and picker, and deleting one by hand
-- blanked the product on its old sale lines, purchases and sales history
-- (stock_purchases / customer_purchases keep no name of their own) and lost
-- its prices — so restocking it meant typing it in again as a duplicate.
-- From here on:
--   * a sold-out product that never did anything (no sale, purchase, quote,
--     amanat or stock count) is purged — it is just a name;
--   * a product with history can no longer be deleted: the app hides it from
--     every browse list while it is out of stock (typing its name still finds
--     it) and it comes back by itself when stock is booked, so restocking
--     reuses the same record;
--   * one product per name (normalised: trimmed, single spaces, any case).
--
-- Duplicate-name copies are folded together by the merge in
-- RUN_THIS_IN_SUPABASE.sql (20261004 §2). That merge re-points every ledger
-- row to the keeper before deleting the copies, so the guard below never
-- blocks it. Copies are left for the merge here (their image, description or
-- category may be what the keeper lacks); re-running this file after the
-- merge purges a keeper that is junk too.
--
-- Needs 20261015000000_stock_ledger.sql (track_stock, stock_adjustments).
-- Safe to re-run (idempotent, no drops).

-- 1. Indexes for the history checks (sale lines, purchases and counts are
--    indexed by 20261015; these three were not).
create index if not exists customer_purchases_product_id_idx on public.customer_purchases (product_id);
create index if not exists quotation_items_product_id_idx    on public.quotation_items (product_id);
create index if not exists amanat_items_product_id_idx       on public.amanat_items (product_id);

-- 2. Purge sold-out products with no history at all: a stock-tracked product
--    at or below zero (or, as 20261004 §3 already did, an untracked bare name
--    with no price, image, description, category, brand or website flag)
--    that was never sold, bought, quoted, given on amanat or counted.
--    Untracked services/trade-ins with a price are always sellable and stay.
--    A product added in the last week is left alone: it may have been
--    entered ahead of its first delivery.
delete from public.products p
where coalesce(p.quantity_in_stock, 0) <= 0
  and p.created_at < now() - interval '7 days'
  and (p.track_stock is distinct from false
       or (coalesce(p.selling_price, 0) = 0 and coalesce(p.purchase_price, 0) = 0
           and coalesce(p.image_url, '') = '' and coalesce(p.description, '') = ''
           and p.category_id is null and p.brand_id is null
           and not coalesce(p.is_featured, false) and not coalesce(p.is_deal, false)))
  and not exists (select 1 from public.invoice_items      x where x.product_id = p.id)
  and not exists (select 1 from public.customer_purchases x where x.product_id = p.id)
  and not exists (select 1 from public.stock_purchases    x where x.product_id = p.id)
  and not exists (select 1 from public.quotation_items    x where x.product_id = p.id)
  and not exists (select 1 from public.amanat_items       x where x.product_id = p.id)
  and not exists (select 1 from public.stock_adjustments  x where x.product_id = p.id)
  -- a duplicate-name copy is the merge's to fold into its keeper
  and not exists (
    select 1 from public.products o
    where o.id <> p.id
      and lower(regexp_replace(trim(o.product_name), '\s+', ' ', 'g'))
        = lower(regexp_replace(trim(p.product_name), '\s+', ' ', 'g')));

-- 3. A product with history is kept for the records. Its sale lines,
--    purchases, sales history, quotations and amanat entries would otherwise
--    lose the product (ON DELETE SET NULL) — and with it the purchase and
--    sales figures per product. Stock counts alone do not block a delete
--    (they cascade with the product). SECURITY DEFINER so the check sees
--    every row whatever the caller's row-level security allows.
create or replace function public.products_keep_history()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.invoice_items      where product_id = old.id)
     or exists (select 1 from public.stock_purchases    where product_id = old.id)
     or exists (select 1 from public.customer_purchases where product_id = old.id)
     or exists (select 1 from public.quotation_items    where product_id = old.id)
     or exists (select 1 from public.amanat_items       where product_id = old.id) then
    raise exception 'This product has sales or purchase history and is kept for the records; it stays hidden while out of stock and returns when restocked.'
      using errcode = 'P0001',
            detail = format('product %s (%s)', old.id, coalesce(old.product_name, '')),
            hint = 'Re-point or delete its sale, purchase, quotation and amanat rows first.';
  end if;
  return old;
end $$;
revoke execute on function public.products_keep_history() from public, anon, authenticated;

create or replace trigger products_keep_history
  before delete on public.products
  for each row execute function public.products_keep_history();

-- 4. One product per name, so re-entering a product can never create a
--    conflicting copy (the app already reuses an existing name). Skipped with
--    a notice until the duplicate merge has folded the old copies together.
do $$
begin
  if exists (
    select 1 from public.products
    group by lower(regexp_replace(trim(product_name), '\s+', ' ', 'g')) having count(*) > 1
  ) then
    raise notice 'duplicate product names remain — unique name index skipped; run the duplicate merge (RUN_THIS_IN_SUPABASE.sql) first';
  else
    create unique index if not exists products_name_norm_uidx
      on public.products ((lower(regexp_replace(trim(product_name), '\s+', ' ', 'g'))));
  end if;
end $$;

notify pgrst, 'reload schema';
