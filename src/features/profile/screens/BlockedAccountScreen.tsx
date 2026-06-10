import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { Button } from '@/shared/ui/Button';
import { HomeIndicator } from '@/shared/ui/iOSChrome';
import { Stamp } from '@/shared/ui/Stamp';
import { colors, fonts } from '@/shared/constants/tokens';
import { useLogout } from '@/features/auth';

export default function BlockedAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logout = useLogout();

  const signOut = async () => {
    await logout.mutateAsync();
    router.replace('/(onboarding)');
  };

  return (
    <PaperBackground tone="paper">
      <View style={[styles.container, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 42 }]}>
        <Stamp size={132} fontSize={13} color="red" rotate={-8}>{`COMPTE\nBLOQUÉ\n★ ★ ★\n2026`}</Stamp>
        <View style={styles.copy}>
          <Text style={styles.title}>Account blocked</Text>
          <Text style={styles.body}>
            This profile cannot use Take Me Pic right now. If this looks wrong, contact support with the email on your account.
          </Text>
        </View>
        <Button full variant="ink" onPress={signOut} disabled={logout.isPending}>
          Sign out
        </Button>
      </View>
      <HomeIndicator />
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 26,
  },
  copy: {
    gap: 10,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.type,
    fontSize: 14,
    lineHeight: 20,
    color: colors.inkFaded,
    textAlign: 'center',
  },
});
