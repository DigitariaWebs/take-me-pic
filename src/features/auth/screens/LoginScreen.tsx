import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar, HomeIndicator } from '@/shared/ui/iOSChrome';
import { Squiggle } from '@/shared/ui/Squiggle';
import { Field } from '@/shared/ui/Field';
import { Stamp } from '@/shared/ui/Stamp';
import { Button } from '@/shared/ui/Button';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { useAuth } from '@/shared/providers';
import { t } from '@/shared/lib/i18n';
import { useLogin } from '../hooks/useLogin';
import { useResendSignupVerification } from '../hooks/useResendSignupVerification';
import { useAuthUiStore } from '../store/auth-ui-store';

function isEmailNotConfirmedError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.toLowerCase().includes('email not confirmed');
}

/** Connexion — e-mail + mot de passe, validation légère, → /(tabs). */
export default function Login() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const login = useLogin();
  const resendSignupVerification = useResendSignupVerification();
  const setRememberedEmail = useAuthUiStore((s) => s.setRememberedEmail);
  const { refresh } = useAuth();

  const onSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      setError(t('ob.errorEmail'));
      return;
    }
    if (password.length < 4) {
      setError(t('ob.errorPasswordShort'));
      return;
    }
    setError('');
    try {
      await login.mutateAsync({ email: cleanEmail, password });
      setRememberedEmail(cleanEmail);
      // Sync the auth context from the now-authenticated client before routing
      // to '/', so the gate resolves immediately instead of flashing a stale
      // signed-out state. RootShell then keeps a ready user out of onboarding.
      await refresh();
      router.replace('/');
    } catch (err) {
      if (isEmailNotConfirmedError(err)) {
        setRememberedEmail(cleanEmail);
        try {
          await resendSignupVerification.mutateAsync(cleanEmail);
        } catch {
          // The original confirmation email may still be valid or Supabase may be rate-limiting resend.
        }
        router.replace({ pathname: '/(onboarding)/otp', params: { email: cleanEmail } });
        return;
      }
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
          title={<Text style={styles.page}>{t('ob.loginPage')}</Text>}
          right={<View style={{ width: 60 }} />}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 150 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.hello}>{t('ob.loginHello')}</Text>
          <Text style={styles.eyebrow}>{t('ob.loginEyebrow')}</Text>

          <View style={styles.titleRow}>
            <Text style={styles.title}>{t('ob.loginTitle')}{' '}</Text>
            <Squiggle style={styles.title}>{t('ob.loginTitleHighlight')}</Squiggle>
            <Text style={styles.title}>.</Text>
          </View>

          <Text style={styles.subtitle}>{t('ob.loginSubtitle')}</Text>

          <Field
            label={t('ob.email')}
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password field with show/hide toggle */}
          <View style={styles.passwordWrap}>
            <Text style={styles.fieldLabel}>{t('ob.password')}</Text>
            <View style={styles.passwordRow}>
              <Field
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={styles.passwordField}
              />
              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                style={styles.eyeBtn}
                hitSlop={8}
              >
                {showPassword
                  ? <EyeOff size={20} color={colors.inkFaded} />
                  : <Eye size={20} color={colors.inkFaded} />
                }
              </Pressable>
            </View>
          </View>

          {/* Forgot password link */}
          <Pressable
            onPress={() => router.push('/(onboarding)/forgot')}
            style={styles.forgotWrap}
          >
            <Text style={styles.forgot}>{t('ob.forgotPassword')}</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Decorative stamp */}
      <View style={{ position: 'absolute', right: 22, top: insets.top + 200 }}>
        <Stamp size={88} fontSize={9} color="blue" rotate={10}>{t('ob.loginStamp')}</Stamp>
      </View>

      <View style={[styles.cta, { bottom: insets.bottom + 26 }]}>
        <Button full variant="ink" onPress={onSubmit} loading={login.isPending || resendSignupVerification.isPending}>
          {t('ob.loginCta')}
        </Button>
        <Text style={styles.foot}>
          {t('ob.noAccount')}{' '}
          <Text
            style={styles.footLink}
            onPress={() => router.replace('/(onboarding)/signup')}
          >
            {t('ob.createAccount')}
          </Text>
        </Text>
      </View>

      <HomeIndicator />
    </PaperBackground>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  page: { fontFamily: fonts.type, fontSize: 11, color: colors.inkFaded, letterSpacing: 1 },
  keyboard: { flex: 1 },
  body: { paddingHorizontal: 26, paddingTop: 14 },
  hello: {
    fontFamily: fonts.hand,
    fontSize: 28,
    color: colors.goldDeep,
    transform: [{ rotate: '-2deg' }],
  },
  eyebrow: {
    fontFamily: fonts.type,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.inkFaded,
    textTransform: 'uppercase' as const,
    marginTop: 4,
    marginBottom: 4,
    paddingLeft: 2,
  },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: fonts.serifItalic,
    fontStyle: 'italic',
    color: colors.inkFaded,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: fonts.hand,
    fontSize: 18,
    color: colors.ink2,
    marginBottom: 2,
    paddingLeft: 8,
  },
  passwordWrap: { marginBottom: 4 },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  passwordField: { flex: 1, marginBottom: 0 },
  eyeBtn: {
    height: 46,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1.5,
    borderColor: colors.ink,
  },
  forgotWrap: { alignItems: 'flex-end', marginTop: 8, marginBottom: 6 },
  forgot: {
    fontFamily: fonts.hand,
    fontSize: 17,
    color: colors.goldDeep,
    textDecorationLine: 'underline',
  },
  error: {
    fontFamily: fonts.hand,
    fontSize: 16,
    color: colors.stampRed,
    marginTop: 14,
  },
  cta: { position: 'absolute', left: 22, right: 22 },
  foot: {
    textAlign: 'center',
    marginTop: 14,
    fontFamily: fonts.hand,
    fontSize: 18,
    color: colors.inkFaded,
  },
  footLink: {
    color: colors.goldDeep,
    textDecorationLine: 'underline',
  },
});
