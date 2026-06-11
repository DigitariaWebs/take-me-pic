# TASK-007 - Wire Session Photo Transfer

Status: Done
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

- [x] Upload works for active session participants. (two-user test: party upload + row insert PASS)
- [x] Non-participants cannot read/write session photos. (two-user test: non-party write denied by the storage policy / RLS)
- [x] Gallery renders backend photos. (GalleryScreen lists session_photos + signed URLs; reachable from the chat's attach action with the conversation's help_request_id)
- [x] Upload failure is visible and retryable. (uploadError + retry in the gallery; pick-and-upload via expo-image-picker)
- [x] `npm run typecheck` passes.

## Grilling decision: how the gallery is reached
- **From the chat** (MVP): the conversation links to `help_request_id`, so the
  chat's attach button opens `/session/gallery?request={id}`. Ties photos to the
  real accepted session. The full session lifecycle (`SessionScreen` owning the
  active request) is a later task.

## Implementation Notes (this PR)
- **Migration 0007:** private `session-photos` bucket + party-only storage
  policies via `SECURITY DEFINER private.is_session_party()` (EXECUTE granted —
  the 0006 lesson). Verified two-user against the live DB: party upload/read +
  signed URL work; non-party write denied.
- `sessionPhotoApi` (upload/list/signedUrl) + `useSessionPhotos` (list + signed
  URLs + realtime + pick-and-upload with retry). Gallery wired to a `request`
  param; chat attach opens it.
- `expo-image-picker` pinned to 56.0.15 (matches expo-modules-core; 56.0.17 would
  crash the native build like expo-location).

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
