# Take Me Pic (TMP) — PRD & Engineering Assessment

> **Source:** `Take-Me-Pic-Dossier.pdf` (18 pp., v1.0 — June 2026)
> **Author of dossier:** El Jed Ahmed (concept) · PROGIX / Digitaria (build)
> **This document:** PRD (via `/to-prd` template) + Stripe/payments validity review + tech-stack assessment + Flutter-vs-React-Native evaluation.
> **Prepared:** 2026-06-05 · senior-engineer review

---

## 0. Executive Summary

**Take Me Pic** turns any friendly stranger nearby into your personal photographer in under 30 seconds — solving the "someone always has to stay behind the camera" problem. It is a French-first, "travel-journal"-themed iOS app (Expo / React Native, 27 screens) plus a Next.js marketing site + admin console (107 routes). Both currently run on a **mock data layer** as a complete clickable prototype; the backend is not yet built.

Three headline findings from this review:

| # | Finding | Severity |
|---|---------|----------|
| **1** | **The dossier's plan to bill the €4.99/mo Premium subscription through Stripe is non-compliant on iOS.** Apple Guideline 3.1.1 requires in-app digital subscriptions to use **Apple In-App Purchase (StoreKit)**. Stripe-billed Premium = App Store rejection. Stripe **is** correct for booking commissions and B2B ad billing. → **Use RevenueCat over StoreKit for Premium; keep Stripe for bookings + sponsored/ads.** | 🔴 Blocker |
| **2** | **Admin console is protected only by a `localStorage` stub.** 65 admin routes — including payments, refunds, payouts — must get real auth (JWT/session + RBAC) before any production data is connected. | 🔴 Blocker |
| **3** | **Stay on React Native / Expo — do not migrate to Flutter.** A complete validated 27-screen prototype already exists, and RN shares the TypeScript/React stack, design tokens, and talent pool with the Next.js web/admin. Flutter's rendering edge does not justify a full rewrite and a fractured stack. | 🟢 Recommendation |

---

# PART A — Product Requirements Document

## Problem Statement

When a group of people (travellers, families, friends) wants a photo of **everyone together**, one person always has to stay behind the camera. Asking a passing stranger feels awkward, slow, and a little unsafe — so the moment is either missed, settled with a selfie stick, or captured with someone left out. There is no trusted, instant way to find a willing nearby person to take the shot.

## Solution

A location-based mobile app that, in under 30 seconds, matches a person who wants a group photo with a willing, vetted stranger nearby who is "happy to help." Around that core help loop, a community layer (a "travel-journal" feed, photo spots, and a **karma** reputation system) turns a once-a-trip utility into a daily-use network; an ecosystem layer (itineraries, AI framing help, bookings) extends it further. Trust is engineered in — verification, post-session ratings, session-only GPS sharing, and active moderation make stranger-to-stranger help acceptable and safe.

## User Stories

**Onboarding & profile**
1. As a new user, I want to sign up with email and phone, so that the network can verify I'm a real person.
2. As a new user, I want to set up a profile with a photo, bio, and languages I speak, so that others can trust and communicate with me.
3. As a user, I want my identity verified (email + phone), so that the people I meet know I'm legitimate.

**Core help loop (Phase 1)**
4. As a user who wants a group photo, I want to see a map of available helpers near me, so that I can find someone quickly.
5. As a user, I want each nearby helper shown as a "face-pin" with their availability and karma, so that I can choose someone reassuring.
6. As a user, I want to request a photo with one tap, so that asking is effortless.
7. As a potential helper, I want an instant push notification when someone nearby needs a photo, so that I can offer to help in the moment.
8. As a helper, I want a "happy to help" button, so that I can opt in to a specific request.
9. As a requester, I want to see the request status (sent → accepted), so that I know help is on the way.
10. As either party, I want a quick in-app chat, so that we can coordinate where to meet without sharing personal contacts.
11. As a requester, I want a guided in-app "viewfinder" with framing guides during the session, so that the helper gets the shot right.
12. As either party, I want the photo shared securely inside the app, so that I receive my picture without exchanging numbers or social handles.
13. As a user, I want my GPS shared only during an active session, so that I'm not trackable the rest of the time.

