-- Stock is owned by the database from here on.
--
-- products.quantity_in_stock used to be a counter that six screens rewrote
-- from numbers loaded when the page opened: sales from another phone were
-- overwritten, an oversold quantity was clamped away, returns re-added units
-- that had never come off, and a purchase could be saved without its stock
-- arriving. Now the ledgers are the truth — stock_purchases (in),
-- invoice_items (out) and stock_adjustments (counts and corrections) — and
-- triggers keep the counter in step atomically, from any device. Deleting or
-- shrinking a sale line gives the units back by itself; a purchase row adds
-- them by itself. The counter may go below zero (sold before the purchase
-- was booked); the app shows anything at or below zero as "Out of stock".
--
-- Nothing else may write the counter: a guard trigger ignores direct writes
-- (the old app's read-modify-write, a stale browser tab, a hand edit in the
-- table editor), so this file can run before or after the app update without
-- double counting. Run it BEFORE deploying the app version that uses it (that
-- version reads products.track_stock). Safe to re-run: every run ends by
-- resyncing each product to its ledger.

-- 1. Counts and corrections (opening stock, physical counts, damaged units,
--    returns to the merchant) as ledger rows instead of overwrites.
create table if not exists public.stock_adjustments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  delta integer not null,
  reason text not null default 'Correction',
  note text,
  created_at timestamptz not null default now()
);
create index if not exists stock_adjustments_product_id_idx on public.stock_adjustments (product_id);
create index if not exists stock_adjustments_created_at_idx on public.stock_adjustments (created_at);

-- Services, trade-ins and consumables that are sold without ever being
-- booked in (battery charging, wheel balancing, old tyres taken in) are not
-- stock-tracked: always sellable, never "out of stock". The owner can switch
-- it per product on the Products page.
alter table public.products add column if not exists track_stock boolean not null default true;

alter table public.products alter column quantity_in_stock set default 0;
update public.products set quantity_in_stock = 0 where quantity_in_stock is null;
alter table public.products alter column quantity_in_stock set not null;

-- Sale lines point at products like every other ledger (a deleted product
-- leaves the line, with no product, instead of a dangling id).
do $$
begin
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on t.oid = c.conrelid join pg_class r on r.oid = c.confrelid
    where c.contype = 'f' and t.relname = 'invoice_items' and r.relname = 'products'
  ) then
    update public.invoice_items i set product_id = null
    where i.product_id is not null and not exists (select 1 from public.products p where p.id = i.product_id);
    alter table public.invoice_items
      add constraint invoice_items_product_id_fkey foreign key (product_id) references public.products(id) on delete set null;
  end if;
end $$;
create index if not exists invoice_items_product_id_idx on public.invoice_items (product_id);
create index if not exists stock_purchases_product_id_idx on public.stock_purchases (product_id);

-- 2. The ledger view of a product's stock, and the sync that keeps the
--    counter equal to it.
create or replace function public.stock_derived(_product uuid)
returns integer language sql stable set search_path = public as $$
  select coalesce((select sum(quantity) from public.stock_purchases   where product_id = _product), 0)::integer
       - coalesce((select sum(quantity) from public.invoice_items     where product_id = _product), 0)::integer
       + coalesce((select sum(delta)    from public.stock_adjustments where product_id = _product), 0)::integer;
$$;

-- The one door to the counter. It raises the app.stock_sync flag for the
-- duration of its update so the guard below lets the write through.
create or replace function public.stock_apply(_product uuid, _delta integer)
returns void language plpgsql set search_path = public as $$
declare prev text := current_setting('app.stock_sync', true);
begin
  if _product is null or coalesce(_delta, 0) = 0 then return; end if;
  perform set_config('app.stock_sync', 'on', true);
  update public.products set quantity_in_stock = coalesce(quantity_in_stock, 0) + _delta where id = _product;
  perform set_config('app.stock_sync', coalesce(prev, ''), true);
end $$;
-- only the ledger triggers (owned by the database) may call it
revoke execute on function public.stock_apply(uuid, integer) from public, anon, authenticated;

-- Set every listed product (all when null) to its ledger figure.
create or replace function public.stock_resync(_products uuid[] default null)
returns integer language plpgsql security definer set search_path = public as $$
declare prev text := current_setting('app.stock_sync', true); n integer;
begin
  perform set_config('app.stock_sync', 'on', true);
  update public.products p set quantity_in_stock = public.stock_derived(p.id)
  where (_products is null or p.id = any(_products))
    and p.quantity_in_stock <> public.stock_derived(p.id);
  get diagnostics n = row_count;
  perform set_config('app.stock_sync', coalesce(prev, ''), true);
  return n;
