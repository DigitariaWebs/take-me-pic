# Temporary Supabase Auth Setup

Use this checklist to configure the current email/password auth slice.

## 1. Environment

Set these in `.env`:

```text
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Do not use a service-role key in the mobile app.

## 2. Auth Provider

In Supabase Dashboard:

- Go to `Authentication > Providers > Email`.
- Enable email signups.
- Enable password-based sign-in.
- Decide whether email confirmation is required.

Current app behavior expects:

- Email/password signup.
- If Supabase returns no session after signup, the app sends the user to the email verification code screen.
- The verification screen expects a 6-digit signup code.
- If the project uses email links, the app now handles `token_hash` links at `tmp://auth/callback` and exchanges them for a session.

## 3. Profiles RLS

Confirm `public.profiles` has RLS enabled and authenticated users can create only their own row.

Suggested policies:

```sql
alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
```

If these policies already exist under different names, do not duplicate them. Verify behavior instead.

## 4. Manual Test

1. Start the app.
2. Create a new account with email/password.
3. Verify email if Supabase requires confirmation.
4. Submit profile fields: first name, username, age, city, languages.
5. Confirm the app reaches `/(tabs)`.
6. Restart the app and confirm it still reaches `/(tabs)`.
7. Trigger "Forgot password" and confirm the reset email link opens `tmp://auth/callback`, then lands on reset.
8. Submit a new password and confirm login works with the new password.

## 5. Later

Follow-up `001-2`: add Apple and Google sign-in after this flow is stable.
