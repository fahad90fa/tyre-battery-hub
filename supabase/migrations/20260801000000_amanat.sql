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
