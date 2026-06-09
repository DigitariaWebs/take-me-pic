import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar, HomeIndicator } from '@/shared/ui/iOSChrome';
import { Squiggle } from '@/shared/ui/Squiggle';
import { Field } from '@/shared/ui/Field';
import { Button } from '@/shared/ui/Button';
import { Stamp } from '@/shared/ui/Stamp';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';
import { useResetPassword } from '../hooks/useResetPassword';

/** Forgot password — saisie de l'e-mail → lien de réinitialisation. */
export default function Forgot() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const resetPassword = useResetPassword();

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const onSend = async () => {
    if (!isValidEmail(email)) {
      setError(t('ob.forgotError'));
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    setError('');
    try {
      await resetPassword.mutateAsync(cleanEmail);
      setEmail(cleanEmail);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ob.authErrorGeneric'));
    }
  };

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={
            <Pressable onPress={() => router.back()}>
              <Text style={styles.back}>← {t('common.back')}</Text>
            </Pressable>
          }
          title={<View style={{ width: 50 }} />}
          right={<View style={{ width: 50 }} />}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 110 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!sent ? (
          <>
            {/* Form state */}
            <Text style={styles.eyebrow}>{t('ob.forgotEyebrow')}</Text>

            <View style={styles.titleRow}>
              <Text style={styles.title}>{t('ob.forgotTitle')} </Text>
              <Squiggle style={styles.title}>{t('ob.forgotTitleSquiggle')}</Squiggle>
              <Text style={styles.title}> ?</Text>
            </View>

            <Text style={styles.subtitle}>
              {t('ob.forgotSubtitle')}
            </Text>

            <Field
              label={t('ob.email')}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (error) setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </>
        ) : (
          <>
            {/* Success state */}
            <View style={styles.stampWrap}>
              <Stamp color="green" size={120} fontSize={11} rotate={-10}>
                {t('ob.forgotStamp')}
              </Stamp>
            </View>

            <View style={styles.titleRow}>
              <Text style={styles.title}>{t('ob.forgotSentTitle')} </Text>
            </View>
            <Text style={styles.emailSent}>{email.trim()}</Text>

            <Text style={styles.helper}>
              {t('ob.forgotHelper')}
            </Text>
          </>
        )}
      </ScrollView>

      {/* CTA zone */}
      <View style={[styles.cta, { bottom: insets.bottom + 26 }]}>
        {!sent ? (
          <Button full variant="ink" onPress={onSend} disabled={resetPassword.isPending}>
            {t('ob.forgotCta')}
          </Button>
        ) : (
          <>
            <Button full variant="gold" onPress={() => router.push('/(onboarding)/reset')}>
              {t('ob.forgotHaveCode')}
            </Button>
            <Pressable
              style={styles.ghostRow}
              onPress={() => router.replace('/(onboarding)/login' as never)}
            >
              <Text style={styles.ghost}>{t('ob.forgotBackLogin')}</Text>
            </Pressable>
          </>
        )}
      </View>

      <HomeIndicator />
    </PaperBackground>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  scroll: {
    paddingHorizontal: 26,
    paddingTop: 10,
  },
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  eyebrow: {
    fontFamily: fonts.hand,
    fontSize: 26,
    color: colors.goldDeep,
    transform: [{ rotate: '-2deg' }],
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    color: colors.inkFaded,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 22,
    lineHeight: 20,
  },
  error: {
    fontFamily: fonts.hand,
    fontSize: 16,
    color: colors.stampRed,
    marginTop: 4,
    marginBottom: 8,
  },
  stampWrap: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  emailSent: {
    fontFamily: fonts.serifBold,
    fontSize: 16,
    color: colors.ink,
    marginTop: 4,
    marginBottom: 14,
  },
  helper: {
    fontFamily: fonts.hand,
    fontSize: 18,
    color: colors.inkFaded,
    marginTop: 4,
  },
  cta: {
    position: 'absolute',
    left: 22,
    right: 22,
    gap: 12,
  },
  ghostRow: { alignItems: 'center', marginTop: 2 },
  ghost: {
    fontFamily: fonts.hand,
    fontSize: 18,
    color: colors.inkFaded,
    textDecorationLine: 'underline',
  },
});
