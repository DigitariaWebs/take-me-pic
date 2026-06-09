import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { useThemeColors } from '@/shared/providers/ThemeProvider';

/**
 * The mockup uses `box-shadow: 4px 4px 0 var(--ink)` — a hard offset shadow.
 * React Native can't render that with normal shadow props, so we layer a
 * colored View behind the surface.
 *
 * Usage: <HardShadow><Card/></HardShadow>
 */
export function HardShadow({
  offset = 4,
  color,
  children,
  style,
}: {
  offset?: number;
  color?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useThemeColors();
  const resolvedColor = color ?? colors.inkSurface;
  return (
    <View style={[styles.wrap, style]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX: offset }, { translateY: offset }], backgroundColor: resolvedColor },
        ]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
});
