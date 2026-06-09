# Implementation Plan: Take Me Pic Platform

**Branch**: `001-take-me-pic-platform` | **Date**: 2026-06-08 | **Spec**: `docs/specs/001-take-me-pic-platform/spec.md`

## Summary

Take Me Pic needs to move from a mock-backed Expo prototype to a Supabase-backed MVP while preserving the existing UI and data seam. The plan prioritizes the Phase 1 help loop: Auth/profile, geospatial presence, request matching, realtime chat, secure photo transfer, ratings, and karma.

## Technical Context

**Language/Version**: TypeScript 6, React 19, React Native 0.85, Expo SDK 56  
**Primary Dependencies**: Expo Router, Supabase JS, AsyncStorage, React Native maps/SVG UI components  
**Storage**: Supabase Postgres/PostGIS, Supabase Storage, local queued chat state  
**Testing**: TypeScript check now; add Supabase/RLS integration tests and repository-layer unit tests  
**Target Platform**: iOS-first Expo mobile app, Android later  
**Project Type**: Mobile app with managed backend  
**Performance Goals**: Nearby helper query under 1 second at MVP scale; realtime message fanout under 1 second on healthy network  
**Constraints**: Preserve UI, avoid scattering backend calls into screens, keep RLS enabled on exposed tables, no service-role key in client  
**Scale/Scope**: 35 route files, 27-screen dossier catalogue plus auth/system flows

## Constitution Check

- Preserve the existing UI and named data seam.
- Add backend integration incrementally by feature module.
- Test module behavior and state transitions, not component internals.
- Keep trust/safety and RLS as first-order requirements.

## Project Structure

### Documentation

```text
docs/
  features/
    features_overview.md
    phase_1/
      realtime_session_chat_flow.md
  specs/
    001-take-me-pic-platform/
      spec.md
      plan.md
    002-realtime-session-chat/
      spec.md
      plan.md
      data-model.md
      tasks.md
      contracts/
        realtime-events.md
```

### Source Code

```text
app/                  # Expo Router screens
components/           # shared UI system
data/mock.ts          # current seam and mock contract
lib/supabase.ts       # Supabase client
supabase/migrations/  # schema migrations
```

**Structure Decision**: This is a mobile app with a managed backend. Keep feature documentation in `docs/features/`, Spec Kit-style artifacts in `docs/specs/`, and backend schema in `supabase/migrations/`.

## Phase Plan

### Phase 0 - Backend Baseline

- Apply the local migration to the Supabase project with database credentials.
- Verify Data API exposure and authenticated grants.
- Create Storage buckets for avatars, posts, and session photos.
- Generate typed Supabase table/RPC types.

### Phase 1 - Core Help Loop

- Wire Supabase Auth into onboarding and profile setup.
- Implement presence update and nearby helper lookup.
- Implement help request create/accept/session/complete/rate state transitions.
- Implement realtime chat and session photo transfer.
- Implement rating and karma ledger writes.

### Phase 2 - Community and Monetization

- Replace feed, comments, likes, follows, spots, and tips with typed fetchers.
- Add RevenueCat entitlement sync for Premium.
- Keep Stripe only for bookings and B2B billing.

### Phase 3 - Ecosystem and Operations

- Add AI suggestion persistence, itineraries, family mode, and moderation flows.
- Connect admin repository to shared RBAC and audit schema.

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Remote schema not applied | App cannot read/write Supabase data | Apply migration and verify with REST/RPC probes |
| Supabase Data API exposure disabled for new tables | Tables exist but client gets schema cache errors | Keep explicit grants and verify Dashboard exposure settings |
| Realtime messages are under-modeled | Offline retry, attachments, read states become fragile | Use the focused realtime spec before coding |
| RLS recursion or missing policies | Conversation reads fail or overexpose data | Test member/non-member access through authenticated clients |
| Premium billed through Stripe on iOS | App Store rejection | Use Apple IAP via RevenueCat |

## Verification Strategy

- Unit-test pure state machines: help requests, karma ledger, entitlement mapping.
- Integration-test Supabase RLS with party/non-party users.
- Test data-fetcher shape parity against the existing mock contract.
- Reproduce offline/reconnect chat behavior with deterministic client ids.
