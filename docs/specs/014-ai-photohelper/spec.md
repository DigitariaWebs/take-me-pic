# Spec: AI PhotoHelper

**Flow Doc**: `docs/features/phase_3/ai_photohelper_flow.md`  
**Priority**: P3

## User Story

As a user, I want framing suggestions and manual photo tips, so that my photos improve during sessions and travel.

## Independent Test

Open manual tips offline, then request an AI suggestion with a mocked provider response and verify fallback behavior on provider failure.

## Acceptance Criteria

1. Static framing tips load without backend/provider availability.
2. AI suggestions go through a provider-agnostic interface.
3. Suggestion records are stored only according to privacy policy.
4. Provider failure does not block a photo session.

## Minimal Data Contract

- `framing_tips`
- `ai_suggestions`
- optional image/storage path

## Execution Tasks

- [ ] Add framing tips fetcher.
- [ ] Add AI provider service interface.
- [ ] Add suggestion request/persist helper.
- [ ] Wire manual and AI camera screens.
- [ ] Test offline/manual and provider failure paths.

