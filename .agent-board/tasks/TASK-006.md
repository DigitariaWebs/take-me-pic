# TASK-006 - Wire Realtime Session Chat

Status: Backlog
Priority: P1
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Core help loop
Owner: Agent

## Purpose

Replace mock chat behavior with Supabase-backed realtime conversation messages for accepted photo sessions.

## Scope

- Add message list/send APIs behind the chat feature.
- Subscribe to conversation messages for active participants.
- Wire quick replies, typing state where feasible, and message send failures.
- Enforce participant-only access.
- Keep private contact details out of chat payloads.

## User Flow

Accepted request opens conversation

.

Requester/helper exchange quick coordination messages

.

New messages appear in realtime

.

Conversation remains tied to the active session/request

## Acceptance Criteria

- [ ] Only conversation participants can read/send messages.
- [ ] Sending a message persists it and renders in the current chat.
- [ ] Incoming messages update without manual refresh.
- [ ] Failed sends are visible and retryable.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Source docs: `docs/specs/002-realtime-session-chat/spec.md`, `docs/specs/002-realtime-session-chat/contracts/realtime-events.md`.
- Use Supabase Realtime with explicit participant checks.
- Prefer minimal text/quick replies for MVP.

## Dependencies

- TASK-005 completed.

## Verification

- Two-user manual chat test.
- Participant access check.
- Typecheck.
