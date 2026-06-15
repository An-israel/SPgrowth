-- ============================================================================
-- Let admins manage other users' roles (promote/revoke) from the dashboard,
-- while preventing regular users from escalating their own role.
-- ============================================================================

-- Allow admins to update any profile row. Combined with the existing
-- "Users update own profile" policy (policies are OR'd), admins can edit any
-- row while regular users can still only edit their own.
drop policy if exists "Admins update any profile" on public.profiles;
create policy "Admins update any profile"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- Security hardening: RLS is row-level, not column-level, so the
-- "Users update own profile" policy would otherwise let a user set their OWN
-- role to 'admin'. This trigger blocks any role change unless made by an admin.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change a user role';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.prevent_role_change();
