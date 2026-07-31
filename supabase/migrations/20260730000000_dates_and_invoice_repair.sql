-- 1. Expenses: give date_of_expense a default and backfill old rows that
--    were saved without a date (they showed "—" and never appeared in the
--    daily closing).
alter table public.expenses alter column date_of_expense set default current_date;
update public.expenses
set date_of_expense = (created_at at time zone 'Asia/Karachi')::date
where date_of_expense is null;

-- 2. Repair invoice statuses: customers who already paid through their
--    account still had invoices stuck on unpaid/partial. Allocate each
--    client's surplus account payments to their outstanding invoices
--    (oldest first) and flip statuses to paid/partial automatically.
do $$
declare
  c record;
  inv record;
  surplus numeric;
  bal numeric;
  alloc numeric;
begin
  for c in select id from public.clients loop
    select coalesce((select sum(amount) from public.client_ledger
                     where client_id = c.id and entry_type = 'payment'), 0)
         - coalesce((select sum(ip.amount) from public.invoice_payments ip
                     join public.invoices i on i.id = ip.invoice_id
                     where i.client_id = c.id), 0)
      into surplus;

    for inv in
      select i.id, i.total_amount,
             i.total_amount - coalesce((select sum(amount) from public.invoice_payments
                                        where invoice_id = i.id), 0) as balance
      from public.invoices i
      where i.client_id = c.id and coalesce(i.payment_status, '') <> 'paid'
      order by i.created_at
    loop
      bal := inv.balance;
      if bal <= 0 then
        update public.invoices set payment_status = 'paid' where id = inv.id;
      elsif surplus > 0 then
        alloc := least(bal, surplus);
        insert into public.invoice_payments (invoice_id, amount, method, note)
        values (inv.id, alloc, 'cash', 'Auto-allocated from account payments (repair)');
        if alloc >= bal then
          update public.invoices set payment_status = 'paid' where id = inv.id;
        else
          update public.invoices set payment_status = 'partial' where id = inv.id;
        end if;
        surplus := surplus - alloc;
      end if;
    end loop;
  end loop;
end $$;
