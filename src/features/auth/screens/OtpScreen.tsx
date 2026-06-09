import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar, HomeIndicator } from '@/shared/ui/iOSChrome';
import { Squiggle } from '@/shared/ui/Squiggle';
import { Button } from '@/shared/ui/Button';
import { Stamp } from '@/shared/ui/Stamp';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';

const LEN = 6;
const CORRECT = '258741'; // demo code that "validates"

/** 03b · Tampon d'entrée — vérification OTP (PAGE 2/3). */
export default function Otp() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone?: string }>();

  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(''));
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState('');
  const [resentMsg, setResentMsg] = useState('');
  const [verified, setVerified] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);
  const stamp = useRef(new Animated.Value(0)).current; // 0 → 1 passport-stamp slam

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  // focus the first box on mount
  useEffect(() => {
    const id = setTimeout(() => inputs.current[0]?.focus(), 350);
    return () => clearTimeout(id);
  }, []);

  const code = digits.join('');
  const complete = code.length === LEN;

  // auto-verify the moment all 6 digits are in
  useEffect(() => {
    if (complete && !verified) verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const stampDown = () => {
    setVerified(true);
    setError('');
    inputs.current.forEach((el) => el?.blur());
    Animated.sequence([
      Animated.spring(stamp, { toValue: 1, friction: 4.5, tension: 140, useNativeDriver: true }),
      Animated.delay(550),
    ]).start(() => router.push('/(onboarding)/profile'));
  };

  const setDigit = (i: number, val: string) => {
    if (verified) return;
    const clean = val.replace(/\D/g, '');
    setError('');
    if (clean.length > 1) {
      const next = clean.slice(0, LEN).split('');
      const filled = Array(LEN).fill('').map((_, k) => next[k] ?? '');
      setDigits(filled);
      inputs.current[Math.min(next.length, LEN - 1)]?.focus();
      return;
    }
    setDigits((d) => {
      const copy = [...d];
      copy[i] = clean;
      return copy;
    });
    if (clean && i < LEN - 1) inputs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
      setDigits((d) => {
        const copy = [...d];
        copy[i - 1] = '';
        return copy;
      });
    }
  };

  const verify = () => {
    if (!complete) {
      setError(t('otp.invalid'));
      return;
    }
    if (code !== CORRECT) {
      setError(t('ob.otpErrorCode'));
      setDigits(Array(LEN).fill(''));
      setTimeout(() => inputs.current[0]?.focus(), 60);
      return;
    }
    stampDown();
  };

  const resend = () => {
    setSeconds(30);
    setDigits(Array(LEN).fill(''));
    setResentMsg(t('otp.resent'));
    inputs.current[0]?.focus();
    setTimeout(() => setResentMsg(''), 2200);
  };

  // passport-stamp transform
  const stampScale = stamp.interpolate({ inputRange: [0, 1], outputRange: [2.1, 1] });
  const stampRotate = stamp.interpolate({ inputRange: [0, 1], outputRange: ['-32deg', '-12deg'] });
  const stampOpacity = stamp.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.95, 0.92] });

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.back()}><Text style={styles.back}>← {t('common.back')}</Text></Pressable>}
          title={<Text style={styles.page}>{t('signup.page', { n: 2 })}</Text>}
          right={<View style={{ width: 50 }} />}
        />
      </View>

      <View style={styles.body}>
        <Text style={styles.hello}>{t('otp.almost')}</Text>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('otp.title')} </Text>
          <Squiggle style={styles.title}>{t('otp.titleHighlight')}</Squiggle>
          <Text style={styles.title}>.</Text>
        </View>
        <Text style={styles.subtitle}>{t('otp.sub', { phone: phone ?? '+33 6 12 34 56 78' })}</Text>

        {/* Code boxes */}
        <View style={styles.codeRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={d}
              onChangeText={(v) => setDigit(i, v)}
              onKeyPress={(e) => onKey(i, e)}
              keyboardType="number-pad"
              maxLength={LEN}
              editable={!verified}
              style={[styles.codeBox, d ? styles.codeBoxFilled : null, verified && styles.codeBoxDone]}
              textAlign="center"
              returnKeyType="done"
            />
          ))}
        </View>

        <Text style={styles.demoHint}>{t('ob.demoHint')}</Text>

        {/* Resend / status */}
        <View style={styles.resendRow}>
          {resentMsg ? (
            <Text style={styles.resent}>{resentMsg}</Text>
          ) : seconds > 0 ? (
            <Text style={styles.resendMuted}>
              {t('otp.notReceived')} {t('otp.resendIn', { s: seconds })}
            </Text>
          ) : (
            <Pressable onPress={resend}>
              <Text style={styles.resendLink}>{t('otp.resend')}</Text>
            </Pressable>
          )}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!verified && (
          <Pressable onPress={() => router.back()} style={{ marginTop: 18 }}>
            <Text style={styles.edit}>
              {t('otp.edit')} <Text style={styles.editLink}>{t('otp.editLink')}</Text>
            </Text>
          </Pressable>
        )}
      </View>

      {/* Passport-stamp slam on success */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.stampOverlay,
          { top: insets.top + 130, opacity: stampOpacity, transform: [{ scale: stampScale }, { rotate: stampRotate }] },
        ]}
      >
        <Stamp color="green" size={168} fontSize={15} rotate={0}>{`VÉRIFIÉ\n★ ★ ★\nACCÈS\n2026`}</Stamp>
      </Animated.View>

      <View style={[styles.cta, { bottom: insets.bottom + 26 }]}>
        <Button full variant={complete ? 'gold' : 'ink'} onPress={verify} disabled={verified}>
          {t('otp.cta')}
        </Button>
      </View>
      <HomeIndicator />
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
  subtitle: { fontFamily: fonts.serifItalic, fontStyle: 'italic', color: colors.inkFaded, fontSize: 14, marginVertical: 18 },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  codeBox: {
    width: 48,
    height: 60,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 4,
    backgroundColor: colors.cardWhite,
    fontFamily: fonts.serifBold,
    fontSize: 26,
    color: colors.ink,
  },
  codeBoxFilled: { backgroundColor: colors.paperWarm, shadowColor: colors.ink, shadowOpacity: 1, shadowOffset: { width: 3, height: 3 }, shadowRadius: 0, elevation: 3 },
  codeBoxDone: { borderColor: colors.stampGreen },
  demoHint: { fontFamily: fonts.type, fontSize: 10, letterSpacing: 1, color: colors.inkFaded, marginTop: 12, opacity: 0.7 },
  resendRow: { marginTop: 16, alignItems: 'flex-start' },
  resendMuted: { fontFamily: fonts.hand, fontSize: 17, color: colors.inkFaded },
  resendLink: { fontFamily: fonts.hand, fontSize: 18, color: colors.goldDeep, textDecorationLine: 'underline' },
  resent: { fontFamily: fonts.hand, fontSize: 17, color: colors.stampGreen },
  error: { fontFamily: fonts.hand, fontSize: 16, color: colors.stampRed, marginTop: 14 },
  edit: { fontFamily: fonts.hand, fontSize: 17, color: colors.inkFaded },
  editLink: { color: colors.goldDeep, textDecorationLine: 'underline' },
  stampOverlay: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 20 },
  cta: { position: 'absolute', left: 22, right: 22 },
});
