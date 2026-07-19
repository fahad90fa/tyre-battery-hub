-- Quotations (letterhead documents) + multi-item merchant purchases.
-- Safe to re-run. Run in the Supabase SQL editor.

-- 1. Quotations with their own unique numbering (QUO-1001, ...)
create sequence if not exists public.quotation_no_seq start 1001;

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quote_no text unique default ('QUO-' || nextval('public.quotation_no_seq')),
  customer_name text not null,
  client_id uuid references public.clients(id) on delete set null,
  status text not null default 'draft', -- draft / sent / accepted / converted
  valid_until date,
  notes text,
  total_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric not null default 0,
  total_price numeric not null default 0
);
create index if not exists quotation_items_quotation_id_idx on public.quotation_items (quotation_id);

-- 2. Group multi-item purchases and tie them to the merchant account, so a
--    single supplier visit with 3-4 items shows as one dated purchase with
--    full item details.
alter table public.stock_purchases add column if not exists reference text;
alter table public.stock_purchases add column if not exists merchant_id uuid references public.merchants(id) on delete set null;
create index if not exists stock_purchases_reference_idx on public.stock_purchases (reference);
create index if not exists stock_purchases_merchant_id_idx on public.stock_purchases (merchant_id);
