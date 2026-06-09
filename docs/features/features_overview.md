# Take Me Pic Feature Overview

Sources: `Take-Me-Pic-Dossier.pdf` via `Take-Me-Pic-PRD-and-Assessment.md`, current Expo routes in `app/`, mock contracts in `data/mock.ts`, and the current Supabase schema docs.

## Current Product State

Take Me Pic is a complete clickable Expo prototype backed by `data/mock.ts`. The UI covers the dossier's 27-screen catalogue plus auth recovery flows, but no screen currently calls Supabase at runtime.

## Feature Inventory

| Phase | Feature area | User-facing screens | Current UI state | Backend/schema state |
|---|---|---|---|---|
| Phase 1 | Onboarding, login, OTP, profile setup | `(onboarding)/index`, `intro`, `signup`, `login`, `otp`, `profile`, `forgot`, `reset` | Implemented as local UI flows | `profiles` models identity; Supabase Auth not wired |
| Phase 1 | Proximity and presence | `(tabs)/index`, `user/[id]` | Nearby map, face-pins, filters, mini profiles | `presence`, PostGIS RPC `find_available_helpers` |
| Phase 1 | Help request and matching | `request/sent`, `request/incoming` | Sent and incoming request screens with local timing/navigation | `help_requests` with DB transition trigger |
| Phase 1 | Realtime session chat | `chat/[id]`, `(tabs)/messages` | Inbox, chat, quick replies, typing, attachments, voice UI | `conversations`, `conversation_participants`, `messages`; needs richer realtime plan |
| Phase 1 | Photo session and transfer | `session/index`, `session/gallery` | Viewfinder, capture count, gallery favorites | `session_photos`; Storage buckets/policies not confirmed |
| Phase 1/2 | Rating, karma, leaderboard | `session/rating`, `stars`, profiles | Star rating, karma display, TMP Stars | `ratings`, `karma_ledger`, `leaderboard` view |
| Phase 2 | Community feed | `(tabs)/carnet`, `post/[id]`, `user/[id]` | Posts, likes, comments, follow affordances | `posts`, `post_likes`, `comments`, `follows` |
| Phase 2 | Photo spots | `spots/index`, `spots/[id]` | Spots map/detail, tips, photos | `spots`, `spot_photos`, `spot_tips` |
| Phase 2 | Premium | `premium` | Paywall design only | `subscriptions` for RevenueCat-style entitlements; IAP not wired |
| Phase 2/3 | Bookings and B2B monetization | `booking` | Booking/payment screen prototype | `bookings`, `businesses`, `sponsored_campaigns` |
| Phase 3 | AI PhotoHelper | `ai-camera`, `manual` | Static suggestions and guide cards | `ai_suggestions`, `framing_tips` |
| Phase 3 | Itineraries | `itinerary` | Daily itinerary prototype | `itineraries`, `itinerary_steps` |
| Phase 3 | Family mode | `family` | Family members and location-sharing UI | `families`, `family_members` |
| Cross-cutting | Notifications | `notifications` | In-app notification list with read state | `notifications`, `push_tokens`; push not wired |
| Cross-cutting | Trust, safety, moderation | Multiple screens have report/block affordances | Mostly local UI affordances | `reports`, `blocks`, `bans`, `admin_audit_log`, `user_roles` |
| Cross-cutting | Localization and settings | `settings`, i18n files | FR-first with EN/ES/AR files present | Client-side only |

## Recommended Reading Order

1. `docs/specs/001-take-me-pic-platform/spec.md` - full extracted product spec.
2. `docs/specs/001-take-me-pic-platform/plan.md` - phased implementation plan.
3. `docs/specs/003-feature-modules/spec.md` - module-level specs for the non-chat feature set.
4. `docs/specs/004-auth-onboarding/spec.md` - small execution spec for auth/onboarding/profile.
5. `docs/specs/002-realtime-session-chat/spec.md` - focused realtime messaging spec.
6. `docs/specs/002-realtime-session-chat/data-model.md` - proposed realtime message schema.
7. `docs/specs/000-condensed-execution/condensed-feature-specs.md` - smallest execution slices.
8. `docs/FEATURE-SPEC-COVERAGE.md` - dossier/PRD story-by-story coverage check.

## Split Small Specs

- `docs/specs/004-auth-onboarding/spec.md`
- `docs/specs/005-presence-nearby/spec.md`
- `docs/specs/006-help-request-matching/spec.md`
- `docs/specs/007-session-photo-transfer/spec.md`
- `docs/specs/008-rating-karma/spec.md`
- `docs/specs/009-notifications-push/spec.md`
- `docs/specs/010-community-feed/spec.md`
- `docs/specs/011-photo-spots/spec.md`
- `docs/specs/012-premium-entitlements/spec.md`
- `docs/specs/013-bookings-sponsored/spec.md`
- `docs/specs/014-ai-photohelper/spec.md`
- `docs/specs/015-itinerary/spec.md`
- `docs/specs/016-family-mode/spec.md`
- `docs/specs/017-trust-safety-admin/spec.md`
- `docs/specs/018-localization-settings/spec.md`

## Small Feature Flow Docs

### Phase 1

- `docs/features/phase_1/onboarding_profile_verification_flow.md`
- `docs/features/phase_1/proximity_presence_flow.md`
- `docs/features/phase_1/help_request_matching_flow.md`
- `docs/features/phase_1/realtime_session_chat_flow.md`
- `docs/features/phase_1/session_photo_transfer_flow.md`
- `docs/features/phase_1/rating_karma_leaderboard_flow.md`

### Phase 2

- `docs/features/phase_2/community_feed_flow.md`
- `docs/features/phase_2/photo_spots_flow.md`
- `docs/features/phase_2/premium_entitlements_flow.md`
- `docs/features/phase_2/bookings_sponsored_monetization_flow.md`

### Phase 3

- `docs/features/phase_3/ai_photohelper_flow.md`
- `docs/features/phase_3/itinerary_flow.md`
- `docs/features/phase_3/family_mode_flow.md`

### Cross-Cutting

- `docs/features/cross_cutting/notifications_flow.md`
- `docs/features/cross_cutting/trust_safety_admin_flow.md`
- `docs/features/cross_cutting/localization_settings_flow.md`

## Backend Integration Principle

Keep the existing named data seam intact. Screens should continue importing feature data through a single data layer; implementation should replace mock exports with typed fetchers behind that seam rather than scattering Supabase calls through screens.
