import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronDown, Eye, EyeOff } from 'lucide-react-native';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar, HomeIndicator } from '@/shared/ui/iOSChrome';
import { Squiggle } from '@/shared/ui/Squiggle';
import { Field } from '@/shared/ui/Field';
import { Stamp } from '@/shared/ui/Stamp';
import { Button } from '@/shared/ui/Button';
import { Flag } from '@/shared/ui/Flag';
import { CountryPickerModal } from '@/shared/ui/CountryPickerModal';
import { defaultCountry, type Country } from '@/shared/data/countries';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';
import { useSignup } from '../hooks/useSignup';
import { useAuthUiStore } from '../store/auth-ui-store';

/** 03 · Tampon d'entrée — controlled form, native country picker, → OTP. */
export default function Signup() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState('Claire');
  const [email, setEmail] = useState('claire.bernard@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('6 12 34 56 78');
  const [country, setCountry] = useState<Country>(defaultCountry);
  const [accepted, setAccepted] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState('');
  const signup = useSignup();
  const setRememberedEmail = useAuthUiStore((s) => s.setRememberedEmail);

  const onSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanFirstName = firstName.trim();
    const cleanPhone = phone.replace(/\s+/g, ' ').trim();

    if (!cleanFirstName || !cleanEmail.includes('@')) {
      setError(t('ob.errorSignupFields'));
      return;
    }
    if (password.length < 4) {
      setError(t('ob.errorPasswordShort'));
      return;
    }
    if (cleanPhone && cleanPhone.replace(/\D/g, '').length < 6) {
      setError(t('ob.errorPhone'));
      return;
    }
    if (!accepted) {
      setError(t('ob.errorSignupTerms'));
      return;
    }
    setError('');
    try {
      const result = await signup.mutateAsync({ email: cleanEmail, password });
      const params = {
        email: cleanEmail,
        firstName: cleanFirstName,
        phone: cleanPhone ? `${country.dial} ${cleanPhone}` : '',
      };
      setRememberedEmail(cleanEmail);
      if (result.session) {
        router.replace({ pathname: '/(onboarding)/profile', params });
        return;
      }
      router.push({ pathname: '/(onboarding)/otp', params });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ob.authErrorGeneric'));
    }
  };

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.back()}><Text style={styles.back}>← {t('common.back')}</Text></Pressable>}
          title={<Text style={styles.page}>{t('signup.page', { n: 1 })}</Text>}
          right={<View style={{ width: 50 }} />}
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
          <Text style={styles.hello}>{t('signup.welcome')}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{t('signup.title')}</Text>
            <Squiggle style={styles.title}>{t('signup.titleHighlight')}</Squiggle>
            <Text style={styles.title}>.</Text>
          </View>
          <Text style={styles.subtitle}>{t('signup.subtitle')}</Text>

          <Field label={t('signup.firstName')} value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          <Field
            label={t('signup.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.passwordWrap}>
            <Text style={styles.fieldL}>{t('ob.password')}</Text>
            <View style={styles.passwordRow}>
              <Field
                value={password}
                onChangeText={(v) => { setPassword(v); setError(''); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={styles.passwordField}
              />
              <Pressable onPress={() => setShowPassword((s) => !s)} style={styles.eyeBtn} hitSlop={8}>
                {showPassword
                  ? <EyeOff size={20} color={colors.inkFaded} />
                  : <Eye size={20} color={colors.inkFaded} />
                }
              </Pressable>
            </View>
          </View>

          <Text style={styles.fieldL}>{t('signup.phone')}</Text>
          <View style={styles.phone}>
            <Pressable style={styles.prefix} onPress={() => setPickerOpen(true)}>
              <Flag size={18}>{country.flag}</Flag>
              <Text style={styles.flagCode}>{country.dial}</Text>
              <ChevronDown size={14} color={colors.ink} />
            </Pressable>
            <Field
              value={phone}
              onChangeText={setPhone}
              containerStyle={{ flex: 1, marginBottom: 0, marginLeft: 10 }}
              keyboardType="phone-pad"
            />
          </View>

          <Pressable style={styles.acceptRow} onPress={() => setAccepted((a) => !a)}>
            <View style={[styles.checkbox, !accepted && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.ink }]}>
              {accepted ? <Check size={14} color={colors.goldLight} /> : null}
            </View>
            <Text style={styles.acceptText}>{t('signup.accept')}</Text>
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={{ position: 'absolute', right: 22, top: insets.top + 220 }}>
        <Stamp size={88} fontSize={9} color="red" rotate={-12}>{`DEMANDE\nD'ACCÈS\n★ ★ ★\n2026`}</Stamp>
      </View>

      <View style={[styles.cta, { bottom: insets.bottom + 26 }]}>
        <Button full variant="ink" onPress={onSubmit} loading={signup.isPending}>
          {t('signup.cta')}
        </Button>
        <View style={styles.footRow}>
          <Text style={styles.foot}>{t('signup.alreadyAccount')} </Text>
          <Pressable onPress={() => router.replace('/(onboarding)/login')}>
            <Text style={styles.footLink}>{t('signup.login')}</Text>
          </Pressable>
        </View>
      </View>
      <HomeIndicator />

      <CountryPickerModal
        visible={pickerOpen}
        selected={country}
        onClose={() => setPickerOpen(false)}
        onSelect={setCountry}
      />
    </PaperBackground>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  page: { fontFamily: fonts.type, fontSize: 11, color: colors.inkFaded },
  keyboard: { flex: 1 },
  body: { paddingHorizontal: 26, paddingTop: 14 },
  hello: { fontFamily: fonts.hand, fontSize: 26, color: colors.goldDeep, transform: [{ rotate: '-2deg' }] },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  title: { fontFamily: fonts.serifBold, fontSize: 28, color: colors.ink, letterSpacing: -0.6, lineHeight: 32 },
  subtitle: { fontFamily: fonts.serifItalic, fontStyle: 'italic', color: colors.inkFaded, fontSize: 14, marginVertical: 16 },
  fieldL: { fontFamily: fonts.hand, fontSize: 18, color: colors.ink2, paddingLeft: 8 },
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
  phone: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14 },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderColor: colors.ink,
  },
  flagCode: { fontFamily: fonts.serifBold, fontSize: 16, color: colors.ink },
  acceptRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 24 },
  checkbox: { width: 22, height: 22, backgroundColor: colors.inkSurface, alignItems: 'center', justifyContent: 'center' },
  acceptText: { fontFamily: fonts.serif, fontSize: 13, color: colors.inkFaded, lineHeight: 19, flex: 1 },
  error: { fontFamily: fonts.hand, fontSize: 16, color: colors.stampRed, marginTop: 14 },
  cta: { position: 'absolute', left: 22, right: 22 },
  footRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 14 },
  foot: { fontFamily: fonts.hand, fontSize: 18, color: colors.inkFaded },
  footLink: { color: colors.goldDeep, textDecorationLine: 'underline', fontFamily: fonts.hand, fontSize: 18 },
});
