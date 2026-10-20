-- Payroll: which month's salary each employee has been paid.
--
-- The Employees page only knew each person's fixed salary; whether a month
-- had actually been paid lived in the owner's head (and in hand-typed
-- Expenses such as "zain 25000" or "Zain ko dea 5000"). Now every salary
-- payment is a row here, for one employee and one month (YYYY-MM). A month
-- may hold several rows (advances, part payments); its status is derived:
-- Paid when the payments add up to the salary due, Partial below that,
-- Unpaid when there are none.
--
-- Every payment is ALSO an expense, exactly once, because Expenses drive the
-- Daily Closing net cash, Reports and the Dashboard profit:
--   * paid from the Employees page -> salary_mark_paid() creates the expense
--     ("Salary — Zain") and links it (expense_created = true);
--   * already typed in Expenses by hand -> the owner links that expense
--     instead (expense_created = false), so it is never counted twice.
-- Deleting the expense on the Expenses page deletes its payment with it (the
-- month goes back to Unpaid/Partial). Marking a month unpaid removes the
-- expenses payroll created and leaves hand-typed ones (that cash really went
-- out). Deleting an employee deletes their payroll history; the expenses stay.
--
-- Safe to re-run: nothing is dropped, policies are created only if missing.

-- 1. The payments.
create table if not exists public.salary_payments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  month text not null check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  amount numeric not null check (amount > 0),
  -- employees.salary when the payment was recorded (a later raise does not
  -- rewrite what was due in an old month)
  salary_due numeric not null default 0,
  paid_date date not null default current_date,
  method text not null default 'cash',
  expense_id uuid unique references public.expenses(id) on delete cascade,
  -- false = linked to an expense the owner typed by hand
  expense_created boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists salary_payments_month_idx on public.salary_payments (month);
create index if not exists salary_payments_employee_month_idx on public.salary_payments (employee_id, month);

-- 2. Admin only (salaries are nobody else's business).
alter table public.salary_payments enable row level security;
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'salary_payments' and policyname = 'salary payments admin') then
    create policy "salary payments admin" on public.salary_payments for all to authenticated
      using (public.has_role((select auth.uid()), 'admin'))
      with check (public.has_role((select auth.uid()), 'admin'));
  end if;
end $$;

-- 3. Record a payment for an employee's month, with its expense, in one
--    transaction. With _expense: link that (hand-typed) expense — its amount
--    and date are the payment's. Without: _amount is paid on _paid_date and
--    a "Salary — <name>" expense is created for it. Returns the payment id.
create or replace function public.salary_mark_paid(
  _employee uuid,
  _month text,
  _amount numeric default null,
  _paid_date date default current_date,
  _method text default 'cash',
  _expense uuid default null,
  _notes text default null
)
returns uuid language plpgsql set search_path = public as $$
declare
  emp_name text;
  emp_salary numeric;
  exp_amount numeric;
  exp_date date;
  m text := lower(coalesce(nullif(trim(_method), ''), 'cash'));
  note text := nullif(trim(coalesce(_notes, '')), '');
  month_label text;
  method_label text;
  amt numeric;
  d date;
  eid uuid;
  pid uuid;
begin
  if _month is null or _month !~ '^\d{4}-(0[1-9]|1[0-2])$' then
    raise exception 'Month must look like YYYY-MM (got %)', coalesce(_month, 'nothing');
  end if;
  select e.name, e.salary into emp_name, emp_salary from public.employees e where e.id = _employee;
  if not found then raise exception 'Employee not found'; end if;
  month_label := to_char(to_date(_month || '-01', 'YYYY-MM-DD'), 'Mon YYYY');

  if _expense is not null then
    select x.amount, x.date_of_expense into exp_amount, exp_date from public.expenses x where x.id = _expense;
    if not found then raise exception 'That expense no longer exists'; end if;
    if exists (select 1 from public.salary_payments s where s.expense_id = _expense) then
      raise exception 'That expense is already linked to a salary payment';
    end if;
    if coalesce(exp_amount, 0) <= 0 then raise exception 'That expense has no amount'; end if;
    amt := exp_amount;
    d := coalesce(exp_date, current_date);
    eid := _expense;
  else
    if _amount is null or _amount <= 0 then raise exception 'Amount must be more than zero'; end if;
    amt := _amount;
    d := coalesce(_paid_date, current_date);
    method_label := case m
      when 'cash' then 'Cash' when 'jazzcash' then 'JazzCash' when 'easypaisa' then 'Easypaisa'
      when 'bank' then 'Bank transfer' when 'card' then 'Card' when 'other' then 'Other'
      else m end;
    insert into public.expenses (expense_type, amount, notes, date_of_expense)
    values ('Salary — ' || coalesce(nullif(trim(emp_name), ''), 'employee'), amt,
            'Salary for ' || month_label || ' · ' || method_label || coalesce(' · ' || note, ''), d)
    returning id into eid;
  end if;

  begin
    insert into public.salary_payments (employee_id, month, amount, salary_due, paid_date, method, expense_id, expense_created, notes)
    values (_employee, _month, amt, coalesce(emp_salary, 0), d, m, eid, _expense is null, note)
    returning id into pid;
  exception when unique_violation then
    -- two phones linking the same expense at once
    raise exception 'That expense is already linked to a salary payment';
  end;
  return pid;
end $$;
revoke execute on function public.salary_mark_paid(uuid, text, numeric, date, text, uuid, text) from public, anon;
grant execute on function public.salary_mark_paid(uuid, text, numeric, date, text, uuid, text) to authenticated;

-- 4. Undo a month: its payments go, and so do the expenses payroll created
--    for them (out of Expenses and the Daily Closing). Hand-typed expenses
--    that were only linked stay — that cash really went out. Returns the
--    number of payments removed.
create or replace function public.salary_mark_unpaid(_employee uuid, _month text)
returns integer language plpgsql set search_path = public as $$
declare
  n integer;
  created uuid[];
begin
  if _month is null or _month !~ '^\d{4}-(0[1-9]|1[0-2])$' then
    raise exception 'Month must look like YYYY-MM (got %)', coalesce(_month, 'nothing');
  end if;
  with gone as (
    delete from public.salary_payments s
    where s.employee_id = _employee and s.month = _month
    returning s.expense_id, s.expense_created
  )
  select count(*)::integer,
         coalesce(array_agg(g.expense_id) filter (where g.expense_created and g.expense_id is not null), '{}')
    into n, created
  from gone g;
  if cardinality(created) > 0 then
    delete from public.expenses x where x.id = any(created);
  end if;
  return n;
end $$;
revoke execute on function public.salary_mark_unpaid(uuid, text) from public, anon;
grant execute on function public.salary_mark_unpaid(uuid, text) to authenticated;

-- 5. When an employee left. Set by the app when they are made inactive
--    (cleared when reactivated), so the months they still worked keep
--    showing as due instead of vanishing the moment they leave.
alter table public.employees add column if not exists left_on date;

notify pgrst, 'reload schema';
