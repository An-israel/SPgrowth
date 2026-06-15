-- ============================================================================
-- Add branch/location tracking to profiles.
-- Nullable so existing users (with no location yet) are prompted in-app.
-- ============================================================================

alter table public.profiles
  add column if not exists location text;

create index if not exists profiles_location_idx on public.profiles (location);

-- Capture location from signup metadata when a new user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone_number, location)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone_number', ''),
    nullif(new.raw_user_meta_data ->> 'location', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
