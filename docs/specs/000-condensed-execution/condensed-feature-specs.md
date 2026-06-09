# Condensed Execution Specs

Checked on: 2026-06-08

This file runs the small execution specs against the detailed feature-flow docs. Use this as the implementation handoff: each row is intentionally narrow enough to become one agent task or ticket.

## Execution Slices

| Slice | Priority | Flow doc | Condensed spec / source | Done when |
|---|---|---|---|---|
| Auth, onboarding, profile | P1 | `docs/features/phase_1/onboarding_profile_verification_flow.md` | `docs/specs/004-auth-onboarding/spec.md` | User can sign up, verify, complete profile, and persist session |
| Presence and nearby helper lookup | P1 | `docs/features/phase_1/proximity_presence_flow.md` | `docs/specs/005-presence-nearby/spec.md` | Map reads backend helpers through indexed PostGIS RPC |
| Help request create/accept | P1 | `docs/features/phase_1/help_request_matching_flow.md` | `docs/specs/006-help-request-matching/spec.md` | Request is created and accepted through atomic RPC with conversation |
| Realtime session chat | P1 | `docs/features/phase_1/realtime_session_chat_flow.md` | `docs/specs/002-realtime-session-chat/spec.md` | Participants exchange idempotent realtime messages with read state |
| Session photo transfer | P1 | `docs/features/phase_1/session_photo_transfer_flow.md` | `docs/specs/007-session-photo-transfer/spec.md` | Session photos upload to private storage and are party-readable |
| Rating, karma, leaderboard | P1 | `docs/features/phase_1/rating_karma_leaderboard_flow.md` | `docs/specs/008-rating-karma/spec.md` | Completed session produces one rating and deterministic karma update |
| Notifications and push | P1/P2 | `docs/features/cross_cutting/notifications_flow.md` | `docs/specs/009-notifications-push/spec.md` | In-app notifications persist; push token registered; chat/request push planned |
| Community feed | P2 | `docs/features/phase_2/community_feed_flow.md` | `docs/specs/010-community-feed/spec.md` | Feed reads/writes posts, likes, comments, follows from backend |
| Photo spots | P2 | `docs/features/phase_2/photo_spots_flow.md` | `docs/specs/011-photo-spots/spec.md` | Spots/tips/photos load from backend and support contributions |
| Premium entitlements | P2 | `docs/features/phase_2/premium_entitlements_flow.md` | `docs/specs/012-premium-entitlements/spec.md` | RevenueCat entitlement unlocks Premium without Stripe |
| Bookings and sponsored monetization | P2/P3 | `docs/features/phase_2/bookings_sponsored_monetization_flow.md` | `docs/specs/013-bookings-sponsored/spec.md` | Stripe-backed booking/sponsored state is separate from Premium |
| AI PhotoHelper | P3 | `docs/features/phase_3/ai_photohelper_flow.md` | `docs/specs/014-ai-photohelper/spec.md` | Static guide works; provider-backed suggestions are isolated |
| Smart itinerary | P3 | `docs/features/phase_3/itinerary_flow.md` | `docs/specs/015-itinerary/spec.md` | Itinerary and ordered steps load from backend |
| Family mode | P3 | `docs/features/phase_3/family_mode_flow.md` | `docs/specs/016-family-mode/spec.md` | Family membership and sharing state are RLS-protected |
| Trust, safety, admin ops | P1 | `docs/features/cross_cutting/trust_safety_admin_flow.md` | `docs/specs/017-trust-safety-admin/spec.md` | Reports/blocks/bans/RBAC/audit paths are enforced server-side |
| Localization and settings | P1/P2 | `docs/features/cross_cutting/localization_settings_flow.md` | `docs/specs/018-localization-settings/spec.md` | Locale/settings persist and RTL path is defined |

## First Backend Execution Order

1. Auth, onboarding, profile.
2. Presence and nearby helper lookup.
3. Help request create/accept.
4. Realtime session chat.
5. Session photo transfer.
6. Rating, karma, leaderboard.

This order matches the Phase 1 MVP path and avoids wiring lower-priority community/monetization features before the core help loop works.

## Condensed Spec Rules

- Each slice must preserve the existing UI and named data seam.
- Each slice must be independently testable.
- Each slice must state its RLS/security boundary before implementation.
- Unknown product decisions stay in the feature-flow doc's `Open Questions`.
