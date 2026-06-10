# Product Requirements Document

> Source of intent: **what** we are building and **why**, before how.
>
> This is the human original. The repository mirrors it to `docs/product/prd.md` for agents.
>
> Keep it concise where possible. Filled by `/write-prd`; updated by `/meeting-intake` when requirements change.

**Client:** Take Me Pic / El Jed Ahmed

**Product / Project:** Take Me Pic

**Owner / PM:** PROGIX / Digitaria delivery team

**Status:** draft

**Updated:** 2026-06-09

**Version:** 0.2

---

## Project Description

Take Me Pic is an iOS-first React Native / Expo mobile app that helps travellers, families, and groups find a trusted nearby person to take their photo. It solves the common travel problem where someone is left out of the picture, or a group must awkwardly ask an unverified stranger for help. The product delivers an instant, trust-backed help loop with profiles, verification, live coordination, secure photo sharing, ratings, and a karma reputation layer.

---

## Problem & Opportunity

The dossier and current prototype show a clear gap for travellers who want group photos without excluding someone or relying on unsafe, awkward stranger interactions. The opportunity is strongest in tourist-heavy locations where users already need help in the moment and where trust signals, language preferences, and proximity matter. The mobile prototype already covers the intended 27-screen experience, and Supabase now provides the backend foundation for auth, profiles, proximity, sessions, chat, moderation, and storage-backed flows.

### Problem

Groups need a fast, trusted way to get everyone into the photo without sharing personal contact details or exposing location outside the active session.

### Opportunity

The app can convert a frequent travel pain into a trusted local-help network, then expand into community, photo spots, premium benefits, sponsored placements, and travel services.

---

## Goals & Non-Goals

### Goals

**What success requires:**

- Deliver the Phase 1 help loop: verified user, nearby helpers, request, accept, chat/session, photo transfer, rating.
- Replace mock-backed Phase 1 screens with Supabase-backed auth, profile, request, presence, and session flows.
- Preserve the approved travel-journal UI while moving data access behind typed feature APIs.

### Business Goals

- Launch a testable MVP that can validate real-world stranger-to-stranger photo help.
- Establish the backend and trust foundation for later premium, sponsored, and booking revenue.

### User Goals

- Request or offer photo help quickly with clear trust signals.
- Keep identity, GPS, and photos protected while coordinating with a nearby stranger.

### Non-Goals

**Explicitly out of scope — protects budget and timeline:**

- Premium subscriptions, payments, sponsored spots, and bookings in the first backend slice.
- AI PhotoHelper, itineraries, and family mode in the MVP auth-first slice.
- Redesigning the approved mobile UI or replacing React Native / Expo.

---

## Users & Jobs

| User | What they are trying to do | Success looks like |
| --- | --- | --- |
| Traveller / requester | Find a trusted nearby helper to take a group photo | Request is accepted quickly and the photo is shared securely in-app |
| Helper | Offer help to someone nearby and earn reputation | Helper accepts a request, coordinates safely, completes the session, and earns karma |
| Moderator / admin | Keep the network safe | Reports, bans, audit trails, and role controls protect users |

### Primary Users

The main users are travellers, friends, couples, families, and local helpers in public tourist areas. They receive the most value from verified profiles, language signals, session-only GPS, quick chat, and secure photo sharing.

### Secondary Users

Secondary users include moderators, customer support, tourism partners, local businesses, and internal product/ops teams. They are affected by trust and safety, analytics, payments, sponsored content, and operational tooling.

---

## MVP Scope

The non-negotiables for launch, ranked. Each capability should become one or more specs via `/create-spec`.

### Included in MVP

1. Supabase Auth signup, login, OTP/password reset, session persistence, and logout.
2. Profile creation/update tied to `profiles.id = auth.uid()`, including required trust fields and avatar readiness.
3. Auth/profile gates for map, request, helper, session, and messaging actions.
4. Nearby presence and help request lifecycle using the migrated Supabase schema and RPCs.
5. Realtime coordination, secure session photo transfer, rating, karma, and reporting foundations.

### Excluded from MVP

These features are intentionally out of scope for the first release.

- Premium subscription and entitlements.
- Sponsored spots, ads, payments, bookings, refunds, and payouts.
- AI PhotoHelper, itinerary planning, and family mode.

---

## User Journey

Describe the core user journey from discovery to value received.

```text
Traveller
↓
Installs Take Me Pic and signs up
↓
Verifies account and completes profile
↓
Requests a nearby helper
↓
Coordinates through session chat and receives photo in-app
↓
Rates the session and builds trust/karma
```

### Core Journey

1. User opens onboarding and creates an account.
2. User verifies identity and completes the required profile fields.
3. User enters the map and sees available nearby helpers.
4. User sends a photo request and a helper accepts.
5. Both users coordinate, complete the photo session, share the result, and rate each other.

### Value Received

The requester gets a full-group photo without awkwardly asking an unknown person outside the app. Both parties get a safer interaction because identity, availability, chat, GPS, photo sharing, and ratings happen inside Take Me Pic.

---

## Constraints

Document all known constraints that may affect product, design, engineering, delivery, or compliance decisions.

