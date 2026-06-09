## Feature Information

- Feature Name: Premium Entitlements
- Description / Goal: Unlock ad-free, profile boost, and exclusive spots through Apple IAP/RevenueCat, not Stripe.
- Screens Involved: `premium`, `(tabs)/moi`, spots, map/feed surfaces
- User Inputs: select plan, purchase, restore purchases, manage subscription
- Backend/API Interactions: RevenueCat SDK/webhooks, `subscriptions`, `profiles.is_premium`
- Special Conditions / Rules: iOS digital subscription must use Apple IAP; Stripe is forbidden for Premium
- Additional Notes: Current paywall is UI only.

---

# Premium Entitlements

## Purpose

Premium monetizes digital app features while staying App Store-compliant. It ensures the app reads entitlement state from a trusted subscription source rather than client-only state or Stripe.

## Entry Points

- Premium screen
- Exclusive spot gate
- Profile boost upsell
- Settings/manage subscription

## Preconditions

- RevenueCat project/products configured.
- Apple IAP products approved/configured.
- Webhook endpoint can sync entitlements to backend.

## Main User Flow

### Step 1 - Open Paywall

User:

- Opens Premium screen.

System:

- Loads offerings and entitlement state.
- Shows restore/manage options.

### Step 2 - Purchase Or Restore

User:

- Purchases or restores Premium.

System:

- Uses RevenueCat/StoreKit.
- Receives entitlement update.
- Syncs `subscriptions` and premium profile mirror.

### Step 3 - Use Premium Benefits

User:

- Opens boosted/exclusive/ad-free surfaces.

System:

- Reads entitlement state.
- Enables only active benefits.

## Alternate Flows

- Purchase cancelled.
- Billing retry/grace period.
- Subscription expires while app is active.
- Android later uses Play Billing through RevenueCat.

## Edge Cases & Failure Scenarios

- RevenueCat unavailable.
- Webhook delayed.
- User changes Apple account.
- Entitlement revoked/refunded.

## Success State

- Active entitlement unlocks Premium benefits.
- Backend mirrors entitlement state for profile/map/feed decisions.
- User can restore purchases.

## Failure State

- No entitlement means gates remain closed.
- User sees purchase/restore error and can retry.

## Backend / API Notes

- `subscriptions.entitlements` stores entitlement json.
- `profiles.is_premium` may be a cached mirror.
- Stripe must not drive Premium unlocks on iOS.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `premium_paywall_opened` | Paywall opens | `source`, `isPremium` |
| `premium_purchase_started` | User taps buy | `productId` |
| `premium_purchase_completed` | Entitlement active | `productId`, `store` |
| `premium_restore_completed` | Restore succeeds | `entitlementCount` |
| `premium_purchase_failed` | Purchase fails/cancelled | `errorCode` |

## Security & Validation Considerations

- Never trust client-only purchase state for backend gates.
- Webhook validation required.
- Avoid storing raw receipt secrets in public clients.

## Technical Notes / Engineering Considerations

- Use RevenueCat as entitlement abstraction.
- Keep entitlement checks in a small service.
- Handle stale JWT/app state until refreshed.

## QA Testing Recommendations

- Purchase success/cancel/failure sandbox flows.
- Restore purchase.
- Entitlement expiry/revocation.
- Premium gates in spots/map/feed.

## Open Questions

- Exact Premium product ids and entitlement names?
- What features are MVP Premium vs later?
- How should grace period display in UI?

