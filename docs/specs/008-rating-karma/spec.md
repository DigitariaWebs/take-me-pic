# Spec: Rating, Karma, and Leaderboard

**Flow Doc**: `docs/features/phase_1/rating_karma_leaderboard_flow.md`  
**Priority**: P1

## User Story

As a participant, I want to rate the session and update karma, so that good helpers earn visible trust.

## Independent Test

Complete a request, submit one rating, verify a karma ledger entry and leaderboard/profile update.

## Acceptance Criteria

1. Only request parties can rate a completed request.
2. Each rater can rate a request once.
3. Karma deltas are produced by trusted backend logic.
4. Banned users do not appear on leaderboard.

## Minimal Data Contract

- `ratings`
- `karma_ledger`
- `profiles`
- `leaderboard`

## Execution Tasks

- [ ] Define karma rules.
- [ ] Add rating submit data-layer function.
- [ ] Add trusted karma update path.
- [ ] Wire rating screen and leaderboard.
- [ ] Test duplicate and non-party ratings.

