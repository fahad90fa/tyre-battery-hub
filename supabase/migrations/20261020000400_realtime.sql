-- Live dashboard: publish the tables the dashboard listens to.
--
-- The dashboard subscribes to Supabase Realtime (postgres_changes) and
-- reloads its figures a moment after a sale, payment, expense, purchase or
-- stock correction lands. Realtime only sends changes for tables that are
-- members of the supabase_realtime publication, which had none.
--
-- Safe to re-run: the publication is created only when missing, and each
-- table is added only when it exists and is not a member yet (adding a
-- member twice is an error). Nothing is dropped. A publication defined
-- FOR ALL TABLES already covers every table and is left alone.

do $$
declare
  t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  if (select puballtables from pg_publication where pubname = 'supabase_realtime') then
    return;
  end if;

  foreach t in array array[
    'invoices', 'invoice_items', 'invoice_payments', 'customer_purchases',
    'client_ledger', 'expenses', 'stock_purchases', 'stock_adjustments', 'products'
  ] loop
    if to_regclass(format('public.%I', t)) is not null
       and not exists (
         select 1 from pg_publication_tables
         where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
       ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
