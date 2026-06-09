## Feature Information

- Feature Name: AI PhotoHelper and Framing Guide
- Description / Goal: Provide framing, angle, and composition suggestions before or during a photo session.
- Screens Involved: `ai-camera`, `manual`, `session/index`
- User Inputs: camera frame/image, suggest action, guide selection
- Backend/API Interactions: `ai_suggestions`, `framing_tips`, AI provider API
- Special Conditions / Rules: provider should be isolated; avoid storing sensitive images unless needed
- Additional Notes: Current UI uses static suggestion and manual guide cards.

---

# AI PhotoHelper and Framing Guide

## Purpose

AI PhotoHelper helps users and helpers take better photos by giving composition suggestions and reusable framing guidance. It supports the dossier’s “L'œil bienveillant” ecosystem feature.

## Entry Points

- AI camera screen
- Manual/framing guide
- Active session viewfinder

## Preconditions

- Camera permission is available if using live frame.
- AI provider and privacy policy are configured.
- Static framing tips are seeded.

## Main User Flow

### Step 1 - Open Guide Or Camera

User:

- Opens manual or AI camera.

System:

- Loads static framing tips or camera preview state.
- Shows fallback if camera is unavailable.

### Step 2 - Request Suggestion

User:

- Taps suggest/framing helper.

System:

- Sends permitted image/context to provider.
- Stores provider-agnostic suggestion metadata if needed.
- Shows loading and result state.

### Step 3 - Apply Guidance

User:

- Uses tip during session or saves/continues.

System:

- Keeps suggestion available for active session.

## Alternate Flows

- Offline: show static guide only.
- User denies camera: manual remains available.
- Provider fails: show retry and static tips.

## Edge Cases & Failure Scenarios

- Sensitive image content.
- Provider timeout.
- Camera permission revoked.
- Unsupported locale.

## Success State

- User receives actionable framing suggestion.
- Suggestion is stored only if policy allows.
- Static guide remains available without AI.

## Failure State

- AI failure does not block session.
- User sees retry/fallback.

## Backend / API Notes

- Store `ai_suggestions` with provider, user, optional help request, and json suggestion.
- Keep provider-specific code behind a service.
- Avoid durable storage of raw images unless necessary.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `ai_camera_opened` | AI camera opens | `source` |
| `ai_suggestion_requested` | User taps suggest | `hasImage`, `requestId` |
| `ai_suggestion_shown` | Suggestion displayed | `provider`, `latencyMs` |
| `framing_tip_opened` | Manual card opened | `tipId` |
| `ai_suggestion_failed` | Provider fails | `errorCode` |

## Security & Validation Considerations

- Avoid uploading images without consent.
- Do not send private session photos unnecessarily.
- Redact or minimize metadata.
- Review provider data-retention terms.

## Technical Notes / Engineering Considerations

- Keep AI behind provider-agnostic interface.
- Cache static framing tips.
- The feature must degrade to manual tips.

## QA Testing Recommendations

- Camera grant/deny.
- Provider timeout/failure.
- Static manual offline.
- Suggestion display in FR/EN/AR.

## Open Questions

- Which provider is approved for MVP?
- Are images stored, transient, or never persisted?
- Is AI part of MVP or Phase 3 only?

