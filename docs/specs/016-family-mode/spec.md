# Spec: TMP Family Mode

**Flow Doc**: `docs/features/phase_3/family_mode_flow.md`  
**Priority**: P3

## User Story

As a family traveler, I want family members and optional location-sharing controls, so that family use of Take Me Pic is safer.

## Independent Test

Create a family with members, load it as owner/member/non-member, and verify RLS plus sharing toggles.

## Acceptance Criteria

1. Users see only families they own or belong to.
2. Owner/member permissions are enforced.
3. Location-sharing toggle persists only for authorized member state.
4. Non-members cannot read family graph.

## Minimal Data Contract

- `families`
- `family_members`
- `profiles`

## Execution Tasks

- [ ] Add family read helper.
- [ ] Add location-sharing toggle helper.
- [ ] Add owner/member permission tests.
- [ ] Wire family screen.
- [ ] Decide invitation/minor policy before production.

