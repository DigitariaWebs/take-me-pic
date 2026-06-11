# Next Meeting Questions

## Context

Open product and engineering questions to resolve before implementation locks.

## Questions

1. Without heartbeat, what stale-presence policy do we want for MVP?
   - Proposed baseline: presence updates are event-driven (toggle on/off, app background, permission revoke, current-location refresh tap).
   - Decision needed: TTL duration for `updated_at` filtering in `find_available_helpers`, and whether to enforce a one-time foreground refresh when presence is on and data is older than the TTL window.
