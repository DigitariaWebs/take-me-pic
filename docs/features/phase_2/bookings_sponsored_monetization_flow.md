## Feature Information

- Feature Name: Bookings, Sponsored Spots, and Geo Ads
- Description / Goal: Monetize real-world bookings and B2B advertising through Stripe while keeping Premium separate.
- Screens Involved: `booking`, spots, map/feed sponsored surfaces, admin web repo
- User Inputs: booking selection, payment, business campaign configuration in admin
- Backend/API Interactions: `bookings`, `businesses`, `sponsored_campaigns`, Stripe/Stripe Connect
- Special Conditions / Rules: real-world bookings use Stripe; Premium digital subscription does not
- Additional Notes: Mobile repo has booking UI prototype only; admin operations live in web repo.

---

# Bookings, Sponsored Spots, and Geo Ads

## Purpose

This feature supports non-subscription revenue: booking commissions and B2B sponsored placement. It keeps payment compliance clear by using Stripe for real-world/B2B transactions only.

## Entry Points

- Booking screen
- Sponsored spot CTA
- Geo-targeted ad placement
- Admin campaign management

## Preconditions

- Stripe account and Connect strategy configured.
- Booking inventory/business data exists.
- Sponsored campaign rules exist.
- Admin auth/RBAC is implemented before real operations.

## Main User Flow

### Step 1 - Start Booking

User:

- Selects an activity/stay/offer.

System:

- Creates booking intent and shows amount/currency/commission.

### Step 2 - Pay Through Stripe

User:

- Completes checkout/payment.

System:

- Confirms Stripe payment.
- Updates booking status.
- Records commission/payout metadata.

### Step 3 - Sponsored Placement

Business/admin:

- Creates sponsored spot or geo ad campaign.

System:

- Stores campaign area, budget, dates, and billing references.
- Surfaces eligible campaigns in map/feed/spots.

## Alternate Flows

- Payment cancelled.
- Refund requested.
- Campaign budget exhausted.
- Sponsored campaign expires.

## Edge Cases & Failure Scenarios

- Stripe webhook delayed.
- Duplicate payment callback.
- Booking cancelled after confirmation.
- Campaign targets invalid geo area.

## Success State

- Booking status reflects Stripe truth.
- Sponsored placements show only when active and paid/eligible.
- Premium remains independent of Stripe.

## Failure State

- Failed payment leaves booking pending/cancelled.
- User can retry checkout.
- Admin sees reconciliation errors.

## Backend / API Notes

- Use Stripe webhook as source of truth for payment state.
- Store Stripe ids on booking/business/campaign rows.
- Keep B2B/admin controls RBAC-gated.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `booking_opened` | Booking screen opens | `source` |
| `booking_payment_started` | Stripe checkout begins | `bookingId`, `amountCents` |
| `booking_confirmed` | Payment confirmed | `bookingId`, `commissionCents` |
| `sponsored_spot_viewed` | Sponsored content displayed | `campaignId`, `spotId` |
| `booking_payment_failed` | Payment fails | `bookingId`, `errorCode` |

## Security & Validation Considerations

- Do not trust client-side payment success.
- Webhooks must be verified.
- Admin campaign writes require RBAC and audit logs.
- Sponsored content should be labeled.

## Technical Notes / Engineering Considerations

- Keep Stripe integration outside Premium entitlement code.
- Use idempotent webhook handlers.
- Admin web repo owns operational UI.

## QA Testing Recommendations

- Payment success/cancel/failure.
- Webhook duplicate handling.
- Refund/cancel behavior.
- Campaign active/expired display.

## Open Questions

- Which booking categories launch first?
- Is Stripe Connect required at MVP or later?
- What ad labeling/legal copy is required?

