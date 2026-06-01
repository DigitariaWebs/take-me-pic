import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon } from 'react-native-svg';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';

export interface LuggageTagProps {
  property?: string;
  title: string;
  /** Bottom-line script tagline. */
  tagline?: string;
  size?: 'sm' | 'lg';
  rotate?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Big gold luggage tag with a string-hole grommet — the mockup's splash
 * centerpiece and masthead chip both use this shape.
 */
export function LuggageTag({
  property = 'PROPERTY OF',
  title,
  tagline,
  size = 'lg',
  rotate = -4,
  style,
}: LuggageTagProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const w = size === 'lg' ? 230 : 170;
  const h = size === 'lg' ? 300 : 220;
  // Cut a notch at the top (asymmetric trapezoid): polygon points map to the CSS clip-path.
  const points = `0,${h * 0.08} ${w * 0.5},0 ${w},${h * 0.08} ${w},${h} 0,${h}`;
  return (
    <View
      style={[
        { width: w, height: h, transform: [{ rotate: `${rotate}deg` }] },
        style,
      ]}
    >
      {/* String + grommet */}
      <View style={[styles.string, { left: w / 2 - 1 }]} />
      <View style={[styles.grommet, { left: w / 2 - 6 }]} />

      {/* Tag body cut via SVG (RN cannot clip-path) */}
      <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
        <Polygon points={points} fill="url(#tag)" />
      </Svg>
      <LinearGradient
        colors={[colors.goldLight, colors.gold] as unknown as readonly [string, string]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          {
            top: h * 0.08,
            // crude approximation of the cut polygon — covers the body, leaving the notch transparent
          },
        ]}
      />
      <View
        style={{
          position: 'absolute',
          inset: 0 as unknown as number,
          top: h * 0.08 + 30,
          paddingHorizontal: 24,
          alignItems: 'center',
        }}
      >
        <Text style={styles.propertyText}>{property}</Text>
        <Text style={[styles.title, size === 'sm' && { fontSize: 24 }]}>{title}</Text>
        {tagline ? (
          <>
            <View style={styles.divider} />
            <Text style={styles.tagline}>{tagline}</Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  string: {
    position: 'absolute',
    top: -60,
    width: 2,
    height: 80,
    backgroundColor: colors.kraftShadow,
  },
  grommet: {
    position: 'absolute',
    top: 14,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.bg2,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
  },
  propertyText: {
    fontFamily: fonts.type,
    fontSize: 11,
    letterSpacing: 2.2,
    color: colors.ink,
    opacity: 0.6,
  },
  title: {
    fontFamily: fonts.serifBlack,
    color: colors.ink,
    fontSize: 34,
    letterSpacing: -0.6,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 36,
  },
  divider: {
    width: 60,
    marginVertical: 14,
    borderTopWidth: 1.5,
    borderColor: 'rgba(42,31,26,0.4)',
    borderStyle: 'dashed',
  },
  tagline: {
    fontFamily: fonts.hand,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 24,
  },
});