**Karma, ratings, reputation (Phase 1 → 2)**
14. As a helper, I want to earn karma for each photo I take, so that I'm rewarded for helping.
15. As a user, I want to rate the other person after a session, so that good behaviour is recognised and bad behaviour is surfaced.
16. As a user, I want to see karma displayed on profiles and pins, so that I can gauge trustworthiness at a glance.
17. As a frequent helper, I want to appear on a "TMP Stars" leaderboard, so that my contribution is publicly recognised.

**Community & spots (Phase 2)**
18. As a user, I want a community feed (the "shared journal") of posts, polaroids, likes and comments, so that I have a reason to return daily.
19. As a user, I want to follow other users, so that I see content from people I like.
20. As a user, I want a map of photo spots with community tips, so that I can find great places to shoot.
21. As a user, I want to view and post spot details and framing advice, so that I can help and be helped beyond a single session.

**Premium & monetization (Phase 2)**
22. As a power user, I want a Premium subscription (ad-free, boosted profile, exclusive spots), so that I get more from the app.
23. As a user, I want to pay for Premium securely on my phone, so that subscribing is frictionless and trusted.
24. As a Premium user, I want my profile boosted in the map and feed, so that I get more help/visibility.
25. As a business (tourism board / camera brand), I want to sponsor a spot on the map, so that I reach relevant travellers.
26. As a local business, I want geo-targeted ad placement, so that I reach users physically near me.

**Ecosystem (Phase 3)**
27. As a traveller, I want smart itineraries and daily suggestions, so that the app helps plan my day.
28. As a user, I want an AI "PhotoHelper" for framing and angle suggestions, so that my photos improve.
29. As a traveller, I want to book activities and stays through the app, so that I can plan and pay in one place.
30. As a family, I want a secure "TMP Family" mode, so that family members can use the help network safely together.

**Trust, safety & moderation (cross-cutting)**
31. As any user, I want one-tap reporting of suspicious behaviour, so that I can flag problems instantly.
32. As a user, I want abusers banned immediately, so that the network stays safe.
33. As a user, I want my data encrypted and GDPR-compliant, so that my privacy is protected.

**Admin / operations**
34. As an admin, I want a secure, authenticated console, so that only authorised staff can manage the platform.
35. As an admin, I want dashboards and analytics (users, revenue, engagement, retention, geography), so that I can steer the product.
36. As a moderator, I want queues for reports, appeals, and blocked users plus an audit log, so that I can enforce safety consistently.
37. As an operator, I want to manage sessions, requests, bookings, premium subscriptions, payments, refunds and payouts, so that I can run the business.
38. As an admin, I want to manage content, notification templates, support tickets, roles, and integrations, so that I can operate day-to-day.

**Localization**
39. As a French/English/Arabic speaker, I want the app in my language with correct RTL for Arabic, so that it feels native.

## Implementation Decisions

> *No file paths or code snippets — these are decisions, kept implementation-agnostic.*

**Architecture & data layer**
- Two repos (`take-me-pic` mobile, `take-me-pic-web` web/admin) share one visual identity and **one data contract**. The decisive convention is that **every screen imports its data by name from a single data module** (`data/mock.ts` mobile, `lib/data.ts` web). Production swaps these mock exports for real fetchers — screens do not change. This isolation is the project's most important architectural asset and must be preserved.

