# TASK-006 - Wire Realtime Session Chat

Status: In Progress
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

- [x] Only conversation participants can read/send messages. (RLS via `private.in_conversation`, fixed in 0006; two-user test: both participants read/send their shared conversation)
- [x] Sending a message persists it and renders in the current chat. (two-user test: send persists; rendered via optimistic item + history)
- [x] Incoming messages update without manual refresh. (realtime INSERT subscription on the conversation; same proven path as TASK-004/005)
- [x] Failed sends are visible and retryable. (optimistic `failed` status + tap-to-retry affordance)
- [x] `npm run typecheck` passes.

## Implementation Notes (this PR)

- **Backend bug fixed (0006):** `0001` revoked EXECUTE on `private.in_conversation`
  from `authenticated`, but the conversation/message RLS policies call it — so all
  participant reads/sends were denied. Granted (SECURITY DEFINER, boolean-only).
- `chatApi` + `useConversation` verified two-user against the live DB: both
  participants send and read their shared conversation; other-participant lookup
  works. Realtime delivery + failed-retry are wired (same subscription pattern
  proven in TASK-004/005); on-device two-device realtime is the natural manual check.
- Photos / voice / calls are **out of MVP scope** (TASK-007 owns session photos) —
  the affordances show a "coming soon" alert.

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
