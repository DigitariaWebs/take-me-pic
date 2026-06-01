import { useMemo } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';

/**
 * A horizontal dashed line.
 *
 * iOS can't render a single-side dashed border (`borderBottomWidth` +
 * `borderStyle: 'dashed'`) and logs "Unsupported dashed / dotted border style".
 * This draws the dashes with SVG instead, so it stays crisp and warning-free —
 * use it anywhere we want the carnet perforated-divider look.
 */
export function DashedLine({
  color,
  thickness = 1.5,
  dash = 4,
  gap = 4,
  style,
}: {
  color?: string;
  thickness?: number;
  dash?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useThemeColors();
  const resolvedColor = color ?? colors.inkLine;

  return (
    <View style={[{ height: thickness, width: '100%' }, style]}>
      <Svg width="100%" height={thickness}>
        <Line
          x1="0"
          y1={thickness / 2}
          x2="100%"
          y2={thickness / 2}
          stroke={resolvedColor}
          strokeWidth={thickness}
          strokeDasharray={`${dash} ${gap}`}
        />
      </Svg>
    </View>
  );
}
