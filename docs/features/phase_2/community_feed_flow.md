## Feature Information

- Feature Name: Community Feed
- Description / Goal: Let users browse, post, like, comment, and follow inside the shared travel journal.
- Screens Involved: `(tabs)/carnet`, `post/[id]`, `user/[id]`, `(tabs)/moi`
- User Inputs: post compose, like, comment, follow, report
- Backend/API Interactions: `posts`, `post_likes`, `comments`, `follows`, `profiles`, Storage `posts`
- Special Conditions / Rules: authored writes only; moderation hooks required
- Additional Notes: Current UI uses `data/mock.ts` posts and local interaction state.

---

# Community Feed

## Purpose

The community feed gives users a reason to return outside active photo sessions. It turns Take Me Pic from a utility into a travel-journal network.

## Entry Points

- Carnet tab
- Post detail
- Public profile
- Notification deep link

## Preconditions

- User is authenticated.
- Feed tables and post image storage are available.
- Moderation/reporting rules exist.

## Main User Flow

### Step 1 - Browse Feed

User:

- Opens the carnet tab.

System:

- Loads recent/relevant posts with author and counts.
- Shows loading, empty, and retry states.

### Step 2 - Interact With Post

User:

- Likes, comments, opens author, or follows author.

System:

- Writes idempotent like/follow rows.
- Inserts comments as authenticated author.
- Updates counters from canonical state.

### Step 3 - Create Post

User:

- Composes caption and selects image/spot.

System:

- Uploads image to Storage.
- Inserts post row and links spot if selected.

## Alternate Flows

- User opens post from notification.
- User reports content.
- User deletes their own post/comment.

## Edge Cases & Failure Scenarios

- Duplicate like/follow.
- Image upload fails.
- Author is blocked/banned.
- Comment is empty or too long.

## Success State

- Feed reflects canonical post/comment/like/follow state.
- New posts appear in feed/profile.
- Counts remain consistent.

## Failure State

- Failed interactions roll back optimistic UI.
- Upload failures show retry/remove.

## Backend / API Notes

- Use unique constraints for likes/follows.
- Use Storage paths for post images.
- Consider pagination by created time/id.
- Moderation tables must link reports to posts/comments.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `feed_opened` | Carnet opens | `source` |
| `post_liked` | Like succeeds | `postId` |
| `comment_created` | Comment inserted | `postId` |
| `post_created` | Post inserted | `hasSpot`, `hasImage` |
| `follow_toggled` | Follow/unfollow succeeds | `targetUserId` |

## Security & Validation Considerations

- Users can write only as themselves.
- Banned users cannot post/comment.
- Validate media size/type.
- Report/block must affect visibility.

## Technical Notes / Engineering Considerations

- Keep feed fetchers paginated.
- Avoid N+1 author/comment lookups.
- Reconcile optimistic interactions with server constraints.

## QA Testing Recommendations

- Feed loading/empty/retry.
- Like/comment/follow idempotency.
- Post image upload failure.
- Reported/blocked user visibility.

## Open Questions

- Is feed global, local-by-city, or follow-based for MVP?
- Can users edit posts/comments?
- What content moderation queue owns reported posts?