end $$;
revoke execute on function public.stock_resync(uuid[]) from public, anon;

-- One trigger function for all three ledgers: purchases and adjustments add,
-- sale lines subtract; an update moves the difference (and moves the units
-- when the row is re-pointed at another product).
create or replace function public.stock_ledger_sync()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  qcol text := case tg_table_name when 'stock_adjustments' then 'delta' else 'quantity' end;
  sign integer := case tg_table_name when 'invoice_items' then -1 else 1 end;
  old_pid uuid; new_pid uuid; old_q integer := 0; new_q integer := 0;
begin
  if tg_op in ('UPDATE', 'DELETE') then
    old_pid := (to_jsonb(old) ->> 'product_id')::uuid;
    old_q := coalesce((to_jsonb(old) ->> qcol)::integer, 0);
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    new_pid := (to_jsonb(new) ->> 'product_id')::uuid;
    new_q := coalesce((to_jsonb(new) ->> qcol)::integer, 0);
  end if;
  if old_pid is not null and old_pid is not distinct from new_pid then
    perform public.stock_apply(old_pid, sign * (new_q - old_q));
  else
    if old_pid is not null then perform public.stock_apply(old_pid, -sign * old_q); end if;
    if new_pid is not null then perform public.stock_apply(new_pid,  sign * new_q); end if;
  end if;
  return null;
end $$;

create or replace trigger stock_ledger_purchases
  after insert or update or delete on public.stock_purchases
  for each row execute function public.stock_ledger_sync();
create or replace trigger stock_ledger_sales
  after insert or update or delete on public.invoice_items
  for each row execute function public.stock_ledger_sync();
create or replace trigger stock_ledger_adjustments
  after insert or update or delete on public.stock_adjustments
  for each row execute function public.stock_ledger_sync();

-- Guard: a direct write of the counter (anything but stock_apply/stock_resync)
-- is ignored — the value stays what the ledger made it.
create or replace function public.stock_ledger_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_setting('app.stock_sync', true) is distinct from 'on' then
    new.quantity_in_stock := old.quantity_in_stock;
  end if;
  return new;
end $$;
create or replace trigger stock_ledger_guard
  before update of quantity_in_stock on public.products
  for each row execute function public.stock_ledger_guard();

-- A product created with a starting count (the old Products page, a CSV
-- import) gets that count recorded as an "Opening count" ledger row.
create or replace function public.stock_ledger_opening()
returns trigger language plpgsql security definer set search_path = public as $$
declare prev text := current_setting('app.stock_sync', true);
begin
  if coalesce(new.quantity_in_stock, 0) <> 0 and prev is distinct from 'on' then
    perform set_config('app.stock_sync', 'on', true);
    update public.products set quantity_in_stock = 0 where id = new.id;
    perform set_config('app.stock_sync', coalesce(prev, ''), true);
    insert into public.stock_adjustments (product_id, delta, reason, note)
    values (new.id, new.quantity_in_stock, 'Opening count', 'Stock entered with the new product');
  end if;
  return null;
end $$;
create or replace trigger stock_ledger_opening
  after insert on public.products
  for each row execute function public.stock_ledger_opening();

-- A physical count, booked as the difference to the live ledger figure in a
-- single statement (no stale number from a page opened earlier). Returns the
-- difference recorded (0 records nothing).
create or replace function public.stock_set_count(_product uuid, _counted integer, _reason text default 'Physical count', _note text default null)
returns integer language plpgsql set search_path = public as $$
declare d integer;
begin
  if _counted is null or _counted < 0 then raise exception 'Counted stock must be zero or more'; end if;
  perform 1 from public.products where id = _product for update;
  if not found then raise exception 'Product not found'; end if;
  d := _counted - public.stock_derived(_product);
  if d <> 0 then
    insert into public.stock_adjustments (product_id, delta, reason, note)
    values (_product, d, coalesce(nullif(trim(_reason), ''), 'Physical count'), nullif(trim(coalesce(_note, '')), ''));
  end if;
  return d;
end $$;
revoke execute on function public.stock_set_count(uuid, integer, text, text) from public, anon;
grant execute on function public.stock_set_count(uuid, integer, text, text) to authenticated;

