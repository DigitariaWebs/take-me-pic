# Spec: Session Photo Transfer

**Flow Doc**: `docs/features/phase_1/session_photo_transfer_flow.md`  
**Priority**: P1

## User Story

As a session participant, I want photos shared securely inside the app, so that nobody needs to exchange phone numbers or social handles.

## Independent Test

Upload a session photo as a request party and verify only the requester/helper can read the metadata and storage object.

## Acceptance Criteria

1. Session can start only for accepted request parties.
2. Upload stores files under request-scoped private paths.
3. `session_photos` inserts are allowed only for request parties.
4. Gallery loads authorized photos and shows retry for failed uploads.

## Minimal Data Contract

- `help_requests`
- `session_photos`
- Storage bucket: `session-photos`

## Execution Tasks

- [ ] Create/verify private `session-photos` bucket and policies.
- [ ] Harden `session_photos_upload` party check.
- [ ] Add upload/list/favorite data-layer helpers.
- [ ] Wire session/gallery screens.
- [ ] Test party vs non-party access.

