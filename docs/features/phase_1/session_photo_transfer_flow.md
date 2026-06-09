## Feature Information

- Feature Name: Photo Session and Secure Photo Transfer
- Description / Goal: Guide the active photo session and keep shared photos inside the app.
- Screens Involved: `session/index`, `session/gallery`, `chat/[id]`, `session/rating`
- User Inputs: capture/shutter actions, favorite toggles, gallery navigation
- Backend/API Interactions: `help_requests`, `session_photos`, Supabase Storage, optional chat attachments
- Special Conditions / Rules: only session parties can upload/read session photos
- Additional Notes: Current UI uses mock gallery images and local favorites.

---

# Photo Session and Secure Photo Transfer

## Purpose

This feature supports the actual moment of taking and receiving photos. It solves the contact-exchange problem by making the photo handoff happen through authorized app storage.

## Entry Points

- Accepted/in-session request
- Chat CTA to start session
- Gallery after capture
- Rating after gallery review

## Preconditions

- Request is accepted or in session.
- User is a requester or helper.
- Camera/photo permissions are granted where needed.
- Storage bucket/policies exist.

## Main User Flow

### Step 1 - Start Session

User:

- Opens the viewfinder/session screen.

System:

- Transitions request to `in_session` if needed.
- Shows framing guide UI.
- Keeps GPS sharing limited to active session.

### Step 2 - Capture Or Upload Photos

User:

- Captures/imports session photos.

System:

- Uploads to private storage path scoped to request.
- Inserts `session_photos` rows.
- Shows upload progress and retry state.

### Step 3 - Review Gallery

User:

- Opens gallery and favorites photos.

System:

- Loads session photos authorized by RLS/storage policy.
- Persists favorite state if product requires cross-device favorites.

## Alternate Flows

- Helper sends photos through chat attachment path.
- User skips gallery and goes directly to rating.
- Upload continues after temporary network loss.

## Edge Cases & Failure Scenarios

- Camera permission denied.
- Upload partially succeeds.
- User leaves session before upload completes.
- Non-party tries to access storage object.
- Request is cancelled while uploading.

## Success State

- Photos are stored under session-controlled paths.
- Both parties can view authorized photos.
- Request can move toward completed/rated state.

## Failure State

- Failed uploads are retryable.
- Orphaned storage files are cleaned up where possible.
- User sees which photos failed.

## Backend / API Notes

- Harden `session_photos_upload` to check uploader is a party to the help request.
- Storage policies must match table RLS.
- Store paths, not public URLs.
- Consider signed URLs with short expiry for private photos.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `session_started` | Viewfinder opens | `requestId` |
| `session_photo_upload_started` | Upload begins | `requestId`, `source` |
| `session_photo_uploaded` | Upload succeeds | `requestId`, `photoId`, `latencyMs` |
| `session_gallery_opened` | Gallery opens | `requestId`, `photoCount` |
| `session_photo_upload_failed` | Upload fails | `requestId`, `errorCode` |

## Security & Validation Considerations

- Enforce party-only access in both DB and Storage.
- Avoid public permanent URLs for private session photos.
- Strip sensitive metadata if required by privacy policy.
- Stop location sharing after session end.

## Technical Notes / Engineering Considerations

- Use resumable/retry-friendly upload flow if file sizes grow.
- Keep upload state separate from gallery display state.
- Support cleanup of orphaned storage objects.

## QA Testing Recommendations

- Camera permission denied/granted.
- Upload success/failure/retry.
- Party and non-party storage access.
- Gallery after app restart.
- Session cancellation during upload.

## Open Questions

- Are photos always uploaded by helper, requester, or both?
- Should original EXIF metadata be stripped?
- How long should session photos be retained?

