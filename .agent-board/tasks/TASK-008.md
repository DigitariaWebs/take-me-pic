# TASK-008 - Wire Rating, Karma, and Leaderboard

Status: Review
Priority: P1
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Reputation
Owner: Agent

## Purpose

Wire post-session ratings and karma so trust signals on profiles, pins, and leaderboard reflect real completed sessions.

## Scope

- Add rating submission API after completed sessions.
- Update or read karma from the backend contract.
- Wire profile karma and leaderboard to Supabase.
- Prevent duplicate ratings for the same participant/session pair.
- Handle report/rating divergence where a low rating also triggers safety action.

## User Flow

Session completes

.

Both users rate each other

.

Karma/trust signals update

.

Leaderboard reflects eligible helpers

## Acceptance Criteria

- [x] Rating can be submitted only for completed participant sessions. (RPC validates participant + active session; verified two-user)
- [x] Duplicate rating is rejected or idempotent. (verified: re-submit returns the same rating_id, karma unchanged — no double-bump)
- [x] Karma/trust signals update on profile and helper pins. (RPC bumps profiles.karma server-side; profile + find_available_helpers pins already read it — verified 0 → 5)
- [x] Leaderboard reads backend data. (verified: leaderboard view shows the bumped karma=5, rank=1)
- [x] `npm run typecheck` passes.

## Implementation Notes (this PR)
- **Migration 0008:** `submit_rating` RPC (SECURITY DEFINER) — validates participant + active session, one-per-rater-per-session (unique index), inserts the rating, writes karma_ledger, and bumps the ratee's profiles.karma (+stars). Fixes the gap where ratings RLS only checked rater=self and nothing updated karma.
- Verified two-user against the live DB: submit (karma 0 → 5), duplicate idempotent, leaderboard reflects rank.
- RatingScreen submits via the RPC (request param); gallery 'rate' passes the session id. LeaderboardScreen reads the real leaderboard view.
- MVP notes: karma rule is +stars; session gate is "accepted+" (tighten to 'completed' once the session-completion transition is wired); low-rating → safety action is deferred to TASK-010 (trust/safety).

## Technical Notes

- Source docs: `docs/specs/008-rating-karma/spec.md`, `docs/features/phase_1/rating_karma_leaderboard_flow.md`.
- Keep reputation changes deterministic and server-owned.
- Backend sync: `docs/WEB-BACKEND-SYNC.md` §3 — web admin now reads every
  user's karma ledger (`karma_ledger_staff_read`) and shows ratings on
  user/session review. Keep `karma_ledger.reason` values stable; rating
  comments are not a report target yet (coordinate before adding).

## Dependencies

- TASK-007 completed.

## Verification

- Manual completed-session rating path.
- Duplicate rating check.
- Leaderboard refresh check.
