# TASK-013 - Wire Photo Spots Backend Slice

Status: Backlog
Priority: P2
Project: Take Me Pic Mobile
Milestone: Phase 2 - Growth and retention
Owner: Agent

## Purpose

Move photo spots from mock data to Supabase so users can discover and inspect real community spots.

## Scope

- Read spots and spot details from Supabase.
- Wire spot tips/framing advice where current UI supports it.
- Respect moderation and sponsored placement fields.
- Preserve the existing map/spot visual design.

## Acceptance Criteria

- [ ] Spots list/map reads backend data.
- [ ] Spot detail reads backend data.
- [ ] Hidden/moderated spots are excluded.
- [ ] Sponsored fields are represented but not monetized yet.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Source docs: `docs/specs/011-photo-spots/spec.md`, `docs/features/phase_2/photo_spots_flow.md`.
- Backend sync: `docs/WEB-BACKEND-SYNC.md` §1 — spots now default to
  `status = 'pending'` and are invisible to other users until staff approve
  (RLS handles the "hidden/moderated spots are excluded" criterion). Show
  creators a "pending review" state on their own spots. Never call
  `admin_review_spot` from mobile.

## Dependencies

- TASK-011 completed.

## Verification

- Manual spots map/detail path.
- Moderation visibility check.
