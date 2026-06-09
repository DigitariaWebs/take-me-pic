# Spec: Bookings and Sponsored Monetization

**Flow Doc**: `docs/features/phase_2/bookings_sponsored_monetization_flow.md`  
**Priority**: P2/P3

## User Story

As a traveler or business operator, I want real-world bookings and sponsored placement to use Stripe, so that transactions are compliant and operationally trackable.

## Independent Test

Create a booking, process a mocked Stripe confirmation webhook, and verify booking status changes without Premium entitlement changes.

## Acceptance Criteria

1. Booking state is created before checkout.
2. Stripe webhook is source of truth for confirmed/cancelled/refunded states.
3. Sponsored campaigns display only when active/eligible.
4. Premium subscription logic remains separate.

## Minimal Data Contract

- `bookings`
- `businesses`
- `sponsored_campaigns`
- Stripe payment/checkout ids

## Execution Tasks

- [ ] Add booking create/read helpers.
- [ ] Add Stripe webhook design in backend/admin scope.
- [ ] Add sponsored campaign eligibility query.
- [ ] Wire booking screen and sponsored spot surfaces.
- [ ] Test webhook idempotency and expired campaign handling.

