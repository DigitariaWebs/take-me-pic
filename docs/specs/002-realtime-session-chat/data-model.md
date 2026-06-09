# Data Model: Realtime Session Chat

This model refines the current `conversations`, `conversation_participants`, and `messages` tables so the backend matches the existing chat UI contract.

## Current Schema Gaps

- `messages` only has `body`; it does not model message kind, attachment metadata, delivery status, client idempotency, edits/deletes, or system events.
- `conversation_participants.last_read_at` is useful but too coarse for robust read receipts and unread counts.
- There is no durable attachment table for chat-specific image, voice, location, or document messages.
- There is no idempotency constraint for offline retry.
- There is no per-recipient delivery/push state for inactive-recipient notifications.
- Realtime publication and private channel authorization are not configured in schema.
- Typing indicators should not be persisted in Postgres.

## Proposed SQL Shape

```sql
create type public.message_kind as enum (
  'text',
  'image',
  'voice',
  'location',
  'document',
  'system'
);

create type public.message_delivery_state as enum (
  'sent',
  'failed',
  'deleted'
);

alter table public.conversations
  add column if not exists status text not null default 'active',
  add column if not exists last_message_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table public.messages
  add column if not exists kind public.message_kind not null default 'text',
  add column if not exists client_message_id text,
  add column if not exists delivery_state public.message_delivery_state not null default 'sent',
  add column if not exists metadata jsonb not null default '{}',
  add column if not exists edited_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add constraint messages_client_id_unique unique (conversation_id, sender_id, client_message_id);

alter table public.conversation_participants
  add column if not exists muted_until timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists last_delivered_message_id bigint references public.messages (id) on delete set null,
  add column if not exists last_read_message_id bigint references public.messages (id) on delete set null;

create table if not exists public.message_attachments (
  id bigint generated always as identity primary key,
  message_id bigint not null references public.messages (id) on delete cascade,
  kind public.message_kind not null,
  bucket_id text,
  storage_path text,
  mime_type text,
  size_bytes int check (size_bytes is null or size_bytes >= 0),
  width int check (width is null or width > 0),
  height int check (height is null or height > 0),
  duration_seconds int check (duration_seconds is null or duration_seconds >= 0),
  latitude double precision,
  longitude double precision,
  title text,
  created_at timestamptz not null default now(),
  constraint attachment_payload_check check (
    (kind in ('image','voice','document') and bucket_id is not null and storage_path is not null)
    or (kind = 'location' and latitude is not null and longitude is not null)
  )
);

create table if not exists public.message_deliveries (
  message_id bigint not null references public.messages (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  delivered_at timestamptz,
  read_at timestamptz,
  push_status text,
  push_provider_message_id text,
  push_attempted_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (message_id, recipient_id)
);

create index if not exists messages_conversation_page_idx
  on public.messages (conversation_id, created_at desc, id desc)
  where deleted_at is null;

create index if not exists messages_sender_client_id_idx
  on public.messages (sender_id, client_message_id)
  where client_message_id is not null;

create index if not exists message_attachments_message_idx
  on public.message_attachments (message_id);

create index if not exists message_deliveries_recipient_idx
  on public.message_deliveries (recipient_id, created_at desc);

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversation_participants;
alter publication supabase_realtime add table public.message_deliveries;
```

## RLS Policy Direction

- `conversations`: participants can read; creation should happen through server/RPC when a help request is accepted.
- `conversation_participants`: participants can read participant rows for their conversation; users can update only their own read cursor/mute/archive fields.
- `messages`: participants can read; participants can insert only as themselves; edits/deletes only by sender before a product-defined time window, or by staff.
- `message_attachments`: readable by participants through the owning message; insertable only when the owning message belongs to the same sender or via a server RPC.
- `message_deliveries`: readable by sender and recipient; recipient can update read/delivery cursor fields only for themselves, or writes happen through backend worker.
- `system` messages: inserted by trusted backend code, not arbitrary client writes.

## Private Realtime Channel Authorization

Use private Realtime channels for ephemeral typing/presence topics:

```text
conversation:{conversation_id}
```

Authorization must be enforced through policies on Supabase's `realtime.messages` table. The policy should permit `authenticated` users to join/send/receive only when `(select auth.uid())` appears in `public.conversation_participants` for the conversation id encoded in the topic.

Do not rely only on app-table RLS for Broadcast/Presence authorization.

## Realtime Plan

### Durable Events

Subscribe to Postgres changes on:

- `messages` for inserts/updates in active conversations.
- `conversation_participants` for read cursor updates.
- `help_requests` for lifecycle changes that affect chat availability.

Client flow:

1. Load recent messages by page.
2. Subscribe to `messages` changes filtered by `conversation_id`.
3. Send with a `client_message_id`.
4. On insert echo, reconcile local queued message by `client_message_id`.
5. On reconnect, fetch messages newer than the newest local server timestamp.

### Ephemeral Events

Use Realtime Broadcast/Presence for:

- typing start/stop
- online/away hints
- composer focus

Do not persist typing rows.

### Push Notifications

On message insert:

- Notify other participants if they are not actively present in the conversation.
- Use `push_tokens` and a server/edge function or backend worker.
- Deduplicate push by `message.id`.
- Track push attempts and provider ids in `message_deliveries` or a dedicated notification delivery table.

## Client Contract

Current UI states map as:

| UI state | Backend/client meaning |
|---|---|
| `sending` | Local queued message not reconciled with server insert yet |
| `sent` | Server insert accepted and realtime echo/REST response received |
| `read` | Other participant advanced `last_read_message_id` past this message |
| `failed` | Local retry exhausted or backend rejected insert |
