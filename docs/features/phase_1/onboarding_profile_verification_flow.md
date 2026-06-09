## Feature Information

- Feature Name: Onboarding, Profile, and Verification
- Description / Goal: Create a trusted user account with profile details, language preferences, and email/phone verification.
- Screens Involved: `(onboarding)/index`, `intro`, `signup`, `login`, `otp`, `profile`, `forgot`, `reset`, `(tabs)/moi`, `settings`
- User Inputs: email, phone, OTP, password, name, avatar, bio, age, city, languages
- Backend/API Interactions: Supabase Auth, `profiles`, Storage `avatars`, push-token registration after login
- Special Conditions / Rules: do not trust user-editable metadata for authorization; verified state must be server-derived
- Additional Notes: Current app implements the UI locally and does not call Supabase Auth yet.

---

# Onboarding, Profile, and Verification

## Purpose

This feature turns an anonymous app install into a trusted Take Me Pic profile. It solves the safety problem behind real-world stranger meetups by requiring identity, language, and verification signals before users participate in the help network.

## Entry Points

- App launch
- Onboarding intro
- Login/signup links
- Forgot/reset password
- Profile tab edit actions
- Settings account section

## Preconditions

- Supabase project and Auth providers are configured.
- `.env` exposes only publishable client credentials.
- Avatar bucket and policy exist.
- User has network connectivity for signup/login/OTP.

## Main User Flow

### Step 1 - Start Signup

User:

- Enters email/phone and starts account creation.

System:

- Validates input format.
- Creates or starts Supabase Auth flow.
- Shows loading and blocks duplicate submits.

### Step 2 - Verify Identity

User:

- Enters OTP or follows email verification.

System:

- Confirms Auth session.
- Stores verification state server-side.
- Shows retry state for expired/invalid code.

### Step 3 - Complete Profile

User:

- Adds name, avatar, bio, city, age, and languages.

System:

- Creates/updates `profiles` row for `auth.uid()`.
- Uploads avatar to Storage if provided.
- Navigates to the main app only after required fields pass validation.

## Alternate Flows

- Returning user logs in and lands directly in the app.
- User resets password through forgot/reset screens.
- User skips optional avatar/bio but must keep required trust fields.
- User changes language in onboarding or settings.

## Edge Cases & Failure Scenarios

- Duplicate email/phone: show account-exists path.
- OTP expired: allow resend with cooldown.
- Avatar upload fails: keep profile form and allow retry.
- Session expires during profile setup: return to login.
- User is banned: block access after auth and show support path.

## Success State

- Auth session persists in AsyncStorage.
- `profiles` row exists and matches `auth.uid()`.
- Verification signals are visible in profile and trust gates.
- User can access map/help features according to verification policy.

## Failure State

- Account is not partially trusted until verification/profile requirements are met.
- Failed writes are retryable.
- User sees clear inline error, not silent failure.

## Backend / API Notes

- Use Supabase Auth for session and OTP/email verification.
- Use `profiles.id = auth.users.id`.
- Use Storage path ownership for avatars.
- Derive authorization from `auth.uid()` and server-owned app metadata, not user metadata.

## Analytics & Tracking Events

| Event name | Trigger | Key properties |
| --- | --- | --- |
| `onboarding_started` | User opens onboarding | `locale`, `source` |
| `signup_submitted` | User submits signup | `method` |
| `verification_completed` | OTP/email verified | `method`, `durationMs` |
| `profile_completed` | Required profile saved | `hasAvatar`, `languageCount` |
| `onboarding_failed` | Auth/profile write fails | `step`, `errorCode` |

## Security & Validation Considerations

- Enforce age minimum server-side.
- Keep phone/email verification state server-derived.
- Rate-limit OTP retries.
- Do not expose service-role keys.
- Protect avatar uploads with ownership policies.

## Technical Notes / Engineering Considerations

- Keep auth/profile data behind a repository layer.
- Avoid placing business rules directly in screens.
- Persist session with AsyncStorage as configured in `lib/supabase.ts`.
- Ensure logout clears local queued/private state.

## QA Testing Recommendations

- Signup, login, OTP success/failure, password reset.
- Profile create/update and avatar failure retry.
- Session persistence after app restart.
- Banned/unverified access gate behavior.
- Locale switching during onboarding.

## Open Questions

- Is phone verification mandatory before map access, or only before accepting/creating requests?
- What age-gate policy applies by country?
- Will stronger identity verification be required before public launch?

