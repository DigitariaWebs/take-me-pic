import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { PaperBackground } from '@/components/PaperBackground';
import { NavBar, HomeIndicator } from '@/components/iOSChrome';
import { Squiggle } from '@/components/Squiggle';
import { Field } from '@/components/Field';
import { Stamp } from '@/components/Stamp';
import { Button } from '@/components/Button';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { t } from '@/i18n';

/** Connexion — e-mail + mot de passe, validation légère, → /(tabs). */
export default function Login() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = () => {
    if (mode === 'email') {
      if (!email.includes('@')) {
        setError(t('ob.errorEmail'));
        return;
      }
    } else {
      // keep only digits, require a plausible phone length
      if (phone.replace(/[^0-9]/g, '').length < 6) {
        setError(t('ob.errorPhone'));
        return;
      }
    }
    if (password.length < 4) {
      setError(t('ob.errorPasswordShort'));
      return;
    }
    setError('');
    router.replace('/(tabs)');
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

      <View style={styles.body}>
        <Text style={styles.hello}>{t('ob.loginHello')}</Text>
        <Text style={styles.eyebrow}>{t('ob.loginEyebrow')}</Text>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('ob.loginTitle')}{' '}</Text>
          <Squiggle style={styles.title}>{t('ob.loginTitleHighlight')}</Squiggle>
          <Text style={styles.title}>.</Text>
        </View>

        <Text style={styles.subtitle}>{t('ob.loginSubtitle')}</Text>

        {/* e-mail / phone identifier toggle */}
        <View style={styles.segGroup}>
          <Pressable
            style={[styles.segItem, mode === 'email' && styles.segItemActive]}
            onPress={() => { setMode('email'); setError(''); }}
          >
            <Text style={[styles.segText, mode === 'email' && styles.segTextActive]}>
              {t('ob.loginTabEmail')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segItem, mode === 'phone' && styles.segItemActive]}
            onPress={() => { setMode('phone'); setError(''); }}
          >
            <Text style={[styles.segText, mode === 'phone' && styles.segTextActive]}>
              {t('ob.loginTabPhone')}
            </Text>
          </Pressable>
        </View>

        {mode === 'email' ? (
          <Field
            label={t('ob.email')}
            value={email}
            onChangeText={(v) => { setEmail(v); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        ) : (
          <Field
            label={t('ob.phone')}
            value={phone}
            onChangeText={(v) => { setPhone(v); setError(''); }}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}

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
      </View>

      {/* Decorative stamp */}
      <View style={{ position: 'absolute', right: 22, top: insets.top + 200 }}>
        <Stamp size={88} fontSize={9} color="blue" rotate={10}>{t('ob.loginStamp')}</Stamp>
      </View>

      <View style={[styles.cta, { bottom: insets.bottom + 26 }]}>
        <Button full variant="ink" onPress={onSubmit}>
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
  segGroup: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 999,
    padding: 3,
    marginBottom: 18,
    backgroundColor: colors.cardWhite,
  },
  segItem: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
  },
  segItemActive: { backgroundColor: colors.inkSurface },
  segText: {
    fontFamily: fonts.type,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: colors.ink,
  },
  segTextActive: { color: colors.onInk },
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
    paddingHorizontal: 10,
    paddingBottom: 12,
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
