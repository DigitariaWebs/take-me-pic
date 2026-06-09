import React, { ReactNode } from 'react';
import { StyleSheet, Text, TextStyle, View, StyleProp } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeColors } from '@/shared/providers/ThemeProvider';

/**
 * Word(s) underlined with a gold squiggly. Mockup uses this for
 * emphasis on hero titles ("selfie raté", "papiers", "l'Alfama"…).
 */
export interface SquiggleProps {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  squiggleColor?: string;
}

export function Squiggle({ children, style, squiggleColor }: SquiggleProps) {
  const colors = useThemeColors();
  const resolvedColor = squiggleColor ?? colors.gold;
  return (
    <View style={styles.wrap}>
      <Text style={style}>{children}</Text>
      <Svg
        width="100%"
        height={6}
        viewBox="0 0 100 6"
        preserveAspectRatio="none"
        style={styles.svg}
      >
        <Path
          d="M 0 3 Q 12.5 0 25 3 T 50 3 T 75 3 T 100 3"
          fill="none"
          stroke={resolvedColor}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'flex-start' },
  svg: { marginTop: -2 },
});
