import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { fonts } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';

export type ChipColor = 'ink' | 'gold' | 'red' | 'blue' | 'green';
export type ChipVariant = 'outline' | 'filled' | 'dashed';

export interface ChipProps {
  children: React.ReactNode;
  color?: ChipColor;
  variant?: ChipVariant;
  size?: 'sm' | 'md';
  onPress?: () => void;
  leading?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Chip({
  children,
  color = 'ink',
  variant = 'outline',
  size = 'md',
  leading,
  onPress,
  style,
}: ChipProps) {
  const colors = useThemeColors();
  const colorMap: Record<ChipColor, string> = {
    ink: colors.ink,
    gold: colors.goldDeep,
    red: colors.stampRed,
    blue: colors.stampBlue,
    green: colors.stampGreen,
  };
  const c = colorMap[color];
  const filled = variant === 'filled';
  const dashed = variant === 'dashed';
  const Wrap: React.ComponentType<any> = onPress ? Pressable : View;
  const fontSize = size === 'sm' ? 14 : 16;

  // Bug fix: when color='ink' and filled, colors.ink flips to cream in dark mode
  // making it a light surface — use inkSurface (always dark) so text stays readable.
  const filledBg = filled ? (color === 'ink' ? colors.inkSurface : c) : colors.cardWhite;
  const filledText = filled ? (color === 'ink' ? colors.onInk : colors.paperWarm) : c;

  return (
    <Wrap
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: color === 'ink' && filled ? colors.inkSurface : c,
          backgroundColor: filledBg,
          borderStyle: dashed ? 'dashed' : 'solid',
        },
        size === 'sm' && { paddingVertical: 3, paddingHorizontal: 9 },
        style,
      ]}
    >
      {leading}
      <Text
        style={[
          styles.text,
          { color: filledText, fontSize },
        ]}
      >
        {children}
      </Text>
    </Wrap>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderWidth: 1.5,
    borderRadius: 4,
  },
  text: {
    fontFamily: fonts.hand,
    fontWeight: '500',
    lineHeight: 18,
  },
});
