# Maestro Smoke Coverage

TASK-002 trusted profile gates should stay focused:

- `tasks/TASK-002.yml` covers the signed-out app-entry gate.
- `auth_signup.yml`, `auth_login.yml`, and `onboarding_profile.yml` cover the current auth/onboarding surface.

Email-unverified, missing-profile, and blocked-account automation needs seeded Supabase users/profiles. Until test seeding is available, verify those states manually and keep this note updated with the seeded flow names once added.
