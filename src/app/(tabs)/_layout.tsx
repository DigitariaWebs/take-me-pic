import { useMemo } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { JournalTabBar } from '@/shared/ui/JournalTabBar';
import { colors as tokenColors, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { ProfileGateErrorState, useTrustedProfileGate } from '@/features/profile';

const makeStyles = (colors: ThemeColors) => ({
  sceneStyle: { backgroundColor: colors.paper },
});

const blockedRoute = '/blocked' as never;

export default function TabsLayout() {
  const themeColors = useThemeColors();
  const themed = useMemo(() => makeStyles(themeColors), [themeColors]);
  const gate = useTrustedProfileGate();

  if (gate.state === 'loading') {
    return <View style={styles.fallback} />;
  }

  if (gate.state === 'signed_out') {
    return <Redirect href="/(onboarding)" />;
  }

  if (gate.state === 'email_unverified') {
    return <Redirect href={{ pathname: '/(onboarding)/otp', params: { email: gate.email } }} />;
  }

  if (gate.state === 'profile_missing') {
    return <Redirect href="/(onboarding)/profile" />;
  }

  if (gate.state === 'blocked') {
    return <Redirect href={blockedRoute} />;
  }

  if (gate.state === 'error') {
    return <ProfileGateErrorState onRetry={gate.retry} />;
  }

  return (
    <Tabs
      tabBar={(props) => <JournalTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: themed.sceneStyle,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="carnet" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="moi" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokenColors.paper,
    paddingHorizontal: 24,
  },
});
