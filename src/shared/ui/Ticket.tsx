import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { useThemeColors } from '@/shared/providers/ThemeProvider';

export interface TicketProps {
  children: React.ReactNode;
  /** Paper color of the ticket. */
  background?: string;
  /** Color of the perforation circles (matches the page background). */
  notchColor?: string;
  notchSize?: number;
  style?: StyleProp<ViewStyle>;
  shadow?: boolean;
}

/**
 * Ticket with side perforations — the look from .ticket in the mockup
 * (used on Premium boarding pass and the booking confirmation card).
 */
export function Ticket({
  children,
  background,
  notchColor,
  notchSize = 14,
  style,
  shadow = true,
}: TicketProps) {
  const colors = useThemeColors();
  const bg = background ?? colors.cardWhite;
  const notch = notchColor ?? colors.paper;
  return (
    <View
      style={[
        styles.root,
        { backgroundColor: bg },
        shadow && styles.shadow,
        style,
      ]}
    >
      <View
        style={[
          styles.notch,
          {
            left: -notchSize / 2,
            width: notchSize,
            height: notchSize,
            borderRadius: notchSize / 2,
            backgroundColor: notch,
          },
        ]}
        pointerEvents="none"
      />
      <View
        style={[
          styles.notch,
          {
            right: -notchSize / 2,
            width: notchSize,
            height: notchSize,
            borderRadius: notchSize / 2,
            backgroundColor: notch,
          },
        ]}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderRadius: 4, position: 'relative' },
  shadow: {
    shadowColor: '#3c2814',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  notch: { position: 'absolute', top: '50%', marginTop: -7 },
});
