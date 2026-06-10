# TASK-005 - Wire Help Request Create and Accept Lifecycle

Status: Backlog
Priority: P1
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Core help loop
Owner: Agent

## Purpose

Wire the one-tap request flow so a requester can create a photo request and exactly one eligible helper can accept it through the Supabase lifecycle.

## Scope

- Add create/cancel/expire request API functions.
- Wire request sent and incoming request screens to backend state.
- Use `accept_help_request` for atomic helper acceptance.
- Create or load the linked conversation after acceptance.
- Handle duplicate accept, cancel, and expiry races.

## User Flow

Requester sends photo request

.

Nearby helper receives/opens incoming request

.

Helper accepts

.

Request becomes accepted and conversation/session coordination begins

## Acceptance Criteria

- [ ] Request create validates requester, location, people count, and expiry.
- [ ] `accept_help_request` assigns exactly one helper.
- [ ] Request status changes are visible to requester and helper.
- [ ] Duplicate accept/cancel/expire races resolve to one canonical state.
- [ ] Linked conversation is available after acceptance.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Source docs: `docs/specs/006-help-request-matching/spec.md`, `docs/features/phase_1/help_request_matching_flow.md`.
- Remote Supabase status says `accept_help_request` exists.
- Keep lifecycle rules server-enforced.

## Dependencies

- TASK-004 completed.

## Verification

- Manual request/create/accept path.
- Double-accept check.
- Expired request check.