**Modules to build (proposed deep modules, testable in isolation):**
1. **Proximity & Presence** — "who is available near me." Geospatial radius query + availability/presence heartbeat. Interface ~ `setAvailability(userId, status)`, `findAvailableHelpers(location, radiusM) → Helper[]`. **Best backed by PostGIS `ST_DWithin`/geohash**, not naïve scans — this is the latency-critical "30 seconds" path.
2. **Help Request & Matching** — request lifecycle as an explicit state machine: `REQUESTED → ACCEPTED → IN_SESSION → COMPLETED → RATED` (with `CANCELLED/EXPIRED`). One-tap create, accept, push-notify on transitions.
3. **Realtime Session & Chat** — live coordination channel + secure in-app photo transfer; teardown of GPS sharing on `COMPLETED`.
4. **Karma & Reputation** — pure-logic ledger: earn per completed photo, post-session bidirectional ratings, leaderboard (TMP Stars) derivation. Deterministic, highly testable.
5. **Identity & Trust/Safety** — email+phone verification, one-tap reporting, moderation actions, instant bans, appeals; gate for "Family mode."
6. **Subscriptions & Entitlements (Premium)** — **Apple IAP via RevenueCat** (see Part B). Entitlement gating: `isPremium → {adFree, profileBoost, exclusiveSpots}`. The app reads entitlements; it never reads a Stripe state for Premium on iOS.
7. **Payments & Bookings** — **Stripe** for booking commission (5–10% on real-world activities/stays) and B2B billing (sponsored spots, geo-ads). Stripe Connect for payouts to partners.
8. **Community Feed & Spots** — posts/likes/comments, spots map + details + tips, content moderation hooks.
9. **Notifications** — push via APNs/FCM (`expo-notifications`) + in-app notification stack.
10. **Admin auth & operations** — **real authentication (JWT/session) + RBAC** replacing the `localStorage` stub; moderation, analytics, payments-ops, content, settings.
11. **AI PhotoHelper** — Claude (Anthropic) vision model behind a "suggest framing" action; isolated behind a provider-agnostic interface.
12. **i18n/RTL** — FR (primary) / EN / AR with `forceRTL` for Arabic; already stubbed.

**Backend decisions (recommended — see Part C):**
- Realtime presence/chat/push + structured data + **geospatial nearby-search**. Strongly evaluate **Supabase (Postgres + PostGIS + Realtime + Auth + Storage + RLS)** as a single consolidated platform, since the killer query ("available users near me") is geospatial and Postgres/PostGIS handles it natively — better than Firestore's geohash workarounds. Push still requires APNs/FCM regardless.
- Keep the data-fetcher seam exactly where the mock layer sits, so backend choice stays swappable.

**Payments decisions (see Part B for full rationale):**
- Premium subscription → **Apple In-App Purchase via RevenueCat** (15% under Apple Small Business Program while <$1M/yr; 30% above). **Not Stripe** on iOS.
- Bookings (real-world services) → **Stripe** (Apple forbids IAP here; 3.1.3(e)/3.1.5(a)).
- Sponsored spots & geo-ads (B2B) → **Stripe**, billed to businesses outside the app.

## Testing Decisions

- **Test external behaviour, not implementation details.** Prefer testing module interfaces and state transitions over internal structure.
- **Highest-value units to test first** (pure logic, deterministic, no I/O): **Karma & Reputation** (earn/spend/leaderboard math), **Help Request & Matching** (state-machine transitions, illegal transitions rejected), **Entitlements** (premium → feature flags), **Proximity radius** (boundary correctness of the geo query).
- **Integration tests** for the data-fetcher seam: each screen's named import resolves against the real backend identically to the mock, so the swap is provably behaviour-preserving.
- **Prior art:** none yet — the backend is greenfield. This PRD establishes the first test patterns; mirror them across modules.

## Out of Scope (Phase 1 / MVP)

- Bookings & commissions, sponsored spots, geo-ads (Phase 2–3).
- AI PhotoHelper, smart itineraries, TMP Family mode (Phase 3).
- Full EN/AR translation (stubs only in Phase 1).
- Android build (iOS-first; RN/Expo gives Android later at low marginal cost).
- Web user accounts (users live in the app; only `/admin` is authenticated).

## Further Notes

- **The clickable prototype (mobile + web + admin) is complete on mock data.** Remaining work is backend + payments + iOS distribution + content — and it stays "local and incremental" thanks to the isolated data layer.
- **Trust & safety is the existential product risk**, not a feature: the app puts strangers into physical proximity. Treat verification, moderation, and the audit log as P0, and consider stronger identity verification than email+phone before scale.

