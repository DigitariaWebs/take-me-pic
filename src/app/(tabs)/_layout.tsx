import { useMemo } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { JournalTabBar } from '@/shared/ui/JournalTabBar';
import { colors as tokenColors, fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { useAuth } from '@/shared/providers';
import { useProfile } from '@/features/profile';

const makeStyles = (colors: ThemeColors) => ({
  sceneStyle: { backgroundColor: colors.paper },
});

export default function TabsLayout() {
  const themeColors = useThemeColors();
  const themed = useMemo(() => makeStyles(themeColors), [themeColors]);
  const { user, isLoading, isAuthenticated } = useAuth();
  const profile = useProfile(user?.id ?? '');

  if (isLoading || (isAuthenticated && profile.isLoading)) {
    return <View style={styles.fallback} />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(onboarding)" />;
  }

  if (profile.isError) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.error}>Could not load your profile. Check your connection and try again.</Text>
      </View>
    );
  }

  if (profile.data === null) {
    return <Redirect href="/(onboarding)/profile" />;
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
  error: {
    fontFamily: fonts.serifBold,
    color: tokenColors.stampRed,
    fontSize: 16,
    textAlign: 'center',
  },
});
