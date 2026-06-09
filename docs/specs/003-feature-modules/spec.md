# Feature Specification: Take Me Pic Feature Modules

**Feature Branch**: `003-feature-modules`  
**Created**: 2026-06-08  
**Status**: Draft  
**Input**: Full dossier/PRD story set, current mobile route inventory, current Supabase schema, and feature-flow docs.

## User Scenarios & Testing

### User Story 1 - Trusted Identity Module (Priority: P1)

New users sign up, verify email/phone, and complete a trustworthy profile before participating in the help network.

**Why this priority**: Trust is required before real-world stranger matching.

**Independent Test**: Create a user, verify identity, create profile, restart app, and confirm session/profile persist.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they complete signup and OTP/email verification, **Then** an Auth user and matching profile exist.
2. **Given** an unverified or banned user, **When** they attempt gated help-network actions, **Then** access is blocked.

### User Story 2 - Proximity And Matching Module (Priority: P1)

Requesters find nearby helpers and create requests that eligible helpers can accept atomically.

**Why this priority**: This is the app’s core marketplace loop.

**Independent Test**: Seed presence, create request, accept via RPC, and verify conversation creation.

**Acceptance Scenarios**:

1. **Given** nearby available helpers, **When** requester opens map, **Then** helper results are distance/trust filtered.
2. **Given** an open request, **When** a helper accepts, **Then** exactly one helper is assigned and a conversation is created.

### User Story 3 - Session Completion Module (Priority: P1)

Participants complete the session, share photos securely, rate each other, and update reputation.

**Why this priority**: The product value is the delivered photo plus trust feedback.

**Independent Test**: Complete an accepted request, upload a photo, rate, and verify karma/leaderboard effects.

**Acceptance Scenarios**:

1. **Given** a session party uploads a photo, **When** another party opens gallery, **Then** the photo is accessible through authorized storage.
2. **Given** a completed session, **When** rating is submitted, **Then** rating and karma ledger are updated once.

### User Story 4 - Community And Spots Module (Priority: P2)

Users browse the shared journal, interact with posts, follow others, and discover photo spots.

**Why this priority**: Community extends engagement beyond single sessions.

**Independent Test**: Load feed/spots, like/comment/follow, add tip, and verify canonical counts.

**Acceptance Scenarios**:

1. **Given** feed content exists, **When** a user opens carnet, **Then** posts, comments, likes, and authors render.
2. **Given** spot content exists, **When** a user opens a spot, **Then** photos, tips, and sponsored/Premium state are visible.

### User Story 5 - Monetization Module (Priority: P2)

Premium uses RevenueCat/Apple IAP, while bookings, sponsored spots, and geo ads use Stripe.

**Why this priority**: Monetization must be compliant and separated by payment rail.

**Independent Test**: Mock an active RevenueCat entitlement and a Stripe booking confirmation; verify each updates the correct feature state.

**Acceptance Scenarios**:

1. **Given** active Premium entitlement, **When** user opens gated benefits, **Then** Premium features unlock.
2. **Given** Stripe confirms a real-world booking, **When** webhook is processed, **Then** booking state updates without Premium entitlement changes.

### User Story 6 - Ecosystem Module (Priority: P3)

Users can use AI framing help, smart itineraries, bookings, and Family Mode as later-stage ecosystem features.

**Why this priority**: These features deepen product value after the core loop is stable.

**Independent Test**: Load each ecosystem screen from persisted seed/backend data without relying on mock constants.

**Acceptance Scenarios**:

1. **Given** itinerary data exists, **When** user opens itinerary, **Then** ordered daily steps render.
2. **Given** AI suggestions are enabled, **When** user requests framing help, **Then** provider-agnostic suggestion data is returned or fallback guide appears.
3. **Given** family membership exists, **When** user opens family mode, **Then** only authorized family members and sharing controls are visible.

### User Story 7 - Trust, Operations, And Localization Module (Priority: P1)

Users can report/block unsafe behavior, staff can moderate with RBAC/audit logs, and users can run the app in supported languages.

**Why this priority**: Safety, operations, and localization are cross-cutting launch requirements.

**Independent Test**: Submit report, moderate as staff, verify audit log, switch language, and verify persisted locale.

**Acceptance Scenarios**:

1. **Given** a user reports unsafe behavior, **When** report is submitted, **Then** reporter and staff can see allowed state and staff actions are audited.
2. **Given** user selects Arabic, **When** app reloads if needed, **Then** RTL handling applies without broken layout.

### Edge Cases

- User loses permissions or network mid-flow.
- Duplicate request acceptance, rating, like, follow, or payment callback.
- Remote schema exists locally but is not applied to Supabase.
- Storage upload succeeds but metadata insert fails.
- User is banned/blocked during an active request.
- Entitlement/payment webhook is delayed or duplicated.
- Missing translation key or RTL clipping.

## Requirements

### Functional Requirements

- **FR-001**: Each module MUST be independently documented as a feature flow under `docs/features/`.
- **FR-002**: Each module MUST preserve the current UI/data seam during backend integration.
- **FR-003**: Phase 1 modules MUST be integrated before Phase 2/3 backend work, except for safe documentation/prototyping.
- **FR-004**: All user-owned or safety-sensitive data MUST be protected by RLS or trusted backend code.
- **FR-005**: All write flows with retries MUST use idempotency or unique constraints where duplicate writes are harmful.
- **FR-006**: Premium entitlement logic MUST remain separate from Stripe booking/B2B logic.
- **FR-007**: Admin operations MUST use RBAC and audit logs before production data is connected.

### Key Entities

- **Identity**: Auth user plus profile and verification state.
- **Marketplace Session**: Presence, help request, conversation, session photos, ratings, and karma.
- **Community Graph**: Posts, comments, likes, follows, spots, tips, and photos.
- **Monetization State**: Subscriptions/entitlements, bookings, businesses, campaigns.
- **Safety Operations**: Reports, blocks, bans, user roles, audit logs.
- **Localization Preference**: Local and optionally profile-backed locale/RTL settings.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every PRD story from 1-39 maps to at least one Spec Kit spec and one small feature flow.
- **SC-002**: Every Phase 1 backend module has a testable independent acceptance scenario.
- **SC-003**: The coverage matrix identifies implementation gaps separately from documentation coverage.
- **SC-004**: No feature flow leaves unresolved placeholders; unknowns are captured as open questions.

## Assumptions

- The existing `Take-Me-Pic-PRD-and-Assessment.md` is the canonical extracted text from the dossier.
- `Take-Me-Pic-Dossier.pdf` itself cannot currently be text-extracted in this environment because `pdftotext` is unavailable.
- Mobile implementation remains in this repository; admin UI implementation remains in the web/admin repository.

