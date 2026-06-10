# TASK-012 - Wire Community Feed Backend Slice

Status: Backlog
Priority: P2
Project: Take Me Pic Mobile
Milestone: Phase 2 - Growth and retention
Owner: Agent

## Purpose

Move the community feed from mock data to a small Supabase-backed slice after Phase 1 is stable.

## Scope

- Read feed posts from Supabase.
- Add create post flow if supported by current UI.
- Wire likes/comments behind feature APIs.
- Enforce author ownership and moderation visibility.

## Acceptance Criteria

- [ ] Feed reads backend posts.
- [ ] User can create a post if UI supports it.
- [ ] Likes/comments persist and refresh.
- [ ] Moderated/hidden content is not shown.
- [ ] `npm run typecheck` passes.

## Technical Notes

- Source docs: `docs/specs/010-community-feed/spec.md`, `docs/features/phase_2/community_feed_flow.md`.

## Dependencies

- TASK-011 completed.

## Verification

- Manual feed read/write path.
- Ownership/moderation access check.
