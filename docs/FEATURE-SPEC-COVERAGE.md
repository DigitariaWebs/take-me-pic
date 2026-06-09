# Take Me Pic — Dossier/PRD Feature Coverage

Checked on: 2026-06-08

This matrix runs the current docs against the 39 user stories extracted in `Take-Me-Pic-PRD-and-Assessment.md`.

## Coverage Summary

| Area | PRD stories | Spec coverage | Small flow coverage | Status |
|---|---:|---|---|---|
| Onboarding & profile | 1-3 | `004-auth-onboarding/spec.md` | `onboarding_profile_verification_flow.md` | Covered |
| Core help loop | 4-13 | `005`, `006`, `002`, `007` specs | proximity, help request, realtime chat, session photo flows | Covered |
| Karma/reputation | 14-17 | `008-rating-karma/spec.md` | `rating_karma_leaderboard_flow.md` | Covered |
| Community & spots | 18-21 | `010`, `011` specs | community feed, photo spots flows | Covered |
| Premium & monetization | 22-26 | `012`, `013` specs | premium entitlements, bookings/sponsored monetization flows | Covered |
| Ecosystem | 27-30 | `014`, `015`, `016` specs | itinerary, AI PhotoHelper, family flows | Covered |
| Trust/safety | 31-33 | `017-trust-safety-admin/spec.md`, architecture review | trust/safety/admin flow | Covered |
| Admin/operations | 34-38 | `017`, `013` specs, architecture review | trust/safety/admin flow; implementation lives in web repo | Covered at backend/product level |
| Localization | 39 | `018-localization-settings/spec.md` | localization/settings flow | Covered |

## Story-Level Mapping

