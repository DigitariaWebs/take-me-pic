## Feature Information

- Feature Name: Trust, Safety, Moderation, and Admin Operations
- Description / Goal: Protect users in real-world stranger meetups through reports, blocks, bans, RBAC, and audit logs.
- Screens Involved: mobile report/block affordances, settings, web/admin repo
- User Inputs: report reason, block action, admin moderation decisions, role changes
- Backend/API Interactions: `reports`, `blocks`, `bans`, `admin_audit_log`, `user_roles`, `profiles`
- Special Conditions / Rules: admin console must use real auth/RBAC before production data
- Additional Notes: PRD marks trust/safety as existential product risk.

---

# Trust, Safety, Moderation, and Admin Operations

## Purpose

Trust and safety keeps Take Me Pic viable by reducing risk when strangers meet physically. It gives users immediate reporting/blocking controls and gives staff auditable moderation tools.

## Entry Points

- Report/block buttons on profile, post, comment, session, or chat
- Settings safety/account controls
- Admin moderation queues in web repo
- Support/escalation paths

## Preconditions

- User is authenticated.
- Report/block tables and RLS exist.
- Staff roles are assigned through trusted flow.
- Admin console has real authentication.

## Main User Flow

### Step 1 - Report Or Block

User:

- Reports suspicious behavior or blocks a user.

System:

- Validates reporter identity.
- Inserts report/block row.
- Applies immediate local safety state where appropriate.

### Step 2 - Moderate

Moderator:

- Reviews reports, appeals, blocked users, or incidents.

System:

- Requires staff role.
- Updates report/ban status.
- Writes audit log.

### Step 3 - Enforce Safety

System:

- Excludes banned/blocked users from matching, chat, feed, and visibility according to policy.

## Alternate Flows

- User appeals ban.
- Staff dismisses report.
- User unblocks another user.
- Severe incident triggers immediate ban.

## Edge Cases & Failure Scenarios

- False reports/spam.
- Reporter and reported user are in active session.
- Staff role removed during moderation.
- Audit write failure.

## Success State

- Reports are durable and triageable.
- Blocks/bans affect product surfaces.
- Staff actions are auditable.

## Failure State

- User receives clear feedback if report fails.
- Unsafe state should fail closed where possible.
- Admin action should not partially apply without audit.

## Backend / API Notes

- `user_roles` drives RBAC.
- `reports` can link reported user, post, or comment.
- Add message/report linkage when chat moderation is implemented.
- `admin_audit_log` should capture actor, action, target, and detail.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `safety_report_submitted` | User reports | `targetType`, `reason` |
| `user_blocked` | User blocks another | `blockedUserId` |
| `moderation_action_taken` | Staff acts | `action`, `targetType` |
| `ban_created` | Ban inserted | `duration`, `reason` |
| `safety_action_failed` | Report/block/admin fails | `action`, `errorCode` |

## Security & Validation Considerations

- Do not allow user-editable metadata for roles.
- RLS protects reports and staff-only fields.
- Admin actions require real session/JWT and RBAC.
- All staff changes should be audited.

## Technical Notes / Engineering Considerations

- Mobile repo only owns user-facing safety affordances.
- Admin web repo owns moderation UI.
- Safety filters must be enforced server-side, not only hidden in UI.

## QA Testing Recommendations

- Report user/post/comment where supported.
- Block/unblock affects matching/chat/feed.
- Non-staff cannot read moderation queue.
- Staff action writes audit log.
- Banned user excluded from presence/search.

## Open Questions

- What report reason taxonomy is required?
- What are ban appeal SLAs?
- Should chat messages be reportable in MVP?
- Who can grant staff roles?

