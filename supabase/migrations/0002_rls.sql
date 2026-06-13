-- ============================================================================
-- Row Level Security policies
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.daily_content enable row level security;
alter table public.user_progress enable row level security;
alter table public.final_growth_plan enable row level security;
alter table public.app_config enable row level security;

-- ---------------------------------------------------------------------------
-- Helper: is the current user an admin?
-- SECURITY DEFINER avoids RLS recursion when checking the profiles table.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- daily_content: all authenticated users may read; only admins may update.
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated read daily content" on public.daily_content;
create policy "Authenticated read daily content"
  on public.daily_content for select
  to authenticated
  using (true);

drop policy if exists "Admins update daily content" on public.daily_content;
create policy "Admins update daily content"
  on public.daily_content for update
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- user_progress: users own their rows; admins may read all.
-- ---------------------------------------------------------------------------
drop policy if exists "Users read own progress" on public.user_progress;
create policy "Users read own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Admins read all progress" on public.user_progress;
create policy "Admins read all progress"
  on public.user_progress for select
  using (public.is_admin());

drop policy if exists "Users insert own progress" on public.user_progress;
create policy "Users insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own progress" on public.user_progress;
create policy "Users update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- final_growth_plan: users own their row; admins may read all.
-- ---------------------------------------------------------------------------
drop policy if exists "Users read own plan" on public.final_growth_plan;
create policy "Users read own plan"
  on public.final_growth_plan for select
  using (auth.uid() = user_id);

drop policy if exists "Admins read all plans" on public.final_growth_plan;
create policy "Admins read all plans"
  on public.final_growth_plan for select
  using (public.is_admin());

drop policy if exists "Users insert own plan" on public.final_growth_plan;
create policy "Users insert own plan"
  on public.final_growth_plan for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own plan" on public.final_growth_plan;
create policy "Users update own plan"
  on public.final_growth_plan for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- app_config: all authenticated users may read; only admins may update.
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated read config" on public.app_config;
create policy "Authenticated read config"
  on public.app_config for select
  to authenticated
  using (true);

drop policy if exists "Admins update config" on public.app_config;
create policy "Admins update config"
  on public.app_config for update
  using (public.is_admin())
  with check (public.is_admin());
