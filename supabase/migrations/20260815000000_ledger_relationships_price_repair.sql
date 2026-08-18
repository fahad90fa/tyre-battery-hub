-- Ledger ↔ account relationships + product price repair.
-- Fixes: "Could not find a relationship between 'client_ledger' and 'clients'
-- in the schema cache" (and the merchant_ledger/merchants twin), which also
-- silently blanked recoveries in Daily Closing and the Recoveries page.
-- Safe to re-run (idempotent).

-- 1. Detach orphaned ledger rows left behind by past account deletions
--    (no foreign key existed, so the rows survived pointing at nothing).
--    They are money that really moved, so they are kept — shown as
--    "Customer"/"Merchant" — and only the dead link is cleared. Clearing it
--    (rather than deleting the rows) keeps every daily closing and cash-flow
--    total intact, and each rupee still counted exactly once.
update public.client_ledger l
set client_id = null
where l.client_id is not null
  and not exists (select 1 from public.clients c where c.id = l.client_id);

update public.merchant_ledger l
set merchant_id = null
where l.merchant_id is not null
  and not exists (select 1 from public.merchants m where m.id = l.merchant_id);

-- 2. Real foreign keys so PostgREST can embed clients(name)/merchants(name)
--    in ledger queries. ON DELETE RESTRICT: an account with money history
--    can no longer be deleted outright (delete its ledger entries first) —
--    a cascade here would silently erase recorded payments from every
--    daily-closing and cash-flow report.
--    Guard on ANY existing foreign key between the two tables (not just our
--    constraint name): a second FK on the same pair would make PostgREST's
--    embed ambiguous instead of fixing it.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where contype = 'f'
      and conrelid = 'public.client_ledger'::regclass
      and confrelid = 'public.clients'::regclass
  ) then
    alter table public.client_ledger
      add constraint client_ledger_client_id_fkey
      foreign key (client_id) references public.clients(id) on delete restrict;
  end if;

  if not exists (
    select 1 from pg_constraint
    where contype = 'f'
      and conrelid = 'public.merchant_ledger'::regclass
      and confrelid = 'public.merchants'::regclass
  ) then
    alter table public.merchant_ledger
      add constraint merchant_ledger_merchant_id_fkey
      foreign key (merchant_id) references public.merchants(id) on delete restrict;
  end if;
end $$;

create index if not exists client_ledger_client_id_idx on public.client_ledger (client_id);
create index if not exists client_ledger_entry_date_idx on public.client_ledger (entry_date);
create index if not exists merchant_ledger_merchant_id_idx on public.merchant_ledger (merchant_id);
create index if not exists merchant_ledger_entry_date_idx on public.merchant_ledger (entry_date);

-- 3. Product price repair: products booked in through stock purchases before
--    prices carried over automatically still ring up as Rs 0 in the POS.
--    Take each product's most recent stock-purchase cost as its purchase
--    price, then give products with no selling price that cost as well
--    (same rule new stock purchases apply).
update public.products p
set purchase_price = sp.purchase_price
from (
  select distinct on (product_id) product_id, purchase_price
  from public.stock_purchases
  where product_id is not null and coalesce(purchase_price, 0) > 0
  order by product_id, date desc nulls last, created_at desc
) sp
where sp.product_id = p.id
  and coalesce(p.purchase_price, 0) = 0;

update public.products
set selling_price = purchase_price
where coalesce(selling_price, 0) = 0
  and coalesce(purchase_price, 0) > 0;

-- 4. PostgREST re-reads the schema so the new relationships work immediately.
notify pgrst, 'reload schema';
