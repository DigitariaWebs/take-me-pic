import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/shared/constants/tokens';
import { useAuth } from '@/shared/providers';
import { useProfile } from '@/features/profile';

export default function Index() {
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

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    paddingHorizontal: 24,
  },
  error: {
    fontFamily: fonts.serifBold,
    color: colors.stampRed,
    fontSize: 16,
    textAlign: 'center',
  },
});