-- Products whose counter disagrees with the ledger (should stay empty).
create or replace view public.stock_reconciliation as
  select p.id, p.product_name, p.quantity_in_stock as stored, public.stock_derived(p.id) as derived
  from public.products p
  where p.quantity_in_stock <> public.stock_derived(p.id);

-- 3. One-time reconciliation (marked in app_settings so re-runs skip it).
--    The old register's opening counts did not always match the purchases
--    imported with them (two products had stock with no purchase rows, four
--    had sold units before the system existed); those gaps are recorded as
--    "Opening stock" rows so the ledger explains the count. A product
--    entered on the Products page with a starting count and no movements
--    keeps it the same way. Then every product takes the ledger figure —
--    including below zero where units were sold that were never booked in,
--    which the app now shows as out of stock until the purchase is entered.
do $$
begin
  if exists (select 1 from public.app_settings where key = 'stock_ledger_backfill') then return; end if;

  -- sold, never booked in, nothing on the shelf: a service or trade-in item
  update public.products p set track_stock = false
  where p.quantity_in_stock <= 0
    and exists (select 1 from public.invoice_items x where x.product_id = p.id)
    and not exists (select 1 from public.stock_purchases x where x.product_id = p.id)
    and not exists (select 1 from public.stock_adjustments x where x.product_id = p.id);

  insert into public.stock_adjustments (product_id, delta, reason, note)
  -- (opening count − purchases imported − legacy sales imported, per the
  --  2026-07-16 import file; a positive gap is stock with no purchase row, a
  --  negative one units sold before the system existed)
  select v.id::uuid, v.delta, 'Opening stock', 'Old register count minus the purchases and sales imported with it (2026-07-15 import)'
  from (values
    ('b3198079-a292-4c3c-8514-005c61d6000b', 35),  -- Sunfull
    ('3952bec9-9db2-4646-899e-67dda5aabb7b', -1),  -- 185R14
    ('d06c8f5d-23af-4491-be2c-b3382cafb659', -2),  -- Evergreen 145R12
    ('5802e98a-e32f-4828-aa21-d0d444bdd2ca', -2),  -- Ovation 195/65R15
    ('9302b467-c9cc-4b15-ba23-5f0bcc9da30b', -1),  -- HT200 osaka 21p
    ('f30133de-bdeb-4617-a331-77943d8483f9', -1),  -- HT160 osaka 19p
    ('e0a74211-bf17-44df-9119-e0de840f7c53', -2),  -- Michelin 215/75R14
    ('16503174-2cfb-4f64-a860-6fd47b50d48b', -1)   -- 500-12 Tube Diamond
  ) as v(id, delta)
  where exists (select 1 from public.products p where p.id = v.id::uuid)
    and not exists (select 1 from public.stock_adjustments a where a.product_id = v.id::uuid and a.reason = 'Opening stock');

  -- A count typed on the Products page (never booked as a purchase) is the
  -- counter plus whatever has been sold from it since: record that gap.
  insert into public.stock_adjustments (product_id, delta, reason, note)
  select p.id, p.quantity_in_stock - public.stock_derived(p.id), 'Opening count',
         'Starting stock entered on the Products page (count shown plus units sold since)'
  from public.products p
  where p.quantity_in_stock > 0
    and p.quantity_in_stock <> public.stock_derived(p.id)
    and not exists (select 1 from public.stock_purchases   x where x.product_id = p.id)
    and not exists (select 1 from public.stock_adjustments x where x.product_id = p.id);

  insert into public.app_settings (key, value) values ('stock_ledger_backfill', now()::text)
  on conflict (key) do nothing;
end $$;

-- Every run: make each product equal to its ledger. On the first run this
-- is the reconciliation; afterwards it is a no-op unless something drifted
-- (it heals the stock if anything ever wrote the counter around the ledger).
select public.stock_resync();

-- 4. One product per name (the merge above folds the old copies together
--    first; until that has run the index is skipped, and the app itself
--    reuses an existing name instead of inserting a copy).
do $$
begin
  if exists (
    select 1 from public.products
    group by lower(regexp_replace(trim(product_name), '\s+', ' ', 'g')) having count(*) > 1
  ) then
    raise notice 'duplicate product names remain — unique name index skipped; run the duplicate merge first';
  else
    create unique index if not exists products_name_norm_uidx
      on public.products ((lower(regexp_replace(trim(product_name), '\s+', ' ', 'g'))));
  end if;
end $$;

notify pgrst, 'reload schema';
