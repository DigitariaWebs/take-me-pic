# Take Me Pic — Supabase Integration Status

Checked on: 2026-06-08

## Verdict

Supabase is scaffolded, but the mobile app is not fully runtime-integrated yet.

The repository has:

- `@supabase/supabase-js` installed.
- `lib/supabase.ts` configured for React Native auth persistence through `AsyncStorage`.
- `.env` populated with the provided Supabase project URL and publishable key.
- `.gitignore` excluding local env files.
- `supabase/migrations/0001_initial_schema.sql` modeling the PRD and current mock-data feature surface.
- Authenticated Data API grants in the migration, matching Supabase's current behavior where new tables may not be exposed automatically.
- `docs/SCHEMA.md` documenting the schema and the apply path.
- Supabase agent skills installed under `.agents/skills/` and tracked by `skills-lock.json`.

Remote check with the provided publishable key:

- `GET /rest/v1/profiles?select=id&limit=1` returned `PGRST205`: `public.profiles` is not in the schema cache.
- That confirms the remote project is not yet fully integrated with this local schema, or the table is not exposed through the Data API.

The repository does not yet have:

- Screens or feature fetchers calling `lib/supabase.ts`.
- Supabase Auth wired into onboarding/login/signup/OTP/profile setup.
- `0001_initial_schema.sql` applied and visible on `oxexcljzzemfenzogcnz`.
- Dashboard confirmation that the intended public schema objects are exposed through the Data API.
- Storage buckets/policies created for avatars, posts, and session photos.
- Realtime subscriptions for presence, help requests, or chat.
- Push notification plumbing through `expo-notifications` / APNs / FCM.

## Env

The active local env file contains:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://oxexcljzzemfenzogcnz.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_LLx1T8YCh1f8jZcyXCfGbA_yqFcafIq
```

`lib/supabase.ts` also accepts Supabase's current Expo quickstart name:

```bash
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_LLx1T8YCh1f8jZcyXCfGbA_yqFcafIq
```

The provided key is a publishable client key. It is correct for the Expo app, but it cannot run database DDL or create buckets. Applying the schema to the remote project still requires a database password, Supabase access token, service-role context, or a Dashboard SQL Editor session.

## Schema Coverage

The local migration covers the PRD and implemented mock-data feature surface:

| UI / PRD area | Schema support | Runtime status |
|---|---|---|
| Onboarding, login, OTP, profile setup | `auth.users`, `profiles` | UI only; no Supabase Auth calls yet |
| Nearby helper map | `presence`, PostGIS `find_available_helpers` RPC | UI uses mock `nearby` and local coordinates |
| Request sent / incoming / active session | `help_requests` with DB transition trigger | UI navigation only; no persisted requests |
| Chat | `conversations`, `conversation_participants`, `messages` | UI uses static/generated chat data |
| Session gallery | `session_photos` | UI uses mock gallery URLs; storage bucket not confirmed |
| Rating and karma | `ratings`, `karma_ledger`, `leaderboard` view | UI uses mock user karma/rating |
| Feed, posts, comments | `posts`, `post_likes`, `comments`, `follows` | UI uses `data/mock.ts` |
| Spots | `spots`, `spot_photos`, `spot_tips` | UI uses `data/mock.ts` |
| Notifications | `notifications`, `push_tokens` | UI uses mock notification rows; push not wired |
| Premium | `subscriptions` with RevenueCat-style entitlements | Paywall UI only; no IAP/RevenueCat integration |
| Itinerary | `itineraries`, `itinerary_steps` | UI uses mock itinerary data |
| AI camera | `ai_suggestions`, `framing_tips` | UI uses static suggestion copy |
| Family mode | `families`, `family_members` | UI uses mock family members |
| Moderation / trust | `reports`, `blocks`, `bans`, `admin_audit_log`, `user_roles` | Schema only; mobile UI affordances are not persisted |

## UI Status

The UI is fixed as a clickable Expo prototype, not as a backend-connected product.

Confirmed route coverage:

- Onboarding and auth screens exist.
- Main tabs exist: map, feed/carnet, messages, profile.
- Core help loop screens exist: request sent, incoming request, session, gallery, rating.
- Community screens exist: post detail, public profile, spots map/detail, leaderboard.
- Ecosystem screens exist: manual, premium, AI camera, itinerary, booking, family.
- System screens exist: settings and notifications.

Current UI limitations:

- Most interactive actions update local component state or navigate only.
- No screen imports Supabase data fetchers yet.
- `README.md` and `docs/FEATURE-ASSESSMENT.md` still correctly state that the app runs on `data/mock.ts`.
- Premium is a design/paywall screen only; per PRD, iOS Premium must use Apple IAP via RevenueCat, not Stripe.

## Recommended Next Build Order

1. Apply and verify the migration against the remote Supabase project.
2. Create Storage buckets and policies for `session-photos`, `avatars`, and `posts`.
3. Replace onboarding mock behavior with Supabase Auth and `profiles` reads/writes.
4. Add typed data-layer fetchers behind the existing `data/mock.ts` seam.
5. Wire the Phase 1 path first: `presence` -> `find_available_helpers` -> `help_requests` -> chat -> `session_photos` -> `ratings` / `karma_ledger`.
6. Add integration tests proving mock-data shapes and Supabase fetcher shapes match.
