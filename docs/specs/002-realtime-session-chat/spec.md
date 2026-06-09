# Feature Specification: Realtime Session Chat

**Feature Branch**: `002-realtime-session-chat`  
**Created**: 2026-06-08  
**Status**: Draft  
**Flow Doc**: `docs/features/phase_1/realtime_session_chat_flow.md`  
**Input**: Dossier/PRD realtime session requirement, current `chat/[id]` UI, mock message contract, and current Supabase schema.

## User Scenarios & Testing

### User Story 1 - Send And Receive Session Messages (Priority: P1)

As either party in an accepted photo request, I want realtime in-app chat, so that we can coordinate the meetup without exchanging contact details.

**Why this priority**: Chat is part of the Phase 1 help loop and directly supports safe real-world coordination.

**Independent Test**: With two authenticated participants in one conversation, send a text message from one device and verify the other receives it without refreshing.

**Acceptance Scenarios**:

1. **Given** two users are participants in a conversation, **When** one sends a text message, **Then** the other receives it through Supabase Realtime and the sender sees `sending -> sent`.
2. **Given** a non-participant tries to read or insert a message, **When** the request reaches Supabase, **Then** RLS denies it.
3. **Given** the client reconnects after missing realtime events, **When** it fetches messages newer than the local cursor, **Then** the timeline is complete and ordered.

### User Story 2 - Show Delivery And Read State (Priority: P1)

As a sender, I want to know whether my message was persisted and read, so that I can trust the coordination state.

**Why this priority**: The current UI already shows `sending`, `sent`, and `read`; the backend must support those states.

**Independent Test**: Send a message, mark it read from the recipient account, and verify sender UI maps the read cursor to `read`.

**Acceptance Scenarios**:

1. **Given** a message is queued locally, **When** Supabase insert succeeds, **Then** the client reconciles the message by `client_message_id`.
2. **Given** the recipient opens the conversation, **When** visible messages are acknowledged, **Then** the participant read cursor advances.

### User Story 3 - Send Attachments (Priority: P2)

As a participant, I want to share photos, voice notes, location cards, and documents, so that session coordination and photo transfer stay inside the app.

**Why this priority**: The current UI exposes attachment and voice affordances; attachment persistence is needed before production.

**Independent Test**: Upload an image attachment, insert a linked message, and verify only participants can resolve the storage-backed record.

**Acceptance Scenarios**:

1. **Given** an image upload succeeds, **When** the message is inserted, **Then** the message references bucket/path metadata rather than a personal public URL.
2. **Given** upload succeeds but message insert fails, **When** retry is not possible, **Then** orphan cleanup is attempted and the local message shows failed state.

### User Story 4 - Notify Inactive Participants (Priority: P2)

As a recipient, I want to receive a push notification when I am not actively in the chat, so that I do not miss a session coordination message.

**Why this priority**: Supabase Realtime only helps active clients; session coordination needs background delivery.

**Independent Test**: Insert a message while recipient is offline and verify one push job is created for that message.

**Acceptance Scenarios**:

1. **Given** a recipient is not present in the conversation channel, **When** a new message is inserted, **Then** a push notification is queued once.
2. **Given** the recipient is actively present, **When** a message arrives, **Then** push is suppressed or downgraded according to notification policy.

### Edge Cases

- Sender backgrounds app immediately after tapping send.
- Two devices for the same user send with overlapping local queues.
- Attachment upload succeeds but message insert fails.
- Message insert succeeds but realtime event is missed.
- Recipient blocks sender during the session.
- Conversation participant is removed or banned.
- Push notification arrives before the realtime insert is processed.

## Requirements

### Functional Requirements

- **FR-001**: Chat MUST be scoped to a `conversation` with explicit participants.
- **FR-002**: A conversation MAY be linked to a `help_request`; Phase 1 session chats SHOULD be linked.
- **FR-003**: Messages MUST support `text`, `image`, `voice`, `location`, `document`, and `system` kinds.
- **FR-004**: Outgoing messages MUST have a client-generated idempotency key.
- **FR-005**: Message delivery MUST distinguish at least local `pending/sending`, persisted `sent`, failed `failed`, and recipient-read state at the client contract level.
- **FR-006**: Attachments MUST store bucket/path metadata, not raw public URLs as the source of truth.
- **FR-007**: Realtime clients MUST subscribe only to conversations where the authenticated user is a participant.
- **FR-008**: Read receipts MUST be modeled per participant, not only as a single message boolean.
- **FR-009**: Typing indicators SHOULD use ephemeral Realtime broadcast/presence, not durable database rows.
- **FR-010**: Push notifications MUST be generated for new messages when the recipient is offline/backgrounded.
- **FR-011**: Message history MUST be pageable by `created_at` and `id`.
- **FR-012**: System messages MUST be server-created or constrained so clients cannot forge trust-sensitive lifecycle events.
- **FR-013**: Private Realtime typing/presence channels MUST be authorized so only conversation participants can join.

### Key Entities

- **Conversation**: Durable chat channel, optionally linked to a help request.
- **Conversation Participant**: Member row with read cursor and notification preferences.
- **Message**: Durable communication event.
- **Message Attachment**: File, location, or document metadata linked to a message.
- **Message Delivery**: Per-recipient delivery/read/push state.
- **Typing Presence**: Ephemeral realtime state keyed by conversation and user.
- **Push Notification Job**: Background delivery work triggered by message insert.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Authenticated participants can exchange text messages in under 1 second on a healthy network.
- **SC-002**: A duplicate retry with the same idempotency key results in exactly one message row.
- **SC-003**: A non-participant cannot select, insert, update, or subscribe to the conversation's messages.
- **SC-004**: Read receipts update without granting broad message update privileges.
- **SC-005**: Attachment records cannot point to storage objects outside allowed chat/session buckets.

## Assumptions

- Supabase Realtime Postgres changes are used for durable message insert/update events.
- Supabase Realtime Broadcast/Presence is used for typing and online hints.
- Expo notifications/APNs/FCM handle push outside Supabase.
- Voice messages are uploaded as attachments before or during message insert.
