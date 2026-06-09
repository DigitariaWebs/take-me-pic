# Spec: Community Feed

**Flow Doc**: `docs/features/phase_2/community_feed_flow.md`  
**Priority**: P2

## User Story

As a user, I want a shared travel-journal feed with posts, likes, comments, and follows, so that I have a reason to return daily.

## Independent Test

Load feed, like a post, comment, follow an author, and verify all writes are persisted without duplicate rows.

## Acceptance Criteria

1. Feed loads posts with author, image, caption, counts, and comments.
2. Likes/follows are idempotent.
3. Comments are authored by `auth.uid()`.
4. Blocked/banned users are filtered according to safety policy.

## Minimal Data Contract

- `posts`
- `post_likes`
- `comments`
- `follows`
- `profiles`
- Storage bucket: `posts`

## Execution Tasks

- [ ] Add paginated feed fetcher.
- [ ] Add like/comment/follow data-layer functions.
- [ ] Add post image upload path.
- [ ] Wire carnet/post/user screens.
- [ ] Test idempotent interactions and blocked visibility.

