import React, { useMemo } from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';

export type ButtonVariant = 'ink' | 'gold' | 'paper' | 'ghost';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  variant = 'ink',
  size = 'md',
  full,
  icon,
  trailing,
  children,
  style,
  textStyle,
  ...rest
}: ButtonProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const h = size === 'sm' ? 38 : 52;
  const fontSize = size === 'sm' ? 13 : 15;

  const isGold = variant === 'gold';
  const isPaper = variant === 'paper';
  const isGhost = variant === 'ghost';
  const isInk = variant === 'ink';

  const textColor = isGold || isPaper || isGhost ? colors.ink : colors.paperWarm;
  const borderColor = isPaper ? colors.ink : isGhost ? colors.inkSoft : 'transparent';
  const bg = isInk ? colors.ink : isPaper ? colors.cardWhite : 'transparent';

  const content = (
    <>
      {icon}
      <Text style={[styles.label, { color: textColor, fontSize }, textStyle]} numberOfLines={1}>
        {children}
      </Text>
      {trailing}
    </>
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.root,
        { height: h, opacity: pressed ? 0.85 : 1 },
        full && styles.full,
        isPaper && { borderColor, borderWidth: 1.5 },
        isGhost && { borderColor, borderWidth: 1.5, borderStyle: 'dashed' as const },
        isInk && [styles.ink, { backgroundColor: bg }],
        isPaper && [styles.paper, { backgroundColor: bg }],
        style,
      ]}
      {...rest}
    >
      {isGold && (
        <LinearGradient
          colors={[colors.goldLight, colors.goldDeep] as unknown as readonly [string, string]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {isGold && <View style={styles.goldShine} pointerEvents="none" />}
      {content}
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  full: { width: '100%' },
  ink: {
    shadowColor: colors.ink,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  paper: {
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 2,
  },
  goldShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  label: {
    fontFamily: fonts.serifBold,
    letterSpacing: -0.2,
  },
});
