import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';

export function Compass({ size = 48, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: colors.inkFaded,
          backgroundColor: colors.paperWarm,
          opacity: 0.85,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text style={styles.n}>N</Text>
      {/* needle */}
      <View style={[styles.needle, { backgroundColor: colors.stampRed, top: size * 0.18, height: size * 0.32 }]} />
      <View style={[styles.needle, { backgroundColor: colors.ink, top: size * 0.5, height: size * 0.32 }]} />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  n: {
    position: 'absolute',
    top: 2,
    fontFamily: fonts.type,
    fontSize: 11,
    color: colors.inkFaded,
  },
  needle: {
    position: 'absolute',
    width: 2,
    left: '50%',
    marginLeft: -1,
    borderRadius: 1,
  },
});
