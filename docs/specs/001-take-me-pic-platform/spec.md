# Feature Specification: Take Me Pic Platform

**Feature Branch**: `001-take-me-pic-platform`  
**Created**: 2026-06-08  
**Status**: Draft  
**Input**: `Take-Me-Pic-Dossier.pdf`, `Take-Me-Pic-PRD-and-Assessment.md`, current Expo mobile prototype, and current Supabase schema.

## User Scenarios & Testing

### User Story 1 - Find And Request Nearby Help (Priority: P1)

A requester opens the map, sees nearby vetted helpers, selects a reassuring profile, and sends a photo request.

**Why this priority**: This is the core product promise: find a real nearby human in under 30 seconds.

**Independent Test**: With a signed-in user and seeded presence rows, open the map and create a request to an available helper without touching chat, feed, or monetization.

**Acceptance Scenarios**:

1. **Given** a verified user with location permission, **When** they open the map, **Then** helpers within the configured radius are shown with distance, karma, rating, languages, and verification state.
2. **Given** no helpers are available, **When** the map loads, **Then** the user sees an empty state and can retry or adjust radius.
3. **Given** a helper is selected, **When** the requester sends a request, **Then** a `help_request` is created in `requested` state and is visible to eligible helpers.

### User Story 2 - Accept And Coordinate A Session (Priority: P1)

A helper receives a request, accepts it, and both parties coordinate through realtime chat.

**Why this priority**: The app must convert nearby availability into a safe, coordinated meetup.

**Independent Test**: With two authenticated users and one requested help request, accept the request and exchange a text message in the linked conversation.

**Acceptance Scenarios**:

1. **Given** an open request, **When** a helper accepts it, **Then** the request transitions to `accepted`, a conversation exists, and both parties are participants.
2. **Given** a non-party user, **When** they try to read the conversation, **Then** RLS denies access.
3. **Given** the requester and helper are in chat, **When** one sends a message, **Then** the other receives it through Realtime.

### User Story 3 - Complete Session, Share Photos, Rate (Priority: P1)

The requester and helper complete the session, share photos securely, and record ratings/karma.

**Why this priority**: The trust loop closes only when photos, ratings, and reputation are persisted.

**Independent Test**: Complete an accepted request, upload one session photo, submit a rating, and verify the karma ledger changes.

**Acceptance Scenarios**:

1. **Given** a request is `in_session`, **When** a photo is uploaded, **Then** only request parties can access the storage-backed record.
2. **Given** the session is completed, **When** a rating is submitted, **Then** the rating is stored once per rater per request.
3. **Given** karma is awarded, **When** the profile and leaderboard are read, **Then** the cached profile karma matches the ledger-derived result.

### User Story 4 - Use Community And Spots (Priority: P2)

A user browses the shared journal feed, likes/comments, follows users, and discovers photo spots with tips.

**Why this priority**: Community gives Take Me Pic daily-use value beyond one-off utility.

**Independent Test**: Read feed and spot data, like a post, comment, and follow a user without invoking help requests.

**Acceptance Scenarios**:

1. **Given** public feed data exists, **When** a user opens the carnet tab, **Then** posts render with author, image, caption, likes, comments, and spot context where available.
2. **Given** a user likes a post twice, **When** the second request arrives, **Then** the backend preserves one like or toggles according to product policy without duplicate rows.

### User Story 5 - Monetize Safely (Priority: P2)

A user buys Premium through compliant in-app purchase, while real-world bookings and B2B ads use Stripe.

**Why this priority**: Monetization must not cause App Store rejection or mix incompatible payment rails.

**Independent Test**: Mock a RevenueCat entitlement update and verify Premium gates read entitlement state rather than Stripe state.

**Acceptance Scenarios**:

1. **Given** RevenueCat reports an active Premium entitlement, **When** the user opens Premium-gated features, **Then** ad-free/profile-boost/exclusive-spot behavior is enabled.
2. **Given** a booking is for a real-world service, **When** checkout starts, **Then** Stripe/Stripe Connect may be used and no IAP entitlement is created.

### User Story 6 - Operate Trust And Safety (Priority: P1)

Users can report or block unsafe behavior, and staff can moderate with RBAC and audit logs.

**Why this priority**: The product coordinates real-world stranger meetups, so safety is existential.

