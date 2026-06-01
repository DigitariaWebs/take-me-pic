import React, { ReactNode, useMemo } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle, Text } from 'react-native';
import { fonts, shadow, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';

export interface PolaroidProps {
  source?: ImageSourcePropType | { uri: string };
  caption?: string;
  /** Photo (square) height. Defaults to width. */
  width?: number;
  height?: number;
  rotate?: number;
  captionSize?: number;
  /** Skip the bottom caption gutter for icon-style polaroids. */
  noCaption?: boolean;
  style?: ViewStyle;
  /** Slot for overlay (e.g. tape, stamps, "+3" badge). */
  children?: ReactNode;
  /** When true the photo area renders dark instead of a remote image. */
  dark?: boolean;
}

export function Polaroid({
  source,
  caption,
  width = 120,
  height,
  rotate = 0,
  captionSize = 16,
  noCaption,
  style,
  children,
  dark,
}: PolaroidProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const photoH = height ?? width;
  const paddingBottom = noCaption ? 10 : caption ? 32 : 16;
  return (
    <View
      style={[
        styles.card,
        {
          width,
          paddingBottom,
          transform: [{ rotate: `${rotate}deg` }],
        },
        style,
      ]}
    >
      <View style={[styles.photo, { height: photoH, backgroundColor: dark ? colors.ink : colors.paper2 }]}>
        {source && !dark && (
          <Image source={source as ImageSourcePropType} style={StyleSheet.absoluteFill} resizeMode="cover" />
        )}
      </View>
      {!noCaption && caption ? (
        <Text style={[styles.caption, { fontSize: captionSize }]} numberOfLines={2}>
          {caption}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.polaroid,
    paddingTop: 8,
    paddingHorizontal: 8,
    ...shadow.polaroid,
  },
  photo: { width: '100%', overflow: 'hidden' },
  caption: {
    textAlign: 'center',
    color: colors.ink,
    fontFamily: fonts.hand,
    marginTop: 6,
    lineHeight: 18,
  },
});
