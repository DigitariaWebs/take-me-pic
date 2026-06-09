# Spec: Notifications and Push

**Flow Doc**: `docs/features/cross_cutting/notifications_flow.md`  
**Priority**: P1/P2

## User Story

As a user, I want timely request, chat, and reputation notifications, so that I do not miss active session events.

## Independent Test

Register a push token, create an in-app notification, and verify the authenticated user can read/mark it while other users cannot.

## Acceptance Criteria

1. Push token is stored for the authenticated user.
2. In-app notification rows are user-owned.
3. Request/chat notification creation is idempotent by source event.
4. Push payload avoids sensitive data.

## Minimal Data Contract

- `notifications`
- `push_tokens`
- optional delivery attempt table/metadata

## Execution Tasks

- [ ] Add Expo notifications dependency/config when implementing.
- [ ] Add push-token registration helper.
- [ ] Add notification list/mark-read helpers.
- [ ] Add backend worker/Edge Function for request/chat push.
- [ ] Test token rotation and mark-read persistence.

