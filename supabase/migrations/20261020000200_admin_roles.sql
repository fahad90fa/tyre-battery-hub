-- Admin access managed from the app (Admin → Users) + the profile phone field.
-- Safe to re-run (idempotent; nothing is dropped).
--
-- The shop was set up with a developer's admin login. Rather than baking
-- anyone's email or password into the code, admins now grant and revoke
-- admin access themselves: the owner signs up (or resets the password) with
-- their own email, an existing admin grants it admin in Admin → Users, and
-- the developer account is revoked once the owner's login works.

-- 1. Profile phone. "Save profile" on Admin → Profile writes it; the column
--    was missing, so saving the profile failed.
alter table public.profiles add column if not exists phone text;

-- 2. Admins may grant and revoke roles (insert / delete rows). There is no
--    update policy: a role is changed by revoking one and granting another.
--    Everyone else can still only add the plain customer role to their own
--    account at sign-up ("roles self customer").
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_roles' and policyname = 'roles admin insert') then
    create policy "roles admin insert" on public.user_roles for insert to authenticated
      with check (public.has_role((select auth.uid()), 'admin'));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_roles' and policyname = 'roles admin delete') then
    create policy "roles admin delete" on public.user_roles for delete to authenticated
      using (public.has_role((select auth.uid()), 'admin'));
  end if;
end $$;

-- 3. Never lock everyone out: removing the last admin role is refused, from
--    the app or anywhere else. The advisory lock makes two admins revoking
--    each other at the same moment take turns, so one of them is refused.
create or replace function public.user_roles_keep_one_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role = 'admin' then
    perform pg_advisory_xact_lock(hashtext('public.user_roles_keep_one_admin'));
    if not exists (select 1 from public.user_roles r where r.role = 'admin' and r.id <> old.id) then
      raise exception 'At least one admin must remain' using errcode = 'P0001',
        hint = 'Grant admin to another account before revoking this one.';
    end if;
  end if;
  return old;
end $$;
revoke execute on function public.user_roles_keep_one_admin() from public, anon;

create or replace trigger user_roles_keep_one_admin
  before delete on public.user_roles
  for each row execute function public.user_roles_keep_one_admin();

-- 4. Every sign-in account for Admin → Users, including accounts that never
--    got a profile row, with roles and last sign-in. Admins only.
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  roles text[]
)
language plpgsql stable security definer set search_path = public as $$
begin
  if not coalesce(public.has_role(auth.uid(), 'admin'), false) then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  return query
    select u.id,
           coalesce(u.email, p.email)::text,
           p.full_name,
           u.created_at,
           u.last_sign_in_at,
           coalesce(
             array(select r.role::text from public.user_roles r where r.user_id = u.id order by r.role::text),
             '{}'::text[]
           )
      from auth.users u
      left join public.profiles p on p.id = u.id
     order by u.created_at desc nulls last;
end $$;
revoke execute on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;
