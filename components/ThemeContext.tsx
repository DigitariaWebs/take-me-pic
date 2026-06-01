import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, type ThemeColors } from '@/theme/tokens';

/**
 * App-wide light/dark theme for the carnet.
 *
 * Screens and components read the ACTIVE palette via `useThemeColors()` and
 * build their StyleSheets from it (see the `makeStyles(c)` pattern), so a mode
 * switch re-renders every surface with the right colours. Tokens keep identical
 * keys across palettes — `ink` is always the foreground, `paper` always the
 * surface — so styling against the shape themes for free.
 */
export type ThemeMode = 'light' | 'dark';

const KEY = '@tmp/theme';

type ThemeCtx = {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const initial: ThemeMode = (Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');

const Ctx = createContext<ThemeCtx>({
  mode: 'light',
  colors: lightColors,
  isDark: false,
  setMode: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(initial);

  // Restore a saved preference; if none, follow the system scheme captured above.
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(KEY);
        if (stored === 'light' || stored === 'dark') setModeState(stored);
      } catch {
        /* storage unavailable — keep the system default */
      }
    })();
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  };

  const value = useMemo<ThemeCtx>(() => {
    const isDark = mode === 'dark';
    return {
      mode,
      isDark,
      colors: isDark ? darkColors : lightColors,
      setMode,
      toggle: () => setMode(isDark ? 'light' : 'dark'),
    };
  }, [mode]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Full theme state — mode, the active palette, and setters. */
export const useTheme = () => useContext(Ctx);

/** The active colour palette. Build StyleSheets from this: `makeStyles(c)`. */
export const useThemeColors = (): ThemeColors => useContext(Ctx).colors;