---

# PART B — Stripe Validity vs. App Requirements & Subscriptions

**The dossier states (p.5, p.18):** *"Encaissement par Stripe (Visa/Mastercard, abonnements & transactions)"* and *"Intégrer Stripe (abonnement Premium ~4,99 €, transactions)."*

**Verdict: partially valid — and wrong in the one place that matters most.** Stripe is the right tool for booking and B2B revenue, but it **cannot legally process the in-app Premium subscription on iOS.** Billing Premium via Stripe is a near-certain App Store rejection under Guideline 3.1.1.

### Revenue stream → payment rail map

| Revenue stream | What it is | Apple rule | Correct rail | Dossier says | Compliant? |
|---|---|---|---|---|---|
| **TMP Premium** €4.99/mo (ad-free, profile boost, exclusive spots) | **Digital** content/functionality unlocked **inside** the app | **3.1.1** → must use Apple IAP | **Apple IAP (StoreKit) via RevenueCat** | Stripe | ❌ **No** |
| **Booking commission** 5–10% (activities, stays) | **Real-world** services consumed **outside** the app | **3.1.3(e) / 3.1.5(a)** → must **not** use IAP | **Stripe (Connect)** | Stripe | ✅ Yes |
| **Sponsored spots** (tourism boards, camera brands) | B2B advertising, billed to a business | Outside the app, not a user digital purchase | **Stripe** | Stripe | ✅ Yes |
| **Geo-targeted ads** (local businesses) | B2B advertising | Outside the app | **Stripe** | Stripe | ✅ Yes |

### Why Premium-via-Stripe fails

Apple **Guideline 3.1.1**: *"If you want to unlock features or functionality within your app (… subscriptions … access to premium content …), you must use in-app purchase."* TMP Premium unlocks ad-free use, a profile boost, and exclusive spots — all consumed in-app. That is squarely digital content → **Apple IAP is mandatory.** Conversely, **3.1.5(a)** forbids using IAP for physical/real-world services — which is exactly why Stripe is **required** (not just allowed) for the bookings.

### The 2025 "external link" caveat — and why it's closing

