# Spec: Localization and Settings

**Flow Doc**: `docs/features/cross_cutting/localization_settings_flow.md`  
**Priority**: P1/P2

## User Story

As a French, English, or Arabic speaker, I want the app in my language with correct layout behavior, so that the app feels native.

## Independent Test

Switch locale during onboarding/settings, restart the app, and verify the locale persists and major screens render without clipping.

## Acceptance Criteria

1. Locale selection persists across app restart.
2. Unsupported locale falls back safely.
3. Arabic path defines RTL/reload behavior.
4. Settings changes are local or backend-backed according to sensitivity.

## Minimal Data Contract

- local locale persistence
- optional `profiles.locale`
- optional notification/privacy preference fields

## Execution Tasks

- [ ] Confirm official supported locales, including whether Spanish is supported.
- [ ] Add locale persistence/sync decision.
- [ ] Audit RTL on major screens.
- [ ] Wire settings persistence for backend-backed preferences.
- [ ] Test missing-key fallback and restart persistence.

