# Spec: Photo Spots

**Flow Doc**: `docs/features/phase_2/photo_spots_flow.md`  
**Priority**: P2

## User Story

As a user, I want to discover photo spots with community tips and photos, so that I can find better places to shoot.

## Independent Test

Seed spots, tips, and photos; load spots map/detail; add a tip as an authenticated user.

## Acceptance Criteria

1. Spots load with location, rating, review count, hero/photo content, and best time.
2. Spot details load photos and tips.
3. Authenticated users can contribute tips.
4. Sponsored and Premium states are clearly distinguished.

## Minimal Data Contract

- `spots`
- `spot_photos`
- `spot_tips`
- `posts.spot_id`
- `sponsored_campaigns`

## Execution Tasks

- [ ] Add spots list/detail fetchers.
- [ ] Add tip/photo contribution helpers.
- [ ] Wire spots index/detail screens.
- [ ] Add sponsored/Premium display handling.
- [ ] Test no-photo/no-tip and invalid location cases.

