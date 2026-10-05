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
  ('jazzcash_number', '03017881150'),
  ('jazzcash_title', 'Muzaffar Iqbal'),
  ('bank_name', 'Bank Alfalah'),
  ('bank_account_title', 'Muzaffar Tyre and Battery House'),
  ('bank_account_number', '01661003362641'),
  ('bank_iban', '')
on conflict (key) do nothing;

-- 2. Merge duplicate products (same name ignoring case/spacing). The copy
--    with the most stock (then most history, price, newest) survives; the
--    other copies' stock is added to it, whatever the keeper lacks (cost,
--    image, description, category, brand, featured/deal flags) is taken from
--    the copies, every sale/purchase/quotation/amanat row is re-pointed to
--    it, and the copies are removed. A copy that is the same entry saved
--    twice (never booked in, identical row created moments later) is not
--    counted as extra stock.
do $$
declare
  grp record;
  keeper uuid;
  rest record;
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

    select coalesce(sum(case when c.twin then 0 else coalesce(c.quantity_in_stock, 0) end), 0) as extra_stock,
           coalesce(max(coalesce(c.selling_price, 0)), 0)  as best_price,
           coalesce(max(coalesce(c.purchase_price, 0)), 0) as best_cost,
           max(nullif(c.image_url, ''))      as image_url,
           max(nullif(c.description, ''))    as description,
           max(c.category_id::text)::uuid    as category_id,
           max(c.subcategory_id::text)::uuid as subcategory_id,
           max(c.brand_id::text)::uuid       as brand_id,
           bool_or(c.is_featured)            as is_featured,
           bool_or(c.is_deal)                as is_deal,
           max(c.deal_end_date)              as deal_end_date
      into rest
    from (
      select c.*,
             -- the same entry saved twice: never booked in, and an identical
             -- row (stock and prices) was created within a minute after it
             (not exists (select 1 from public.stock_purchases sp where sp.product_id = c.id)
              and exists (select 1 from public.products o
                          where o.id = any(grp.ids) and o.id <> c.id
                            and coalesce(o.quantity_in_stock, 0) = coalesce(c.quantity_in_stock, 0)
                            and coalesce(o.selling_price, 0) = coalesce(c.selling_price, 0)
                            and coalesce(o.purchase_price, 0) = coalesce(c.purchase_price, 0)
                            and o.created_at >= c.created_at and o.created_at < c.created_at + interval '1 minute'
                            and (o.created_at > c.created_at or o.id > c.id))) as twin
      from public.products c
      where c.id = any(grp.ids) and c.id <> keeper
    ) c;

    update public.invoice_items      set product_id = keeper where product_id = any(grp.ids) and product_id <> keeper;
    update public.customer_purchases set product_id = keeper where product_id = any(grp.ids) and product_id <> keeper;
    update public.stock_purchases    set product_id = keeper where product_id = any(grp.ids) and product_id <> keeper;
    update public.quotation_items    set product_id = keeper where product_id = any(grp.ids) and product_id <> keeper;
    update public.amanat_items       set product_id = keeper where product_id = any(grp.ids) and product_id <> keeper;

    update public.products
    set quantity_in_stock = coalesce(quantity_in_stock, 0) + rest.extra_stock,
        selling_price  = case when coalesce(selling_price, 0)  > 0 then selling_price  else rest.best_price end,
        purchase_price = case when coalesce(purchase_price, 0) > 0 then purchase_price else rest.best_cost end,
        image_url      = coalesce(nullif(image_url, ''),   rest.image_url),
        description    = coalesce(nullif(description, ''), rest.description),
        category_id    = coalesce(category_id,    rest.category_id),
        subcategory_id = coalesce(subcategory_id, rest.subcategory_id),
        brand_id       = coalesce(brand_id,       rest.brand_id),
        is_featured    = coalesce(is_featured, false) or coalesce(rest.is_featured, false),
        is_deal        = coalesce(is_deal, false)     or coalesce(rest.is_deal, false),
        deal_end_date  = greatest(deal_end_date, rest.deal_end_date)
    where id = keeper;

    delete from public.products where id = any(grp.ids) and id <> keeper;
  end loop;
end $$;

-- 3. Remove the junk left by mistyped "add new product" entries: a bare name
--    with no stock, prices, image, description, category or website flags,
--    never bought, sold, quoted or given on amanat. A product entered on the
--    Products page ahead of its stock is none of those, so it stays.
delete from public.products p
where coalesce(p.quantity_in_stock, 0) <= 0
  and coalesce(p.selling_price, 0) = 0 and coalesce(p.purchase_price, 0) = 0
  and coalesce(p.image_url, '') = '' and coalesce(p.description, '') = ''
  and p.category_id is null and p.brand_id is null
  and not coalesce(p.is_featured, false) and not coalesce(p.is_deal, false)
  and not exists (select 1 from public.invoice_items      x where x.product_id = p.id)
  and not exists (select 1 from public.customer_purchases x where x.product_id = p.id)
  and not exists (select 1 from public.stock_purchases    x where x.product_id = p.id)
  and not exists (select 1 from public.quotation_items    x where x.product_id = p.id)
  and not exists (select 1 from public.amanat_items       x where x.product_id = p.id);

-- 4. Lock the settings down. Anyone may read them (contact page, slips) but
--    only a signed-in admin may change them — otherwise whoever holds the
--    public API key could put their own bank account on every slip. The
--    role table gets the same treatment, or anyone could make themselves an
--    admin first. (Policies are created only if missing, so re-runs are safe.)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;
revoke execute on function public.has_role(uuid, public.app_role) from anon, public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

alter table public.app_settings enable row level security;
alter table public.user_roles  enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'app_settings' and policyname = 'settings read') then
    create policy "settings read" on public.app_settings for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'app_settings' and policyname = 'settings admin write') then
    create policy "settings admin write" on public.app_settings for all to authenticated
      using (public.has_role((select auth.uid()), 'admin'))
      with check (public.has_role((select auth.uid()), 'admin'));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_roles' and policyname = 'roles own read') then
    create policy "roles own read" on public.user_roles for select to authenticated using ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_roles' and policyname = 'roles admin read') then
    create policy "roles admin read" on public.user_roles for select to authenticated using (public.has_role((select auth.uid()), 'admin'));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_roles' and policyname = 'roles self customer') then
    -- sign-up gives the new account the plain customer role, nothing more
    create policy "roles self customer" on public.user_roles for insert to authenticated
      with check ((select auth.uid()) = user_id and role = 'customer');
  end if;
end $$;
