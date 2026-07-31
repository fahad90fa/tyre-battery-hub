-- Track merchant payments (cash out) in daily closings.
alter table public.daily_closings add column if not exists merchant_payments numeric not null default 0;
