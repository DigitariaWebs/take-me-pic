# Take Me Pic (TMP)

Mobile app for travelers who want a real human nearby to take their photo.
This is the iOS-first React Native / Expo implementation of the approved
"carnet de voyage" design (see `mockup/Take Me Pic v2.html` — the design
source of truth).

## Stack

- **Expo SDK 56** (the brief asked for SDK 55, the latest stable at scaffold
  time was 56; new architecture only, same direction). React Native 0.85,
  React 19.2, TypeScript 6.
- **Expo Router** for file-based navigation. No imports from
  `@react-navigation/*` in app code, per SDK 55+ direction.
- **react-native-maps** wired up but the home screen and spots screen use a
  bespoke `HandMap` SVG so we never show a default blue Google map. To use
  a real map provider later, drop a `MapView` from `react-native-maps` into
  the screens (it is already installed and works with Apple Maps by
  default on iOS).
- **react-native-reanimated 4 + react-native-worklets + react-native-gesture-handler**
  for the pulse animations, switches, and gesture surface.
- **expo-image** for fast image loading.
- **@expo-google-fonts/{fraunces, caveat, special-elite, dm-mono}** —
  the four typefaces from the mockup, loaded via `expo-font`.
- **lucide-react-native** for the icon set (matches the lucide icons in
  the mockup).
- **i18n-js + expo-localization + AsyncStorage** for FR (primary) / EN / AR
  language switching with persistence.
- **@tanstack/react-query** for server state (Supabase reads/mutations).
- **zustand** for client state (role, transient UI/feature state).
- **@supabase/supabase-js** centralized under `src/shared/lib/supabase`.

## Run Commands By Environment

### 1) Local development (fast iteration)

```bash
npm install
npm run start
```

Then press `i` for iOS simulator or `a` for Android emulator.

Useful local commands:

```bash
npm run ios       # native iOS run (prebuild/run)
npm run android   # native Android run (prebuild/run)
npm run typecheck
```

### 2) QA / internal testing builds (`preview` profile)

Prerequisite once per machine:

```bash
npx eas login
```

Build binaries for testers:

```bash
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

### 3) Production candidate builds (`production` profile)

Build store-grade binaries:

```bash
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
```

Submit the latest iOS production build to TestFlight:

```bash
npx eas submit --platform ios --profile production --latest
```

Optional combined iOS build + auto-submit flow:

```bash
npx eas build --platform ios --profile production --auto-submit
```

For the complete command catalog (dev, tests, E2E, CI workflows, deploy/release), see `docs/ci-cd/commands-reference.md`.

## Project layout

Feature-first architecture (see `docs/ARCHITECTURE.md` for the full rules).
`src/app/` is the thin Expo Router layer; all logic lives in `src/features/*`;
anything used by 2+ features lives in `src/shared/`.

```
src/
  app/                # expo-router file routes ONLY — thin re-exports + layouts
    _layout.tsx       # root: QueryProvider > ThemeProvider > AuthProvider > Role
    index.tsx         # redirect to onboarding
    (onboarding)/     # auth + onboarding routes
    (tabs)/           # bottom-tab routes — carte / carnet / messages / moi
    request/ session/ chat/ post/ spots/ user/ ...  # one thin file per route

  features/           # every feature: api/ components/ hooks/ screens/ store/ types/ index.ts
    auth/             # login, signup, otp, forgot/reset (+ Supabase auth api/hooks/store)
    onboarding/       # splash, intro, profile setup
    profile/          # my profile, public profile, leaderboard (+ TanStack Query api/hooks)
    feed/ chat/       # community feed + realtime session chat (screens + components + types)
    discover/         # nearby map
    help-request/ session/ spots/ premium/ ai-camera/
    itinerary/ booking/ family/ settings/ notifications/

  shared/
    lib/supabase/     # client / auth / storage / realtime / database.types (centralized)
    lib/query/        # TanStack Query client factory
    lib/i18n/         # strings + helper hook
    lib/analytics/ lib/sentry/
    providers/        # AuthProvider / QueryProvider / ThemeProvider / RoleProvider
    store/            # zustand client-state stores (role)
    ui/               # reusable presentational components (Polaroid, Stamp, Button, ...)
    constants/        # tokens.ts (colors/fonts/radii) + fonts.ts loader
    data/             # mock.ts seed data + countries
    hooks/ utils/ types/ testing/

assets/               # icons / splash (referenced by app.json at repo root)
```

A consumer imports a feature through its public API only:

```ts
import { LoginScreen, useLogin } from '@/features/auth';
```

## Config-plugin steps (for when you ship a real build)

- **Maps** — `react-native-maps` is installed but its config plugin is not
  enabled, so iOS uses Apple Maps with no extra configuration. If you want
  Google Maps on iOS, add the plugin block back into `app.json`:

  ```json
  "plugins": [
    ["react-native-maps", { "iosGoogleMapsApiKey": "YOUR_KEY" }]
  ]
  ```

- **Camera / Photos** — `app.json` ships the `NSCameraUsageDescription`,
  `NSPhotoLibraryUsageDescription`, and `NSLocationWhenInUseUsageDescription`
  strings. Update copy if needed; the screens currently use placeholder
  imagery rather than the real camera.
- **Push** — not wired yet. When the backend lands, install
  `expo-notifications` and add its plugin to `app.json`.

## What's not built

- Screens still render from `src/shared/data/mock.ts` (the approved UI is
  unchanged). The Supabase + TanStack Query data layer is now wired
  (`src/shared/lib/supabase`, `src/features/*/api`, `src/features/*/hooks`);
  swap a screen's mock import for the feature hook to go live, screen by
  screen, without touching the UI.
- No real AI; screen 22 uses a static "suggestion" panel that matches the
  mockup. Hook up your favorite model (Anthropic / OpenAI) behind the
  `Sparkles` button.
- Arabic / English strings exist as stubs that fall back to French. Once
  translated, also flip `I18nManager.forceRTL(true)` in the AR branch of
  `src/shared/lib/i18n/index.ts` and reload.

## Design references

When in doubt about a visual detail, open `mockup/Take Me Pic v2.html` in
a browser side-by-side with the running app — that's the single source of
truth, by design. Every token in `src/shared/constants/tokens.ts` traces back
to a `:root` variable in that file.