| # | User story summary | Spec(s) | Small feature flow |
|---:|---|---|---|
| 1 | Sign up with email and phone | `001-take-me-pic-platform/spec.md`, `004-auth-onboarding/spec.md` | `phase_1/onboarding_profile_verification_flow.md` |
| 2 | Set up profile with photo, bio, languages | `001-take-me-pic-platform/spec.md`, `004-auth-onboarding/spec.md` | `phase_1/onboarding_profile_verification_flow.md` |
| 3 | Verify identity | `001-take-me-pic-platform/spec.md`, `004-auth-onboarding/spec.md` | `phase_1/onboarding_profile_verification_flow.md` |
| 4 | See available helpers nearby | `005-presence-nearby/spec.md` | `phase_1/proximity_presence_flow.md` |
| 5 | See helper face-pins with trust signals | `005-presence-nearby/spec.md` | `phase_1/proximity_presence_flow.md` |
| 6 | Request a photo with one tap | `006-help-request-matching/spec.md` | `phase_1/help_request_matching_flow.md` |
| 7 | Receive instant push for nearby request | `009-notifications-push/spec.md`, `006-help-request-matching/spec.md` | `cross_cutting/notifications_flow.md` |
| 8 | Helper accepts with happy-to-help | `006-help-request-matching/spec.md` | `phase_1/help_request_matching_flow.md` |
| 9 | Requester sees sent -> accepted status | `006-help-request-matching/spec.md` | `phase_1/help_request_matching_flow.md` |
| 10 | Quick in-app chat | `002-realtime-session-chat/spec.md` | `phase_1/realtime_session_chat_flow.md` |
| 11 | Guided viewfinder/framing | `007-session-photo-transfer/spec.md`, `014-ai-photohelper/spec.md` | `phase_1/session_photo_transfer_flow.md`, `phase_3/ai_photohelper_flow.md` |
| 12 | Secure in-app photo sharing | `007-session-photo-transfer/spec.md`, `002-realtime-session-chat/spec.md` | `phase_1/session_photo_transfer_flow.md` |
| 13 | GPS only during active session | `005-presence-nearby/spec.md`, `007-session-photo-transfer/spec.md` | `phase_1/proximity_presence_flow.md`, `phase_1/session_photo_transfer_flow.md` |
| 14 | Earn karma for taking photos | `008-rating-karma/spec.md` | `phase_1/rating_karma_leaderboard_flow.md` |
| 15 | Rate after session | `008-rating-karma/spec.md` | `phase_1/rating_karma_leaderboard_flow.md` |
| 16 | See karma on profiles/pins | `008-rating-karma/spec.md` | `phase_1/rating_karma_leaderboard_flow.md` |
| 17 | TMP Stars leaderboard | `008-rating-karma/spec.md` | `phase_1/rating_karma_leaderboard_flow.md` |
| 18 | Community feed | `010-community-feed/spec.md` | `phase_2/community_feed_flow.md` |
| 19 | Follow users | `010-community-feed/spec.md` | `phase_2/community_feed_flow.md` |
| 20 | Photo spots map/tips | `011-photo-spots/spec.md` | `phase_2/photo_spots_flow.md` |
| 21 | Spot details/framing advice | `011-photo-spots/spec.md`, `014-ai-photohelper/spec.md` | `phase_2/photo_spots_flow.md`, `phase_3/ai_photohelper_flow.md` |
| 22 | Premium subscription benefits | `012-premium-entitlements/spec.md` | `phase_2/premium_entitlements_flow.md` |
| 23 | Secure Premium payment | `012-premium-entitlements/spec.md` | `phase_2/premium_entitlements_flow.md` |
| 24 | Premium profile boost | `012-premium-entitlements/spec.md` | `phase_2/premium_entitlements_flow.md` |
| 25 | Sponsored spots | `013-bookings-sponsored/spec.md`, `011-photo-spots/spec.md` | `phase_2/bookings_sponsored_monetization_flow.md`, `phase_2/photo_spots_flow.md` |
| 26 | Geo-targeted ads | `013-bookings-sponsored/spec.md` | `phase_2/bookings_sponsored_monetization_flow.md` |
| 27 | Smart itineraries | `015-itinerary/spec.md` | `phase_3/itinerary_flow.md` |
| 28 | AI PhotoHelper | `014-ai-photohelper/spec.md` | `phase_3/ai_photohelper_flow.md` |
| 29 | Book activities/stays | `013-bookings-sponsored/spec.md`, `015-itinerary/spec.md` | `phase_2/bookings_sponsored_monetization_flow.md`, `phase_3/itinerary_flow.md` |
| 30 | TMP Family mode | `016-family-mode/spec.md` | `phase_3/family_mode_flow.md` |
| 31 | One-tap reporting | `017-trust-safety-admin/spec.md` | `cross_cutting/trust_safety_admin_flow.md` |
| 32 | Ban abusers | `017-trust-safety-admin/spec.md` | `cross_cutting/trust_safety_admin_flow.md` |
| 33 | Data privacy/GDPR | `017-trust-safety-admin/spec.md`, `005-presence-nearby/spec.md` | `cross_cutting/trust_safety_admin_flow.md`, `phase_1/proximity_presence_flow.md` |
| 34 | Secure admin console | `017-trust-safety-admin/spec.md` | `cross_cutting/trust_safety_admin_flow.md` |
| 35 | Admin dashboards/analytics | `017-trust-safety-admin/spec.md` | `cross_cutting/trust_safety_admin_flow.md` |
| 36 | Moderation queues/audit log | `017-trust-safety-admin/spec.md` | `cross_cutting/trust_safety_admin_flow.md` |
| 37 | Manage operations/payments/refunds | `013-bookings-sponsored/spec.md`, `017-trust-safety-admin/spec.md` | `phase_2/bookings_sponsored_monetization_flow.md`, `cross_cutting/trust_safety_admin_flow.md` |
| 38 | Manage content/templates/roles/integrations | `017-trust-safety-admin/spec.md` | `cross_cutting/trust_safety_admin_flow.md` |
| 39 | FR/EN/AR with RTL | `018-localization-settings/spec.md` | `cross_cutting/localization_settings_flow.md` |

## Gaps Still Present In Product/Schema

- Docs now cover all PRD stories, but implementation remains mock-backed.
- Remote Supabase project still needs migration application and verification.
- Help request acceptance requires an RPC/RLS fix before Phase 1 backend can work.
- Realtime chat needs the `002-realtime-session-chat` schema plan before UI wiring.
- Admin implementation belongs primarily in the web/admin repository, but backend RBAC/audit requirements are documented here.
