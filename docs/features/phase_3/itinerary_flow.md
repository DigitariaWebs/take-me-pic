## Feature Information

- Feature Name: Smart Itinerary
- Description / Goal: Help travelers plan daily photo-friendly routes and activities.
- Screens Involved: `itinerary`, `spots/[id]`, `booking`
- User Inputs: city/day selection, step open, booking action
- Backend/API Interactions: `itineraries`, `itinerary_steps`, `spots`, `bookings`
- Special Conditions / Rules: bookings are real-world services and use Stripe, not IAP
- Additional Notes: Current UI uses mock itinerary steps.

---

# Smart Itinerary

## Purpose

Smart Itinerary turns Take Me Pic into a planning companion by combining photo stops, activities, and booking opportunities into a daily route.

## Entry Points

- Itinerary screen
- Spot detail CTA
- Booking CTA
- Notification/daily suggestion

## Preconditions

- User is authenticated.
- City/date context exists.
- Itinerary data or generation service is available.

## Main User Flow

### Step 1 - Open Itinerary

User:

- Opens itinerary screen for a day/city.

System:

- Loads itinerary and ordered steps.
- Shows active/current step.

### Step 2 - Explore Step

User:

- Opens a step for photo spot, coffee, ticket, walk, or view.

System:

- Shows detail, map/spot/booking context.

### Step 3 - Book Or Save

User:

- Books an activity or saves plan.

System:

- Starts booking flow where applicable.
- Persists itinerary changes if editing is enabled.

## Alternate Flows

- Empty itinerary: generate or show suggested spots.
- Offline: show cached itinerary.
- Premium-only itinerary recommendations if product chooses.

## Edge Cases & Failure Scenarios

- Booking unavailable.
- Step location missing.
- Date/city unsupported.
- Generated itinerary conflicts with opening hours.

## Success State

- User sees a useful ordered day plan.
- Booking CTAs route to compliant payment flow.

## Failure State

- Missing data falls back to spots/manual suggestions.
- Booking failures do not corrupt itinerary.

## Backend / API Notes

- `itineraries` owns user/day/city.
- `itinerary_steps` owns ordered step content.
- Keep booking state separate.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `itinerary_opened` | Screen opens | `city`, `day` |
| `itinerary_step_opened` | Step tapped | `kind`, `position` |
| `itinerary_booking_started` | Booking CTA tapped | `stepId` |
| `itinerary_empty` | No plan exists | `city` |
| `itinerary_failed` | Load/generate fails | `errorCode` |

## Security & Validation Considerations

- Users can only manage their own itineraries.
- Validate booking handoff server-side.
- Avoid exposing precise travel plans publicly.

## Technical Notes / Engineering Considerations

- Keep itinerary generator separate from persistence.
- Stable ordering by `position`.
- Cache per day/city.

## QA Testing Recommendations

- Load with/without steps.
- Step ordering.
- Booking handoff.
- Offline cached display.

## Open Questions

- Are itineraries generated, manually curated, or both?
- Can users edit/reorder steps?
- Are itineraries Premium-only?

