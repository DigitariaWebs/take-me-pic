import React, { useMemo } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';

export type PinColor = 'ink' | 'gold' | 'red' | 'blue';

export interface PinProps {
  source?: ImageSourcePropType | { uri: string };
  color?: PinColor;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Map pin = round avatar in a polaroid border with a triangle tail. */
export function Pin({ source, color = 'ink', size = 48, style }: PinProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const PIN_COLOR: Record<PinColor, string> = {
    ink: colors.ink,
    gold: colors.goldDeep,
    red: colors.stampRed,
    blue: colors.stampBlue,
  };

  const c = PIN_COLOR[color];
  return (
    <View style={[{ width: size, height: size }, style]}>
      <View
        style={[
          styles.frame,
          { width: size, height: size, borderRadius: size / 2, borderColor: c },
        ]}
      >
        <View style={[styles.photo, { borderRadius: (size - 6) / 2 }]}>
          {source ? (
            <Image source={source as ImageSourcePropType} style={StyleSheet.absoluteFill} />
          ) : null}
        </View>
      </View>
      <View style={[styles.tail, { borderTopColor: c, marginTop: -1 }]} />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  frame: {
    backgroundColor: colors.polaroid,
    borderWidth: 2,
    padding: 3,
    shadowColor: '#3c2814',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  photo: { flex: 1, backgroundColor: colors.kraft, overflow: 'hidden' },
  tail: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
