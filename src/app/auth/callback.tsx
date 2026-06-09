import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { EmailOtpType } from '@supabase/supabase-js';
import { authApi } from '@/features/auth';
import { colors, fonts } from '@/shared/constants/tokens';

const allowedAuthTypes = new Set<EmailOtpType>([
  'signup',
  'recovery',
  'invite',
  'magiclink',
  'email',
  'email_change',
]);

function parseAuthType(value: string): EmailOtpType | null {
  if (allowedAuthTypes.has(value as EmailOtpType)) {
    return value as EmailOtpType;
  }
  return null;
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token_hash?: string;
    type?: string;
    error?: string;
    error_description?: string;
  }>();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const normalizedError = useMemo(() => {
    if (typeof params.error_description === 'string' && params.error_description.length > 0) {
      return decodeURIComponent(params.error_description);
    }
    if (typeof params.error === 'string' && params.error.length > 0) {
      return decodeURIComponent(params.error);
    }
    return '';
  }, [params.error, params.error_description]);

  useEffect(() => {
    const tokenHash = typeof params.token_hash === 'string' ? params.token_hash : '';
    const type = typeof params.type === 'string' ? parseAuthType(params.type) : null;
    if (normalizedError.length > 0) {
      setStatus('error');
      setErrorMessage(normalizedError);
      return;
    }
    if (!tokenHash || !type) {
      setStatus('error');
      setErrorMessage('Invalid authentication link');
      return;
    }
    authApi.exchangeTokenHashForSession({ tokenHash, type })
      .then(() => {
        if (type === 'recovery') {
          router.replace('/(onboarding)/reset');
          return;
        }
        router.replace('/');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');
      });
  }, [normalizedError, params.token_hash, params.type, router]);

  return (
    <View style={styles.container}>
      {status === 'loading' ? (
        <>
          <ActivityIndicator size="small" color={colors.ink} />
          <Text style={styles.text}>Finalizing authentication...</Text>
        </>
      ) : (
        <>
          <Text style={styles.errorTitle}>Authentication link error</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  text: {
    fontFamily: fonts.type,
    color: colors.ink,
    fontSize: 14,
  },
  errorTitle: {
    fontFamily: fonts.serifBold,
    color: colors.stampRed,
    fontSize: 20,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: fonts.type,
    color: colors.ink,
    fontSize: 14,
    textAlign: 'center',
  },
});
