## Feature Information

- Feature Name: Proximity and Presence
- Description / Goal: Show available nearby helpers quickly while preserving session-only location privacy.
- Screens Involved: `(tabs)/index`, `user/[id]`, `settings`
- User Inputs: location permission, availability toggle, filters, radius/language/trust choices
- Backend/API Interactions: `presence`, PostGIS RPC `find_available_helpers`, `profiles`
- Special Conditions / Rules: GPS must not become broad always-on tracking
- Additional Notes: Current UI uses mock nearby users and deterministic map placement.

---

# Proximity and Presence

## Purpose

This feature powers the “find a helper in under 30 seconds” promise by making available users discoverable near the requester without exposing unnecessary location data.

## Entry Points

- Map tab
- Availability controls
- Profile mini-card from face-pin
- Request creation flow

## Preconditions

- User is authenticated and allowed to use the help network.
- Location permission is granted.
- `presence` rows and PostGIS extension exist.
- Privacy policy for radius/fuzzing/session-only GPS is defined.

## Main User Flow

### Step 1 - Grant Location

User:

- Opens the map and grants location permission.

System:

- Reads current location.
- Shows permission loading/error states.
- Does not write precise GPS unless user is available or in an active session.

### Step 2 - Set Availability

User:

- Marks themselves available/busy/offline.

System:

- Updates `presence.status`, radius, timestamp, and location according to privacy rules.
- Stops sharing when status changes to offline or session ends.

### Step 3 - Find Helpers

User:

- Opens map or changes filters.

System:

- Calls indexed PostGIS lookup.
- Returns nearby available helpers with profile/trust signals.
- Shows empty, retry, and stale-location states.

## Alternate Flows

- Permission denied: show manual enable instructions and non-map fallback.
- No helpers nearby: expand radius or show notification opt-in.
- Location stale: request refresh before creating help request.

## Edge Cases & Failure Scenarios

- User revokes permission while available.
- Backend returns helper who becomes busy before request.
- Location accuracy is too low.
- User is blocked/banned and should not appear.

## Success State

- Requester sees nearby available helpers sorted by distance/trust.
- Helper presence updates without bloating profile rows.
- GPS sharing stops when user is offline or session completes.

## Failure State

- App shows location or backend error with retry.
- User cannot create a request from stale or missing location.
- Presence is cleared/expired when heartbeat stops.

## Backend / API Notes

- Use `geography(point,4326)` and GiST index.
- Prefer RPC for nearby helper search rather than exposing raw presence rows broadly.
- Add TTL/heartbeat cleanup for stale presence.
- Tighten current broad `presence_read` policy before production.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `map_opened` | User opens map | `permissionState` |
| `presence_status_changed` | Availability changes | `status`, `radiusM` |
| `nearby_helpers_loaded` | RPC succeeds | `count`, `radiusM`, `latencyMs` |
| `nearby_helpers_empty` | No results | `radiusM`, `filters` |
| `location_permission_failed` | Permission denied/revoked | `stage` |

## Security & Validation Considerations

- Do not expose precise location to all authenticated users.
- Filter banned/blocked users server-side.
- Expire stale presence.
- Do not trust client-provided distance.

## Technical Notes / Engineering Considerations

- Use a deep Proximity module: `setAvailability`, `clearAvailability`, `findAvailableHelpers`.
- Debounce filter/radius changes.
- Cache last successful result briefly for poor connectivity.

## QA Testing Recommendations

- Permission grant/deny/revoke.
- Available/busy/offline transitions.
- Nearby query boundary radius cases.
- Stale heartbeat cleanup.
- Blocked/banned users excluded.

## Open Questions

- What is the default radius and max radius?
- Should precise helper location ever be shown before acceptance?
- What heartbeat interval and expiry window should MVP use?

