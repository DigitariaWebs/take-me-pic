import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAppFonts } from '@/shared/constants/fonts';
import { loadStoredLocale } from '@/shared/lib/i18n';
import {
  AuthProvider,
  QueryProvider,
  RoleProvider,
  ThemeProvider,
  useTheme,
  useThemeColors,
} from '@/shared/providers';
import { colors } from '@/shared/constants/tokens';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    void loadStoredLocale();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.paper }} />;
  }

  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootShell />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

function RootShell() {
  const c = useThemeColors();
  const { isDark } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: c.paper }}>
      <SafeAreaProvider>
        <RoleProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.paper } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/callback" />
          <Stack.Screen name="user/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="request/sent" options={{ presentation: 'modal' }} />
          <Stack.Screen name="request/incoming" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="chat/[id]" />
          <Stack.Screen name="session/index" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="session/gallery" />
          <Stack.Screen name="session/rating" options={{ presentation: 'modal' }} />
          <Stack.Screen name="post/[id]" />
          <Stack.Screen name="spots/index" />
          <Stack.Screen name="spots/[id]" />
          <Stack.Screen name="stars" />
          <Stack.Screen name="manual" />
          <Stack.Screen name="premium" options={{ presentation: 'modal' }} />
          <Stack.Screen name="ai-camera" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="itinerary" />
          <Stack.Screen name="booking" />
          <Stack.Screen name="family" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="notifications" />
        </Stack>
        </RoleProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
