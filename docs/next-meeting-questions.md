# Next Meeting Questions

## Context

Open product and engineering questions to resolve before implementation locks.

## Questions

1. Without heartbeat, what stale-presence policy do we want for MVP?
   - Proposed baseline: presence updates are event-driven (toggle on/off, app background, permission revoke, current-location refresh tap).
   - Decision needed: TTL duration for `updated_at` filtering in `find_available_helpers`, and whether to enforce a one-time foreground refresh when presence is on and data is older than the TTL window.

2. ~~`find_available_helpers` returns no per-helper location~~ **(resolved — migration 0005 returns lat/lng + distance_m; pins now sit at real positions).**
   - Open privacy follow-up: 0005 returns the exact presence point. Decide whether to expose **coarse/snapped** location instead of precise GPS for nearby helpers.
