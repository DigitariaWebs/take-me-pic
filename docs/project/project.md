# Take Me Pic Project

## Overview

### Description

Take Me Pic is an iOS-first React Native / Expo mobile app for travellers and groups who want a trusted nearby person to take their photo. The current mobile app has the approved travel-journal UI and is being moved from mock data to a Supabase-backed Phase 1 product.

### Status

Active

### GitHub Repository

https://github.com/DigitariaWebs/take-me-pic

### PRD

`docs/product/prd.md`

### Current Focus

Wire Supabase Auth, profile bootstrap, and auth/profile gates so Phase 1 help-network features can move off mock data safely.

### Current Milestone

Phase 1 MVP — Auth and trusted profile foundation.

---

# Resources

- GitHub: https://github.com/DigitariaWebs/take-me-pic
- Product PRD: `docs/product/prd.md`
- Feature coverage: `docs/FEATURE-SPEC-COVERAGE.md`
- Supabase status: `docs/SUPABASE-INTEGRATION-STATUS.md`
- Schema reference: `docs/SCHEMA.md`
- Architecture: `docs/ARCHITECTURE.md`
- Mobile repository: this repository
- Web/admin repository: `/Users/macbookpro/Documents/Progix/take-my-pic-web/take-me-pic-web`
- Monitoring: TBD
- Figma/design source: approved mobile mockup and dossier source files in the repo

---

# Project Health

Current Status: Active backend integration.

Current Milestone: Phase 1 auth/profile foundation.

Target Release: TBD after the first Supabase-backed auth/profile slice is completed and tested.

Notes:

- Remote Supabase bootstrap is marked complete in `docs/SUPABASE-INTEGRATION-STATUS.md`.
- `accept_help_request` exists and is executable by authenticated users.
- Mobile screens remain mostly mock-backed; auth/profile is the first live integration step.

---

# Development Board

Board files:

- `.agent-board/board.md`
- `.agent-board/board.json`
- `.agent-board/tasks/TASK-001.md`
- `.agent-board/tasks/TASK-002.md`

Filter:

Project = Take Me Pic Mobile

Group By:

Status

Columns:

- Backlog
- Ready
- In Progress
- Review
- Blocked
- Done

Create tasks directly in `.agent-board/tasks/` using the existing task template.

---

# Meetings

## Recent Meetings

Table view sorted by Date DESC.

Current meeting records: none added yet.

## Calendar

Calendar view can be added later if meeting notes are tracked in repo.

---

# Features

Features are intentionally lightweight. Instead of using a feature database, maintain checklists in this project file and detailed specs under `docs/features` and `docs/specs`.

## Current Features

- [ ] Authentication
- [ ] User Profile
- [ ] Profile Verification
- [ ] Nearby Presence
- [ ] Help Request Matching
- [ ] Realtime Session Chat
- [ ] Session Photo Transfer
- [ ] Rating, Karma, and Leaderboard
- [ ] Push Notifications
- [ ] Trust, Safety, and Reporting

---

## Example Feature Specification

### Authentication

**Purpose**

Allow users to create, verify, restore, and persist a trusted Take Me Pic account using Supabase Auth.

**User Flow**

User opens onboarding

↓

User signs up or logs in

↓

Supabase returns a session

↓

App bootstraps profile state

↓

Verified users can access gated Phase 1 actions

**Edge Cases**

- Duplicate email or phone.
- Expired or invalid OTP.
- Session expires during onboarding.
- Banned or incomplete-profile user attempts a gated action.

**Technical Notes**

- Supabase Auth.
- `AuthProvider`.
- `src/features/auth/api/auth-api.ts`.
- `profiles.id = auth.uid()`.
- Do not use user-editable metadata for authorization.

---

## Future Features

- [ ] Premium Entitlements
- [ ] Community Feed
- [ ] Photo Spots
- [ ] Bookings and Sponsored Monetization
- [ ] AI PhotoHelper
- [ ] Smart Itinerary
- [ ] Family Mode

---

# Linked Project Pages

- PRD: `docs/product/prd.md`
- PM: PROGIX / Digitaria delivery team
- Technical Notes: `docs/ARCHITECTURE.md`, `docs/SCHEMA.md`
- GitHub: https://github.com/DigitariaWebs/take-me-pic
- Resources: see Resources section above
