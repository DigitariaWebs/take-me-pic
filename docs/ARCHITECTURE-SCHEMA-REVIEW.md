# Take Me Pic — Architecture Schema Review

Reviewed on: 2026-06-08  
Reviewer role: architect subagent, read-only review

## Coverage Matrix

| Feature module | Current schema coverage | UI/runtime coverage | Verdict |
|---|---|---|---|
| Auth/profile/trust | `profiles`, verification flags, bans | UI only, no Supabase Auth wired | Partial |
| Proximity/presence | `presence`, PostGIS RPC | Mock nearby users | Good schema start; privacy needs tightening |
| Help request/matching | `help_requests`, transition trigger | Request/session screens are mock navigation | Partial; acceptance flow needs RPC/RLS fix |
| Realtime chat/session | `conversations`, `conversation_participants`, thin `messages`, `session_photos` | Chat UI supports text/image/voice/location/status/typing | Under-modeled |
| Session photos | `session_photos` pointer table | Mock gallery/images | Partial; storage policies absent |
| Ratings/karma | `ratings`, `karma_ledger`, leaderboard | Mock values | Good starting point |
| Feed/spots | Posts, comments, likes, follows, spots/tips/photos | Mock feed/spots | Broad schema coverage |
| Notifications/push | `notifications`, `push_tokens` | Mock notifications | Partial; no delivery workflow |
| Premium/bookings/ads | Subscriptions, bookings, businesses, campaigns | Paywall/booking mock | Schema only |
| Moderation/admin | Reports, blocks, bans, audit, roles | Schema only in mobile repo | Needs real ops flow |

## P0 Findings

1. Remote Supabase is not integrated yet. `GET /rest/v1/profiles?select=id&limit=1` returned `PGRST205`, so `public.profiles` is not visible in the remote schema cache.
2. Help request acceptance cannot work as written. Open requests have `helper_id = null`, while the update policy allows only requester/helper updates. A candidate helper is not yet `helper_id`, so they cannot accept an open request.
3. Realtime publication is not enabled in SQL. Supabase Postgres Changes requires adding selected tables to the Realtime publication.
4. Chat is under-modeled for the implemented UI. The current `messages` table only stores body text, while the UI models message kind, image/voice/system content, delivery/read states, typing, and attachments.
5. `session_photos_upload` checks uploader identity but not whether the uploader belongs to the referenced help request.
6. `presence_read using (true)` exposes all authenticated users' locations. This conflicts with the PRD's session-only GPS privacy promise unless location is intentionally narrowed, fuzzed, or moved behind RPC-only access.

## Realtime Messaging Architecture

Use durable Postgres rows for canonical message history and Supabase Realtime private channels for ephemeral typing/presence.

### Durable Tables

- `conversations`: durable channel, usually linked to `help_requests`.
- `conversation_participants`: membership, notification preferences, read/delivered cursors.
- `messages`: canonical timeline events with `client_message_id`, message type, metadata, edit/delete state.
- `message_attachments`: storage-backed image, voice, document, and location metadata.
- `message_deliveries`: per-recipient push/delivery tracking when needed.
- `notifications`: in-app notification rows created from message inserts.

### Realtime Events

- Add `conversations`, `conversation_participants`, `messages`, `message_attachments`, `message_deliveries`, `notifications`, and `help_requests` to the Supabase Realtime publication as needed.
- Use Postgres Change subscriptions filtered by conversation id/help request id for durable state.
- Use private Broadcast/Presence channels named `conversation:{id}` for typing, recording voice, and online-in-chat hints.
- Authorize private Broadcast/Presence through policies on `realtime.messages` so only conversation participants can join.

### Write Flow

1. Client creates a local pending message with `client_message_id`.
2. For attachments, client uploads to a private Storage path scoped by `conversation_id` or `help_request_id`.
3. Client calls a `send_message` RPC that validates membership, inserts message plus attachments atomically, and returns canonical rows.
4. Offline retry reuses the same `client_message_id`; a unique constraint prevents duplicates.
5. Recipient receives insert via Realtime; read/delivery state is updated through participant cursors or `message_deliveries`.
6. A backend worker or Edge Function creates notification rows and sends Expo push only if the recipient is not actively present in that conversation.

## Request Acceptance Fix

Create an RPC such as `accept_help_request(request_id bigint)` that:

- Runs as trusted database code with explicit `auth.uid()` checks.
- Validates the request is still `requested` and not expired.
- Validates the accepting user is not the requester, not banned, and allowed to help.
- Atomically sets `helper_id`, transitions status to `accepted`, sets `accepted_at`, creates a conversation, inserts both participants, and creates notification rows.
- Returns the accepted request and conversation id.

This avoids unsafe broad update policies while allowing a candidate helper to accept an open request.

## Prioritized Next Steps

1. Apply/verify the migration remotely, create Storage buckets, and confirm Data API exposure.
2. Fix help-request acceptance with an RPC and stricter RLS.
3. Harden Phase 1 RLS: presence privacy, session-photo party checks, update `WITH CHECK`, Storage policies.
4. Expand chat schema for message types, attachments, idempotency, read/delivery cursors.
5. Enable Supabase Realtime publication and private channel authorization.
6. Build typed fetchers behind the mock seam for `presence -> help_requests -> conversations/messages`.
7. Add integration tests for request state transitions, RLS access, duplicate retry prevention, and chat subscription behavior.
