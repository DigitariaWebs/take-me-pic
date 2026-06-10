# Specs Snapshot (Admin-Oriented)

This snapshot captures the admin-panel-relevant outcomes without replacing canonical specs.

## Trust, Safety, Admin Ops
Source: `docs/specs/017-trust-safety-admin/spec.md`
- Users can submit reports/blocks from supported surfaces.
- Staff role is mandatory for moderation actions.
- Ban/report updates must write `admin_audit_log` entries.
- Banned/blocked users must be filtered from matching and social surfaces.

## Help Request and Matching
Source: `docs/specs/006-help-request-matching/spec.md`
- Helper acceptance must be atomic and single-winner.
- Acceptance should create linked conversation + participants.
- Race conditions (`accept/cancel/expire`) must reconcile to one canonical state.
- RPC contract `accept_help_request(request_id)` is now implemented and verified on the target Supabase project.

## Presence and Nearby
Source: `docs/specs/005-presence-nearby/spec.md`
- Presence updates are scoped with radius + timestamp.
- Nearby helper lookup uses PostGIS RPC.
- Helpers should be filtered by trust/safety rules.
- Stale presence should expire from results.

## Realtime Session Chat
Source: `docs/specs/002-realtime-session-chat/spec.md`
- Durable message timeline with participant-only visibility.
- Idempotent send/retry behavior expected.
- Read state and conversation membership are first-class backend concerns.

## Notifications
Source: `docs/specs/009-notifications-push/spec.md`
- In-app notifications persist in DB.
- Push token registration is required.
- Request/chat events should flow into notification pathways.
