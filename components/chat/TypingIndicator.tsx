import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { radii, spacing, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';

/** Stagger offset (ms) between each dot's bounce animation. */
const STAGGER_MS = 160;
/** Full bounce duration for each dot (ms). */
const BOUNCE_DURATION = 500;
/** How many pixels each dot travels upward. */
const BOUNCE_HEIGHT = 6;

function useBounce(delay: number): Animated.Value {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(y, {
          toValue: -BOUNCE_HEIGHT,
          duration: BOUNCE_DURATION / 2,
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: 0,
          duration: BOUNCE_DURATION / 2,
          useNativeDriver: true,
        }),
        // Pause so the total cycle period feels relaxed even with stagger.
        Animated.delay(STAGGER_MS * 2),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [y, delay]);

  return y;
}

export function TypingIndicator() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const y0 = useBounce(0);
  const y1 = useBounce(STAGGER_MS);
  const y2 = useBounce(STAGGER_MS * 2);

  const dots: Animated.Value[] = [y0, y1, y2];

  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        {dots.map((translateY, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { transform: [{ translateY }] }]}
          />
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  row: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardWhite,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    // Soft ink drop shadow for the paper-bubble feel.
    shadowColor: colors.ink,
    shadowOpacity: 0.14,
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 0,
    elevation: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.inkFaded,
  },
});
