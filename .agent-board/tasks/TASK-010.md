# TASK-010 - Wire Trust, Safety, and Reporting Flows

Status: Backlog
Priority: P1
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Trust and safety
Owner: Agent

## Purpose

Wire reporting, blocking, banned-user gates, and safety state so the stranger-to-stranger help network has a minimum operational safety layer.

## Scope

- Add report/block API functions.
- Wire report entry points from profile, session, chat, and settings where present.
- Enforce banned-user blocks after auth/session restore.
- Hide blocked users from nearby helper/request flows.
- Ensure moderation/audit data is server-owned.

## User Flow

User sees unsafe behavior

.

User reports or blocks the other account

.

Backend records the safety action

.

Blocked/banned users are excluded from future interactions

## Acceptance Criteria

- [ ] User can submit a report from a relevant screen.
- [ ] User can block another user.
- [ ] Blocked users are excluded from presence/request/chat where applicable.
- [ ] Banned users are blocked after auth restore.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Source docs: `docs/specs/017-trust-safety-admin/spec.md`, `docs/features/cross_cutting/trust_safety_admin_flow.md`.
- Do not trust client-provided role/moderation state.
- Admin console implementation is primarily in the web repo; mobile owns user-facing reporting.

## Dependencies

- TASK-002 completed.

## Verification

- Manual report/block path.
- Blocked-user exclusion check.
- Banned-user gate check.
