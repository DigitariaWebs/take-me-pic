import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';

interface FieldProps extends TextInputProps {
  label?: string;
  variant?: 'underline' | 'box';
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Form field. Mockup mixes underlined fields (.field-i) and boxed fields
 * (.field-box). The label uses Caveat handwriting.
 */
export function Field({
  label,
  variant = 'underline',
  containerStyle,
  style,
  ...rest
}: FieldProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.inkFaded}
        {...rest}
        style={[
          variant === 'underline' ? styles.underline : styles.box,
          { fontFamily: fonts.serif, fontSize: 16, color: colors.ink },
          style,
        ]}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontFamily: fonts.hand,
    fontSize: 18,
    color: colors.ink2,
    marginBottom: 2,
    paddingLeft: 8,
  },
  underline: {
    height: 46,
    paddingHorizontal: 14,
    borderBottomWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: 'transparent',
  },
  box: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 4,
  },
});
