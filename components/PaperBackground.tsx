import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Svg, { Defs, Rect, RadialGradient, Stop } from 'react-native-svg';
import { useThemeColors } from '@/components/ThemeContext';
import { useTheme } from '@/components/ThemeContext';

/**
 * Paper texture. Warm aged-paper blotches (from the mockup's `.paper::after`).
 *
 * Note: the mockup's `.paper::before` SVG fractal-noise grain relied on an
 * `feTurbulence` filter, which react-native-svg does NOT support on native
 * (it warns and renders nothing). We omit it and rely on the warm radial
 * blotches + base paper colour, which give the same aged feel natively.
 *
 * Pass `tone` to switch between the light paper (`paper`), the kraft variant
 * (`kraft`), or the warm cream (`warm`).
 */
type Tone = 'paper' | 'warm' | 'paper2' | 'kraft' | 'dark';

export interface PaperBackgroundProps extends ViewProps {
  tone?: Tone;
  /** When false, suppresses the warm radial blotches (e.g. for full-bleed photos). */
  withBlotches?: boolean;
}

export function PaperBackground({
  tone = 'paper',
  withBlotches = true,
  style,
  children,
  ...rest
}: PaperBackgroundProps) {
  const colors = useThemeColors();
  const { isDark } = useTheme();

  const TONE_BG: Record<Tone, string> = {
    paper: colors.paper,
    warm: colors.paperWarm,
    paper2: colors.paper2,
    kraft: colors.kraft,
    dark: colors.bg1,
  };
  const bg = TONE_BG[tone];

  // Aged-paper blotches in light mode; a faint warm vignette in dark mode so
  // the surface still reads as textured leather rather than flat black.
  const blotch = isDark ? '#d9b566' : '#7a5a28';
  const blotchO = isDark ? [0.05, 0.04, 0.05] : [0.14, 0.1, 0.08];

  return (
    <View style={[styles.root, { backgroundColor: bg }, style]} {...rest}>
      {tone !== 'dark' && withBlotches && (
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id="blotch1" cx="22%" cy="18%" rx="32%" ry="22%" fx="22%" fy="18%">
              <Stop offset="0" stopColor={blotch} stopOpacity={blotchO[0]} />
              <Stop offset="1" stopColor={blotch} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="blotch2" cx="78%" cy="82%" rx="34%" ry="22%" fx="78%" fy="82%">
              <Stop offset="0" stopColor={blotch} stopOpacity={blotchO[1]} />
              <Stop offset="1" stopColor={blotch} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="blotch3" cx="88%" cy="12%" rx="24%" ry="18%" fx="88%" fy="12%">
              <Stop offset="0" stopColor={isDark ? '#d9b566' : '#3c2814'} stopOpacity={blotchO[2]} />
              <Stop offset="1" stopColor={isDark ? '#d9b566' : '#3c2814'} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#blotch1)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#blotch2)" />
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#blotch3)" />
        </Svg>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  content: { flex: 1 },
});
