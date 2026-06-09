## Feature Information

- Feature Name: Realtime Session Chat
- Description / Goal: Let the requester and helper coordinate an active photo session inside Take Me Pic without exchanging personal contact details.
- Screens Involved: `(tabs)/messages`, `chat/[id]`, `request/sent`, `request/incoming`, `session/index`, `notifications`
- User Inputs: typed text, quick replies, attachment choices, voice press-and-hold, read/open actions, call/video taps
- Backend/API Interactions: Supabase Auth, `conversations`, `conversation_participants`, `messages`, proposed `message_attachments`, Supabase Realtime, Storage, push notification worker
- Special Conditions / Rules: only conversation participants can read/write; session chats should be linked to accepted help requests; typing is ephemeral; attachments use storage paths
- Additional Notes: Current UI is mock-backed and already models text/image/voice/system messages plus `sending`, `sent`, and `read` indicators.

---

# Realtime Session Chat

## Purpose

Realtime Session Chat helps two strangers coordinate where to meet and how to complete the photo session while keeping all communication inside the app. It supports the Phase 1 promise that a requester can find help, coordinate quickly, receive photos securely, and finish the session without exchanging phone numbers or social handles.

## Entry Points

- Inbox tab: `(tabs)/messages`
- Accepted request: `request/sent` routes to `chat/[id]`
- Incoming request acceptance: `request/incoming`
- Public/mini profile CTA: `user/[id]`
- Family member chat CTA: `family`
- Push notification for a new chat message

## Preconditions

- User is authenticated.
- User has a `profiles` row.
- A `conversation` exists and the user has a `conversation_participants` row.
- For session chat, the linked `help_request` is accepted or in session.
- Network connection is available for send/subscribe; offline queue handles temporary failure.
- Storage bucket and policy exist before sending image, voice, or document attachments.

## Main User Flow

### Step 1 - Open Conversation

User:

- Opens a conversation from inbox, request flow, profile, or notification.

System:

- Loads the most recent message page.
- Subscribes to durable message and read-cursor changes for that conversation.
- Joins ephemeral typing/presence channel.
- Shows empty state if no messages exist.
- Blocks access if RLS denies membership.

### Step 2 - Send Text Or Quick Reply

User:

- Types a message or taps a quick reply.

System:

- Creates a local queued message with `sending` status and `client_message_id`.
- Inserts the message into Supabase.
- Reconciles the local message when the server insert is returned or received through Realtime.
- Shows `sent` after persistence and `read` after the other participant advances their read cursor.

### Step 3 - Send Attachment

User:

- Opens the attachment sheet and chooses photo, camera, position, or document.

System:

- Uploads file-based attachments to Storage first, or stores location metadata for position.
- Inserts the message and attachment metadata atomically where possible.
- If upload succeeds but message insert fails, exposes retry/delete cleanup behavior.

### Step 4 - Read And Typing Updates

User:

- Views messages or starts typing.

System:

- Updates the participant read cursor after messages are visible.
- Broadcasts typing start/stop through ephemeral Realtime channels.
- Does not persist typing events in Postgres.

### Step 5 - Session Lifecycle

User:

- Moves from chat to session, gallery, rating, or cancellation.

System:

- Continues conversation while request is accepted/in session.
- Stops session-only GPS and optionally disables new user messages when request is completed/cancelled.
- Creates system messages for lifecycle events through trusted backend code.

## Alternate Flows

- Offline send: local message remains queued/failed until reconnect; retry uses the same `client_message_id`.
- Push entry: notification opens the conversation, fetches history, and reconciles missed realtime events.
- Read-only history: completed sessions can remain readable while new messages are disabled.
- Attachment retry: failed upload/message insert can be retried or removed from local queue.

## Edge Cases & Failure Scenarios

- API timeout: keep local message in `sending` or `failed`, allow retry.
- Duplicate retry: backend unique constraint on `(conversation_id, sender_id, client_message_id)` prevents duplicates.
- Non-participant access: RLS blocks read/write and UI shows safe error.
- Message received out of order: client sorts by `created_at` then `id`.
- User blocked/banned: new sends are blocked; existing history follows product moderation policy.
- Attachment orphan: cleanup storage object if message insert fails after upload.
- Realtime gap: client fetches messages newer than local newest server timestamp on reconnect.

## Success State

- Message is stored exactly once.
- Other participant receives it in realtime or through history fetch.
- Sender sees delivery/read feedback.
- Attachments resolve through authorized storage access.
- Notification is created only for inactive/backgrounded recipients.

## Failure State

- User sees a failed local message with retry/remove behavior.
- Backend rejects unauthorized conversation access.
- Failed attachments do not create broken message rows.
- Errors are logged with conversation id, local message id, and backend request id where available.

## Backend / API Notes

- Use Supabase Postgres changes for durable `messages` and read-cursor events.
- Use Supabase Broadcast/Presence for typing and online hints.
- Add `message_attachments` and richer message columns before wiring UI.
- Use storage paths rather than public URLs.
- Use server/RPC or constrained policies for lifecycle `system` messages.
- Push delivery requires Expo notifications/APNs/FCM and should be deduplicated by message id.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `chat_opened` | Conversation screen opened | `source`, `conversationId`, `helpRequestId` |
| `chat_message_send_started` | User taps send or attachment upload starts | `conversationId`, `kind`, `hasAttachment` |
| `chat_message_sent` | Server insert succeeds | `conversationId`, `messageId`, `kind`, `latencyMs` |
| `chat_message_failed` | Send/upload/retry fails | `conversationId`, `kind`, `errorCode`, `retryCount` |
| `chat_read_cursor_updated` | Read cursor advances | `conversationId`, `lastReadMessageId` |
| `chat_typing_broadcasted` | Typing state emitted | `conversationId`, `state` |

## Security & Validation Considerations

- Never trust client-supplied participant ids; derive access from authenticated user and participant rows.
- RLS must protect conversations, participants, messages, and attachments.
- Clients should not create arbitrary system messages.
- Attachment paths must be scoped by conversation/request and checked by Storage policies.
- Do not expose service-role keys in the app.
- Do not use user-editable metadata claims for authorization.

## Technical Notes / Engineering Considerations

- Keep chat state in a repository/data layer rather than inside the screen.
- Preserve current UI message types: text, image, voice, system.
- Add a local queue for offline and background sends.
- Reconcile by `client_message_id`.
- Page message history by `(created_at, id)` to avoid unstable ordering.
- Avoid persisting typing indicators.
- Test two-device concurrency and reconnect behavior.

## QA Testing Recommendations

- Two-user realtime text send and receive.
- Sender sees `sending -> sent -> read`.
- Offline send, app restart, reconnect, no duplicate.
- Image, voice, location, and document attachment behavior.
- Non-participant cannot open or subscribe to messages.
- Completed/cancelled request stops or limits further sends according to product policy.
- Push opens the correct conversation and does not duplicate a message already received by Realtime.
- Voice and attachment UI remain usable on small screens and with keyboard open.

## Open Questions

- Should completed sessions remain writable for follow-up thanks/support, or become read-only?
- What is the retention policy for chat messages and attachments?
- Are voice messages required for MVP or can they remain local UI until Phase 2?
- Should chat be one-to-one only, or support staff/moderator joins later?
- What moderation flow should apply to reported messages?
