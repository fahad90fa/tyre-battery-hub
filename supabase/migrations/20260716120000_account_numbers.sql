-- Unique human-friendly account numbers for customer & merchant accounts.
-- Safe to re-run. Run in the Supabase SQL editor.

create sequence if not exists public.client_account_no_seq start 1001;
create sequence if not exists public.merchant_account_no_seq start 1001;

alter table public.clients add column if not exists account_no text
  default ('CUST-' || nextval('public.client_account_no_seq'));
alter table public.merchants add column if not exists account_no text
  default ('MER-' || nextval('public.merchant_account_no_seq'));

-- Backfill existing accounts in creation order.
with ordered as (
  select id from public.clients where account_no is null order by created_at, id
)
update public.clients c
set account_no = 'CUST-' || nextval('public.client_account_no_seq')
from ordered o where c.id = o.id;

with ordered as (
  select id from public.merchants where account_no is null order by created_at, id
)
update public.merchants m
set account_no = 'MER-' || nextval('public.merchant_account_no_seq')
from ordered o where m.id = o.id;

-- Enforce uniqueness (partial-safe: run after backfill).
create unique index if not exists clients_account_no_key on public.clients (account_no);
create unique index if not exists merchants_account_no_key on public.merchants (account_no);
