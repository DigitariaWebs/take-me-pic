# Take Me Pic — Architecture

Feature-First architecture for Expo Router + Supabase + TanStack Query + Zustand.
Optimized for discoverability, scalability, and AI-assisted development.

## Layers

```
src/app/        Routes only. Thin. Layouts, redirects, navigation orchestration.
src/features/*  All business logic. Each feature is self-contained.
src/shared/*    Code used by 2+ features (UI, lib, providers, constants, data).
```

### 1. Expo Router owns navigation

`src/app/` contains routes only. Route files are thin re-exports of a feature
screen, plus `_layout.tsx` files for navigation orchestration.

```tsx
// src/app/(onboarding)/login.tsx
import { LoginScreen } from '@/features/auth';

export default LoginScreen;
```

Forbidden in `src/app/`: business logic, API calls, state management, reusable UI.

### 2. Features own business logic

Every feature follows the same shape:

```
features/<name>/
  api/         # data access (Supabase calls)
  components/  # feature-only components
  hooks/       # feature hooks (TanStack Query wrappers, etc.)
  screens/     # screen components (default export per screen)
  store/       # feature-scoped Zustand stores (client state)
  types/       # feature types
  index.ts     # public API
```

Subfolders are created when they hold real code (avoid premature abstraction).
`auth` and `profile` are the reference implementations of the full pattern.

### 3. Public API rule

Consumers import a feature only through its barrel:

```ts
import { LoginScreen, useLogin } from '@/features/auth';   // yes
import { LoginScreen } from '@/features/auth/screens/LoginScreen'; // no
```

### 4. TanStack Query for server state

Profiles, chats, bookings, notifications, leaderboard, etc. Query client lives at
`src/shared/lib/query`, provided by `QueryProvider`. See
`src/features/profile/hooks/useProfile.ts` for the canonical query, and
`src/features/auth/hooks/*` for mutations.

### 5. Zustand for client state

Theme, role, filters, onboarding state, transient UI. Never put server state in
Zustand. See `src/shared/store/role-store.ts` and
`src/features/auth/store/auth-ui-store.ts`.

## Shared infrastructure

```
shared/lib/supabase/   client.ts, auth.ts, storage.ts, realtime.ts, database.types.ts
shared/lib/query/      query-client.ts
shared/lib/i18n/       i18n strings + hooks
shared/lib/analytics/  analytics client (stub)
shared/lib/sentry/     crash reporter (stub)
shared/providers/      AuthProvider, QueryProvider, ThemeProvider, RoleProvider
shared/ui/             reusable presentational components
shared/constants/      tokens.ts, fonts.ts
shared/data/           mock.ts seed data (screens still render from this)
shared/testing/        test providers
```

Regenerate Supabase types after a schema change:

```bash
supabase gen types typescript --linked > src/shared/lib/supabase/database.types.ts
```

## Path aliases

`@/*` → `src/*`. Also `@/shared/*`, `@/features/*`, `@/app/*`.

## Provider tree

`QueryProvider` > `ThemeProvider` > `AuthProvider` > `RoleProvider` > routes
(see `src/app/_layout.tsx`).

## Migration note

The approved UI is unchanged: screens still render from `shared/data/mock.ts`.
The Supabase + TanStack Query data layer is wired and ready; switch a screen's
mock import for the matching feature hook to go live incrementally.
