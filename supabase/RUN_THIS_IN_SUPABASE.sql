-- ============================================================
-- MT&B HOUSE — SAB PENDING DATABASE UPDATES EK SAATH
-- Supabase > SQL Editor mein yeh POORI file paste kar ke RUN karen.
-- Dobara chalana bilkul safe hai (sab kuch idempotent hai).
-- Included: daily closings, merchant payments column, expenses date
-- fix + backfill, pending-invoice auto-repair, transaction date
-- backfill, and the Amanat (security deposit) table.
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
