# TASK-004 - Wire Nearby Presence and Helper Map

Status: Backlog
Priority: P1
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Core help loop
Owner: Agent

## Purpose

Replace mock nearby helpers with Supabase-backed presence so requesters can see trusted available helpers near them.

## Scope

- Add `setAvailability` and `findAvailableHelpers` feature API functions.
- Wire the map/discover screen to backend helpers behind the existing UI.
- Use the `find_available_helpers` RPC for radius lookup.
- Exclude banned, blocked, unavailable, and stale-presence users.
- Handle denied location permission without writing precise presence.

## User Flow

Verified user opens map

.

App requests location permission

.

Available helpers are loaded by radius

.

Requester sees trusted face-pins with karma/profile signals

## Acceptance Criteria

- [ ] Location denied state is explicit and does not write precise presence.
- [ ] Available status writes a scoped presence row.
- [ ] Nearby lookup returns helpers by radius and excludes unsafe users.
- [ ] Stale presence no longer appears.
- [ ] UI keeps the approved map design.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Source docs: `docs/specs/005-presence-nearby/spec.md`, `docs/features/phase_1/proximity_presence_flow.md`.
- Keep precise GPS session-scoped and privacy-aware.
- Use PostGIS/RPC; avoid client-side global location filtering.

## Dependencies

- TASK-002 completed.

## Verification

- Manual permission granted/denied paths.
- Seeded nearby helper query.
- Radius boundary check.