### Delivery Constraints

- **Deadline:** TBD after Supabase-backed auth/profile slice is estimated.
- **Budget:** TBD.
- **Team capacity:** Small product/engineering team; keep slices narrow and vertical.
- **Contractual terms:** PROGIX / Digitaria delivery context; confirm ownership and production support terms.

### Platform Constraints

- **Platforms:** iOS-first mobile app; Android later through Expo; web/admin lives in the separate web repo.
- **Hosting:** Supabase for backend/auth/database/storage/realtime; Expo/EAS for mobile build and distribution.
- **Devices / browsers:** iOS target devices first; Expo Go/dev builds during development.

### Compliance & Legal Constraints

- **Compliance:** GDPR/RGPD expected because the product targets Europe and handles identity, location, chat, and photos.
- **Data privacy:** GPS must be session-scoped; personal data and photos need strict RLS/storage policies.
- **IP ownership:** TBD with client/delivery agreement.
- **Security requirements:** No service-role key in the client; RLS enabled; authorization must not trust user-editable metadata.

### Language & Market Constraints

- **Languages / i18n:** French primary; English and Arabic supported/stubbed; Arabic needs RTL validation.
- **Regions:** France/EU first, tourist-heavy markets later.
- **Accessibility:** Basic mobile accessibility required; validate contrast, labels, touch targets, and RTL behavior.

---

## Success Metrics

How we will know the product worked — measurable signals per goal.

### Product Metrics

- Signup-to-profile-complete conversion rate.
- Photo request acceptance rate within 30 seconds.
- Completed session rate and repeat usage rate.

### Business Metrics

- Weekly active users in launch geography.
- Helper/requester retention and later premium conversion readiness.

### Technical Metrics

- Crash-free session rate.
- Supabase auth/profile API success rate and latency.
- Realtime notification/message delivery reliability.

---

## Risks

### Product Risks

- Users may not trust strangers enough without stronger verification.
- Supply/demand imbalance may leave requests unanswered.
- Poor first-session quality can reduce retention quickly.

### Technical Risks

- Auth/profile wiring may expose incomplete or unverified users to gated flows.
- Storage and RLS mistakes could leak private photos or profile data.
- Realtime/push coordination may be unreliable without clear delivery semantics.

### Business / Operational Risks

- Moderation workload may rise before admin workflows are ready.
- App Store payment rules constrain future premium subscription implementation.

### Mitigations

| Risk | Mitigation |
| --- | --- |
| Untrusted or unsafe interactions | Require verified profiles, session-only GPS, ratings, reports, bans, and moderation audit logs |
| Incomplete auth/profile state | Gate Phase 1 actions behind session, profile, verification, and ban checks |
| Private data exposure | Use Supabase RLS, storage ownership paths, signed URLs, and publishable client keys only |
| Payment compliance issues | Use StoreKit/RevenueCat for digital premium and Stripe only for real-world bookings/B2B |

---

## Open Questions

Resolved before the relevant spec proceeds. These are carried into `/create-spec` interviews and should never be assumed.

- [ ] Is phone verification required before map access, or only before creating/accepting requests?
- [ ] What minimum age and country-specific eligibility rules apply?
- [ ] Which identity verification level is required for public launch beyond email/phone?
- [ ] What is the exact first TestFlight geography and target release date?

---

## Decision Log

Track important product decisions and the reasoning behind them.

- 2026-06-08 — Keep React Native / Expo for mobile — because the approved 27-screen prototype already exists and shares TypeScript/design conventions with web/admin.
- 2026-06-08 — Use Supabase as the backend foundation — because Postgres/PostGIS, Auth, Realtime, Storage, and RLS fit the proximity/trust requirements.
- 2026-06-09 — Start implementation with auth/profile — because remote Supabase bootstrap is complete and Phase 1 flows require trusted identity first.

---

## Recommended Product Phases

### Phase 1 — MVP

**Goal:** Validate safe, trusted, nearby photo-help sessions.

Included:

- Auth, profile, verification, and access gates.
- Presence, nearby helpers, request/accept, session chat, photo transfer, rating, and reports.

### Phase 2 — Growth / Retention

**Goal:** Increase repeat usage and community value.

Potential features:

- Community feed, follows, likes/comments, photo spots, leaderboards, push notifications.
- Premium entitlement foundation after app-store-compliant billing design.

### Phase 3 — Expansion / Monetization

**Goal:** Extend Take Me Pic into a travel-photo ecosystem.

Potential features:

- Sponsored spots, bookings, geo-targeted ads, itinerary planning, AI PhotoHelper, family mode.

---

## MVP Definition of Done

The MVP is ready when:

- [ ] Auth signup/login/verification/profile completion works against Supabase.
- [ ] Core Phase 1 screens no longer depend on mock data for user/session/request state.
- [ ] Help requests, acceptance, chat/session state, photo transfer, rating, and reports work in the target environment.
- [ ] Core analytics events are tracked.
- [ ] Admin or operational workflows are usable where required.
- [ ] Security and privacy requirements are satisfied.
- [ ] Product can be tested with real users in the target environment.
