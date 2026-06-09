/**
 * Take Me Pic — design tokens.
 * Mirror of the :root variables in the approved HTML mockup
 * (mockup/Take Me Pic v2.html). When you edit a value here, you edit the
 * single source of truth for the whole app.
 */

export const colors = {
  // Paper & ink
  paper: '#f1e6cf',
  paper2: '#ebdeC0',
  paperWarm: '#f5ebd5',
  kraft: '#c9b48b',
  kraftDeep: '#9a8254',
  kraftShadow: '#7a6440',
  cardWhite: '#fbf6e9',
  polaroid: '#fdf9ed',
  ink: '#2a1f1a',
  ink2: '#4a3d33',
  inkFaded: '#6e5d4e',
  inkLine: 'rgba(42,31,26,0.22)',
  inkSoft: 'rgba(42,31,26,0.55)',

  // Brand
  gold: '#b8893a',
  goldDeep: '#8a6420',
  goldLight: '#d9b566',
  stampRed: '#a8362e',
  stampBlue: '#2a4f76',
  stampGreen: '#3f6b3f',
  sunset: '#d77032',
  sea: '#5a8aa3',

  // Board (dark stage in mockup — used for splash, premium, dark surfaces)
  bg1: '#1a140e',
  bg2: '#0e0a07',
  boardLine: 'rgba(255,255,255,0.08)',

  /**
   * A deliberately-DARK filled surface (ink ticket / chat bubble / chip) that
   * must STAY dark in both themes — unlike `ink`, which is the foreground text
   * colour and flips to cream in dark mode. Pair with `onInk` for text/icons.
   */
  inkSurface: '#2a1f1a',
  onInk: '#f5ebd5',

  // Transparent helpers
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;

/**
 * The shape every palette satisfies. Light (`colors`) and dark (`darkColors`)
 * share identical keys — tokens are used SEMANTICALLY across the app
 * (`ink` = foreground text/lines, `paper` = surface background, etc.), so a
 * screen styled against this shape themes correctly just by swapping which
 * palette it reads at runtime via `useThemeColors()`.
 */
export type ThemeColors = { [K in ColorToken]: string };

/**
 * Dark carnet — "leather journal at night". Same token semantics as the light
 * palette: warm near-black paper surfaces, cream ink, slightly brightened
 * brand accents so gold/stamps still pop against the dark ground.
 */
export const darkColors: ThemeColors = {
  // Paper & ink — inverted: surfaces go dark-warm, ink goes cream
  paper: '#191310',
  paper2: '#211a14',
  paperWarm: '#1f1812',
  kraft: '#5c4c34',
  kraftDeep: '#6f5b3d',
  kraftShadow: '#473a27',
  cardWhite: '#2a2018',
  polaroid: '#332821',
  ink: '#f1e6cf',
  ink2: '#d9cbb0',
  inkFaded: '#a89a82',
  inkLine: 'rgba(241,230,207,0.18)',
  inkSoft: 'rgba(241,230,207,0.50)',

  // Brand — brightened to read on the dark ground
  gold: '#c79a4a',
  goldDeep: '#b8893a',
  goldLight: '#e0c074',
  stampRed: '#c4554b',
  stampBlue: '#5a82ad',
  stampGreen: '#6b9b6b',
  sunset: '#e08a4f',
  sea: '#79a8bf',

  // Board (already-dark stages stay dark)
  bg1: '#140f0a',
  bg2: '#0a0705',
  boardLine: 'rgba(255,255,255,0.10)',

  // Raised dark surface, distinct from the page so cream/gold text pops.
  inkSurface: '#352a20',
  onInk: '#f5ebd5',

  transparent: 'transparent',
};

export const lightColors: ThemeColors = colors;

export const fonts = {
  serif: 'Fraunces_500Medium',
  serifBold: 'Fraunces_700Bold',
  serifBlack: 'Fraunces_800ExtraBold',
  serifItalic: 'Fraunces_400Regular_Italic',
  hand: 'Caveat_500Medium',
  handBold: 'Caveat_700Bold',
  type: 'SpecialElite_400Regular',
  mono: 'DMMono_400Regular',
  monoMd: 'DMMono_500Medium',
} as const;

export const radii = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
  pill: 999,
} as const;

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 14,
  lg: 22,
  xl: 32,
  '2xl': 48,
} as const;

export const shadow = {
  card: {
    shadowColor: '#3c2814',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  polaroid: {
    shadowColor: '#3c2814',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 6,
  },
  stamp: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
} as const;

/**
 * Mockup gives us a "hard ink offset" effect (e.g. `box-shadow: 4px 4px 0 var(--ink)`).
 * RN can't render this with shadow props, so we layer a background View under the
 * surface. This token captures the canonical offset.
 */
export const hardShadow = {
  ink: { offsetX: 4, offsetY: 4, color: colors.ink },
  gold: { offsetX: 5, offsetY: 5, color: colors.goldDeep },
  red: { offsetX: 3, offsetY: 3, color: colors.stampRed },
  blue: { offsetX: 4, offsetY: 4, color: colors.stampBlue },
} as const;
