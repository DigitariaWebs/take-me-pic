import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';

export type TapeColor = 'cream' | 'red' | 'blue';

const TAPE_COLORS: Record<TapeColor, [string, string]> = {
  cream: ['rgba(232,217,170,0.85)', 'rgba(214,194,138,0.75)'],
  red: ['rgba(217,165,140,0.7)', 'rgba(199,132,108,0.65)'],
  blue: ['rgba(170,200,220,0.7)', 'rgba(140,180,205,0.65)'],
};

export interface TapeProps {
  color?: TapeColor;
  width?: number;
  height?: number;
  rotate?: number;
  style?: ViewStyle;
}

export function Tape({ color = 'cream', width = 60, height = 22, rotate = 0, style }: TapeProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [a, b] = TAPE_COLORS[color];
  return (
    <View
      style={[
        styles.tape,
        { width, height, transform: [{ rotate: `${rotate}deg` }] },
        style,
      ]}
    >
      <LinearGradient
        colors={[a, b] as unknown as readonly [string, string]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  tape: {
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: colors.kraft,
  },
});
