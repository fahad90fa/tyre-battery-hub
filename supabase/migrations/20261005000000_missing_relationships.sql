-- Relationships the admin pages embed but the database never had, which made
-- PostgREST fail with "Could not find a relationship between ... in the schema
-- cache" — so the Products page, stock-out movements and sales history loaded
-- empty. Safe to re-run (idempotent). Dead links are cleared, never deleted.

update public.products p set category_id = null where p.category_id is not null and not exists (select 1 from public.categories c where c.id = p.category_id);
update public.products p set brand_id = null where p.brand_id is not null and not exists (select 1 from public.brands b where b.id = p.brand_id);
update public.templates t set category_id = null where t.category_id is not null and not exists (select 1 from public.categories c where c.id = t.category_id);
update public.customer_purchases cp set product_id = null where cp.product_id is not null and not exists (select 1 from public.products p where p.id = cp.product_id);
update public.invoice_items ii set invoice_id = null where ii.invoice_id is not null and not exists (select 1 from public.invoices i where i.id = ii.invoice_id);

do $$
begin
  if not exists (select 1 from pg_constraint where contype = 'f' and conrelid = 'public.products'::regclass and confrelid = 'public.categories'::regclass) then
    alter table public.products add constraint products_category_id_fkey foreign key (category_id) references public.categories(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where contype = 'f' and conrelid = 'public.products'::regclass and confrelid = 'public.brands'::regclass) then
    alter table public.products add constraint products_brand_id_fkey foreign key (brand_id) references public.brands(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where contype = 'f' and conrelid = 'public.templates'::regclass and confrelid = 'public.categories'::regclass) then
    alter table public.templates add constraint templates_category_id_fkey foreign key (category_id) references public.categories(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where contype = 'f' and conrelid = 'public.customer_purchases'::regclass and confrelid = 'public.products'::regclass) then
    alter table public.customer_purchases add constraint customer_purchases_product_id_fkey foreign key (product_id) references public.products(id) on delete set null;
  end if;
  if not exists (select 1 from pg_constraint where contype = 'f' and conrelid = 'public.invoice_items'::regclass and confrelid = 'public.invoices'::regclass) then
    alter table public.invoice_items add constraint invoice_items_invoice_id_fkey foreign key (invoice_id) references public.invoices(id) on delete cascade;
  end if;
end $$;

create index if not exists invoice_items_invoice_id_idx on public.invoice_items (invoice_id);
create index if not exists customer_purchases_product_id_idx on public.customer_purchases (product_id);

notify pgrst, 'reload schema';
