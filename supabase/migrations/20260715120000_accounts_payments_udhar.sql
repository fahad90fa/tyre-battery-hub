-- Accounts, split payments, credit (udhar) management & profit tracking
-- Run this in the Supabase SQL editor (or via supabase db push).

-- 1. Split payments: one invoice can be paid through several methods
--    (e.g. PKR 3,000 JazzCash + remainder cash) and over multiple days.
create table if not exists public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric not null,
  method text not null default 'cash',
  payment_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists invoice_payments_invoice_id_idx on public.invoice_payments (invoice_id);
create index if not exists invoice_payments_payment_date_idx on public.invoice_payments (payment_date);

-- 2. Cost snapshot at sale time so profit can be computed later even if the
--    product's purchase price changes. Only shown in the admin panel.
alter table public.invoice_items add column if not exists cost_price numeric;
alter table public.customer_purchases add column if not exists cost_price numeric;

-- 3. Link invoices to a client (credit/udhar account) and track due dates.
alter table public.invoices add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.invoices add column if not exists due_date date;
create index if not exists invoices_client_id_idx on public.invoices (client_id);

-- 4. Payment method on ledger entries (jazzcash / cash / bank / ...).
alter table public.client_ledger add column if not exists method text;
alter table public.merchant_ledger add column if not exists method text;

-- 5. Keep account balances in sync automatically.
--    Clients: sale/debit increases what they owe us; payment/credit decreases it.
create or replace function public.sync_client_balance() returns trigger
language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  cid := coalesce(new.client_id, old.client_id);
  update public.clients c set
    current_balance = coalesce(c.opening_balance, 0) + coalesce((
      select sum(case when l.entry_type in ('sale','debit') then l.amount else -l.amount end)
      from public.client_ledger l where l.client_id = c.id
    ), 0),
    updated_at = now()
  where c.id = cid;
  return coalesce(new, old);
end $$;

drop trigger if exists client_ledger_balance on public.client_ledger;
create trigger client_ledger_balance
after insert or update or delete on public.client_ledger
for each row execute function public.sync_client_balance();

--    Merchants: purchase/credit increases what we owe them; payment/debit decreases it.
create or replace function public.sync_merchant_balance() returns trigger
language plpgsql security definer set search_path = public as $$
declare mid uuid;
begin
  mid := coalesce(new.merchant_id, old.merchant_id);
  update public.merchants m set
    current_balance = coalesce(m.opening_balance, 0) + coalesce((
      select sum(case when l.entry_type in ('purchase','credit') then l.amount else -l.amount end)
      from public.merchant_ledger l where l.merchant_id = m.id
    ), 0),
    updated_at = now()
  where m.id = mid;
  return coalesce(new, old);
end $$;

drop trigger if exists merchant_ledger_balance on public.merchant_ledger;
create trigger merchant_ledger_balance
after insert or update or delete on public.merchant_ledger
for each row execute function public.sync_merchant_balance();

-- Recompute existing balances once so old data is consistent.
update public.clients c set current_balance = coalesce(c.opening_balance, 0) + coalesce((
  select sum(case when l.entry_type in ('sale','debit') then l.amount else -l.amount end)
  from public.client_ledger l where l.client_id = c.id), 0);
update public.merchants m set current_balance = coalesce(m.opening_balance, 0) + coalesce((
  select sum(case when l.entry_type in ('purchase','credit') then l.amount else -l.amount end)
  from public.merchant_ledger l where l.merchant_id = m.id), 0);

-- 6. Seed the base product categories (safe to re-run; skips existing slugs).
insert into public.categories (name, slug, display_order)
select v.name, v.slug, v.ord
from (values
  ('Tyres', 'tyres', 1),
  ('Batteries', 'batteries', 2),
  ('Engine Oil', 'engine-oil', 3),
  ('Rims', 'rims', 4),
  ('Car Accessories', 'car-accessories', 5),
  ('Car Care Products', 'car-care-products', 6),
  ('Car Mats', 'car-mats', 7)
) as v(name, slug, ord)
where not exists (select 1 from public.categories c where c.slug = v.slug);
