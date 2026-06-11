# TASK-003 - Verify Avatar Storage and Profile Media Upload

Status: Review
Priority: P0
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Auth first
Owner: Agent

## Purpose

Verify and wire avatar upload so trusted profiles can include a user-owned photo without exposing private storage paths or requiring service-role access.

## Scope

- Verify the `avatars` storage bucket exists in Supabase.
- Configure `avatars` as a public bucket because profile avatars are intentionally visible on profiles and helper pins.
- Verify storage policies allow authenticated users to upload and update only their own avatar path.
- Add or complete avatar upload helper behind the existing Supabase storage module.
- Wire profile setup/edit flow to upload avatar and persist `profiles.avatar_url`.
- Keep avatar optional until storage policy verification is complete.
- Keep private session-photo storage out of this task; TASK-007 owns `session-photos`.

## User Flow

Authenticated user selects avatar

.

App uploads to user-owned avatar path

.

Profile row stores the public avatar reference

.

Profile and helper pins can render the avatar

## Acceptance Criteria

- [x] Avatar upload works with the publishable client key. (verified: scripts/verify-avatars.mjs, after 0004 applied)
- [x] User cannot overwrite another user's avatar path. (verified: own-path upload succeeds, cross-user upload denied)
- [x] Public avatar reads work without exposing write access. (verified: public URL returns 200)
- [x] Link profile page to real data alongside avatar (MyProfileScreen wired to useProfile; on-device pixels pending a standalone build).
- [x] Profile write stores the avatar reference after upload succeeds. (verified: profiles.avatar_url persisted under publishable key)
- [x] Avatar upload failure does not create a partially broken trusted profile. (useUploadAvatar uploads first, persists only on success)
- [x] `npm run typecheck` passes.

## Implementation Notes (this PR)

- `supabase/migrations/0004_avatars_storage.sql`: public `avatars` bucket,
  owner-scoped `storage.objects` policies (`{auth.uid()}/...` folder), and the
  `profiles.avatar_url` column grant 0003 omitted.
- `uploadAvatar()` helper (`{userId}/avatar.<ext>`, upsert) + `useUploadAvatar`
  hook that uploads first and only persists `avatar_url` on success, so a failed
  upload can't leave a broken profile reference.
- Remote `avatars` bucket already exists and is reachable with the publishable
  key; 0004 makes the bucket config + policies reproducible.
- **Deferred:** the avatar picker UI (`expo-image-picker` is not installed and
  is a native dep needing a fresh dev build). This PR ships the upload/persist
  data layer; the picker UI is a follow-up. Avatar stays optional per scope.
- **Pending manual/RLS verification (after applying 0004):** upload with the
  publishable key, cross-user write denial, public read, persist-after-success.

## Technical Notes

- Source docs: `docs/specs/004-auth-onboarding/spec.md`, `docs/features/phase_1/onboarding_profile_verification_flow.md`.
- Use Supabase Storage; do not expose service-role keys.
- Use public `avatars` bucket reads for profile display.
- Use user-owned paths such as `{auth.uid()}/avatar.<ext>` or `{auth.uid()}/{uuid}.jpg`.
- Storage policies must restrict insert/update/delete to the authenticated user's own top-level path.
- Do not apply this public-bucket decision to session photos; session photos stay private and party-scoped.

## Dependencies

- TASK-002 completed.
- Remote storage bucket and policies verified.

## Verification

- Manual upload/update path.
- RLS/storage policy check for another user's path.
- Typecheck.
