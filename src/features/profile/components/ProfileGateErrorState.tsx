import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/shared/ui/Button';
import { colors, fonts } from '@/shared/constants/tokens';
import { useLogout } from '@/features/auth';

type Props = {
  onRetry: () => void;
};

export function ProfileGateErrorState({ onRetry }: Props) {
  const router = useRouter();
  const logout = useLogout();

  const signOut = async () => {
    await logout.mutateAsync();
    router.replace('/(onboarding)');
  };

  return (
    <View style={styles.fallback}>
      <Text style={styles.title}>Could not load your trusted profile.</Text>
      <Text style={styles.body}>Check your connection and try again, or sign out and return later.</Text>
      <Button variant="ink" full onPress={onRetry}>
        Try again
      </Button>
      <Button variant="paper" full onPress={signOut} disabled={logout.isPending}>
        Sign out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
    gap: 12,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: fonts.serifBold,
    color: colors.stampRed,
    fontSize: 18,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.type,
    color: colors.inkFaded,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
});
