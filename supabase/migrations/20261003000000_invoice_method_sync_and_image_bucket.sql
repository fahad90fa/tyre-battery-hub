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
