# Next Meeting Questions

## Context

Open product and engineering questions to resolve before implementation locks.

## Questions

1. Without heartbeat, what stale-presence policy do we want for MVP?
   - Proposed baseline: presence updates are event-driven (toggle on/off, app background, permission revoke, current-location refresh tap).
   - Decision needed: TTL duration for `updated_at` filtering in `find_available_helpers`, and whether to enforce a one-time foreground refresh when presence is on and data is older than the TTL window.

2. `find_available_helpers` returns profile rows only — no per-helper location or distance.
   - Impact: the map currently places real helper identities at cosmetic scatter positions and shows approximate distances.
   - Decision needed: extend the RPC to return `location` (or `distance_m`) so pins sit at real coordinates and distances are accurate. Confirm we expose coarse/snapped location, not precise GPS, for privacy.
