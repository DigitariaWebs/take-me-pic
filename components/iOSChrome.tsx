import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';

/**
 * The mockup explicitly draws iOS status-bar text and a "home indicator" pill on
 * every screen. On a real device the real status bar is already there, so we
 * only render *spacing* equal to the safe-area inset and a thin home indicator
 * mirror that matches the design.
 */

export function StatusBarSpacer({ light, style }: { light?: boolean; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        { height: Math.max(insets.top, 8), backgroundColor: light ? 'transparent' : 'transparent' },
        style,
      ]}
    />
  );
}

export function HomeIndicator({ light }: { light?: boolean }) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="none" style={[staticStyles.bar, { bottom: Math.max(insets.bottom, 8) }]}>
      <View
        style={[
          staticStyles.pill,
          { backgroundColor: light ? colors.polaroid : colors.ink, opacity: light ? 0.9 : 0.7 },
        ]}
      />
    </View>
  );
}

interface NavBarProps {
  left?: React.ReactNode;
  title?: React.ReactNode;
  right?: React.ReactNode;
  back?: string;
  onBack?: () => void;
  light?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Navigation bar — pulls space from the safe-area inset. */
export function NavBar({ left, title, right, back, onBack, light, style }: NavBarProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.nav, style]}>
      <View style={{ minWidth: 70 }}>
        {left ??
          (back ? (
            <Text
              onPress={onBack}
              style={[styles.back, { color: light ? colors.polaroid : colors.ink }]}
            >
              ← {back}
            </Text>
          ) : null)}
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        {typeof title === 'string' ? (
          <Text style={[styles.title, { color: light ? colors.polaroid : colors.ink }]}>{title}</Text>
        ) : (
          title
        )}
      </View>
      <View style={{ minWidth: 70, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

// Layout-only styles that never reference colours — kept module-level
const staticStyles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: { width: 134, height: 5, borderRadius: 3 },
});

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  nav: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  back: {
    fontFamily: fonts.hand,
    fontSize: 20,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    letterSpacing: -0.2,
  },
});
