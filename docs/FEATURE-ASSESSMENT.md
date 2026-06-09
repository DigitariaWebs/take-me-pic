# Take Me Pic — Feature Assessment (code vs. PRD)

What the **mobile repo actually contains** (extracted from `app/`, `data/mock.ts`,
`components/`, `i18n/`) measured against `Take-Me-Pic-PRD-and-Assessment.md`.

## Verdict

The repo is exactly what the PRD's executive summary claims: a **complete clickable
prototype on a mock data layer, with no backend**. Every screen reads named exports
from `@/data/mock`; there is no `fetch`, no API client, no auth, no persistence. The
data-fetcher seam the PRD calls "the project's most important architectural asset"
is present and intact — which is what makes the Supabase schema a drop-in behind it.

## Screen inventory (actual routes in `app/`)

35 route files implement the 27-screen catalogue plus auth sub-flows:

| Area | Routes present | PRD screen(s) |
|---|---|---|
| Onboarding | `(onboarding)/` index, intro, signup, login, otp, profile, forgot, reset | 01–04 (+ auth flows beyond the 27) |
| Tabs | `(tabs)/` index (map), carnet (feed), messages, moi (profile) | 05, 13, 14 |
| Help loop | `request/sent`, `request/incoming`, `session/index`, `session/gallery`, `session/rating` | 06–12 |
| Chat | `chat/[id]` | 09 |
| Community | `post/[id]`, `user/[id]`, `spots/index`, `spots/[id]`, `stars` | 14–19 |
| Guides/Premium | `manual`, `premium` | 20, 21 |
| Ecosystem | `ai-camera`, `itinerary`, `booking`, `family` | 22–25 |
| System | `settings`, `notifications` | 26, 27 |

## Mock data shapes → confirmed feature surface

`data/mock.ts` defines the data contract every screen depends on:

- **`User`** — karma, rating, photosCount, languages[], verified, followers/following, spots. → drives `profiles`.
- **`Seeker`** — the other side of the marketplace (people needing a photo). → `help_requests`.
- **`nearby`** (generated pool) — map face-pins with distance/language/rating/verified filters. → `presence` + `find_available_helpers`.
- **`Post`** + comments + hearts + badge. → `posts`, `comments`, `post_likes`.
- **`Spot`** + tips + thumbs + bestTime. → `spots`, `spot_tips`, `spot_photos`.
- **`Notification`** (kinds: karma/request/community/badge/spot). → `notifications`.
- **`ManualSecret`** framing cards. → `framing_tips`.
- **`itinerarySteps`** (photo/coffee/ticket/price). → `itineraries`, `itinerary_steps`.
- **`familyMembers`** (relation, location sharing). → `families`, `family_members`.
- **`leaderboard`** (rank/score). → `leaderboard` view.
- **`galleryPhotos`** (favorite flag). → `session_photos`.

## Alignment with the PRD

| PRD claim | In the repo? | Notes |
|---|---|---|
| Expo SDK 56 / RN 0.85 / React 19.2 / TS 6, New Architecture | ✅ | `package.json` matches exactly |
| Expo Router, 27 screens | ✅ | 35 route files (27 + auth/system) |
| `react-native-maps` + custom SVG HandMap | ✅ | `components/HandMap.tsx`, `expo-maps` guarded in `(tabs)/index.tsx` |
| Reanimated 4 + worklets + gesture-handler | ✅ | present in deps |
| i18n FR-first, EN/AR (+RTL) | ⚠️ | `i18n/` has **fr, en, es, ar** — Spanish exists too (PRD said FR/EN/AR only) |
| Single data module seam (`data/mock.ts`) | ✅ | every screen imports by name; no backend calls |
| Backend not yet built | ✅ | confirmed — no client, no fetch, no env until now |
| Premium billing rail | ⚠️ design risk | `premium.tsx` is a paywall UI only. PRD blocker stands: must be **Apple IAP via RevenueCat**, not Stripe, on iOS — the schema models this in `subscriptions.entitlements`, not a Stripe state |
| Admin console auth | n/a here | admin lives in the **web** repo (`take-me-pic-web`); RBAC modeled here via `user_roles` for the shared backend |

## Gaps the schema closes (present as UI, absent as data model until now)

- **Verification** — `verified` is a static bool in mock; schema adds `email_verified` / `phone_verified` and the trust-gate.
- **Presence/GPS** — map pins are static; schema adds session-only `presence.location` (PRD user story 13: GPS shared only during a session).
- **State machine** — request screens imply `sent → accepted → session → rated`; schema enforces it in the DB (trigger).
- **Moderation** — one-tap report / block / ban exist as UI affordances; schema adds `reports`, `blocks`, `bans`, `admin_audit_log` (PRD P0).
- **Entitlements** — Premium paywall has no backing; schema adds `subscriptions` with a jsonb entitlement set the app reads (never a Stripe state on iOS).

## Recommended build order (matches PRD Phase 1 MVP)

1. `profiles` + Supabase Auth (email+phone) → onboarding screens.
2. `presence` + `find_available_helpers` → the map (killer query).
3. `help_requests` state machine + `conversations`/`messages` → core help loop.
4. `session_photos` (Storage) + `ratings`/`karma_ledger` → session close + karma.
5. Defer feed/spots/Premium/bookings/family to Phase 2–3 (tables already there, RLS already on).
