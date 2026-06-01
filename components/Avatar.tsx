import React, { useMemo } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';

interface AvatarProps {
  source?: ImageSourcePropType | { uri: string };
  size?: number;
  online?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ source, size = 40, online, style }: AvatarProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2 }, styles.root, style]}>
      {source && (
        <Image
          source={source as ImageSourcePropType}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      )}
      {online ? (
        <View style={[styles.dot, { borderRadius: 6, right: -1, bottom: -1 }]} />
      ) : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { backgroundColor: colors.paper2, overflow: 'visible' },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: colors.stampGreen,
    borderWidth: 2,
    borderColor: colors.polaroid,
  },
});
