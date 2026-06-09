# Implementation Plan: Realtime Session Chat

**Branch**: `002-realtime-session-chat` | **Date**: 2026-06-08 | **Spec**: `docs/specs/002-realtime-session-chat/spec.md`

## Summary

Implement production realtime session chat behind the existing chat UI. The technical approach is to enrich the Supabase message schema, use Postgres Realtime for durable events, use Broadcast/Presence for typing, add storage-backed attachments, and keep client reconciliation idempotent through `client_message_id`.

## Technical Context

**Language/Version**: TypeScript 6, React Native 0.85, Expo SDK 56, SQL/Postgres  
**Primary Dependencies**: `@supabase/supabase-js`, AsyncStorage auth persistence, Expo Router  
**Storage**: Supabase Postgres and Storage  
**Testing**: RLS integration tests, repository-layer unit tests, TypeScript check  
**Target Platform**: iOS-first Expo mobile app  
**Project Type**: Mobile app with Supabase backend  
**Performance Goals**: New messages visible in under 1 second on healthy network; page load bounded by latest message page  
**Constraints**: No service-role key in client, no non-participant access, no duplicate messages on retry  
**Scale/Scope**: One-to-one session chat for MVP, with a schema that can later support staff joins or group participants

## Constitution Check

- Preserve the existing chat UI behavior and visual system.
- Keep raw Supabase calls behind a typed chat data layer.
- RLS must be tested before production use.
- Typing indicators are ephemeral; only durable chat history belongs in Postgres.

## Project Structure

```text
docs/specs/002-realtime-session-chat/
  spec.md
  plan.md
  data-model.md
  tasks.md
  contracts/
    realtime-events.md
```

**Structure Decision**: Document first, then implement with a schema migration plus a chat repository/data layer. The screen should consume message state rather than owning backend details.

## Implementation Phases

### Phase 1 - Schema Migration

- Add message enums and columns for kind, metadata, delivery state, client idempotency, edits, and deletes.
- Add `message_attachments`.
- Add participant read cursor columns.
- Add indexes for message paging and idempotency.
- Extend RLS and grants for the new table/types.

### Phase 2 - Data Layer

- Add typed repository/fetcher functions behind the existing data seam:
  - list conversations
  - list messages
  - send message
  - upload attachment
  - mark read
  - subscribe to conversation
  - broadcast typing
- Keep screens importing a stable high-level chat interface instead of raw Supabase calls.

### Phase 3 - UI Wiring

- Replace seed messages in `chat/[id]` with loaded server messages.
- Map local queued state to UI `sending`.
- Reconcile server inserts by `client_message_id`.
- Preserve current design and interaction patterns.

### Phase 4 - Push and Lifecycle

- Trigger push notification for offline recipients.
- Gate sending by help-request status and participant membership.
- Stop typing presence and location sharing when a session completes/cancels.

## Verification

- RLS tests for participant vs non-participant reads/inserts.
- Idempotency test for duplicate `client_message_id`.
- Pagination test for stable message ordering.
- Read receipt test with two authenticated users.
- Offline retry simulation at the repository layer.

