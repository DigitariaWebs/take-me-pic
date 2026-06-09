# Spec: Smart Itinerary

**Flow Doc**: `docs/features/phase_3/itinerary_flow.md`  
**Priority**: P3

## User Story

As a traveler, I want a smart daily itinerary, so that photo spots, activities, and bookings fit into one plan.

## Independent Test

Seed an itinerary with ordered steps, load it from the itinerary screen, and verify booking handoff from one step.

## Acceptance Criteria

1. User can load their own itinerary by city/day.
2. Steps are ordered by position.
3. Step kind controls display and CTA behavior.
4. Booking handoff does not mutate itinerary incorrectly.

## Minimal Data Contract

- `itineraries`
- `itinerary_steps`
- optional `bookings`

## Execution Tasks

- [ ] Add itinerary fetcher by day/city.
- [ ] Add step mapping to UI model.
- [ ] Wire itinerary screen.
- [ ] Add booking handoff.
- [ ] Test empty, offline cached, and ordered-step cases.

