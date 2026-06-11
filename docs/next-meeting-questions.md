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
   - Decision needed: enforce **one active request per user** (dedupe) so resume is unambiguous? And what is the resume UX — auto-return to the in-flight request/session, or a banner?