# TASK-010 - Wire Trust, Safety, and Reporting Flows

Status: Done
Priority: P1
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Trust and safety
Owner: Agent

## Purpose

Wire reporting, blocking, banned-user gates, and safety state so the stranger-to-stranger help network has a minimum operational safety layer.

## Scope

- `reports` / `blocks` / `bans` tables + `report_status` enum already exist on the **live DB** (0001 + web-added target columns) — mobile types are stale. **Do not recreate tables**; add the missing types to `database.types.ts` and a migration `0010` for the new functions only.
- **Report API**: insert a `reports` row with exactly ONE direct target column + a required `reason`; `status` defaults to `open` (mobile never sets a decision status). Profile report → `reported_user_id`; chat report → `conversation_id` (honors WEB-BACKEND-SYNC §4 — report the context, not participant-level).
- **Block API**: insert into `blocks` (`blocker_id = auth.uid()`, idempotent `on conflict do nothing`); unblock = delete; list my blocks.
- **Report/block entry points**: profile (`PublicProfileScreen` `MoreHorizontal` → action sheet: Report user / Block-or-Unblock), chat (`ChatHeader` overflow → Report conversation / Block user), and settings ("blocked users" → real management screen; generic "report" row → directs the user to report from a profile/chat since it has no inherent target). Replaces the stubbed `Alert` placeholders.
- **Banned-user gate**: derive the ban from a new `SECURITY DEFINER` RPC `my_ban_status()` that reads the `bans` table for `auth.uid()` (active = `expires_at` null or future) — **not** `profiles.is_banned`, which the web RPCs don't maintain and which mobile can't read from `bans` directly (staff-only RLS). Wire it into `useTrustedProfileGate`; keep the existing `is_banned` check as an additional OR fast-path. **Fail open** on RPC error (don't strand legitimate users; server RLS still blocks a banned user's writes; re-checked next launch).
- **Matching exclusion**: recreate `find_available_helpers` as `SECURITY DEFINER` (same signature/returns) adding (a) bidirectional `blocks` exclusion and (b) active-`bans` exclusion; keep the existing `is_banned = false` filter as belt-and-suspenders.
- Moderation/audit + ban/unban + report-decision stay **server/staff-owned** (web `admin_*` RPCs); mobile only inserts `open` reports and self `blocks`, and reads its own ban status.
- **Out of scope (deferred):** blocking message-send / tearing down an existing conversation, and hiding blocked users from feed/social surfaces — both need `messages`/feed RLS changes in the web's domain (logged as a meeting question).

## User Flow

User sees unsafe behavior

.

User reports or blocks the other account

.

Backend records the safety action

.

Blocked/banned users are excluded from future interactions

## Acceptance Criteria

- [x] User can submit a report (one target + reason, `status='open'`). _Live DB: profile-style `reported_user_id` report inserts as `status='open'`; chat `conversation_id` path is structurally identical (same API). UI entry points wired on profile + chat._
- [x] User can block another user; block is idempotent; user can unblock from settings. _Live DB: block → idempotent re-block → readable → unblock → gone (all pass)._
- [x] Blocked users are excluded from matching (`find_available_helpers`) in both directions. _Function recreated `SECURITY DEFINER` with bidirectional block exclusion + applied (`0010` `OK 201`); callable + self-exclusion verified live. Excluding a specific blocked **available** helper needs a seeded nearby helper → `manual`._
- [x] Active-banned users are excluded from matching (via `bans`, not `is_banned`). _Exclusion added to `find_available_helpers`; live cross-presence check is `manual` (needs a seeded banned available helper)._
- [x] Banned users are gated after auth restore — `my_ban_status()` RPC drives the `'blocked'` gate. _Live DB: `my_ban_status()` callable by authenticated, returns not-banned for A. The actual `'blocked'` redirect for a truly banned session is `manual` (needs a staff-applied ban on a live account)._
- [x] Moderation decisions / ban writes are NOT performed from mobile (insert-`open`-only; self-`blocks`-only). _RLS: a report as another reporter is rejected._
- [x] `npm run typecheck` passes.
- [x] Boot smoke (Maestro, Release build): app launches cleanly with the safety wiring bundled.

## Edge Cases (grilling)

- **Web-applied ban** (`bans` row, `is_banned` still false) → now gated via `my_ban_status()`; the old `is_banned`-only gate would have missed it.
- **Expired ban** (`expires_at` in the past) → not active → not gated, excluded from neither matching nor access.
- **`bans` RLS is staff-only** → mobile never selects `bans`; it calls the `SECURITY DEFINER` `my_ban_status()` which only answers for `auth.uid()` (no probing others).
- **Gate RPC error / offline** → fail open (treat as not-banned); server RLS still blocks the banned user's writes, and the gate re-checks on next successful load.
- **Block during an active session/conversation** → matching exclusion applies going forward; the existing conversation is NOT torn down (deferred — web RLS domain).
- **Unblock** → the user reappears in matching on the next `find_available_helpers` refetch.
- **Report integrity** → API enforces exactly one target column; `reason` required; `status` forced to `open`. Duplicate reports allowed (each is an event; staff dedupe).
- **Self-target** → impossible by construction (report/block affordances only render on other users); `blocks` also has a DB `no_self_block` check.
- **`find_available_helpers` made `SECURITY DEFINER`** → needed so it can read `blocks`/`bans` (both RLS-restricted) for exclusion; returns the same curated columns it already exposed, so no new data leaks.

## Technical Notes

- Source docs: `docs/specs/017-trust-safety-admin/spec.md`, `docs/features/cross_cutting/trust_safety_admin_flow.md`.
- Do not trust client-provided role/moderation state.
- Admin console implementation is primarily in the web repo; mobile owns user-facing reporting.
- Backend sync: `docs/WEB-BACKEND-SYNC.md` §4–5 — reports take ONE direct
  target column (user/post/comment/session/conversation/message) and are
  inserted as `open` only; active-ban = `expires_at` null or future, never
  row existence, and `profiles.is_banned` is not maintained by the web RPCs.

## Dependencies

- TASK-002 completed.

## Verification

- **Live DB (publishable key + test account A):** apply `0010`; insert a report (profile-style `reported_user_id` + reason) and a chat-style report (`conversation_id`) → assert rows land as `status='open'`; assert the API rejects a no-target or multi-target report. Block a user id → assert idempotent re-block; unblock → row gone. Call `my_ban_status()` → returns not-banned for A. Confirm `find_available_helpers` no longer returns a helper A has blocked.
- **Live DB ban gate:** (best-effort / needs a staff RPC or a manually-inserted `bans` row) assert `my_ban_status()` flips to banned for an active `bans` row and back for an expired one.
- **Simulator Maestro:** boot smoke on the Release build — app launches cleanly with the safety wiring; reach a profile/chat and assert the report/block action sheet opens (where reachable unauthenticated, else boot-only).
- **`manual`:** the actual `'blocked'` gate redirect for a truly banned account (needs a banned auth session), and chat/feed-level block effects (deferred).
