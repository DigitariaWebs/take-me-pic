# TASK-008 - Wire Rating, Karma, and Leaderboard

Status: Backlog
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

- [ ] Rating can be submitted only for completed participant sessions.
- [ ] Duplicate rating is rejected or idempotent.
- [ ] Karma/trust signals update on profile and helper pins.
- [ ] Leaderboard reads backend data.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Source docs: `docs/specs/008-rating-karma/spec.md`, `docs/features/phase_1/rating_karma_leaderboard_flow.md`.
- Keep reputation changes deterministic and server-owned.

## Dependencies

- TASK-007 completed.

## Verification

- Manual completed-session rating path.
- Duplicate rating check.
- Leaderboard refresh check.
