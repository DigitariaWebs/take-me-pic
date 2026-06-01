# Take Me Pic mobile — "make screens dynamic" brief

You are converting EXISTING static screen files in `/Users/achrafarabi/Dev/Take/TMP-mobile`
into interactive ones. This is a React Native / Expo Router app (Expo SDK 56) in the
**carnet de voyage** aesthetic. French-first UI.

## GOLDEN RULES
1. **Preserve the existing visual design.** Only ADD interactivity (React state, handlers,
   conditional rendering). Do NOT redesign layouts, change colors/spacing, or remove the
   carnet styling (polaroids, stamps, tape, paper). Read the current file and keep its look.
2. **Edit ONLY the screen files listed for your cluster.** Do NOT modify anything under
   `components/`, `theme/`, `data/`, `i18n/`, `lib/` — those are shared and read-only
   (other agents rely on them; editing causes conflicts). If you need a behaviour, implement
   it locally inside your screen file.
3. **Mock data only**, imported from `@/data/mock` (and `@/data/countries`). No backend, no fetch.
4. **Expo Go compatible.** Do NOT add new native dependencies or `require` native modules.
   Use only what's already imported in the project. (The map screen already guards expo-maps —
   don't touch it unless it's in your cluster.)
5. **Flags / regional-indicator emoji** must be rendered with `import { Flag } from '@/components/Flag'`
   — `<Flag size={18}>{"🇫🇷"}</Flag>`. NEVER put a flag inside a custom-font `<Text>` (it tofus).
   For `Chip`, pass the flag via the `leading` prop: `<Chip leading={<Flag>{flag}</Flag>}>français</Chip>`.
6. **Feedback without a backend:** prefer in-screen state changes (button label → "envoyé ✓",
   counters increment, chips toggle filled/outline, list items appear/disappear, a small inline
   confirmation Text). Use React Native `Alert.alert` ONLY for destructive confirmations
   (annuler / bloquer / signaler / supprimer). Don't spam Alerts.
7. **i18n is read-only.** Use existing `t('...')` keys already in the file. For NEW micro-copy,
   hardcode tasteful French inline (don't edit `i18n/`).
8. Keep it **TypeScript-clean and bundleable**: valid TSX, all imports resolve, no `any` leaks
   that break build, proper typing of state.

## AVAILABLE COMPONENTS (import from '@/components/...')
- `PaperBackground` (tone 'paper'|'warm'|'paper2'|'kraft'|'dark')
- `Polaroid` (src, caption, width, height, tilt, captionSize, dark, children)
- `Stamp` (children, color 'red'|'blue'|'green'|'gold'|'ink'|'white', shape, size, rotate, fontSize)
- `Tape` (color, width, height, rotate), `Ticket` (background, notchColor)
- `Chip` (color, variant 'outline'|'filled'|'dashed', size, leading, onPress) — toggle filled/outline for selection
- `Button` (variant 'ink'|'gold'|'paper'|'ghost', size, full, icon, onPress)
- `JournalSwitch` (value, onValueChange) — the iOS-style switch
- `Field` (label, variant 'underline'|'box', value, onChangeText, + TextInputProps)
- `Avatar` (source, size, online), `Pin`, `Compass`, `HandMap`, `Squiggle`
- `Flag` (children emoji, size), `CountryPickerModal` (visible, selected, onClose, onSelect)
- iOSChrome: `NavBar` (left,title,right), `HomeIndicator`, `StatusBarSpacer`
- Icons: `lucide-react-native`. Animations: `Animated` from 'react-native' or `react-native-reanimated`.
- Native modal: use `Modal` from 'react-native' (animationType="slide", presentationStyle="pageSheet")
  for sheets, like `components/CountryPickerModal.tsx` does — follow that pattern.

## DATA (import from '@/data/mock')
me, leo, ines, sami, marc, yasmine, allUsers, nearby, posts, spots, itinerarySteps,
notifications, manualSecrets, galleryPhotos, familyMembers, leaderboard. Types: User, Post, Spot, Notification.
Mutate via local component state (copy arrays into useState) — never mutate the imports directly.

## NAVIGATION
`import { useRouter, useLocalSearchParams } from 'expo-router'`. Routes use the existing paths
(e.g. `router.push('/chat/leo')`, `router.push('/session/gallery')`,
`router.push('/session/rating')`, `router.replace('/(tabs)/moi')`). Keep existing nav targets.

## WHAT "DYNAMIC" MEANS PER ELEMENT
- Text inputs → controlled (`useState` + value/onChangeText).
- Toggles/switches → real on/off state.
- Tabs/segmented controls → switch the rendered content.
- Filter chips → actually filter the list/grid shown.
- Like/bookmark/follow → toggle + update the count/label.
- Star ratings → tap to set 1–5, fill stars up to the tapped one.
- Chat → typed message + quick-reply chips append bubbles to a `useState` list, auto-scroll.
- Camera shutter → capture increments a counter / navigates to the gallery.
- Lists → rendered from data with working row taps; removable items update state.
Return the list of files you changed and a one-line note.
