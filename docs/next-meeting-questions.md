# Next Meeting Questions

## Context

Open product and engineering questions to resolve before implementation locks.

## Questions

1. Help request model: broadcast to all nearby helpers, or targeted to a picked helper?
   - **MVP decision (taken): broadcast.** The schema + `accept_help_request` are broadcast — a request has no target helper; any eligible non-banned non-owner can accept, first-wins. The mobile UI is being wired to match (`RequestSentScreen` shows "waiting for a nearby helper" and reveals the accepter on accept).
   - Decision needed from the meeting: confirm broadcast as the product model, or invest in **targeted** (add `target_helper_id` + restrict `accept_help_request`) post-MVP. Targeted changes matching, notifications, and the request UX.

2. Without heartbeat, what stale-presence policy do we want for MVP?
   - Proposed baseline: presence updates are event-driven (toggle on/off, app background, permission revoke, current-location refresh tap).
   - Decision needed: TTL duration for `updated_at` filtering in `find_available_helpers`, and whether to enforce a one-time foreground refresh when presence is on and data is older than the TTL window.

3. ~~`find_available_helpers` returns no per-helper location~~ **(resolved — migration 0005 returns lat/lng + distance_m; pins now sit at real positions).**
   - Open privacy follow-up: 0005 returns the exact presence point. Decide whether to expose **coarse/snapped** location instead of precise GPS for nearby helpers.

4. Should the admin panel display or fetch users' current location?
   - Web-side recommended answer (compliance-first): **not for MVP, and never as raw live presence.**
     - Today the admin panel reads **no coordinates at all** — the PostGIS columns are deliberately not selected or decoded (web TASK-006 hardening note, ADR-0004 boundary). `presence` is written by mobile but consumed only by `find_available_helpers` matching.
     - Purpose limitation: users share presence **to be matched with nearby helpers**. Repurposing it as back-office live tracking is a different processing purpose and would need its own justification, disclosure in the privacy policy, and arguably its own consent — the riskiest interpretation under GDPR for an EU-facing product.
     - If support genuinely needs location context, prefer the **request-anchored snapshot** (`help_requests.location`, captured when the request was created) over live `presence`: it is tied to a concrete session-review purpose, not ongoing surveillance.
     - If/when we expose anything, the web side will require: **coarse precision** (snapped/rounded, mirroring the question-2 decision), a dedicated staff **capability** (not blanket staff access), an **audit log entry per view** (same pattern as Privileged content review), and respect for `share_radius_m`/presence-off state.
     - Decision needed from the meeting: is there a real support scenario (safety incident, no-show dispute) that justifies even the snapshot view in phase 1, or do we defer entirely?
     
5. make sure he opens an expo account and vercel one to streamline deployement.

6. Background / killed-app handling for pending requests, accepts, and messages.
   - Today delivery is **Supabase realtime (foreground only)** — backgrounded/killed users miss the live "accepted" / "new request" / "new message" event. Server state is durable (the request/conversation persist), so this is a **delivery + resume** problem, not data loss.
   - Two parts, split across tasks so it doesn't slip:
     - **Delivery → push (TASK-009):** server-side trigger (DB trigger / edge function) that emits a push on `status → accepted`, new nearby request, and new message; token registration; deep-link from the push into the right screen.
     - **Resume/reconnect → hardening (TASK-011):** on app foreground/launch, re-query active request/session/conversation state, catch up on missed realtime events, resubscribe, and handle expiry-while-backgrounded.

7. Push delivery infrastructure (surfaced while building TASK-009).
   - **MVP decision (taken): dispatch push from a DB trigger via `pg_net` → Expo Push API**, rather than a deployed edge function. Rationale: self-contained in migration `0009` (one apply step, nothing to deploy/verify separately), server-initiated so it reaches backgrounded/killed devices, and idiomatic (Supabase Database Webhooks are pg_net under the hood). Trade-off: couples delivery to the DB and is harder to add retry/observability to than a function. Decision needed: confirm pg_net-from-trigger for phase 1, or move dispatch into an edge function once deploy tooling is set up.
   - **Android push is deferred:** no `google-services.json` / FCM project in the repo, so Android tokens won't deliver. iOS via APNs (EAS-managed) works. Decision needed: stand up an FCM project + Android credentials (relates to Q5 — Expo/EAS account setup).
   - **Real delivery is not testable in the agent-board loop:** APNs/FCM receipt, the OS-push tap deep-link, and Expo `DeviceNotRegistered` receipt-based token pruning all require an **EAS dev build on a physical device**. Simulator Maestro covers only the in-app path + permission-off fallback. These criteria ship as `manual`.
   - **`incoming_request` fan-out at scale:** every new request notifies all nearby available helpers. Fine for MVP volumes; needs rate-limiting / batching / per-helper quiet-hours before growth. Decision needed: acceptable for phase 1?
   - **Push payload privacy (taken):** push body excludes message text and precise location (routing IDs only travel in `data`). Confirm this is the desired privacy posture, or allow a message preview in-body.
   - **Notification preferences / quiet hours:** not in MVP. Confirm deferral.
   - Decision needed: enforce **one active request per user** (dedupe) so resume is unambiguous? And what is the resume UX — auto-return to the in-flight request/session, or a banner?

8. Trust & safety ban authority + block scope (surfaced building TASK-010).
   - **Ban authority (taken):** mobile's banned-gate now reads the `bans` table via a new `SECURITY DEFINER` `my_ban_status()` RPC (active = `expires_at` null/future), since the web `admin_*` RPCs do **not** maintain `profiles.is_banned` (WEB-BACKEND-SYNC §5 open item) and `bans` RLS is staff-only. `is_banned` is kept only as a fast-path OR. **Decision needed:** either the web side starts maintaining `is_banned` on ban/unban, or we agree mobile is fully authoritative via `my_ban_status()` and `is_banned` is dropped. Today a web-applied ban would not have gated mobile at all — this closes that hole, but the two ban signals should converge.
   - **Block scope (taken, MVP):** blocking excludes the user from **matching** (`find_available_helpers`, both directions) only. It does **not** yet block message-send into an existing conversation, tear down an active session, or hide blocked users from feed/social surfaces — those need `messages`/feed RLS changes that live in the web/DB-policy domain. **Decision needed:** confirm matching-only for phase 1, and schedule the chat/feed block effects (likely a joint mobile+web RLS task).
   - **`find_available_helpers` is now `SECURITY DEFINER`** so it can read the RLS-restricted `blocks`/`bans` for exclusion (it returns the same curated columns as before). **Confirm** this is acceptable vs. exposing a grantable ban-probe helper to `authenticated`.
   - **Report reason taxonomy (taken):** a small canned set (harassment, inappropriate content, spam, safety/danger, other) + optional free text. Confirm the categories.
   - **Gate fails open on RPC error** (offline/flaky → treated as not-banned, server RLS still blocks writes). Confirm this is the right trade-off vs. fail-closed (which would lock out everyone on a network blip).