## Feature Information

- Feature Name: Photo Spots
- Description / Goal: Help users discover and contribute great photo locations with tips and sample photos.
- Screens Involved: `spots/index`, `spots/[id]`, `(tabs)/index`, `post/[id]`
- User Inputs: spot open, tip create, photo post, favorite/bookmark if added
- Backend/API Interactions: `spots`, `spot_photos`, `spot_tips`, `posts`, Storage
- Special Conditions / Rules: sponsored spots must be distinguishable from organic spots
- Additional Notes: Current UI uses mock spots, thumbs, and tips.

---

# Photo Spots

## Purpose

Photo Spots extends the app beyond immediate help requests by making community knowledge about good shooting locations reusable.

## Entry Points

- Spots map/list
- Spot detail
- Post tagged with spot
- Premium exclusive spot surface

## Preconditions

- Spot tables are seeded or user-generated spot creation is enabled.
- Location/map UI can show spot positions.
- Storage exists for spot photos.

## Main User Flow

### Step 1 - Browse Spots

User:

- Opens spots map/list.

System:

- Loads nearby or featured spots.
- Shows rating, review count, best time, photos, and sponsored state.

### Step 2 - Open Spot Detail

User:

- Taps a spot.

System:

- Loads hero, photos, tips, posts, and map context.

### Step 3 - Contribute Tip Or Photo

User:

- Adds tip or posts content tied to spot.

System:

- Inserts `spot_tips` or `posts`/`spot_photos` as authenticated user.
- Updates counts through canonical state.

## Alternate Flows

- Premium-only spot requires entitlement.
- Sponsored spot click routes to business/booking flow.
- Report inaccurate or unsafe spot.

## Edge Cases & Failure Scenarios

- Spot has no photos/tips.
- Location unavailable.
- User attempts duplicate/spam tips.
- Sponsored campaign expired.

## Success State

- Spot content loads and contributions persist.
- Sponsored/Premium states are clearly marked.

## Failure State

- App shows empty/error state without breaking map.
- Failed contribution is retryable.

## Backend / API Notes

- Index spot location with GiST.
- Keep sponsored campaigns separate from organic spots.
- Link posts to spots with nullable `spot_id`.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `spots_opened` | Spots screen opens | `city`, `source` |
| `spot_opened` | Spot detail opens | `spotId`, `isSponsored` |
| `spot_tip_created` | Tip inserted | `spotId` |
| `spot_photo_added` | Photo inserted | `spotId` |
| `premium_spot_gate_shown` | Entitlement required | `spotId` |

## Security & Validation Considerations

- Staff/moderation can remove unsafe spots.
- Validate user-generated tips/photos.
- Sponsored visibility should respect campaign dates and billing state.

## Technical Notes / Engineering Considerations

- Paginate photos/tips.
- Cache spot metadata for map performance.
- Avoid exposing precise user location in spot queries.

## QA Testing Recommendations

- Spots empty/loading/error.
- Spot detail with/without photos.
- Tip creation and moderation.
- Sponsored and Premium display states.

## Open Questions

- Can users create new spots in MVP?
- Are exclusive spots Premium-only or just boosted?
- What ranking algorithm orders spots?

