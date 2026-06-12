# TASK-009 - Wire Push Notification Registration and Delivery

Status: Review
Priority: P1
Project: Take Me Pic Mobile
Milestone: Phase 1 MVP - Notifications
Owner: Agent

## Purpose

Register push tokens and deliver important request/session notifications so helpers and requesters can respond in the moment.

## Scope

- Add Expo push notification setup (`expo-notifications` + `expo-device` deps, `expo-notifications` config plugin in app.json). `notifications` + `push_tokens` tables already exist (migration 0001) — **do not recreate them**; build only the migration `0009` triggers/functions/grants on top.
- Register device push token from a provider gated on auth state (covers post-login, post-profile-completion, and subsequent relaunches), not a one-off call. Guard with `Device.isDevice` (a simulator cannot mint an Expo push token).
- Store/update token under authenticated-user ownership: upsert into `push_tokens` `on conflict (token) do update set user_id = excluded.user_id` so a device handed to another account re-binds (stale/replaced token handling). Map `Platform.OS` → `store_kind` enum (`'apple'`/`'google'`).
- Server-side delivery via a **DB trigger + `pg_net`** (Supabase async HTTP) posting to the Expo Push API — self-contained in migration `0009`, server-initiated so it reaches **backgrounded/killed** users (realtime is foreground-only). No edge-function deploy. The same trigger functions INSERT the canonical in-app `notifications` row.
- Three trigger events, each `kind='request'` with a `data` jsonb `{type, request_id?, conversation_id?}` for routing:
  - `help_requests` status `requested → accepted` → notify the **requester** (`type='request_accepted'`).
  - `help_requests` INSERT → geo fan-out to **nearby available helpers** (`type='incoming_request'`), reusing the `find_available_helpers` matching predicate (available presence within radius), excluding the requester.
  - `messages` INSERT → notify the **other conversation participant(s)** (`type='new_message'`), excluding the sender.
- Push payload carries **non-sensitive** content only: generic title/body (e.g. sender first name, "New photo request nearby", "Your request was accepted") — **no message text, no precise location**; routing IDs travel in `data`.
- Deep-link from a tapped push: a data-driven tap handler routes `request_accepted`→`/chat/[conversation_id]` (fallback `/request/sent`), `incoming_request`→`/request/incoming`, `new_message`→`/chat/[conversation_id]`.
- Wire `NotificationsScreen` to the real `notifications` table (list + mark-read/mark-all) with `read_at` persistence, replacing the volatile `readIds` set and mock rows. Map DB rows → the existing card view model.
- In-app fallback when push permission is denied/undetermined: a banner on the notifications screen (CTA to enable in OS settings); the in-app list keeps functioning.

## User Flow

Verified user allows notifications

.

App registers push token

.

Nearby request/session event occurs

.

User receives push or in-app fallback

## Acceptance Criteria

- [x] Push token registration is tied to authenticated user (row `user_id = auth.uid()`, enforced by existing `push_tokens_self` RLS). _Live DB: A registered a token, owned by A._
- [x] Disabled notification permission shows a usable fallback (banner + working in-app list). _In-app list + read-state verified live; banner renders when `pushStatus !== 'granted'` (code path, behind auth gate)._
- [x] Request and acceptance notifications can be triggered (DB triggers INSERT `notifications` rows on incoming-request and accept). _All 3 triggers + 5 functions + pg_net confirmed installed on live DB (`0009` applied `OK 201`). Cross-user row delivery to a second account → `manual` (needs a seeded 2nd account / service role)._
- [ ] Backgrounded/killed users receive a push for request-accepted, incoming-request, and new-message (delivery does not depend on foreground realtime). _`manual` — real APNs/FCM delivery needs an EAS dev build on a physical device; not coverable by simulator Maestro._
- [x] A server-side trigger emits the push (`pg_net` → Expo Push API) on the relevant status/row change. _Triggers + `pg_net` extension confirmed live; the outbound Expo POST firing is `manual` (needs registered device tokens)._
- [ ] Tapping a push deep-links to the correct request/conversation (data-driven tap handler). _Routing code present (`routeFromNotificationData`); tap-from-OS-push is `manual` (device-only)._
- [x] Stale/replaced tokens are handled (`on conflict (token)` re-binds `user_id`). _Single-user upsert path verified live; cross-user re-bind + Expo `DeviceNotRegistered` prune → `manual`._
- [x] In-app notification read state persists (`read_at`), per the spec independent test. _Live DB: insert → unread → mark-read → read_at persists._
- [x] `npm run typecheck` passes.
- [x] Boot smoke (Maestro, Release build): app launches cleanly with expo-notifications + PushRegistrar + new screen bundled.

## Edge Cases (grilling)

- **Simulator has no push capability** → `Device.isDevice` guard skips token minting; app must not crash and the fallback banner shows. This is the path Maestro exercises.
- **Permission denied / undetermined** → no token registered; in-app notifications + banner still work.
- **Device re-used by another account** → token already exists for old user; `on conflict (token)` re-binds to the new `auth.uid()`.
- **Push delivered after the user already read the message** → in-app row is canonical/read-state authoritative; push is best-effort and may duplicate — acceptable for MVP (no client-side dedupe of an already-read row).
- **Notification target no longer exists** (request expired/cancelled, conversation deleted) → tap handler routes to the best-available screen; missing target degrades to the list, never crashes.
- **`incoming_request` fan-out cost** → notifies only `available` presence within radius, excluding the requester; at scale this needs rate-limiting (logged as a meeting question).
- **Idempotency** → accept fires once (DB transition trigger guarantees a single `requested→accepted`); each message/request row is a distinct event → one notification each. No dedupe table for MVP.
- **`notification_kind` enum has no `message`/`chat` value** → message notifications use `kind='request'` with `data.type='new_message'`; enum extension deferred.

## Technical Notes

- Source docs: `docs/specs/009-notifications-push/spec.md`, `docs/features/cross_cutting/notifications_flow.md`.
- Supabase does not provide native push; use Expo/APNs/FCM pipeline.
- Avoid sending precise location in notification payloads.
- Backend sync: `docs/WEB-BACKEND-SYNC.md` — the web admin wires
  `notifications` reads/templates in its TASK-008; keep rows client-agnostic.

## Dependencies

- TASK-005 completed.

## Verification

- **Live DB (publishable key + test accounts):** apply migration `0009` via management token; create a `help_request` (user A), assert an `incoming_request` notification row lands for a nearby available helper (user B); accept via `accept_help_request` (B), assert a `request_accepted` row for A; insert a `message`, assert a `new_message` row for the other participant. Confirm `notifications_self`/`push_tokens_self` RLS isolation (A cannot read B's rows).
- **Token upsert:** insert a fake token for user A, re-insert same token as user B → row re-binds to B (`on conflict` path).
- **Simulator Maestro:** boot app, reach the authenticated area, open the notifications screen, assert the push-off fallback banner renders (simulator has no push) and the in-app list / empty state renders; mark-all toggles read state.
- **`manual` (device-only):** real push receipt while backgrounded/killed, OS-push tap deep-link, and Expo receipt-based token pruning — require an EAS dev build on a physical device.
