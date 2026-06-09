## Feature Information

- Feature Name: TMP Family Mode
- Description / Goal: Let families coordinate trusted use and optional location sharing.
- Screens Involved: `family`, `chat/[id]`, settings
- User Inputs: family member selection, chat action, location-sharing toggle
- Backend/API Interactions: `families`, `family_members`, profiles, conversations
- Special Conditions / Rules: minors/family safety policy must be explicit before production
- Additional Notes: Current UI uses mock family members.

---

# TMP Family Mode

## Purpose

Family Mode supports safer family travel coordination and future guardian controls. It is especially sensitive because it may involve minors and location sharing.

## Entry Points

- Family screen
- Settings family section
- Family member chat CTA

## Preconditions

- User is authenticated.
- Family owner/member relationship exists.
- Location-sharing rules are accepted.

## Main User Flow

### Step 1 - Open Family

User:

- Opens family screen.

System:

- Loads family and member list.
- Shows location-sharing status for each member.

### Step 2 - Manage Member Interaction

User:

- Opens member profile/chat or toggles sharing.

System:

- Validates family membership/owner rules.
- Updates only permitted member settings.

### Step 3 - Use Family Context

User:

- Starts chat or uses family-safe help mode.

System:

- Applies family trust gates where product requires.

## Alternate Flows

- User is invited to family.
- Owner removes member.
- Child/minor account has restricted features.

## Edge Cases & Failure Scenarios

- User leaves family during active share.
- Unauthorized member management.
- Location-sharing revoked.
- Family owner account banned.

## Success State

- Family list and sharing states persist.
- Users see only families they belong to.
- Location sharing respects explicit toggles.

## Failure State

- Unauthorized updates are blocked.
- Sharing failure leaves prior safe state.

## Backend / API Notes

- `families.owner_id` controls owner management.
- `family_members` stores membership and location-sharing flag.
- Add invitations if family onboarding is implemented.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `family_opened` | Screen opens | `memberCount` |
| `family_member_chat_opened` | Chat CTA tapped | `memberId` |
| `family_location_toggle_changed` | Sharing changed | `enabled` |
| `family_member_added` | Invite/member add succeeds | `role` |
| `family_action_failed` | Backend rejects | `action`, `errorCode` |

## Security & Validation Considerations

- Strong consent for location sharing.
- Owner/member RLS.
- Child-safety policy before minors are supported.
- Do not expose family graph publicly.

## Technical Notes / Engineering Considerations

- Model invitations separately if needed.
- Keep family location sharing separate from public presence.
- Audit sensitive family actions.

## QA Testing Recommendations

- Member/owner permissions.
- Toggle location sharing.
- Non-member access denied.
- Leave/remove member edge cases.

## Open Questions

- Are minors supported in MVP?
- What guardian consent model applies?
- Can family members request helpers on behalf of each other?

