## Feature Information

- Feature Name: Help Request and Matching
- Description / Goal: Let a requester send a one-tap photo request and let an eligible helper accept it safely.
- Screens Involved: `(tabs)/index`, `user/[id]`, `request/sent`, `request/incoming`, `chat/[id]`, `session/index`
- User Inputs: selected helper/request, people count, note, accept/cancel actions
- Backend/API Interactions: `help_requests`, `conversations`, `conversation_participants`, notifications, proposed `accept_help_request` RPC
- Special Conditions / Rules: helper cannot be requester; transitions must be atomic and server-enforced
- Additional Notes: Architect review found current RLS blocks candidate helpers from accepting open requests.

---

# Help Request and Matching

## Purpose

This feature converts nearby availability into a concrete photo-help session. It solves the awkwardness of asking strangers by turning it into a trusted, explicit opt-in request.

## Entry Points

- Helper face-pin on map
- Request button on mini/public profile
- Incoming request notification
- Request sent status screen

## Preconditions

- Requester is authenticated, not banned, and allowed to request.
- Requester has a valid current location.
- Helper is available and not the requester.
- Request state machine exists in database.

## Main User Flow

### Step 1 - Create Request

User:

- Selects a helper or broadcasts a nearby request.

System:

- Validates location, requester eligibility, people count, and note.
- Inserts `help_requests` in `requested`.
- Starts expiry timer and sends notification to eligible helper(s).

### Step 2 - Accept Request

User:

- Helper taps “happy to help”.

System:

- Calls an atomic acceptance RPC.
- Validates request is still open and helper is eligible.
- Sets `helper_id`, status `accepted`, `accepted_at`, creates conversation, inserts both participants, and notifies requester.

### Step 3 - Move To Session

User:

- Requester sees accepted state and opens chat/session.

System:

- Shows accepted status.
- Allows chat and session-only GPS sharing.
- Transitions to `in_session` when session starts.

## Alternate Flows

- Request cancelled by requester.
- Request expires without helper acceptance.
- Helper declines or ignores.
- Requester chooses a different helper after timeout.

## Edge Cases & Failure Scenarios

- Two helpers accept simultaneously: one succeeds, others receive already-accepted response.
- Helper becomes unavailable before accepting.
- Request expires while accept request is in flight.
- Network failure after accept: refetch canonical request/conversation state.

## Success State

- Exactly one helper is assigned.
- Conversation exists with both participants.
- Request status and timestamps are consistent.
- Both users receive appropriate notification/in-app state.

## Failure State

- Request remains `requested`, `cancelled`, or `expired` with clear UI feedback.
- No partial conversation is created if acceptance fails.
- Duplicate accept attempts are idempotently rejected.

## Backend / API Notes

- Implement `accept_help_request(request_id)` RPC.
- Keep DB transition trigger.
- Add `WITH CHECK` for update policies.
- Make notification creation part of the same trusted flow or a reliable worker.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `help_request_created` | Request inserted | `requestId`, `peopleCount`, `targetMode` |
| `help_request_accepted` | Helper accepts | `requestId`, `latencyMs` |
| `help_request_expired` | Expiry fires | `requestId`, `ageSeconds` |
| `help_request_cancelled` | User cancels | `requestId`, `statusBefore` |
| `help_request_failed` | Create/accept fails | `step`, `errorCode` |

## Security & Validation Considerations

- Acceptance must not rely on broad client update rights.
- Prevent self-help requests.
- Exclude blocked/banned users.
- Never trust client-supplied helper assignment without server validation.

## Technical Notes / Engineering Considerations

- Treat request state machine as a deep module.
- Use optimistic UI only after knowing how to reconcile canonical state.
- Design for race conditions around accept/expire/cancel.

## QA Testing Recommendations

- Create, accept, cancel, expire.
- Double-accept race.
- Helper cannot accept own request.
- Banned/blocked users excluded.
- Conversation created once on accept.

## Open Questions

- Are requests targeted to one helper or broadcast to nearby helpers in MVP?
- What is the request expiry duration?
- Can requester chat before helper accepts?

