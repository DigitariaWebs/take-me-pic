# TASK-007 - Wire Session Photo Transfer

Status: Backlog
Priority: P1
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Core help loop
Owner: Agent

## Purpose

Wire secure in-app photo transfer for completed sessions so users do not need to exchange phone numbers or social handles.

## Scope

- Verify `session-photos` storage bucket and policies.
- Add upload/list/download helpers for session photos.
- Wire session gallery to backend data.
- Ensure only session participants can access session photos.
- Add cleanup/retention behavior if defined by the schema/docs.

## User Flow

Session participant uploads photo

.

Photo is stored under session-owned path

.

Both participants see the photo in the session gallery

.

Access is denied outside session participants

## Acceptance Criteria

- [ ] Upload works for active session participants.
- [ ] Non-participants cannot read/write session photos.
- [ ] Gallery renders backend photos.
- [ ] Upload failure is visible and retryable.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Source docs: `docs/specs/007-session-photo-transfer/spec.md`, `docs/features/phase_1/session_photo_transfer_flow.md`.
- Use signed URLs or public access only if policy explicitly permits it.
- Do not store private photo URLs in unrestricted tables.

## Dependencies

- TASK-006 completed.
- Storage bucket and policies verified.

## Verification

- Manual upload/list/download path.
- Participant and non-participant access checks.
- Typecheck.
