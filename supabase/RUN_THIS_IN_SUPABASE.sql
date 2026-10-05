-- ============================================================
-- MT&B HOUSE — SAB PENDING DATABASE UPDATES EK SAATH
-- Supabase > SQL Editor mein yeh POORI file paste kar ke RUN karen.
-- Dobara chalana bilkul safe hai (sab kuch idempotent hai).
-- Included: daily closings, merchant payments column, expenses date
-- fix + backfill, pending-invoice auto-repair, transaction date
-- backfill, the Amanat (security deposit) table, ledger↔account
-- foreign keys (schema-cache relationship fix), product price repair,
-- invoice payment-method label sync, and the product-images bucket.
-- ============================================================

-- Daily closing reports: one row per closed day with the snapshot of that
-- day's numbers. Safe to re-run. Run in the Supabase SQL editor.

create table if not exists public.daily_closings (
  id uuid primary key default gen_random_uuid(),
  closing_date date not null unique,
  net_sales numeric not null default 0,
  cash_sales numeric not null default 0,
  credit_sales numeric not null default 0,
  recoveries numeric not null default 0,
  total_cash_in numeric not null default 0,
  expenses numeric not null default 0,
  net_cash numeric not null default 0,
  cash_in_hand numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists daily_closings_date_idx on public.daily_closings (closing_date);
-- Track merchant payments (cash out) in daily closings.
alter table public.daily_closings add column if not exists merchant_payments numeric not null default 0;
-- 1. Expenses: give date_of_expense a default and backfill old rows that
--    were saved without a date (they showed "—" and never appeared in the
--    daily closing).
alter table public.expenses alter column date_of_expense set default current_date;
update public.expenses
set date_of_expense = (created_at at time zone 'Asia/Karachi')::date
where date_of_expense is null;

-- 2. Repair invoice statuses: customers who already paid through their
--    account still had invoices stuck on unpaid/partial. Allocate each
--    client's surplus account payments to their outstanding invoices
--    (oldest first) and flip statuses to paid/partial automatically.
do $$
declare
  c record;
  inv record;
  surplus numeric;
  bal numeric;
  alloc numeric;
begin
  for c in select id from public.clients loop
    select coalesce((select sum(amount) from public.client_ledger
                     where client_id = c.id and entry_type = 'payment'), 0)
         - coalesce((select sum(ip.amount) from public.invoice_payments ip
                     join public.invoices i on i.id = ip.invoice_id
                     where i.client_id = c.id), 0)
      into surplus;

    for inv in
      select i.id, i.total_amount,
             i.total_amount - coalesce((select sum(amount) from public.invoice_payments
                                        where invoice_id = i.id), 0) as balance
      from public.invoices i
      where i.client_id = c.id and coalesce(i.payment_status, '') <> 'paid'
      order by i.created_at
    loop
      bal := inv.balance;
      if bal <= 0 then
        update public.invoices set payment_status = 'paid' where id = inv.id;
      elsif surplus > 0 then
        alloc := least(bal, surplus);
        insert into public.invoice_payments (invoice_id, amount, method, note)
        values (inv.id, alloc, 'cash', 'Auto-allocated from account payments (repair)');
        if alloc >= bal then
          update public.invoices set payment_status = 'paid' where id = inv.id;
        else
          update public.invoices set payment_status = 'partial' where id = inv.id;
        end if;
        surplus := surplus - alloc;
      end if;
    end loop;
  end loop;
end $$;
-- Every transaction must carry its date: set defaults and backfill all old
-- rows that were saved without one (they showed "—" in the history).
-- Backfill uses the row's creation time in Pakistan time.

alter table public.client_ledger   alter column entry_date set default current_date;
alter table public.merchant_ledger alter column entry_date set default current_date;
alter table public.stock_purchases alter column date set default current_date;

update public.client_ledger
set entry_date = (created_at at time zone 'Asia/Karachi')::date
where entry_date is null;

update public.merchant_ledger
set entry_date = (created_at at time zone 'Asia/Karachi')::date
where entry_date is null;

update public.stock_purchases
set date = (created_at at time zone 'Asia/Karachi')::date
where date is null;

update public.customer_purchases
set purchase_date = (created_at at time zone 'Asia/Karachi')::date
where purchase_date is null;

update public.invoice_payments
set payment_date = (created_at at time zone 'Asia/Karachi')::date
where payment_date is null;
-- Amanat (security deposit / temporary items given to a customer).
-- Any product can be given on amanat and returned later.

create sequence if not exists public.amanat_no_seq start 1001;

create table if not exists public.amanat_items (
  id uuid primary key default gen_random_uuid(),
  amanat_no text unique default ('AMT-' || nextval('public.amanat_no_seq')),
  customer_name text not null,
  phone text,
  client_id uuid references public.clients(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  item_name text not null,
  quantity integer not null default 1,
  given_date date not null default current_date,
  expected_return_date date,
  status text not null default 'out',          -- out / returned
  returned_date date,
  returned_quantity integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists amanat_items_status_idx on public.amanat_items (status);
create index if not exists amanat_items_client_idx on public.amanat_items (client_id);
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

  -- Purchase rows embed the product name the same way — make sure that
  -- relationship exists too (set null keeps the purchase history when a
  -- product is removed).
  if not exists (
    select 1 from pg_constraint
    where contype = 'f'
      and conrelid = 'public.stock_purchases'::regclass
      and confrelid = 'public.products'::regclass
  ) then
    update public.stock_purchases sp set product_id = null
    where sp.product_id is not null
      and not exists (select 1 from public.products p where p.id = sp.product_id);
    alter table public.stock_purchases
      add constraint stock_purchases_product_id_fkey
      foreign key (product_id) references public.products(id) on delete set null;
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
-- Invoice payment-method label kept in sync + product image bucket.
-- Safe to re-run (idempotent).

-- 1. invoices.payment_method is a text snapshot written at sale time
--    ("unpaid" for udhar bills) and was never updated when the bill was
--    paid later through a recovery — so the daily invoice list showed a
--    cash-paid bill as "unpaid". Recompute the label from the real
--    invoice_payments rows, and keep it in sync from now on with a trigger.
create or replace function public.payment_method_label(m text) returns text
language sql immutable as $$
  select case lower(coalesce(m, 'cash'))
    when 'cash' then 'Cash'
    when 'bank' then 'Bank transfer'
    when 'jazzcash' then 'JazzCash'
    when 'easypaisa' then 'Easypaisa'
    when 'card' then 'Card'
    when 'scrap' then 'Scrap'
    when 'other' then 'Other'
    else coalesce(m, 'Cash')
  end
$$;

create or replace function public.invoice_methods_summary(inv_id uuid) returns text
language sql stable as $$
  -- Methods in the order they were first used, e.g. "Cash + Bank transfer".
  -- Fixed canonical order, the same as PAYMENT_METHODS in the app (a split
  -- sale inserts all its rows in one statement, so "first used" is a tie
  -- and only a fixed rank can agree with the receipt): e.g. "Cash + Scrap".
  select string_agg(label, ' + ' order by rank, label)
  from (
    select public.payment_method_label(method) as label,
           min(coalesce(array_position(array['cash','jazzcash','easypaisa','bank','card','scrap','other'], lower(method)), 99)) as rank
    from public.invoice_payments
    where invoice_id = inv_id and amount > 0
    group by 1
  ) m
$$;

create or replace function public.sync_invoice_payment_method() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  iid uuid;
  label text;
begin
  iid := coalesce(new.invoice_id, old.invoice_id);
  label := public.invoice_methods_summary(iid);
  if label is not null then
    update public.invoices set payment_method = label where id = iid;
  end if;
  return coalesce(new, old);
end $$;

-- CREATE OR REPLACE (Postgres 14+) rather than drop-and-create: tooling
-- that gates "destructive" statements stalls on DROP, and this is idempotent.
create or replace trigger invoice_payments_sync_method
after insert or update or delete on public.invoice_payments
for each row execute function public.sync_invoice_payment_method();

-- One-time repair of every bill whose stored label no longer matches how
-- it was actually paid. Cancelled bills are left alone.
update public.invoices i
set payment_method = public.invoice_methods_summary(i.id)
where coalesce(i.payment_status, '') <> 'cancelled'
  and public.invoice_methods_summary(i.id) is not null
  and coalesce(i.payment_method, '') is distinct from public.invoice_methods_summary(i.id);

-- 2. Product image uploads failed because the bucket the app uploads to
--    never existed (its access policies did). Public read, 5 MB, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/*'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

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

-- Relationships the admin pages embed but the database never had, which made
-- PostgREST fail with "Could not find a relationship between ... in the schema
-- cache" — so the Products page, stock-out movements and sales history loaded
-- empty. Safe to re-run (idempotent). Dead links are cleared, never deleted.

update public.products p set category_id = null where p.category_id is not null and not exists (select 1 from public.categories c where c.id = p.category_id);
update public.products p set brand_id = null where p.brand_id is not null and not exists (select 1 from public.brands b where b.id = p.brand_id);
update public.templates t set category_id = null where t.category_id is not null and not exists (select 1 from public.categories c where c.id = t.category_id);
update public.customer_purchases cp set product_id = null where cp.product_id is not null and not exists (select 1 from public.products p where p.id = cp.product_id);
update public.invoice_items ii set invoice_id = null where ii.invoice_id is not null and not exists (select 1 from public.invoices i where i.id = ii.invoice_id);

do $$
begin
  if not exists (select 1 from pg_constraint where contype = 'f' and conrelid = 'public.products'::regclass and confrelid = 'public.categories'::regclass) then
    alter table public.products add constraint products_category_id_fkey foreign key (category_id) references public.categories(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where contype = 'f' and conrelid = 'public.products'::regclass and confrelid = 'public.brands'::regclass) then
    alter table public.products add constraint products_brand_id_fkey foreign key (brand_id) references public.brands(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where contype = 'f' and conrelid = 'public.templates'::regclass and confrelid = 'public.categories'::regclass) then
    alter table public.templates add constraint templates_category_id_fkey foreign key (category_id) references public.categories(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where contype = 'f' and conrelid = 'public.customer_purchases'::regclass and confrelid = 'public.products'::regclass) then
    alter table public.customer_purchases add constraint customer_purchases_product_id_fkey foreign key (product_id) references public.products(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where contype = 'f' and conrelid = 'public.invoice_items'::regclass and confrelid = 'public.invoices'::regclass) then
    alter table public.invoice_items add constraint invoice_items_invoice_id_fkey foreign key (invoice_id) references public.invoices(id) on delete cascade;
  end if;
end $$;

create index if not exists invoice_items_invoice_id_idx on public.invoice_items (invoice_id);
create index if not exists customer_purchases_product_id_idx on public.customer_purchases (product_id);

notify pgrst, 'reload schema';
