create extension if not exists pgcrypto;

drop table if exists public.customer_purchases cascade;
drop table if exists public.invoice_payments cascade;
drop table if exists public.invoice_items cascade;
drop table if exists public.invoices cascade;
drop table if exists public.stock_purchases cascade;
drop table if exists public.expenses cascade;
drop table if exists public.testimonials cascade;
drop table if exists public.products cascade;
drop table if exists public.brands cascade;
drop table if exists public.subcategories cascade;
drop table if exists public.categories cascade;
drop table if exists public.user_roles cascade;
drop table if exists public.profiles cascade;
drop table if exists public.client_ledger cascade;
drop table if exists public.clients cascade;
drop table if exists public.merchant_ledger cascade;
drop table if exists public.merchants cascade;
drop table if exists public.employees cascade;
drop table if exists public.reports_inbox cascade;
drop table if exists public.templates cascade;
drop table if exists public.quotation_items cascade;
drop table if exists public.quotations cascade;
drop type if exists public.app_role cascade;

create type public.app_role as enum ('admin', 'customer');

create sequence if not exists public.client_account_no_seq start 1001;
create sequence if not exists public.merchant_account_no_seq start 1001;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

create table public.categories (
  icon text,
  created_at timestamptz not null default now(),
  display_order integer,
  id uuid primary key default gen_random_uuid(),
  name text,
  slug text
);

create table public.subcategories (
  category_id uuid not null references public.categories(id) on delete cascade,
  slug text,
  name text,
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unique(category_id, slug)
);

create table public.brands (
  logo_url text,
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text
);

create table public.products (
  last_purchase_date date,
  selling_price numeric,
  image_url text,
  id uuid primary key default gen_random_uuid(),
  purchase_price numeric,
  product_name text,
  quantity_in_stock integer,
  description text,
  brand_id uuid,
  subcategory_id uuid,
  category_id uuid,
  deal_end_date timestamptz,
  is_deal boolean,
  created_at timestamptz not null default now(),
  is_featured boolean
);

create table public.expenses (
  amount numeric,
  created_at timestamptz not null default now(),
  expense_type text,
  notes text,
  id uuid primary key default gen_random_uuid(),
  date_of_expense date
);

create table public.stock_purchases (
  date date,
  quantity integer,
  id uuid primary key default gen_random_uuid(),
  purchase_price numeric,
  supplier_name text,
  product_id uuid,
  created_at timestamptz not null default now(),
  reference text,
  merchant_id uuid
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  avatar_url text,
  message text,
  created_at timestamptz not null default now(),
  rating integer,
  customer_name text
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  payment_method text,
  payment_status text,
  total_amount numeric,
  created_at timestamptz not null default now(),
  customer_id uuid,
  invoice_id text,
  customer_name text,
  client_id uuid,
  due_date date
);

create table public.invoice_items (
  total_price numeric,
  product_name text,
  unit_price numeric,
  quantity integer,
  product_id uuid,
  invoice_id uuid,
  id uuid primary key default gen_random_uuid(),
  cost_price numeric
);

create table public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric not null,
  method text not null default 'cash',
  payment_date date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create table public.customer_purchases (
  payment_due_date date,
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  product_id uuid,
  quantity_purchased integer,
  total_price numeric,
  purchase_date date,
  payment_status text,
  payment_method text,
  customer_name text,
  created_at timestamptz not null default now(),
  cost_price numeric
);

create table public.clients (
  account_no text unique default ('CUST-' || nextval('public.client_account_no_seq')),
  cnic text,
  notes text,
  name text,
  phone text,
  email text,
  address text,
  id uuid primary key default gen_random_uuid(),
  opening_balance numeric,
  current_balance numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.merchants (
  account_no text unique default ('MER-' || nextval('public.merchant_account_no_seq')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  id uuid primary key default gen_random_uuid(),
  notes text,
  cnic text,
  address text,
  email text,
  phone text,
  name text,
  opening_balance numeric,
  current_balance numeric
);

create table public.client_ledger (
  id uuid primary key default gen_random_uuid(),
  entry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  entry_type text,
  note text,
  reference text,
  client_id uuid,
  amount numeric,
  method text
);

create table public.merchant_ledger (
  reference text,
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid,
  amount numeric,
  entry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  note text,
  entry_type text,
  method text
);

create table public.employees (
  position text,
  phone text,
  name text,
  status text,
  notes text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  joining_date date,
  salary numeric,
  id uuid primary key default gen_random_uuid(),
  email text,
  cnic text
);

create table public.reports_inbox (
  from_email text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  id uuid primary key default gen_random_uuid(),
  from_name text,
  from_phone text,
  subject text,
  message text,
  status text
);

create table public.templates (
  category_id uuid,
  id uuid primary key default gen_random_uuid(),
  notes text,
  description text,
  name text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  default_price numeric,
  image_url text
);

create sequence if not exists public.quotation_no_seq start 1001;

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  quote_no text unique default ('QUO-' || nextval('public.quotation_no_seq')),
  customer_name text not null,
  client_id uuid references public.clients(id) on delete set null,
  status text not null default 'draft',
  valid_until date,
  notes text,
  total_amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric not null default 0,
  total_price numeric not null default 0
);

alter table public.stock_purchases
  add constraint stock_purchases_merchant_id_fkey
  foreign key (merchant_id) references public.merchants(id) on delete set null;

create index if not exists stock_purchases_reference_idx on public.stock_purchases (reference);
create index if not exists stock_purchases_merchant_id_idx on public.stock_purchases (merchant_id);
create index if not exists quotation_items_quotation_id_idx on public.quotation_items (quotation_id);
create index if not exists invoice_payments_invoice_id_idx on public.invoice_payments (invoice_id);
create index if not exists invoice_payments_payment_date_idx on public.invoice_payments (payment_date);
create index if not exists invoices_client_id_idx on public.invoices (client_id);
