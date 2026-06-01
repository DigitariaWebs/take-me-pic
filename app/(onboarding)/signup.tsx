import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, ChevronDown } from 'lucide-react-native';
import { PaperBackground } from '@/components/PaperBackground';
import { NavBar, HomeIndicator } from '@/components/iOSChrome';
import { Squiggle } from '@/components/Squiggle';
import { Field } from '@/components/Field';
import { Stamp } from '@/components/Stamp';
import { Button } from '@/components/Button';
import { Flag } from '@/components/Flag';
import { CountryPickerModal } from '@/components/CountryPickerModal';
import { defaultCountry, type Country } from '@/data/countries';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { t } from '@/i18n';

/** 03 · Tampon d'entrée — controlled form, native country picker, → OTP. */
export default function Signup() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState('Claire');
  const [email, setEmail] = useState('claire.bernard@gmail.com');
  const [phone, setPhone] = useState('6 12 34 56 78');
  const [country, setCountry] = useState<Country>(defaultCountry);
  const [accepted, setAccepted] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = () => {
    if (!firstName.trim() || !email.includes('@') || phone.replace(/\D/g, '').length < 6) {
      setError(t('ob.errorSignupFields'));
      return;
    }
    if (!accepted) {
      setError(t('ob.errorSignupTerms'));
      return;
    }
    setError('');
    router.push({
      pathname: '/(onboarding)/otp',
      params: { phone: `${country.dial} ${phone}` },
    });
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

      <View style={styles.body}>
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
      </View>

      <View style={{ position: 'absolute', right: 22, top: insets.top + 220 }}>
        <Stamp size={88} fontSize={9} color="red" rotate={-12}>{`DEMANDE\nD'ACCÈS\n★ ★ ★\n2026`}</Stamp>
      </View>

      <View style={[styles.cta, { bottom: insets.bottom + 26 }]}>
        <Button full variant="ink" onPress={onSubmit}>
          {t('signup.cta')}
        </Button>
        <Text style={styles.foot}>
          {t('signup.alreadyAccount')}{' '}
          <Pressable onPress={() => router.replace('/(onboarding)/login')}>
            <Text style={styles.footLink}>{t('signup.login')}</Text>
          </Pressable>
        </Text>
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
  body: { paddingHorizontal: 26, paddingTop: 14 },
  hello: { fontFamily: fonts.hand, fontSize: 26, color: colors.goldDeep, transform: [{ rotate: '-2deg' }] },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  title: { fontFamily: fonts.serifBold, fontSize: 28, color: colors.ink, letterSpacing: -0.6, lineHeight: 32 },
  subtitle: { fontFamily: fonts.serifItalic, fontStyle: 'italic', color: colors.inkFaded, fontSize: 14, marginVertical: 16 },
  fieldL: { fontFamily: fonts.hand, fontSize: 18, color: colors.ink2, paddingLeft: 8 },
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
  foot: { textAlign: 'center', marginTop: 14, fontFamily: fonts.hand, fontSize: 18, color: colors.inkFaded },
  footLink: { color: colors.goldDeep, textDecorationLine: 'underline', fontFamily: fonts.hand, fontSize: 18 },
});