**Independent Test**: Submit a report as one user and verify only the reporter and staff can read/update the moderation record according to role.

**Acceptance Scenarios**:

1. **Given** a user reports another user, **When** the report is inserted, **Then** the reporter owns the report and staff can triage it.
2. **Given** a staff action changes moderation state, **When** it completes, **Then** the action is recorded in an audit log.

### Edge Cases

- Location permission denied or revoked while requesting help.
- No helpers available inside the requested radius.
- Duplicate accept attempts on the same request.
- Request expires while user is in chat or backgrounded.
- Chat messages sent while offline or during reconnect.
- Attachment upload succeeds but message insert fails.
- User is banned or blocked after a request is opened.
- Premium entitlement expires while app is active.
- Arabic RTL is selected before all copy is translated.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST support email and phone-based user onboarding with profile setup, languages, avatar, bio, and trust signals.
- **FR-002**: The system MUST store session-only presence with geospatial location and availability status.
- **FR-003**: The system MUST return available helpers near a requester using an indexed geospatial query.
- **FR-004**: The system MUST model help requests as an explicit state machine: `requested`, `accepted`, `in_session`, `completed`, `rated`, `cancelled`, `expired`.
- **FR-005**: The system MUST prevent a helper from accepting their own request.
- **FR-006**: The system MUST provide realtime conversation coordination between the request parties.
- **FR-007**: The system MUST support text, image, voice, location, document, and system chat events at the product-contract level.
- **FR-008**: The system MUST keep secure session photo transfer inside the app through storage paths, not public personal contact exchange.
- **FR-009**: The system MUST store ratings and karma as durable backend records rather than client-only counters.
- **FR-010**: The system MUST expose public profile, feed, spot, and leaderboard data while protecting private/user-owned records with RLS.
- **FR-011**: The system MUST support in-app notifications and push-token registration, while using APNs/FCM for actual push delivery.
- **FR-012**: The system MUST store Premium entitlements from Apple IAP/RevenueCat and MUST NOT use Stripe for in-app digital subscription unlocks on iOS.
- **FR-013**: The system MUST support Stripe-backed bookings, sponsored spots, and B2B geo-targeted ads separately from Premium.
- **FR-014**: The system MUST support reports, blocks, bans, staff roles, and audit logs for trust and safety.
- **FR-015**: The system MUST keep the mock-data seam as the migration boundary so screens are not tightly coupled to Supabase calls.

### Key Entities

- **Profile**: Auth-linked user identity, trust signals, public counters, and language metadata.
- **Presence**: Short-lived availability and session-only location state.
- **Help Request**: The core marketplace transaction and state machine.
- **Conversation**: A chat context, usually tied to one help request.
- **Message**: A realtime communication event with body and/or attachment metadata.
- **Session Photo**: Storage-backed photo record linked to a completed/active request.
- **Rating**: Post-session trust feedback.
- **Karma Ledger**: Append-only reputation source of truth.
- **Post / Comment / Like / Follow**: Community feed graph.
- **Spot / Spot Tip / Spot Photo**: Photo-location content.
- **Subscription**: RevenueCat entitlement mirror.
- **Booking / Business / Sponsored Campaign**: Stripe and B2B monetization objects.
- **Notification / Push Token**: In-app and push notification plumbing.
- **Report / Block / Ban / Audit Log / User Role**: Safety and operations controls.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A user can complete the Phase 1 help loop from map to rating without mock data.
- **SC-002**: Nearby helper lookup is index-backed and returns under 1 second for MVP-scale city usage.
- **SC-003**: Illegal help request transitions are rejected server-side 100% of the time.
- **SC-004**: Chat reconnect does not create duplicate messages when retrying the same client message id.
- **SC-005**: RLS tests prove non-participants cannot read or write conversations they do not belong to.
- **SC-006**: Session photos are accessible only to the two session parties.
- **SC-007**: Premium state is derived from entitlement records, not Stripe.

## Assumptions

- Supabase is the target MVP backend for Auth, Postgres, PostGIS, Storage, Realtime, and RLS.
- Push delivery remains outside Supabase and is implemented with Expo notifications plus APNs/FCM.
- The mobile app remains Expo/React Native and keeps the travel-journal design system.
- The web/admin repository owns the admin UI, but the shared backend must support RBAC and audit logging.

