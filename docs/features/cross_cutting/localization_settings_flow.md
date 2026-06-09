## Feature Information

- Feature Name: Localization, RTL, and Settings
- Description / Goal: Let users run the app in their language and manage app/account preferences.
- Screens Involved: onboarding language picker, `settings`, all localized screens
- User Inputs: language selection, toggles, account/security preferences
- Backend/API Interactions: optional profile preference fields; local i18n persistence
- Special Conditions / Rules: Arabic requires RTL handling and app reload strategy
- Additional Notes: Repo has FR, EN, ES, AR files; PRD names FR/EN/AR.

---

# Localization, RTL, and Settings

## Purpose

Localization makes Take Me Pic feel native for French-first users while supporting English and Arabic. Settings gives users control over language, account, safety, notifications, and preferences.

## Entry Points

- Onboarding language selector
- Settings screen
- Account/profile preferences

## Preconditions

- Translation files exist for supported locales.
- Local persistence exists for language selection.
- RTL strategy is defined for Arabic.

## Main User Flow

### Step 1 - Select Language

User:

- Chooses language during onboarding or settings.

System:

- Persists choice.
- Updates strings.
- Applies RTL/reload if required.

### Step 2 - Manage Settings

User:

- Toggles preferences such as notifications, theme, safety/account actions.

System:

- Persists local or backend setting according to sensitivity.
- Shows loading/error where backend write is required.

### Step 3 - Reflect Preferences

System:

- Applies language and settings across app sessions.

## Alternate Flows

- Device locale unsupported: default to French.
- User selects Arabic: app may need restart for RTL.
- Offline settings: local-only settings still apply.

## Edge Cases & Failure Scenarios

- Missing translation key.
- RTL layout clipping.
- Backend preference write fails.
- Conflicting device/app language.

## Success State

- Language persists after restart.
- Screens render readable localized content.
- Settings changes are reflected consistently.

## Failure State

- Missing copy falls back safely.
- Failed backend writes show retry.

## Backend / API Notes

- Locale can remain local for MVP or be mirrored on profile.
- Notification preferences should sync if push is implemented.
- Sensitive account settings require backend confirmation.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `language_selected` | User changes language | `locale`, `source` |
| `settings_opened` | Settings opens | `locale` |
| `setting_changed` | Preference changes | `key`, `value` |
| `rtl_applied` | Arabic/RTL enabled | `requiresReload` |
| `settings_update_failed` | Backend/local save fails | `key`, `errorCode` |

## Security & Validation Considerations

- Sensitive account settings must re-auth if needed.
- Notification/privacy preferences should be server-enforced where relevant.
- Avoid logging sensitive setting values.

## Technical Notes / Engineering Considerations

- Centralize locale state.
- Audit layouts for RTL clipping.
- Keep flags rendered through `Flag` component, not custom text fonts.

## QA Testing Recommendations

- FR/EN/AR language switch.
- App restart persistence.
- RTL screen pass for major routes.
- Missing key fallback.
- Settings toggle failure/retry.

## Open Questions

- Is Spanish officially supported since repo includes `es`?
- Should language sync across devices?
- What settings are local-only vs backend-backed?

