# Take Me Pic Agent Board

Project: Take Me Pic Mobile
Current focus: Supabase-backed authentication and trusted profile foundation
Current milestone: Phase 1 MVP — Auth first
Updated: 2026-06-12

## Columns

- Backlog
- Ready
- In Progress
- Review
- Blocked
- Done

## Current Tasks

| Task | Title | Status | Owner | Priority |
| --- | --- | --- | --- | --- |
| TASK-001 | Wire Supabase Auth shell and route gate | Done | Agent | P0 |
| TASK-002 | Bootstrap profiles and auth gates | Done | Agent | P0 |
| TASK-003 | Verify avatar storage and profile media upload | Done | Agent | P0 |
| TASK-004 | Wire nearby presence and helper map | Done | Agent | P1 |
| TASK-005 | Wire help request create and accept lifecycle | Done | Agent | P1 |
| TASK-006 | Wire realtime session chat | Done | Agent | P1 |
| TASK-007 | Wire session photo transfer | Done | Agent | P1 |
| TASK-008 | Wire rating, karma, and leaderboard | Done | Agent | P1 |
| TASK-009 | Wire push notification registration and delivery | Backlog | Agent | P1 |
| TASK-010 | Wire trust, safety, and reporting flows | Backlog | Agent | P1 |
| TASK-011 | Add Phase 1 analytics and integration hardening | Backlog | Agent | P1 |
| TASK-012 | Wire community feed backend slice | Backlog | Agent | P2 |
| TASK-013 | Wire photo spots backend slice | Backlog | Agent | P2 |
| TASK-014 | Prepare premium entitlements foundation | Backlog | Agent | P2 |

## Recommended Start

Start with TASK-001. It is the first dependency for everything else because the app needs a reliable Supabase session and route gate before profile, presence, request, chat, photo transfer, or reporting can be safely wired.

Then do TASK-002 and TASK-003 before moving into map/request flows.

## Auth-First Implementation Steps

1. Confirm `.env` has `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
2. Verify Supabase Auth providers and redirect/deep-link settings for Expo.
3. Add an app-entry route gate: unauthenticated users go to onboarding, authenticated users missing profile go to profile setup, complete users go to tabs.
4. Wire login, signup, OTP, reset password, and logout screens to `authApi`.
5. Replace demo auth behavior, including hard-coded OTP and direct tab navigation.
6. Persist and expose session state through `AuthProvider`.
7. Create or update the `profiles` row after verified signup.
8. Add profile completion and banned/unverified gates before map/request/helper actions.
9. Add tests around auth success, auth failure, session restore, and profile write behavior.

## Dependency Order

1. TASK-001 - Auth shell and route gate.
2. TASK-002 - Profile bootstrap and auth gates.
3. TASK-003 - Avatar storage and profile media.
4. TASK-004 - Presence and nearby helper map.
5. TASK-005 - Help request lifecycle.
6. TASK-006 - Realtime session chat.
7. TASK-007 - Session photo transfer.
8. TASK-008 - Rating, karma, and leaderboard.
9. TASK-009 - Push notifications.
10. TASK-010 - Trust and safety reporting.
11. TASK-011 - Phase 1 analytics and integration hardening.
12. TASK-012 to TASK-014 - Phase 2 backlog.

## Working Rules

- Keep tasks small and vertical.
- Preserve the approved UI; wire behavior through feature APIs/hooks.
- Do not expose service-role or secret keys in client code.
- Do not use user-editable metadata for authorization.
- Read `docs/WEB-BACKEND-SYNC.md` before wiring any Supabase-backed feature:
  the web/admin repo shares this database and ships schema, RLS, and
  staff-RPC changes that affect mobile behavior (spots pre-moderation,
  content soft-hide, report targets, ban semantics, karma ledger staff
  read). Whoever changes the shared schema updates that file AND the web
  repo's `docs/MOBILE-SYNC-NOTES.md`.
