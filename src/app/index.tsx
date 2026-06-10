import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/shared/constants/tokens';
import { ProfileGateErrorState, useTrustedProfileGate } from '@/features/profile';

const blockedRoute = '/blocked' as never;

export default function Index() {
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
});
