# Condensed Feature Specification: Auth, Onboarding, and Profile

**Feature Branch**: `004-auth-onboarding`  
**Created**: 2026-06-08  
**Status**: Draft  
**Flow Doc**: `docs/features/phase_1/onboarding_profile_verification_flow.md`

## User Story

As a new Take Me Pic user, I want to sign up, verify my identity, and complete a profile, so that other users can trust me before meeting in person.

## Independent Test

Create a new user, verify email/phone, complete profile, restart the app, and confirm the Supabase session plus `profiles` row persist.

## Acceptance Criteria

1. **Given** valid signup credentials, **When** the user submits signup, **Then** Supabase Auth starts the account flow without exposing secret keys.
2. **Given** a valid OTP/email verification, **When** verification completes, **Then** the user has an authenticated session.
3. **Given** required profile fields, **When** the profile form is submitted, **Then** `profiles.id = auth.uid()` is created or updated.
4. **Given** missing/invalid required fields, **When** the user submits, **Then** no incomplete trusted profile is created.
5. **Given** a banned or unverified user, **When** they try to access gated help-network actions, **Then** the app blocks them.

## Minimal Data Contract

- `auth.users`: source of authentication identity.
- `profiles`: `id`, `first_name`, `last_name`, `username`, `age`, `city`, `languages`, `avatar_url`, `bio`, `email_verified`, `phone_verified`, `verified`, `is_banned`.
- Storage bucket: `avatars`.

## Execution Tasks

- [ ] Wire signup/login/OTP screens to Supabase Auth.
- [ ] Add profile create/update fetcher behind the data seam.
- [ ] Add avatar upload helper and Storage policy.
- [ ] Add auth/profile gate for map/request/helper actions.
- [ ] Add tests for signup, verification, profile write, and banned/unverified access.

## Risks

- User metadata must not drive authorization.
- OTP resend must be rate-limited.
- Avatar upload and profile write need retry/rollback behavior.

