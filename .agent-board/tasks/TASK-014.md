# TASK-014 - Prepare Premium Entitlements Foundation

Status: Backlog
Priority: P2
Project: Take Me Pic Mobile
Milestone: Phase 2 - Monetization readiness
Owner: Agent

## Purpose

Prepare the entitlement model for premium features without implementing non-compliant Stripe billing for in-app digital subscriptions.

## Scope

- Define premium entitlement flags used by the app.
- Gate premium-only UI states behind entitlement reads.
- Document RevenueCat/StoreKit direction for iOS premium subscriptions.
- Keep Stripe reserved for real-world bookings and B2B sponsored/ads.

## Acceptance Criteria

- [ ] Premium UI reads entitlement state through one feature API/hook.
- [ ] No Stripe-based in-app digital subscription flow is introduced.
- [ ] Entitlement state can represent ad-free, profile boost, and exclusive spots.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Source docs: `docs/specs/012-premium-entitlements/spec.md`, `docs/features/phase_2/premium_entitlements_flow.md`, `Take-Me-Pic-PRD-and-Assessment.md`.
- Premium subscriptions on iOS should use StoreKit/RevenueCat, not Stripe.
- Backend sync: `docs/WEB-BACKEND-SYNC.md` — the web admin prepares premium,
  payments, and booking operations in its TASK-010; keep entitlement state
  server-owned so both clients read the same source.

## Dependencies

- TASK-011 completed.

## Verification

- Manual entitlement-gated UI check.
- Typecheck.
