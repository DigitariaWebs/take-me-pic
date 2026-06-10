# Take Me Pic — Supabase Integration Status

Checked on: 2026-06-09

## Verdict

Remote database bootstrap is now complete on `oxexcljzzemfenzogcnz`, and local migration history is synced with the missing RPC.

Confirmed in the remote project:

- `public` schema has 33 tables.
- RLS is enabled on all tables.
- Initial schema chunks are applied (`0001_*` migration names recorded remotely).
- `public.find_available_helpers` exists.
- `public.accept_help_request` exists and is executable by `authenticated`.

Still pending for full product integration:

- Mobile screens are still largely wired to mock data.
- Supabase Auth flow is not fully connected across onboarding/login/OTP/profile.
- Storage buckets and policies (`session-photos`, `avatars`, `posts`) still need explicit verification.
- Realtime subscriptions and push delivery pipeline remain to be wired.

## Env

The local app uses:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://oxexcljzzemfenzogcnz.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_LLx1T8YCh1f8jZcyXCfGbA_yqFcafIq
```

Also supported:

```bash
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_LLx1T8YCh1f8jZcyXCfGbA_yqFcafIq
```

## Migration Sync Status

- Remote applied: `0001_initial_schema.sql` in chunked migration entries plus RPC patches.
- Local migrations now include:
  - `supabase/migrations/0001_initial_schema.sql`
  - `supabase/migrations/0002_accept_help_request_rpc.sql`

## Current Runtime Coverage Snapshot

| Area | Backend readiness | App wiring |
|---|---|---|
| Profile + leaderboard | Ready (`profiles`, `leaderboard`) | Partial |
| Nearby + presence | Ready (`presence`, `find_available_helpers`) | Mostly mock |
| Help request acceptance | Ready (`accept_help_request`) | Not fully wired |
| Chat/session/photos | Schema ready | Mostly mock |
| Moderation/admin | Schema ready (`reports`, `blocks`, `bans`, `user_roles`, `admin_audit_log`) | Not wired |

## Recommended Next Build Order

1. Wire Supabase Auth and profile bootstrap in onboarding.
2. Replace Phase 1 mock seams with typed Supabase fetchers.
3. Add storage buckets/policies and verify signed upload/download paths.
4. Integrate realtime flows for requests/messages/presence.
5. Add integration tests for `accept_help_request`, request transitions, and RLS boundaries.
