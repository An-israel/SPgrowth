-- ============================================================================
-- Add Prophetic Takeoff (PT) daily morning-prayer tracking to user_progress.
-- PT is the church's daily morning prayer (5am–6am). Tracked per program day
-- alongside reading/exercise/prayer, but it does NOT gate day completion.
-- ============================================================================

alter table public.user_progress
  add column if not exists pt_done boolean not null default false;
