# Spec: Presence and Nearby Helpers

**Flow Doc**: `docs/features/phase_1/proximity_presence_flow.md`  
**Priority**: P1

## User Story

As a requester, I want to see available trusted helpers near me, so that I can request a photo quickly.

## Independent Test

Seed profiles and presence rows, call nearby lookup from the map data layer, and verify helpers are returned by radius/trust rules without exposing raw global location data.

## Acceptance Criteria

1. Location permission denied shows fallback and does not write precise presence.
2. Available status writes a scoped `presence` row with timestamp and radius.
3. Nearby lookup uses PostGIS RPC and excludes banned/blocked/offline users.
4. Stale presence stops appearing after expiry.

## Minimal Data Contract

- `presence`: `user_id`, `status`, `location`, `share_radius_m`, `updated_at`
- `profiles`: public helper trust fields
- RPC: `find_available_helpers(lng, lat, radius_m)`

## Execution Tasks

- [ ] Tighten presence privacy policy/RPC access.
- [ ] Add `setAvailability` and `findAvailableHelpers` data-layer functions.
- [ ] Wire map to backend data behind current mock seam.
- [ ] Test permission denied, stale presence, and radius boundaries.

