import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '@/shared/providers/ThemeProvider';

export interface JournalSwitchProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
}

/** iOS switch re-styled with ink track + gold knob (mockup `.sw`). */
export function JournalSwitch({ value, onValueChange }: JournalSwitchProps) {
  const colors = useThemeColors();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const trackBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.inkLine, colors.inkSurface],
  });
  const knobLeft = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 26] });
  const knobBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.cardWhite, colors.goldLight],
  });

  return (
    <Pressable onPress={() => onValueChange(!value)} hitSlop={6}>
      <Animated.View style={[styles.track, { backgroundColor: trackBg }]}>
        <Animated.View style={[styles.knob, { left: knobLeft, backgroundColor: knobBg }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 54,
    height: 30,
    borderRadius: 30,
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    top: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
});
