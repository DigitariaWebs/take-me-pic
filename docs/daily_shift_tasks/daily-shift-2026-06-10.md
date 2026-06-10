# Daily Shift Tasks - Take Me Pic Mobile

Date: 2026-06-10
Project: Take Me Pic
Branch: `dev`
Shift owner: Codex agent
Template source: `/Users/macbookpro/Downloads/daily_shift_tasks_2026-06-06.pdf`

## Shift Summary

Web/Admin: replaced the last mock admin surfaces (reports, bans, audit log) with live, staff-only Supabase data and shipped transactional moderation RPCs, deployed and verified end-to-end. Mobile: updated `app.json` projectId/owner and expanded README with environment-specific run + local dev instructions.

## Big Tasks Done

- [x] Web — TASK-001 → 004 closed: reports, bans, and audit log now read live from Supabase with staff-only guards, explicit empty/error states, and ADR-0002 session/conversation/message report targets (removed mock localStorage admin auth).
- [x] Web — staff moderation mutations (resolve/dismiss report, ban, unban) as transactional `SECURITY DEFINER` RPCs that write the audit log atomically (ADR-0003), wrapped by Next.js server actions with row-level UI actions.
- [x] Web — deployed all SQL to the remote Supabase project as recorded migrations via MCP; provisioned staff (`admin-tmp@progix.com`) + non-staff test accounts.
- [x] Mobile — updated `projectId`/`owner` in `app.json`; enhanced README with environment-specific run commands and local development instructions.

## Verification

- Command: Playwright admin-access matrix (anonymous redirect, staff access, non-staff denial)
- Result: `pass` — 7 passed. End-to-end with real accounts: resolve/ban/unban produce correct rows + 3 matching audit entries; non-staff rejected (42501) on every path.

<!-- daily-shift:auto:start -->
## Git Tracking

Generated: 2026-06-10T22:31:40.744Z
Date scope: 2026-06-10 00:00 to generation time
Branch: `dev`
Working tree: 1 changed entry

### Mobile repo

Path: `/Users/macbookpro/Documents/Progix/take-my-pic`
Branch: `dev`
Working tree: 1 changed entry

#### Commits Today

```text
5d1a6a2 chore(app): update projectId in app.json and add owner field; enhance README with environment-specific run commands and local development instructions
23ce8da chore(board): mark TASK-001 + TASK-002 Done (PR #2 merged)
2f1bbed Merge pull request #2 from ProgixDev/feat/auth-profile-gate
f1109fd fix(auth): redirect ready users out of the onboarding funnel
28b62ca feat(auth): wire Supabase auth shell + trusted profile gate (TASK-001, TASK-002)
292749b Merge pull request #1 from ProgixDev/chore/agent-build-loop
8ab0dd2 chore(workflow): add supervised agent-board build loop
c53f0ce fix(ios): persist ExpoModulesJSI compatibility and stabilize TASK-002 flow
```
### Web/Admin repo

Path: `/Users/macbookpro/Documents/Progix/take-my-pic-web/take-me-pic-web`
Branch: `main`
Working tree: clean

#### Commits Today

```text
cae0274 docs: trust/safety glossary, mobile sync notes, agent board, MCP config
85cc1d5 test(e2e): playwright admin access suite
49d55a7 feat(admin): wire moderation and audit-log UI to live data
2bbb313 feat(admin): moderation data layer with transactional staff RPCs
4c6cc96 feat(admin): remove mock localStorage admin auth
```
<!-- daily-shift:auto:end -->

## Next Shift Tasks

- [ ] Task

## Notes

- Bugs found & fixed (Web):
  - `authenticated` role lacked `USAGE` on schema `private`, so every RLS policy calling `is_staff()` errored — no staff account could ever have entered the console. Fixed by migration.
  - `reports.status` enum cast missing in the resolve RPC.
  - e2e auth setup watched `localStorage` while sessions live in cookies.
  - Playwright locale had to be pinned to `fr-FR`.
  - Revoked public `EXECUTE` on `rls_auto_enable()` (advisor finding).
