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
