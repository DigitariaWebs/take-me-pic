# Spec: Premium Entitlements

**Flow Doc**: `docs/features/phase_2/premium_entitlements_flow.md`  
**Priority**: P2

## User Story

As a power user, I want Premium benefits through compliant in-app purchase, so that I can unlock ad-free, boosted, and exclusive features.

## Independent Test

Mock a RevenueCat active entitlement, sync it to backend, and verify Premium gates open without reading Stripe state.

## Acceptance Criteria

1. Paywall loads RevenueCat offering state.
2. Purchase/restore updates entitlement state.
3. Backend mirrors active entitlement in `subscriptions` and profile cache.
4. Stripe state cannot unlock Premium.

## Minimal Data Contract

- RevenueCat customer/entitlement
- `subscriptions`
- `profiles.is_premium`

## Execution Tasks

- [ ] Add RevenueCat SDK/config.
- [ ] Add entitlement sync/webhook plan.
- [ ] Add Premium gate helper.
- [ ] Wire Premium screen and gated surfaces.
- [ ] Test purchase, restore, expiry, and revocation.

