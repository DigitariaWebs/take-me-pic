## Feature Information

- Feature Name: Notifications and Push
- Description / Goal: Surface timely request, chat, karma, community, badge, spot, and system updates.
- Screens Involved: `notifications`, request screens, chat, settings
- User Inputs: mark read, mark all read, tap notification, permission opt-in
- Backend/API Interactions: `notifications`, `push_tokens`, Expo notifications/APNs/FCM
- Special Conditions / Rules: Supabase does not provide native mobile push delivery
- Additional Notes: Current notifications are mock rows with local read state.

---

# Notifications and Push

## Purpose

Notifications keep users responsive during the help loop and engaged with community/reputation updates.

## Entry Points

- Push notification
- Notifications screen
- In-app badge/count
- Settings notification preferences

## Preconditions

- User is authenticated.
- Push permission is requested where needed.
- Device token is registered.
- Notification creation rules exist.

## Main User Flow

### Step 1 - Register Token

User:

- Grants notification permission.

System:

- Registers Expo/APNs/FCM token in `push_tokens`.
- Handles denied permission gracefully.

### Step 2 - Receive Notification

User:

- Receives request/chat/community update.

System:

- Creates `notifications` row.
- Sends push when user is inactive/backgrounded.

### Step 3 - Read Notification

User:

- Opens notification list or taps push.

System:

- Routes to target screen.
- Marks notification read when appropriate.

## Alternate Flows

- Permission denied: in-app notifications still work.
- Token refresh: old token replaced/disabled.
- Mark all read.

## Edge Cases & Failure Scenarios

- Duplicate push attempt.
- Push delivered after user already read message.
- Token invalid.
- Notification target no longer exists.

## Success State

- User receives timely relevant updates.
- Read state persists.
- Push and in-app notification do not duplicate confusingly.

## Failure State

- Push failure records retry/failure state.
- App can still show in-app notifications.

## Backend / API Notes

- Use `notifications` for canonical in-app rows.
- Add delivery attempt metadata if push reliability needs auditing.
- Push worker should deduplicate by source event id.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `push_permission_requested` | Prompt shown | `result` |
| `push_token_registered` | Token saved | `platform` |
| `notification_received` | In-app row/push created | `kind`, `sourceId` |
| `notification_opened` | User taps | `kind`, `target` |
| `notification_marked_read` | Read state updated | `notificationId` |

## Security & Validation Considerations

- Users can read/update only own notifications.
- Do not include sensitive payload in push body.
- Token ownership must match `auth.uid()`.

## Technical Notes / Engineering Considerations

- Push requires Expo notifications dependency/config later.
- Handle token rotation.
- Keep notification routing table explicit.

## QA Testing Recommendations

- Permission granted/denied.
- Token registration refresh.
- Request/chat push deep links.
- Mark read/all read persistence.

## Open Questions

- Which notification kinds are push vs in-app only?
- What quiet hours/preferences are required?
- How much message text can appear in push payload?

