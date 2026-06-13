-- ============================================================================
-- IDLC 21-Day Spiritual Growth Tracker — Schema
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone_number text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- daily_content
-- ---------------------------------------------------------------------------
create table if not exists public.daily_content (
  id serial primary key,
  day_number int not null unique check (day_number between 1 and 21),
  week_number int not null check (week_number between 1 and 3),
  chapter text not null,
  topic text not null,
  key_truth text not null,
  practical_exercise text not null,
  prayer_focus text not null,
  is_review_day boolean not null default false,
  weekly_challenge text,
  resources jsonb not null default '[]'::jsonb
);

create index if not exists daily_content_day_number_idx
  on public.daily_content (day_number);

-- ---------------------------------------------------------------------------
-- user_progress
-- ---------------------------------------------------------------------------
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  day_number int not null references public.daily_content (day_number),
  reading_done boolean not null default false,
  exercise_done boolean not null default false,
  prayer_done boolean not null default false,
  exercise_response text,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, day_number)
);

create index if not exists user_progress_user_id_idx
  on public.user_progress (user_id);
create index if not exists user_progress_day_number_idx
  on public.user_progress (day_number);
create index if not exists user_progress_user_day_idx
  on public.user_progress (user_id, day_number);

-- ---------------------------------------------------------------------------
-- final_growth_plan
-- ---------------------------------------------------------------------------
create table if not exists public.final_growth_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  greatest_area_of_growth text,
  biggest_spiritual_challenge text,
  habit_1 text,
  habit_2 text,
  habit_3 text,
  accountability_partner text,
  ninety_day_goal text,
  submitted_at timestamptz
);

create index if not exists final_growth_plan_user_id_idx
  on public.final_growth_plan (user_id);

-- ---------------------------------------------------------------------------
-- app_config (single-row table holding the program start date)
-- ---------------------------------------------------------------------------
create table if not exists public.app_config (
  id int primary key default 1 check (id = 1),
  program_start_date date not null default current_date
);

insert into public.app_config (id, program_start_date)
values (1, current_date)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Trigger: auto-create a profile row when a new auth user signs up.
-- Captures full_name and phone_number from signup metadata, email from auth.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone_number', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Trigger: keep user_progress.updated_at fresh and set completed_at when all
-- three tasks are done (clear it if a task is later un-done).
-- ---------------------------------------------------------------------------
create or replace function public.handle_progress_update()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();

  if new.reading_done and new.exercise_done and new.prayer_done then
    if new.completed_at is null then
      new.completed_at := now();
    end if;
  else
    new.completed_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists on_progress_change on public.user_progress;
create trigger on_progress_change
  before insert or update on public.user_progress
  for each row execute function public.handle_progress_update();
