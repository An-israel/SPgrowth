# IDLC 21-Day Spiritual Growth Tracker

A production-ready full-stack web app for a 21-day spiritual growth program for
undergraduate students, based on Kenneth E. Hagin's _Growing Up, Spiritually_.
Theme: **Light to the World** (Ephesians 4:15).

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend / Auth / DB:** Supabase (Postgres, Supabase Auth, Row Level Security)
- **Hosting:** Vercel

## Features

- Email/password auth with a "forgot password" reset flow
- Student dashboard: 21-day selector, daily content (reading, key truth,
  practical exercise with auto-saving journal, prayer focus), weekly challenge
  callouts on review days, recommended resources, and a confetti completion
  celebration with milestone messages
- Self-paced — every day is always accessible; the calendar-based "current day"
  is highlighted by default
- Final Spiritual Growth Plan form + Graduation Prayer
- Admin dashboard: overview stats, sortable/filterable user table, per-user
  detail (progress grid, exercise responses, growth plan), quick-copy contact
  buttons, per-day resources management, and a program start-date setting

## Project structure

```
app/                 Next.js App Router pages & routes
  page.tsx           Landing page
  signup, login, forgot-password, reset-password
  auth/callback      PKCE code exchange for reset/confirm links
  dashboard/         Student dashboard + growth-plan
  admin/             Admin dashboard
components/          UI + interactive client components
lib/                 Supabase clients, program logic, confetti, celebration
types/               TypeScript database types
supabase/migrations Schema, RLS, seed (run in order)
middleware.ts        Route guards for /dashboard/* and /admin/*
```

## 1. Create the Supabase project

1. Create a project at https://supabase.com/dashboard.
2. In **Project Settings → API**, copy the **Project URL** and **anon public
   key**.
3. (Optional) Under **Authentication → Providers → Email**, decide whether to
   require email confirmation. If confirmation is **off**, signup logs the user
   straight into the dashboard. If **on**, users confirm via email first.
4. Under **Authentication → URL Configuration**, set the **Site URL** to your
   deployment URL (e.g. `https://your-app.vercel.app`) and add it (plus
   `http://localhost:3000` for local dev) to **Redirect URLs**. This makes the
   password-reset / confirmation links return to your app.

## 2. Run the migrations

In the Supabase dashboard, open the **SQL Editor** and run the files in
`supabase/migrations` **in order**:

1. `0001_schema.sql` — tables, indexes, triggers (profile auto-create +
   progress completion timestamp)
2. `0002_rls.sql` — Row Level Security policies
3. `0003_seed.sql` — all 21 days of content
4. `0004_add_pt.sql` — adds the Prophetic Takeoff (PT) daily-prayer field
5. `0005_admin_manage_roles.sql` — lets admins update other users' roles
6. `0006_add_location.sql` — adds branch/location to profiles

Re-running `0003_seed.sql` is safe; it upserts content and preserves any
admin-edited `resources`. All migrations are idempotent and safe to re-run.

## 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Run locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## 5. Make a user an admin

There is no public admin signup. Bootstrap the **first** admin via the SQL
Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

That user will now be routed to `/admin` on sign-in. **After that, admins can
promote or revoke other admins directly from the dashboard** — open a user from
the Users tab and click **Promote to Admin** (revoke from the Admins panel or
the user's detail view). You cannot revoke your own admin access, preventing
accidental lockout. Promoted users get the exact same admin dashboard; the
change takes effect on their next navigation/refresh.

## 6. Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo at https://vercel.com/new.
3. **Framework Preset:** Next.js (auto-detected). Build command `next build`,
   output handled automatically.
4. Add environment variables `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` in **Project → Settings → Environment
   Variables**.
5. Deploy. Then set the Supabase **Site URL** / **Redirect URLs** (step 1.4) to
   your Vercel domain.

## Performance & scale notes

- All dashboard data loads in a few parallel queries — no N+1: a single
  `user_progress` query fetches all 21 days for the user at once.
- Indexes on `user_progress (user_id)`, `(day_number)`, `(user_id, day_number)`
  and on `profiles (role)` keep admin and student queries fast at 100+ users.
- The exercise journal auto-saves with a ~1.2s debounce to avoid excessive
  writes.
- Server Components handle initial data loading; client components handle
  interactivity (day selector, checkboxes, textarea).

## Program day calculation

The `app_config.program_start_date` (admin-settable in **Settings**) drives the
highlighted "current day":

```
current_day = clamp(floor((today - program_start_date) / 1 day) + 1, 1, 21)
```

This affects highlighting and the admin "On Track / Falling Behind" badge only —
all 21 days remain fully accessible and completable at any time.
