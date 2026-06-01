import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useThemeColors } from '@/components/ThemeContext';

/**
 * Take Me Pic brand mark — a map-pin whose interior is a camera aperture,
 * with one gold blade. Vectorised from assets/take-me-pic-icon-transparent*.svg.
 *
 * `tone="dark"`  → cream pin on a dark surface.
 * `tone="light"` → ink pin on a light/paper surface.
 * `badge`        → wraps the light mark in a cream rounded "seal" so the crisp
 *                  iris reads on any background (used on the dark splash).
 * `lensColor` overrides the inner recess so it matches the surface behind it.
 */
export function Logo({
  size = 72,
  tone = 'dark',
  lensColor,
  badge = false,
}: {
  size?: number;
  tone?: 'dark' | 'light';
  lensColor?: string;
  badge?: boolean;
}) {
  const colors = useThemeColors();
  // On a badge we always draw the high-contrast light mark on cream paper.
  const effectiveTone = badge ? 'light' : tone;
  const isDark = effectiveTone === 'dark';
  const body = isDark ? colors.paper : colors.ink; // pin + most aperture blades
  const lens = lensColor ?? (badge ? colors.paper : isDark ? colors.bg1 : colors.paper);
  const gold = colors.goldLight;

  const markSize = badge ? Math.round(size * 0.66) : size;

  const mark = (
    <Svg width={markSize} height={markSize} viewBox="0 0 512 512">
      {/* Pin teardrop */}
      <Path d="M132.79 300.55A150 150 0 1 1 379.21 300.55L256 478Z" fill={body} />
      {/* Lens recess */}
      <Circle cx={256} cy={212} r={102} fill={lens} />
      {/* Aperture blades — first one gold */}
      <G>
        <Path d="M257.79 122.34L333.48 166.04L299.48 206.83L276.11 172.17Z" fill={gold} />
        <Path d="M334.54 168.72L334.54 256.12L282.22 247.07L300.55 209.50Z" fill={body} />
        <Path d="M332.75 258.38L257.06 302.08L238.74 252.24L280.44 249.33Z" fill={body} />
        <Path d="M254.21 301.66L178.52 257.96L212.52 217.17L235.89 251.83Z" fill={body} />
        <Path d="M177.46 255.28L177.46 167.88L229.78 176.93L211.45 214.50Z" fill={body} />
        <Path d="M179.25 165.62L254.94 121.92L273.26 171.76L231.56 174.67Z" fill={body} />
      </G>
    </Svg>
  );

  if (!badge) return mark;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        backgroundColor: colors.paper,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      {mark}
    </View>
  );
}
