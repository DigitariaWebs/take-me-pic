import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Svg, {
  Defs,
  RadialGradient as SvgRadialGradient,
  Stop,
  Rect,
  Path,
  G,
  Text as SvgText,
  Circle,
} from 'react-native-svg';
import { type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';

/**
 * Hand-drawn "carte au trésor" cartography. The mockup uses an inline SVG to
 * draw faint coastlines, dashed paths and a tiny "N" with a compass tick.
 * We reproduce the same SVG here so map screens never reveal a stock blue
 * Google map.
 *
 * Place absolutely positioned children (pins, polaroids, route SVGs) on top.
 */
export function HandMap({ style }: { style?: StyleProp<ViewStyle> }) {
  const colors = useThemeColors();

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.paperWarm }, style]}>
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <SvgRadialGradient id="green1" cx="22%" cy="28%" rx="48%" ry="32%" fx="22%" fy="28%">
            <Stop offset="0" stopColor="#7aa08c" stopOpacity={0.25} />
            <Stop offset="1" stopColor="#7aa08c" stopOpacity={0} />
          </SvgRadialGradient>
          <SvgRadialGradient id="green2" cx="70%" cy="70%" rx="40%" ry="28%" fx="70%" fy="70%">
            <Stop offset="0" stopColor="#7aa08c" stopOpacity={0.18} />
            <Stop offset="1" stopColor="#7aa08c" stopOpacity={0} />
          </SvgRadialGradient>
          <SvgRadialGradient id="water1" cx="0%" cy="65%" rx="56%" ry="40%" fx="0%" fy="65%">
            <Stop offset="0" stopColor="#aac8dc" stopOpacity={0.5} />
            <Stop offset="1" stopColor="#aac8dc" stopOpacity={0} />
          </SvgRadialGradient>
          <SvgRadialGradient id="water2" cx="110%" cy="30%" rx="68%" ry="48%" fx="110%" fy="30%">
            <Stop offset="0" stopColor="#aac8dc" stopOpacity={0.45} />
            <Stop offset="1" stopColor="#aac8dc" stopOpacity={0} />
          </SvgRadialGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#green1)" />
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#green2)" />
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#water1)" />
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#water2)" />
        <G stroke={colors.kraftShadow} strokeWidth={1.2} fill="none" opacity={0.55} strokeLinecap="round">
          <Path d="M 20 220 Q 80 200 130 230 T 240 250 T 380 230" />
          <Path d="M 30 380 Q 100 360 180 400 T 320 420 T 400 410" />
          <Path d="M 0 600 Q 60 580 120 600 T 280 620 T 400 600" />
          <Path d="M 200 0 L 195 200 Q 200 280 210 360 L 215 600 L 205 800" />
          <Path d="M 80 100 Q 100 140 130 160" strokeDasharray="3 4" />
          <Path d="M 280 480 Q 320 520 360 540" strokeDasharray="3 4" />
          <Circle cx={340} cy={120} r={32} strokeDasharray="2 3" opacity={0.5} />
          <Circle cx={60} cy={560} r={24} strokeDasharray="2 3" opacity={0.5} />
        </G>
        <G fill={colors.kraftShadow} opacity={0.5} fontFamily="serif" fontStyle="italic" fontSize={11}>
          <SvgText x={325} y={126} transform="rotate(-8 340 120)">place</SvgText>
          <SvgText x={270} y={250}>quartier</SvgText>
        </G>
        <G fill={colors.gold} opacity={0.4}>
          <SvgText x={34} y={42} fontFamily="serif" fontSize={14} transform="rotate(-6 40 38)">N</SvgText>
          <Path d="M 38 50 L 38 64 M 34 60 L 42 60 M 38 70 L 38 84" stroke={colors.gold} strokeWidth={1.2} fill="none" />
        </G>
      </Svg>
    </View>
  );
}
