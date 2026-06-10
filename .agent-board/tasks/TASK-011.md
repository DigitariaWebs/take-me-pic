# TASK-011 - Add Phase 1 Analytics and Integration Hardening

Status: Backlog
Priority: P1
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Hardening
Owner: Agent

## Purpose

Add the minimum analytics, QA, and integration hardening needed before real-user Phase 1 testing.

## Scope

- Track core analytics events for onboarding, profile, request, accept, chat, photo upload, rating, and report.
- Add integration checks around RLS-sensitive Phase 1 operations.
- Add manual QA checklist for the full requester/helper journey.
- Confirm private data is not logged or exposed in analytics.
- Update docs/status after verification.

## User Flow

User completes Phase 1 journey

.

App emits privacy-safe events

.

Team can inspect funnel and technical health

.

QA confirms end-to-end flow before TestFlight testing

## Acceptance Criteria

- [ ] Core analytics events are emitted with privacy-safe properties.
- [ ] Auth/profile/request/session/photo/rating/report path has a QA checklist.
- [ ] RLS-sensitive operations have at least manual or scripted verification notes.
- [ ] Supabase status docs reflect what is live.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Source docs: `docs/product/prd.md`, `docs/SUPABASE-INTEGRATION-STATUS.md`.
- Avoid sending precise GPS, raw message text, or private photo URLs to analytics.

## Dependencies

- TASK-004 through TASK-010 completed.

## Verification

- Full two-user Phase 1 manual flow.
- Analytics event inspection.
- Typecheck.
