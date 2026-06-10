# Schema Checkout Report

## Scope
- Compare `supabase/migrations/0001_initial_schema.sql` against:
  - product specs in `docs/specs`
  - feature flows in `docs/features`
  - current Supabase code usage in `src`
- Validate current remote Supabase project state after migration attempt.

## Runtime Validation (Supabase MCP)
- Project checked: `oxexcljzzemfenzogcnz` (`Take-my-pic`)
- `list_tables(public)` => 33 tables
- `list_migrations` => 14 entries
- `execute_sql` for `find_available_helpers` and `accept_help_request` => both present
- `execute_sql` table count => `33`

## Result
- **Pass** for runtime checkout: initial schema is present in the target project and key RPCs exist.

## Static Alignment Summary
- SQL provides broad module coverage (`profiles`, `presence`, `help_requests`, chat/session, feed/spots, moderation/admin, subscriptions/bookings, itinerary/family, notifications).
- Current codebase Supabase calls are limited to:
  - `profiles`
  - `leaderboard`
- With empty runtime DB, current Supabase data paths cannot function yet.

## Spec Gaps Still Open
1. Safety filtering (blocked/banned) is required by trust and feed specs and needs explicit query/policy enforcement in acceptance and feed paths.
2. Presence privacy and stale-presence handling need tightening against `docs/specs/005-presence-nearby/spec.md`.
3. `session_photos` upload policy should validate request-party membership at insert-time.

## Admin Panel Implications
- Admin panel can start against live data now that schema bootstrap is complete.
- First operational slice should center on:
  - `user_roles`
  - `reports`
  - `bans`
  - `admin_audit_log`
- Implement privileged write paths as RPC/server actions with explicit role checks.

## Re-check Commands/Operations
- Supabase MCP `list_tables` for `public` with `verbose=true`
- Supabase MCP `list_migrations`
- Supabase MCP `execute_sql` checks:
  - table count
  - required functions (`find_available_helpers`, `accept_help_request`)
  - RLS enabled/forced flags
  - key policy existence for moderation tables
