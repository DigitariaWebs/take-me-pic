# Tasks: Realtime Session Chat

**Input**: Design documents from `docs/specs/002-realtime-session-chat/`  
**Prerequisites**: `spec.md`, `plan.md`, `data-model.md`, `contracts/realtime-events.md`

## Phase 1: Setup

- [ ] T001 Confirm remote Supabase migration baseline is applied and visible through Data API.
- [ ] T002 Confirm Realtime publication settings for `messages` and `conversation_participants`.
- [ ] T003 Generate/update typed Supabase table and RPC types after schema changes.

## Phase 2: Foundational

- [ ] T004 Create migration for message enums, enriched `messages`, `message_attachments`, participant read cursors, indexes, grants, and RLS.
- [ ] T005 [P] Add RLS tests for conversation participants and non-participants.
- [ ] T006 [P] Add storage bucket/policy checks for chat/session attachments.
- [ ] T007 Add helper/RPC strategy for trusted system messages.
- [ ] T007A Add private Realtime channel authorization policies for `conversation:{id}` topics.

## Phase 3: User Story 1 - Send And Receive Session Messages (P1)

**Goal**: Participants can exchange realtime text messages.

**Independent Test**: Send a text message from one authenticated participant and receive it on another client without refresh.

- [ ] T008 [P] Add chat repository function to list recent messages.
- [ ] T009 [P] Add chat repository function to subscribe to message inserts/updates.
- [ ] T010 Add send text message function with `client_message_id`.
- [ ] T011 Wire `chat/[id]` to repository state while preserving the current UI.
- [ ] T012 Add reconnect fetch for messages newer than local cursor.

## Phase 4: User Story 2 - Delivery And Read State (P1)

**Goal**: Current `sending`, `sent`, and `read` UI states are backed by durable server state.

**Independent Test**: Sender sees `sent` after insert and `read` after recipient read cursor advances.

- [ ] T013 Add local queue/reconciliation by `client_message_id`.
- [ ] T014 Add mark-read function that updates only the authenticated participant row.
- [ ] T015 Subscribe to participant read cursor updates.
- [ ] T016 Map read cursor to outgoing message delivery icons.

## Phase 5: User Story 3 - Attachments (P2)

**Goal**: Participants can send image, voice, location, and document messages safely.

**Independent Test**: Upload an image, create linked message/attachment rows, and verify participant-only access.

- [ ] T017 [P] Add attachment upload helper for image and document files.
- [ ] T018 [P] Add voice attachment mapping from local recording metadata.
- [ ] T019 Add location card metadata mapping.
- [ ] T020 Add orphan cleanup/retry behavior for upload-success/message-fail cases.

## Phase 6: User Story 4 - Push Notifications (P2)

**Goal**: Inactive recipients get one push per new message.

**Independent Test**: Insert a message while recipient is offline and verify one push job/notification.

- [ ] T021 Add message-created notification worker/edge function.
- [ ] T022 Deduplicate push notifications by message id.
- [ ] T023 Suppress push when recipient is actively present in the conversation.
- [ ] T023A Persist push attempt/result metadata in `message_deliveries` or notification delivery rows.

## Phase 7: Polish

- [ ] T024 Document final migration in `docs/SCHEMA.md`.
- [ ] T025 Update `docs/SUPABASE-INTEGRATION-STATUS.md` after remote verification.
- [ ] T026 Run TypeScript check and chat repository tests.
- [ ] T027 QA two-device realtime, offline retry, attachment, and non-participant denial flows.

## Dependencies & Execution Order

- Phase 1 blocks all implementation.
- Phase 2 blocks all user stories.
- User Stories 1 and 2 should land before attachments and push.
- Attachment and push work can proceed in parallel once the foundational schema is stable.
