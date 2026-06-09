import { useMemo } from 'react';
import { Stack } from 'expo-router';
import { type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';

export default function OnboardingLayout() {
  const colors = useThemeColors();
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      contentStyle: { backgroundColor: colors.paper },
      animation: 'fade' as const,
    }),
    [colors]
  );

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" />
      <Stack.Screen name="intro" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot" />
      <Stack.Screen name="reset" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
