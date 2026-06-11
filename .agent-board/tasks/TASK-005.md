# TASK-005 - Wire Help Request Create and Accept Lifecycle

Status: In Progress
Priority: P1
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Core help loop
Owner: Agent

## Purpose

Wire the one-tap request flow so a requester can create a photo request and exactly one eligible helper can accept it through the Supabase lifecycle.

## Scope

- Add create/cancel/expire request API functions.
- Wire request sent and incoming request screens to backend state.
- Use `accept_help_request` for atomic helper acceptance.
- Create or load the linked conversation after acceptance.
- Handle duplicate accept, cancel, and expiry races.

## User Flow

Requester sends photo request

.

Nearby helper receives/opens incoming request

.

Helper accepts

.

Request becomes accepted and conversation/session coordination begins

## Acceptance Criteria

- [ ] Request create validates requester, location, people count, and expiry.
- [ ] `accept_help_request` assigns exactly one helper.
- [ ] Request status changes are visible to requester and helper.
- [ ] Duplicate accept/cancel/expire races resolve to one canonical state.
- [ ] Linked conversation is available after acceptance.
- [ ] `npm run typecheck` passes.

## Grilling Decisions (MVP)

- **Request model = broadcast** (schema-driven: `helper_id` is null until accept;
  `accept_help_request` lets any eligible non-owner accept). The requester does
  **not** pick a specific helper. UI resolution: `RequestSentScreen` shows
  "waiting for a nearby helper" generically, and reveals the accepting helper's
  identity once `status='accepted'`. (Drops the current "to {specific name}"
  framing — it implied a targeted model that the backend doesn't support.)
- **Expiry = server-derived** from `expires_at` (DB default). The client never
  writes `status='expired'`; the RPC already rejects accept on expiry, and the
  requester UI treats `now() > expires_at` as expired. A background expiry sweep
  is out of MVP scope.
- **Cancel** = requester sets `status='cancelled'` only while still `requested`
  (guarded by `id`/owner + status); cancel-after-accept fails (already accepted).
- **Accept** = `accept_help_request(request_id)` RPC only — all races
  (duplicate accept, expiry, own-request, banned) resolve server-side. Client
  maps the RPC error codes to user messages.
- **Status delivery** = realtime subscription on the requester's own request row
  (sees `accepted` + helper). Helper-side discovery of open nearby requests
  (a feed / map helper-role pins) is a follow-up; this task wires the
  `IncomingRequestScreen` to accept a request passed by id.
- **Location** = requester's current GPS (reuse the presence locate) written to
  `help_requests.location` (EWKT); `people_count` and optional `note`;
  `expires_at` left to the server default.
- **Conversation** = created by the RPC on accept; client navigates to the
  returned `conversation_id`.

## Edge Cases

- Two helpers accept simultaneously → exactly one wins; the other gets
  "already accepted by another helper".
- Requester cancels at the same moment a helper accepts → accept wins if the
  row was still `requested`; otherwise cancel wins. One canonical state.
- Helper accepts an expired request → rejected with "expired".
- Helper re-accepts their own already-accepted request → idempotent (returns the
  same conversation).
- Requester tries to accept their own request → rejected.
- Banned helper accepts → rejected.

## Technical Notes

- Source docs: `docs/specs/006-help-request-matching/spec.md`, `docs/features/phase_1/help_request_matching_flow.md`.
- Remote Supabase status says `accept_help_request` exists.
- Keep lifecycle rules server-enforced.

## Dependencies

- TASK-004 completed.

## Verification

- Manual request/create/accept path.
- Double-accept check.
- Expired request check.
