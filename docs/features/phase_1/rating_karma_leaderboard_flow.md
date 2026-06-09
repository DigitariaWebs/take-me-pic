## Feature Information

- Feature Name: Rating, Karma, and TMP Stars
- Description / Goal: Convert completed sessions into trust signals, karma rewards, and public leaderboard recognition.
- Screens Involved: `session/rating`, `stars`, `(tabs)/moi`, `user/[id]`, map pins
- User Inputs: star rating, optional comment, report/block after bad session
- Backend/API Interactions: `ratings`, `karma_ledger`, `profiles`, `leaderboard`
- Special Conditions / Rules: one rating per rater per session; karma is ledger-derived
- Additional Notes: Current UI uses mock rating/karma values.

---

# Rating, Karma, and TMP Stars

## Purpose

This feature makes the help network safer and more rewarding by turning session outcomes into durable reputation. It gives users confidence when choosing helpers and rewards helpers for good behavior.

## Entry Points

- End of session
- Session gallery completion
- Profile karma display
- TMP Stars leaderboard
- Map helper pins

## Preconditions

- Help request is completed.
- User is a participant in the completed request.
- User has not already rated that request.
- Rating scale and karma rules are defined.

## Main User Flow

### Step 1 - Prompt For Rating

User:

- Opens rating screen after session/gallery.

System:

- Shows counterpart identity and star controls.
- Blocks submission until valid star value is selected.

### Step 2 - Submit Rating

User:

- Selects stars and submits optional comment.

System:

- Inserts `ratings` row with unique `(help_request_id, rater_id)`.
- Applies karma ledger entries through trusted backend logic.
- Updates cached profile counters.

### Step 3 - Show Reputation

User:

- Views profile, map, or leaderboard.

System:

- Displays karma, rating, photos count, and leaderboard rank from canonical records.

## Alternate Flows

- User reports instead of rating.
- User skips optional comment.
- User rates later from session history.

## Edge Cases & Failure Scenarios

- Duplicate rating attempt.
- Rating before session completion.
- Network failure after rating write but before UI updates.
- Banned user should not appear on leaderboard.

## Success State

- Rating persists once.
- Karma ledger records deterministic change.
- Profile and leaderboard reflect new reputation.

## Failure State

- Duplicate or invalid rating is rejected.
- User can retry failed submission without double-awarding karma.

## Backend / API Notes

- Keep karma ledger append-only.
- Use DB constraints for one rating per rater/session.
- Leaderboard view should remain `security_invoker`.
- Consider triggers/functions for cached aggregates.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `rating_opened` | Rating screen opens | `requestId`, `role` |
| `rating_submitted` | Rating write succeeds | `requestId`, `stars` |
| `karma_awarded` | Ledger entry created | `reason`, `delta` |
| `leaderboard_opened` | TMP Stars opens | `rankVisible` |
| `rating_failed` | Submit fails | `errorCode` |

## Security & Validation Considerations

- Only participants can rate.
- Prevent self-rating and duplicate rating.
- Do not let clients write arbitrary karma deltas.
- Hide banned users from public leaderboard.

## Technical Notes / Engineering Considerations

- Treat karma as a deep pure module with deterministic rules.
- Separate rating write from UI counters.
- Make retry idempotent.

## QA Testing Recommendations

- Valid rating submit.
- Duplicate submit rejection.
- Non-participant cannot rate.
- Leaderboard excludes banned users.
- Offline/retry does not double-award.

## Open Questions

- What exact karma deltas apply per action?
- Are ratings bidirectional or requester-only in MVP?
- Can users edit ratings?

