-- Amanat for both sides: Customer Amanat and Merchant Amanat.
--
-- Amanat is anything held in trust between the shop and a party, either way
-- round, seen from the shop:
--   direction 'taken' — the party took our item / money (it is with them)
--   direction 'left'  — the party left their item / money with us (we hold it)
--   status 'pending'  — still open
--   status 'received' — settled (received back / handed back)
-- An entry belongs to a customer (client_id) or a merchant (merchant_id) and
-- is either goods (kind 'item', quantity) or cash (kind 'money', amount).
--
-- Amanat never touches client_ledger / merchant_ledger: money held in trust
-- is not part of the account balance (the app shows it beside the balance).
--
-- An item taken from shelf stock (from_stock) is booked as one
-- stock_adjustments row per amanat ('Amanat' reason, linked by amanat_id) and
-- the stock ledger triggers move products.quantity_in_stock from it: giving
-- the item out takes the units off, a partial return or "received" gives
-- them back, deleting the amanat deletes its row (cascade) and gives them
-- back. Items a party LEFT with us are not ours and never add to stock.
-- Existing rows keep from_stock = false, so nothing changes retroactively.
--
-- Needs 20261015000000_stock_ledger.sql. Safe to re-run (no drops).

-- 1. Columns.
alter table public.amanat_items add column if not exists party_type text not null default 'client';
alter table public.amanat_items add column if not exists merchant_id uuid references public.merchants(id) on delete set null;
alter table public.amanat_items add column if not exists direction text not null default 'taken';
alter table public.amanat_items add column if not exists kind text not null default 'item';
alter table public.amanat_items add column if not exists amount numeric;
alter table public.amanat_items add column if not exists contact text;
alter table public.amanat_items add column if not exists from_stock boolean not null default false;

-- 2. Status words: out -> pending, returned -> received.
update public.amanat_items
   set status = case when status in ('returned', 'received') then 'received' else 'pending' end
 where status is distinct from 'pending' and status is distinct from 'received';
alter table public.amanat_items alter column status set default 'pending';

-- Old rows may carry quantities the checks below reject; bring them in range
-- (a received row has everything back).
update public.amanat_items set quantity = 1 where quantity is null or quantity < 1;
update public.amanat_items
   set returned_quantity = case when status = 'received' then quantity
                                else least(greatest(coalesce(returned_quantity, 0), 0), quantity) end
 where returned_quantity is null or returned_quantity < 0 or returned_quantity > quantity;

-- 3. Rules.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'amanat_items_party_type_chk') then
    alter table public.amanat_items add constraint amanat_items_party_type_chk
      check (party_type in ('client', 'merchant'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'amanat_items_direction_chk') then
    alter table public.amanat_items add constraint amanat_items_direction_chk
      check (direction in ('taken', 'left'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'amanat_items_status_chk') then
    alter table public.amanat_items add constraint amanat_items_status_chk
      check (status in ('pending', 'received'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'amanat_items_kind_chk') then
    alter table public.amanat_items add constraint amanat_items_kind_chk
      check (kind in ('item', 'money'));
  end if;
  -- a customer entry never points at a merchant and vice versa
  if not exists (select 1 from pg_constraint where conname = 'amanat_items_party_chk') then
    alter table public.amanat_items add constraint amanat_items_party_chk
      check ((party_type = 'client' and merchant_id is null) or (party_type = 'merchant' and client_id is null));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'amanat_items_money_amount_chk') then
    alter table public.amanat_items add constraint amanat_items_money_amount_chk
      check (kind <> 'money' or coalesce(amount, 0) > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'amanat_items_quantity_chk') then
    alter table public.amanat_items add constraint amanat_items_quantity_chk
      check (quantity > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'amanat_items_returned_qty_chk') then
    alter table public.amanat_items add constraint amanat_items_returned_qty_chk
      check (returned_quantity between 0 and quantity);
  end if;
end $$;

create index if not exists amanat_items_merchant_idx on public.amanat_items (merchant_id);

-- 4. Shelf stock for items taken out of stock.
alter table public.stock_adjustments add column if not exists amanat_id uuid references public.amanat_items(id) on delete cascade;
create unique index if not exists stock_adjustments_amanat_id_uidx
  on public.stock_adjustments (amanat_id) where amanat_id is not null;

-- Keeps the amanat's one adjustment row equal to the units still out:
-- -(quantity - returned), 0 (no row) once received or when not from stock.
create or replace function public.amanat_stock_sync()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  want integer := 0;
  tracked boolean;
begin
  if new.from_stock and new.kind = 'item' and new.direction = 'taken' and new.product_id is not null then
    select p.track_stock into tracked from public.products p where p.id = new.product_id;
    if coalesce(tracked, false) then
      want := -(new.quantity - case when new.status = 'received' then new.quantity
                                    else least(greatest(coalesce(new.returned_quantity, 0), 0), new.quantity) end);
    end if;
  end if;

  if want = 0 then
    delete from public.stock_adjustments where amanat_id = new.id;
  else
    insert into public.stock_adjustments (product_id, delta, reason, note, amanat_id)
    values (new.product_id, want, 'Amanat', coalesce(new.amanat_no, 'Amanat') || ' — ' || new.customer_name, new.id)
    on conflict (amanat_id) where amanat_id is not null do update
      set product_id = excluded.product_id, delta = excluded.delta, reason = excluded.reason, note = excluded.note
      where (stock_adjustments.product_id, stock_adjustments.delta, stock_adjustments.reason, stock_adjustments.note)
            is distinct from (excluded.product_id, excluded.delta, excluded.reason, excluded.note);
  end if;
  return null;
end $$;

create or replace trigger amanat_stock_sync
  after insert or update on public.amanat_items
  for each row execute function public.amanat_stock_sync();

notify pgrst, 'reload schema';
