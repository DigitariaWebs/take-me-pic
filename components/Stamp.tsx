import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { fonts } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';

export type StampColor = 'red' | 'blue' | 'green' | 'gold' | 'ink' | 'white';
export type StampShape = 'circle' | 'rect' | 'octagon';

export interface StampProps {
  children: React.ReactNode;
  color?: StampColor;
  shape?: StampShape;
  size?: number;
  rotate?: number;
  fontSize?: number;
  filled?: boolean;
  style?: ViewStyle;
}

/**
 * Passport-style stamp. The mockup uses these everywhere — over polaroids,
 * onto cards, in corners. Supports circle / rect / octagon shapes.
 */
export function Stamp({
  children,
  color = 'red',
  shape = 'circle',
  size = 72,
  rotate = -8,
  fontSize = 10,
  filled = false,
  style,
}: StampProps) {
  const colors = useThemeColors();
  const colorMap: Record<StampColor, string> = {
    red: colors.stampRed,
    blue: colors.stampBlue,
    green: colors.stampGreen,
    gold: colors.goldDeep,
    ink: colors.ink,
    white: colors.polaroid,
  };
  const c = colorMap[color];
  const radius = shape === 'circle' ? size / 2 : shape === 'rect' ? 4 : 0;
  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderColor: c,
          backgroundColor: filled ? c : 'transparent',
          transform: [{ rotate: `${rotate}deg` }],
        },
        shape === 'octagon' && octagonShape,
        style,
      ]}
    >
      <Text
        numberOfLines={5}
        style={[
          styles.text,
          {
            color: filled ? colors.onInk : c,
            fontSize,
            lineHeight: fontSize * 1.15,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const octagonShape = {
  // Approximate the octagon clip-path the CSS used. RN doesn't support clip-path,
  // so we round corners aggressively which reads similarly at thumbnail scale.
  borderRadius: 14,
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.85,
    padding: 4,
  },
  text: {
    fontFamily: fonts.type,
    textAlign: 'center',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
});
