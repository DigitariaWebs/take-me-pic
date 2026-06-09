# Spec: Help Request and Matching

**Flow Doc**: `docs/features/phase_1/help_request_matching_flow.md`  
**Priority**: P1

## User Story

As a requester, I want to send a one-tap photo request that an eligible helper can accept, so that help is coordinated safely.

## Independent Test

Create a request as one user, accept it as another user through an RPC, and verify the request, conversation, participants, and notification state.

## Acceptance Criteria

1. Request create validates requester, location, people count, and expiry.
2. Helper acceptance is atomic and assigns exactly one helper.
3. Acceptance creates a linked conversation with both participants.
4. Duplicate accept/cancel/expire races reconcile to one canonical state.

## Minimal Data Contract

- `help_requests`
- `conversations`
- `conversation_participants`
- notifications for request status
- RPC: `accept_help_request(request_id)`

## Execution Tasks

- [ ] Add `accept_help_request` RPC with explicit `auth.uid()` checks.
- [ ] Fix update policies and `WITH CHECK` constraints.
- [ ] Add create/cancel/expire data-layer functions.
- [ ] Wire request sent/incoming screens to backend state.
- [ ] Test double-accept and expiry races.

