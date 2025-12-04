# Gymverse

Mobile fitness companion built with Expo + Supabase. Helps people plan workouts, track progress, celebrate achievements, and share with the community.

## Who this is for (personas)
- **Everyday athlete:** wants simple guided workouts and easy progress tracking.
- **Social motivator:** enjoys sharing achievements, likes/comments, and leaderboards.
- **Builder/creator:** prefers creating/editing their own templates and reusing them.

## Core journeys
1) **Auth** → sign up/sign in → create profile.
2) **Workouts** → browse templates, filter/search → start a session → log/complete.
3) **Progress** → view streaks, charts, and personal records → spot trends.
4) **Social** → post workout/achievement/progress → engage via likes/comments/shares.
5) **Achievements** → see unlock criteria → complete milestones → share wins.

## Stack (high level)
- Expo (React Native, expo-router), React 19, RN Reanimated, FlashList.
- Supabase (auth, Postgres, storage, realtime) with generated types in `types/supabase.ts`.
- React Query for data and cache; Sentry for crash/trace monitoring.

## Environment setup
1) Copy `.env.example` to `.env` and fill in values:
   - `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (required).
   - `SUPABASE_SERVICE_ROLE_KEY` (local scripts/seeding only; **never ship** in client).
   - `EXPO_PUBLIC_SENTRY_DSN` (to enable Sentry) and `EXPO_PUBLIC_ENVIRONMENT` (dev/staging/prod flag).
2) Install dependencies: `pnpm install` (or `npm install`).
3) Run the app: `pnpm dev` (starts Expo), then open on device/emulator.
4) Optional: regenerate Supabase types after schema changes:
   - Export `SUPABASE_PROJECT_REF` (found in your Supabase project settings URL).
   - Run `pnpm supabase:typegen` (uses `--project-id` under the hood; requires Supabase CLI and `SUPABASE_SERVICE_ROLE_KEY` or access token).

## Scripts (package.json)
- `pnpm dev` – start Expo.
- `pnpm lint` – lint the app.
- `pnpm format` / `pnpm format:check` – Prettier.
- `pnpm supabase:typegen` – regenerate typed client bindings (configure project ref first).

## Supabase migrations & typegen
- Schema migrations live in `supabase/migrations/`. Keep this directory committed for any schema change (workouts, social, achievements, etc.).
- To add a migration, use the Supabase CLI (`supabase migration new <name>`), then apply and commit the generated SQL.
- To refresh client types after schema updates, run the typegen command above. This keeps `types/supabase.ts` in sync with the latest migrations.

## Admin gating for payments/entitlements
- Receipt approvals and granting entitlements rely on an **admin** JWT (`app_metadata.role = 'admin'`). Use an admin session for the `/payments/admin` screen to approve/reject receipts and create entitlements.
- Coaches see only their sales; users see only their own submissions.
- After approval, the client must refresh entitlements (the app does this on auth change; use the admin “Refresh entitlements” toggle to force a refresh in-session).

## KPI placeholders (to align with product goals)
- Activation: % of new users who start a workout within 24h of signup.
- Engagement: weekly active users; average workouts per user per week.
- Retention: D7/D30 retention; streak continuation rate.
- Social: posts per user per week; like/comment rate per post.
- Outcomes: % of users with new personal records per month; plan adherence rate.

## Where things live
- App screens: `app/` (auth, tabs for workouts, progress, social, achievements).
- Data layer: `lib/` and `hooks/` (Supabase client, queries, analytics).
- Theming/components: `components/`, `theme/`, `providers/`.
