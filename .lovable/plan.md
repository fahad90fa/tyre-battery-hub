
# Admin Dashboard Expansion Plan

The current admin has: Dashboard, Products, Categories, Stock Purchases, Customer Sales, Expenses, Invoices, Reports, Users. I'll expand it into the full "command center" from the doc, staged over a few turns.

## Stage 1 — Data model (this turn)

New tables (all with RLS + admin-only write, plus timestamps and update triggers):

- `merchants` — name, phone, email, address, cnic, opening_balance, current_balance, notes
- `clients` — name, phone, email, address, cnic, opening_balance, current_balance, notes
- `employees` — name, phone, email, cnic, role/position, salary, joining_date, status, notes
- `merchant_ledger` — merchant_id, type (credit/debit/purchase/payment), amount, reference, note, entry_date
- `client_ledger` — client_id, type (credit/debit/sale/payment), amount, reference, note, entry_date
- `templates` — name, description, category_id, image_url, default_price, notes (product templates for quick add)
- `reports_inbox` — from_name, from_email, subject, message, status (new/read/archived), created_at (contact-form + support messages)

Triggers to keep `current_balance` in sync on ledger insert/update/delete.

## Stage 2 — Dashboard summary cards + sidebar (next turn)

- Rework `/admin` dashboard cards to show: Templates, Products, Stock units, Employees, Merchants, Clients, plus existing financial cards (Stock value, Today's sales, Expenses, Profit).
- Rebuild `AdminShell` sidebar with grouped nav:
  - Overview: Dashboard
  - Inventory: Products, Categories, Templates, Stock Purchases
  - People: Merchants, Clients, Employees, Users
  - Sales: Customer Sales, Invoices
  - Finance: Expenses, Reports
  - Support: Inbox (reports_inbox)
  - Account: Profile

## Stage 3 — New admin pages (next turns)

Each page follows the existing table+dialog CRUD pattern (like `admin.products.tsx`), with search, and where relevant a "Ledger" side sheet with running balance and "Add credit / Add payment" actions.

- `/admin/merchants` — list + add/edit/delete + ledger sheet + print ledger (window.print stylesheet)
- `/admin/clients` — same shape as merchants
- `/admin/employees` — list + add/edit/delete + status toggle
- `/admin/templates` — list + add/edit/delete + "Create product from template" button
- `/admin/inbox` — support/contact messages, mark read / archive / delete
- `/admin/profile` — edit own profile (full_name, phone, avatar) + change password

## Stage 4 — Wiring & polish (final turn)

- Contact form on public site posts into `reports_inbox`.
- Customer sales page gets optional `client_id` picker; when set, auto-writes to `client_ledger`.
- Stock purchases gets optional `merchant_id` picker; auto-writes to `merchant_ledger`.
- Print-friendly invoice + ledger styles.
- Empty states, delete confirmations, toast notifications, form validation on every new page.

## Technical notes

- All tables live in `public` with `GRANT SELECT, INSERT, UPDATE, DELETE ... TO authenticated;` + `GRANT ALL ... TO service_role;` and RLS policies using `public.has_role(auth.uid(), 'admin')` for writes; reads limited to admins as well (this is internal business data).
- Ledger balance kept via `BEFORE INSERT/UPDATE/DELETE` triggers updating parent row's `current_balance`.
- New routes under `src/routes/_authenticated/admin.*.tsx`; existing admin gate in `admin.tsx` already blocks non-admins.
- No changes to `auth.*`, storage, or existing tables' schema — only additive.

Reply "go" and I'll ship Stage 1 (the migration) now.
