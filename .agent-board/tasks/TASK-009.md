# TASK-009 - Wire Push Notification Registration and Delivery

Status: Backlog
Priority: P1
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Notifications
Owner: Agent

## Purpose

Register push tokens and deliver important request/session notifications so helpers and requesters can respond in the moment.

## Scope

- Add Expo push notification setup if not already installed/configured.
- Register device push token after login/profile completion.
- Store/update token under authenticated user ownership.
- Trigger notifications for request created, request accepted, session updates, and messages where needed.
- Add in-app fallback state when push is disabled.

## User Flow

Verified user allows notifications

.

App registers push token

.

Nearby request/session event occurs

.

User receives push or in-app fallback

## Acceptance Criteria

- [ ] Push token registration is tied to authenticated user.
- [ ] Disabled notification permission shows a usable fallback.
- [ ] Request and acceptance notifications can be triggered.
- [ ] Stale/replaced tokens are handled.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Source docs: `docs/specs/009-notifications-push/spec.md`, `docs/features/cross_cutting/notifications_flow.md`.
- Supabase does not provide native push; use Expo/APNs/FCM pipeline.
- Avoid sending precise location in notification payloads.

## Dependencies

- TASK-005 completed.

## Verification

- Token registration manual check.
- Push disabled path.
- Request/accepted notification test.
