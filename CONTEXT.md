# Take Me Pic

Take Me Pic is a trust-based photo help network where people create verified profiles before meeting nearby strangers for photo sessions.

## Language

**Signup**:
The account creation step that starts with email and password credentials before profile completion.
_Avoid_: Phone-first signup, OTP-only signup

**Profile Completion**:
The final onboarding submit that creates the trusted profile record.
_Avoid_: Signup, verification

**Trusted Profile**:
A profile that has completed the required onboarding fields and is allowed into the main app.
_Avoid_: Auth session, partial profile

**Trusted Profile Fields**:
The required onboarding fields for first-entry access: `first_name`, `username`, `age`, `city`, and `languages`.
_Avoid_: Optional avatar, draft fields

**Email Verification**:
The account confirmation step that proves control of the signup email before profile completion.
_Avoid_: Profile verification, phone verification

**Phone Verification**:
The trust signal that confirms a profile's phone number after the user is already in the app.
_Avoid_: Signup OTP, access gate

**Auth Provider**:
The external identity system used for email/password signup, session persistence, and email verification.
_Avoid_: Social login, local-only auth

## Relationships

- **Signup** precedes **Profile Completion**.
- **Email Verification** may be required between **Signup** and **Profile Completion**.
- **Profile Completion** requires an authenticated person.
- **Trusted Profile** is the gate for entering the main app.
- **Profile Completion** creates the **Trusted Profile** record.
- **Trusted Profile Fields** must be present before **Profile Completion** succeeds.
- **Phone Verification** belongs to a profile and may be completed after app entry.
- **Auth Provider** powers **Signup**, **Email Verification**, and session persistence.

## Example Dialogue

> **Dev:** "Should **Signup** ask for an OTP before creating the account?"
> **Domain expert:** "No. **Signup** starts with email and password; **Phone Verification** is a separate trust signal."

## Flagged Ambiguities

- "OTP" was used to mean both account creation and phone trust verification; resolved: initial **Signup** is email/password, while **Phone Verification** is a separate trust signal.
- "verification" was used to mean both email account confirmation and trust signals; resolved: **Email Verification** confirms email ownership, while **Phone Verification** is a separate trust signal.
- "profile" was used to mean both a saved record and a trusted onboarding result; resolved: a saved record is a **Profile**, while a gate-passing result is a **Trusted Profile**.
- "required profile fields" was used loosely; resolved: the first trusted slice requires **Trusted Profile Fields** and treats avatar as optional.
- "auth" was left abstract; resolved: **Auth Provider** is the identity system used for email/password signup, email verification, and session persistence.
