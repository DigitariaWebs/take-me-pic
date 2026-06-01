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

## Run

```bash
npm install
npx expo start
```

Then press `i` for the iOS simulator, or scan the QR with Expo Go on a
device. The app boots into the splash, walks through 3 onboarding pages
(including the FR / EN / AR picker), and lands in the main tab bar.

## Project layout

```
app/                  # expo-router file routes (one file per screen)
  _layout.tsx         # root stack with all 27 screens
  index.tsx           # redirect to onboarding
  (onboarding)/       # 01 splash, 02 intro, 03 signup, 04 profile setup
  (tabs)/             # bottom-tab routes — carte / carnet / messages / moi
  user/[id].tsx       # 06 mini profile (modal) + 16 full public profile
  request/sent.tsx    # 07
  request/incoming.tsx# 08
  chat/[id].tsx       # 09
  session/*.tsx       # 10 photo session, 11 gallery, 12 rating
  post/[id].tsx       # 15
  spots/*             # 17 spots map + 18 spot detail
  stars.tsx           # 19 leaderboard
  manual.tsx          # 20 framing guides
  premium.tsx         # 21 paywall
  ai-camera.tsx       # 22
  itinerary.tsx       # 23
  booking.tsx         # 24
  family.tsx          # 25
  settings.tsx        # 26
  notifications.tsx   # 27

components/           # reusable journal components (Polaroid, Stamp,
                      # Tape, LuggageTag, Ticket, Squiggle, Pin, Compass,
                      # HandMap, JournalSwitch, JournalTabBar, Button,
                      # Chip, Field, Avatar, PaperBackground, iOSChrome)
theme/tokens.ts       # colors / fonts / radii / shadows from :root
theme/fonts.ts        # loads all four Google Fonts
i18n/{fr,en,ar}.ts    # strings + helper hook
data/mock.ts          # types + seed data (users, posts, spots, etc.)
mockup/               # the approved HTML design (source of truth)
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

- No backend yet — `data/mock.ts` is the data layer. To swap in
  Firestore / Stripe later, replace the exports there with fetcher
  functions; screens import by name so the change is local.
- No real AI; screen 22 uses a static "suggestion" panel that matches the
  mockup. Hook up your favorite model (Anthropic / OpenAI) behind the
  `Sparkles` button.
- Arabic / English strings exist as stubs that fall back to French. Once
  translated, also flip `I18nManager.forceRTL(true)` in the AR branch of
  `i18n/index.ts` and reload.

## Design references

When in doubt about a visual detail, open `mockup/Take Me Pic v2.html` in
a browser side-by-side with the running app — that's the single source of
truth, by design. Every token in `theme/tokens.ts` traces back to a
`:root` variable in that file.
