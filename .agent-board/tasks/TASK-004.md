# TASK-004 - Wire Nearby Presence and Helper Map

Status: Review
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
- Move the map visibility toggle (`visible sur la carte`) from settings to the map/home screen as the single entry/exit control for presence sharing.
- Remove `visible sur la carte` from settings.
- Remove profile role buttons (`je veux une photo`, `je veux aider`) from the profile screen.
- Keep helper discovery visible when presence sharing is off, but disable helper-offer/presence-broadcast actions until the user explicitly enables map visibility.
- Use event-driven presence updates only; do not add heartbeat polling.
- Refresh presence when the user taps the current-location button (explicit refresh action).

## User Flow

Verified user opens map

.

User toggles map visibility on

.

App requests location permission

.

App writes scoped presence only after explicit opt-in and permission grant

.

User taps current-location button to refresh location/presence when needed

.

Available helpers are loaded by radius

.

Requester sees trusted face-pins with karma/profile signals

## Acceptance Criteria

- [x] Location denied state is explicit and does not write precise presence. (useMapPresence returns null on denial; explicit on-map note; no write)
- [x] Presence is never written when visibility toggle is off. (writes only in enable/refresh paths)
- [x] Turning visibility on writes one scoped presence update after permission grant. (enable: locate → setAvailability)
- [x] Turning visibility off clears or sets offline presence server-side. (goOffline upsert — verified via probe)
- [x] Current-location button refreshes location and triggers one explicit presence refresh when visibility is on. (refresh())
- [x] No heartbeat timer/background interval is used for presence updates. (no setInterval anywhere; event-driven only)
- [x] Nearby lookup returns helpers by radius and excludes unsafe users. (find_available_helpers RPC — verified via probe)
- [ ] Stale presence no longer appears. (server-side via RPC updated_at filter — needs seeded stale row to confirm)
- [x] UI keeps the approved map design. (added only a current-location button; pins/chrome unchanged)
- [ ] Map loading is measured and classified:
  - acceptable: first map paint <= 2.0s on normal network/device
  - target: first map paint <= 1.0s for MVP seeded nearby query in normal conditions
  - issue: repeated loads > 2.0s or visible jank/freeze during pan/zoom
- [x] Settings no longer contains `visible sur la carte`. (confirmed absent)
- [x] Profile no longer shows `je veux une photo` and `je veux aider`. (role buttons removed)
- [x] `npm run typecheck` passes.

## Implementation Notes (this PR)

- Presence data layer (`src/features/presence`) verified against the live DB with
  the publishable key: presence write (PostGIS geography as EWKT), the RPC
  lookup, and go-offline all succeed.
- **RPC coordinate gap:** `find_available_helpers` returns profile rows without
  per-helper location/distance, so map pins use real helper identity with a
  cosmetic scatter position/distance. Returning location + distance_m from the
  RPC is a backend follow-up (added to `docs/next-meeting-questions.md`).
- Language filter is not applied to live helpers (profile languages are names,
  the filter chips are flag codes) — rating/verified/sort/distance are applied.
- Runtime device verification (permission flow, toggle write/offline, refresh)
  pending the standalone build + Maestro/manual pass.

## Technical Notes

- Source docs: `docs/specs/005-presence-nearby/spec.md`, `docs/features/phase_1/proximity_presence_flow.md`.
- Keep precise GPS session-scoped and privacy-aware.
- Use PostGIS/RPC; avoid client-side global location filtering.
- Make the current-location button semantics explicit in UI copy (locate + refresh).
- Recommended Expo/React Native implementation approach:
  - use one map screen state machine (`idle`, `locating`, `loading_helpers`, `ready`, `error`) to avoid inconsistent UI states
  - render map shell first, then load helpers asynchronously; do not block first paint on helper query
  - debounce user-driven filter/radius changes before RPC calls
  - cache last successful nearby result briefly (short TTL) for fast return to map
  - cap marker count for initial render and progressively show more only when needed
  - keep server-side geo filtering in RPC; do not move distance filtering to client for large sets

## Dependencies

- TASK-002 completed.

## Verification

- Manual permission granted/denied paths.
- Manual visibility toggle on/off and explicit refresh-on-current-location path.
- Seeded nearby helper query.
- Radius boundary check.