- **May 2025 (Epic v. Apple injunction):** US-storefront apps gained the right to link out to external web payment (e.g., a Stripe page) **without Apple commission and without anti-steering pop-ups**. This briefly made "route US subscriptions to Stripe web" attractive.
- **December 11, 2025 (Ninth Circuit):** the appeals court **reversed the total fee ban** — Apple *"should be able to charge a reasonable commission"* on external-link purchases (rate to be set by the district court), and may again enforce that external links be **no more prominent** than IAP. **The loophole is narrowing.**
- This relief is **US-only**. TMP is **French-first → EU**, where IAP remains required for in-app digital subscriptions (the EU DMA permits alternative billing but attaches Apple's Core Technology Fee/commission — not simpler or cheaper for a small app).

**Net:** do not architect Premium around an external-link escape hatch. Plan for **IAP economics** as the baseline.

### Recommendation

1. **Premium → Apple IAP, abstracted by [RevenueCat](https://www.revenuecat.com/).** RevenueCat wraps StoreKit (and Google Play Billing for the future Android build), handles **server-side receipt validation, entitlements, renewals, grace periods, and subscription analytics** — and feeds the exact metrics the admin "Premium & Payments / refunds / payouts" console needs. This avoids hand-rolling fragile StoreKit receipt logic. *(See the bundled "In-App Purchases" skill.)*
2. **Keep Stripe for bookings + B2B**, ideally **Stripe Connect** so partner payouts and the 5–10% platform commission are handled natively.
3. **Correct the revenue projection.** The dossier's *"10,000 users × 5% × €4.99 ≈ €2,500/mo"* implicitly assumes Stripe-only fees (~2.9% + €0.25). Under Apple IAP the platform takes **15%** (Small Business Program, <$1M/yr — TMP qualifies) or **30%** above. Realistic net ≈ **€2,120/mo** at 15%, ~€1,745/mo at 30%. Bookings/ads (Stripe) stack on top at ~2.9%.
4. **Android note:** Google Play has the same digital-goods rule (Play Billing for in-app subscriptions). RevenueCat covers both stores behind one entitlement API — another reason to adopt it now rather than later.

---

# PART C — Tech Stack Assessment

### Mobile — Expo / React Native ✅ (sound, with version caveats)
- **Stack:** Expo SDK 56 (new architecture / Fabric), React Native 0.85, React 19.2, TypeScript 6, Expo Router (file-based, 27 screens), `react-native-maps` + custom **SVG "HandMap"**, Reanimated 4 + worklets + gesture-handler, `expo-image`, `lucide-react-native`, i18n-js + `expo-localization` (FR/EN/AR), EAS configured.
- **Assessment:** Modern and coherent. Using the **New Architecture (Fabric/TurboModules)** is the right call and closes most of RN's historical performance gap — important for the animation-heavy screens.
- **⚠️ Caveat — bleeding-edge versions.** Expo SDK 56 / RN 0.85 / React 19.2 / TS 6 are at/ahead of the stability curve. **Pin exact versions, verify each is a stable release (not RC), and lock the lockfile** before committing; avoid chasing majors mid-build.
- **Geo reality check.** The hand-drawn SVG map is a *presentation* choice; the *matching* still needs real geospatial indexing server-side. Don't conflate the two — the "nearby in 30s" promise lives in the backend query, not the SVG.

### Web & Admin — Next.js ✅ (solid)
- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TS, Tailwind v4 with `@theme` tokens mirroring the mobile `theme/tokens.ts`, `next/font`, `lucide-react`, `recharts`; 107 routes (42 marketing + 65 admin) on `lib/data.ts`.
- **Assessment:** Excellent fit. Next.js is ideal for the SEO-driven marketing surface and the data-dense admin. **Shared design tokens between Tailwind `@theme` and the mobile theme is exactly right** — one source of visual truth.
- **🔴 Auth gap.** Admin is a `localStorage` stub (acknowledged in the dossier). With 65 routes including **payments/refunds/payouts**, this is a hard blocker: implement real **session/JWT auth + RBAC** (Auth.js/NextAuth, Clerk, or Supabase Auth) with role-scoped routes and a server-enforced audit log **before** connecting real data.

### Backend — proposed Firebase + Postgres + Node 🟡 (works, but reconsider)
- **Dossier proposal:** Node + Firebase/Firestore (realtime, presence, push, chat) + PostgreSQL (structured) on AWS/GCP; Stripe; TestFlight beta.
- **Concern:** **Two databases = two sources of truth.** Firestore-for-realtime + Postgres-for-structured doubles operational surface, and Firestore's geo story (geohash libraries) is awkward precisely where TMP is most demanding — "available users near me."
- **Recommended alternative — evaluate Supabase seriously** *(bundled `supabase` skill available):*
  - **Postgres + PostGIS** → `ST_DWithin` makes the nearby-helper query first-class and fast — the single most important query in the product.
  - **Realtime** (presence + Postgres changes) covers availability/session/chat.
  - **Auth + Storage + RLS** consolidate identity, secure photo storage, and row-level security in one platform that matches the React/TS stack.
  - **One platform** instead of Firestore+Postgres+glue.
  - **Caveat:** Supabase has **no native push** — you still wire **APNs/FCM via `expo-notifications`**. Presence/chat scale is fine for MVP; revisit a dedicated realtime tier only at large concurrency.
- **Either way**, keep the **data-fetcher seam** untouched so the backend stays swappable. If the team has deep Firebase expertise and wants managed push/presence out of the box, Firebase remains viable — just isolate geo behind the Proximity module so the engine can be optimized independently.

### Cross-cutting
- **AI PhotoHelper → Claude (Anthropic).** Good choice; a vision model (Claude Sonnet/Opus) fits framing/angle suggestions. Keep it behind a provider-agnostic interface (the dossier already says "Anthropic / autre").
- **Security/Trust:** GDPR + full encryption + **session-only GPS** is strong privacy-by-design. For a stranger-meetup product, plan for **stronger identity verification** than email+phone before scale, and treat moderation/audit-log as P0.

---

# PART D — Flutter vs. React Native for Mobile

**Question:** can Flutter be leveraged *better* than React Native here?

**Answer: No — stay on React Native / Expo.** Flutter is an excellent framework and would render the custom "travel-journal" UI beautifully, but in *this specific situation* the decisive factors point firmly to RN.

### Why React Native wins here
1. **A complete, validated 27-screen prototype already exists in Expo/RN.** Migrating to Flutter means discarding months of finished, design-approved work for marginal runtime gains. Sunk-but-working assets dominate the calculus.
2. **Stack cohesion with the web.** The marketing site + admin are **Next.js (React + TypeScript)**. RN keeps **one language (TS), one mental model, and shared artifacts**: the `data/mock.ts` types and the design tokens (`theme/tokens.ts` ↔ Tailwind `@theme`) are reused across mobile and web. Flutter (Dart) **splits the stack and the talent pool** in two.
3. **Single team, single hiring pool.** PROGIX/Digitaria is delivering both surfaces in React/TS. React/TS talent is larger and overlaps the web team; Dart-native talent is a separate hire.
4. **Expo ecosystem is already wired:** EAS build/submit, `expo-localization`, `expo-image`, `expo-notifications`, OTA updates, configured `app.json`/`eas.json`/bundle id/scheme. This is real velocity that a Flutter rewrite resets to zero.
5. **The "hard" UI is already solved in RN:** the hand-drawn map is **SVG**, animations are **Reanimated 4 + worklets at 60fps**, and the **New Architecture (Fabric)** removes the old JS-bridge bottleneck.
6. **AI-assisted design pipeline.** The source-of-truth is an **HTML mockup built with Claude**; RN/React maps closely onto the HTML/CSS mental model, making mock→app translation smoother than translating to Dart widgets.
7. **Cross-platform is not a Flutter-only advantage.** RN/Expo already ships Android from the same codebase when wanted — so even "one codebase for iOS+Android" is **neutral** between the two here.

### Where Flutter *would* have won (none apply here)
- **Greenfield** with no existing prototype.
- **Android-first** or rendering-consistency-critical Android targeting.
- A **Dart-native team**, or a desire for pixel-identical Skia/Impeller rendering as a top priority over stack cohesion.
- Extreme custom-canvas work where `CustomPainter` would beat SVG/Reanimated — but TMP's needs are already met in RN.

### Decision matrix

| Criterion | React Native / Expo | Flutter | Winner (this project) |
|---|---|---|---|
| Reuse of existing 27-screen prototype | Full | Discarded | **RN** |
| Shared stack/types/tokens with Next.js web | Yes (TS) | No (Dart) | **RN** |
| Talent pool / single team | Larger, overlaps web | Separate | **RN** |
| Tooling already configured (EAS/OTA) | Yes | Reset | **RN** |
| Custom brand-heavy UI rendering | Very good (SVG+Reanimated+Fabric) | Excellent (Skia/Impeller) | Flutter (marginal) |
| Raw animation performance ceiling | Good (New Arch) | Slightly higher | Flutter (marginal) |
| iOS + Android single codebase | Yes | Yes | Tie |
| Mock→app from Claude HTML mockup | Closer mapping | Further | **RN** |

**Recommendation:** **Keep React Native / Expo on the New Architecture.** Revisit Flutter only if real-device testing shows RN's animation performance is insufficient for the heaviest screens, *and* Android becomes a first-class, rendering-consistency-critical target — neither of which is true today. The marginal rendering/perf edge of Flutter does not outweigh a finished prototype plus a unified React/TypeScript stack across mobile and web.

---

## Appendix 1 — 27-Screen Catalogue (mobile)

| # | FR | EN | # | FR | EN |
|---|----|----|----|----|----|
| 01 | Embarquement | Boarding / Cover | 15 | Photo en grand | Photo detail |
| 02 | Page d'introduction | Intro / Onboarding | 16 | Page de quelqu'un d'autre | Public profile |
| 03 | Tampon d'entrée | Sign-up | 17 | Carte au trésor | Spots map |
| 04 | Première page du carnet | Profile setup | 18 | Page du spot | Spot detail |
| 05 | La carte du quartier | Neighborhood map | 19 | Tableau d'honneur | Leaderboard |
| 06 | Carte de visite | Mini profile card | 20 | Manuel illustré | Framing guide |
| 07 | Pli envoyé | Request sent | 21 | Première classe | Premium paywall |
| 08 | Un mot sur le pas-de-porte | Lock-screen notice | 22 | L'œil bienveillant | AI PhotoHelper |
| 09 | Petit mot rapide | Quick chat | 23 | Itinéraire du jour | Daily itinerary |
| 10 | Dans le viseur | Photo session | 24 | Billet & paiement | Booking & payment |
| 11 | Pellicule de la session | Session gallery | 25 | Album de famille | Family mode |
| 12 | Tampon de remerciement | Rating & karma | 26 | Cahier de réglages | Settings |
| 13 | Mon carnet | My profile | 27 | La pile de notes | Notifications |
| 14 | Le carnet partagé | Community feed | | | |

## Appendix 2 — Roadmap, Business Model & Design Tokens (from dossier)

**Roadmap:** Phase 1 MVP (~2 mo, core help loop) → Phase 2 Community (~3 mo, feed/spots/karma/leaderboard/Premium/sponsored/ads) → Phase 3 Ecosystem (~4–6 mo, AI PhotoHelper, itineraries, bookings, Family mode, multilingual/partnerships).

**Business model:** TMP Premium €4.99/mo (P2), sponsored spots (P2), geo-targeted ads (P2), booking commission 5–10% (P3).

**Design system — "travel journal":** paper `#f1e6cf` · card `#fbf6e9` · kraft `#c9b48b` · gold `#b8893a` · ink `#2a1f1a` · board `#1a140e` · red `#a8362e` · blue `#2a4f76` · green `#3f6b3f` · sunset `#d77032` · sea `#5a8aa3` · gold-lt `#d9b566`. Typefaces: **Fraunces** (titles/body), **Caveat** (handwriting), **Special Elite** (stamps/labels), **DM Mono** (data). Logo: map-pin + camera aperture in gold.

**Repos:** `github.com/DigitariaWebs/take-me-pic` (mobile) · `github.com/DigitariaWebs/take-me-pic-web` (web+admin) · `Take.zip` (HTML mockup = source of truth) · Web deployed on Vercel.

## Appendix 3 — Sources (payments analysis)

- [Apple — In-app purchase (HIG)](https://developer.apple.com/design/human-interface-guidelines/in-app-purchase/)
- [Apple Developer — App Review Guideline updates (May 2025)](https://developer.apple.com/news/?id=dovxb62h)
- [BuddyBoss — Resolving Guideline 3.1.1 (Payments / IAP)](https://buddyboss.com/docs/app-store-guideline-3-1-1-business-payments-in-app-purchase/)
- [9to5Mac — Apple updates guidelines to allow external payment links (May 2025)](https://9to5mac.com/2025/05/01/apple-app-store-guidelines-external-links/)
- [RevenueCat — What the Epic v. Apple anti-steering ruling means](https://www.revenuecat.com/blog/growth/apple-anti-steering-ruling-monetization-strategy/)
- [MacRumors — Apple wins ability to charge fees on external links; Ninth Circuit modifies injunction (Dec 11 2025)](https://www.macrumors.com/2025/12/11/apple-app-store-fees-external-payment-links/)
- [Epic Games v. Apple — Wikipedia (case overview)](https://en.wikipedia.org/wiki/Epic_Games_v._Apple)

---

*Prepared from `Take-Me-Pic-Dossier.pdf` v1.0. PRD section follows the `/to-prd` template; published as a standalone Markdown deliverable because the working directory has no connected project issue tracker.*
