-- Business settings (owner-editable company details) + product clean-up.
-- Safe to re-run (idempotent).

-- 1. Company details shown on slips, letterheads and the contact page, edited
--    in Admin → Business Settings. Blank bank fields stay off the slip.
create table if not exists public.app_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.app_settings (key, value) values
  ('name', 'MT&B House Auto Hub'),
  ('full_name', 'Muzaffar Tyres & Batteries House Auto Hub'),
  ('tagline', 'Tyres · Batteries · Engine Oil · Rims · Car Accessories'),
  ('phone', '0304-0510256'),
  ('email', 'muzaffartyresandbatteries@gmail.com'),
  ('website', 'mtbhouse.store'),
  ('address', 'Near Degree Boys College, Multan Road, Muzaffargarh'),
  ('branch', 'Muzaffargarh'),
  ('bank_name', ''),
  ('bank_account_title', ''),
  ('bank_account_number', ''),
  ('bank_iban', '')
on conflict (key) do nothing;

-- 2. Merge duplicate products (same name ignoring case/spacing). The copy
--    with the most stock (then most history, price, newest) survives; the
--    other copies' stock is added to it, every sale/purchase/quotation/amanat
--    row is re-pointed to it, and the copies are removed. Nothing is lost.
do $$
declare
  grp record;
  keeper uuid;
  extra_stock integer;
  best_price numeric;
begin
  for grp in
    select lower(regexp_replace(trim(product_name), '\s+', ' ', 'g')) as norm, array_agg(id) as ids
    from public.products
    group by 1 having count(*) > 1
  loop
    select p.id into keeper
    from public.products p
    where p.id = any(grp.ids)
    order by coalesce(p.quantity_in_stock, 0) desc,
             ((select count(*) from public.invoice_items ii where ii.product_id = p.id)
              + (select count(*) from public.customer_purchases cp where cp.product_id = p.id)
              + (select count(*) from public.stock_purchases sp where sp.product_id = p.id)) desc,
             coalesce(p.selling_price, 0) desc, p.created_at desc
    limit 1;

    select coalesce(sum(coalesce(quantity_in_stock, 0)), 0), max(coalesce(selling_price, 0))
      into extra_stock, best_price
    from public.products where id = any(grp.ids) and id <> keeper;

    update public.invoice_items      set product_id = keeper where product_id = any(grp.ids) and product_id <> keeper;
    update public.customer_purchases set product_id = keeper where product_id = any(grp.ids) and product_id <> keeper;
    update public.stock_purchases    set product_id = keeper where product_id = any(grp.ids) and product_id <> keeper;
    update public.quotation_items    set product_id = keeper where product_id = any(grp.ids) and product_id <> keeper;
    update public.amanat_items       set product_id = keeper where product_id = any(grp.ids) and product_id <> keeper;

    update public.products
    set quantity_in_stock = coalesce(quantity_in_stock, 0) + extra_stock,
        selling_price = case when coalesce(selling_price, 0) > 0 then selling_price else best_price end
    where id = keeper;

    delete from public.products where id = any(grp.ids) and id <> keeper;
  end loop;
end $$;

-- 3. Remove products that have no stock and were never bought, sold, quoted
--    or given on amanat — junk rows from mistyped "add new product" entries.
delete from public.products p
where coalesce(p.quantity_in_stock, 0) <= 0
  and not exists (select 1 from public.invoice_items      x where x.product_id = p.id)
  and not exists (select 1 from public.customer_purchases x where x.product_id = p.id)
  and not exists (select 1 from public.stock_purchases    x where x.product_id = p.id)
  and not exists (select 1 from public.quotation_items    x where x.product_id = p.id)
  and not exists (select 1 from public.amanat_items       x where x.product_id = p.id);
