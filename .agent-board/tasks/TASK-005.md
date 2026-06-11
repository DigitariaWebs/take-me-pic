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

- [x] Request create validates requester, location, people count, and expiry. (create writes requester/location/people_count; expiry is server-default — verified via probe)
- [x] `accept_help_request` assigns exactly one helper. (atomic UPDATE...WHERE status='requested' AND helper_id IS NULL in the RPC — verified reachable; own-accept rejected)
- [ ] Request status changes are visible to requester and helper. (requester realtime subscription + helper status display — needs two-user runtime to confirm)
- [x] Duplicate accept/cancel/expire races resolve to one canonical state. (all server-enforced in the RPC + status-guarded cancel)
- [ ] Linked conversation is available after acceptance. (RPC creates it; client fetches conversation_id — needs two-user runtime to confirm end-to-end)
- [x] `npm run typecheck` passes.

## Implementation Notes (this PR)

- `helpRequestApi` verified against the live DB (publishable key): create
  (status `requested`, `expires_at` server-default), own-accept correctly
  rejected, cancel (status-guarded) all behave correctly.
- `RequestSentScreen` rewired to the broadcast model: creates one request from
  the user's GPS (falls back to le Marais if location denied), subscribes to its
  row over realtime, reveals the accepting helper + routes to the linked
  conversation. `IncomingRequestScreen` loads a request by id and accepts via
  the RPC (handles already-accepted / expired).
- **Pending two-user runtime:** the realtime status hand-off and conversation
  routing need a second authenticated helper to verify end-to-end (the single
  publishable account can't accept its own request, by design).
- Distance on the incoming card is omitted (would need the helper's location);
  people_count + note are shown.

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
