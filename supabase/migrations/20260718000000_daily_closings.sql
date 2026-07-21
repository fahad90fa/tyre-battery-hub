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
