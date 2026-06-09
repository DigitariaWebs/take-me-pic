# Spec: Trust, Safety, and Admin Operations

**Flow Doc**: `docs/features/cross_cutting/trust_safety_admin_flow.md`  
**Priority**: P1

## User Story

As a user or moderator, I want reports, blocks, bans, roles, and audit logs, so that real-world stranger interactions are safer and operable.

## Independent Test

Submit a report as a user, triage it as staff, and verify non-staff cannot access staff-only moderation data.

## Acceptance Criteria

1. Users can report/block from supported surfaces.
2. Staff role is required for moderation actions.
3. Ban/report updates write audit logs.
4. Banned/blocked users are filtered from matching and relevant social surfaces.

## Minimal Data Contract

- `reports`
- `blocks`
- `bans`
- `user_roles`
- `admin_audit_log`

## Execution Tasks

- [ ] Add report/block helpers for mobile.
- [ ] Add backend staff-role checks.
- [ ] Add audit-log write path.
- [ ] Add safety filters to matching/chat/feed queries.
- [ ] Test staff/non-staff and banned/blocked behavior.

