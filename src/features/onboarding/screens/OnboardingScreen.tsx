import { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { LuggageTag } from '@/shared/ui/LuggageTag';
import { Logo } from '@/shared/ui/Logo';
import { HomeIndicator } from '@/shared/ui/iOSChrome';
import { t } from '@/shared/lib/i18n';

/** 01 · Embarquement — splash with the giant luggage tag.
 *  Auto-advances to onboarding after a short beat; a tap skips ahead. */
export default function Splash() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const goneRef = useRef(false);
  const hint = useRef(new Animated.Value(0)).current;

  const go = () => {
    if (goneRef.current) return;
    goneRef.current = true;
    router.replace('/(onboarding)/intro');
  };

  useEffect(() => {
    // auto-advance after ~3s
    const timer = setTimeout(go, 3000);
    // gently pulse the "tap to continue" hint
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hint, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(hint, { toValue: 0.35, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable style={styles.root} onPress={go}>
      <LinearGradient
        colors={[colors.bg1, colors.bg2] as unknown as readonly [string, string]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.center}>
        {/* zIndex keeps the badge above the luggage-tag string so the line passes behind it */}
        <View style={{ zIndex: 5 }}>
          <Logo size={76} badge />
        </View>
        <LuggageTag title={'Take\nMe Pic'} tagline={t('brand.tagline')} property="PROPERTY OF" rotate={-4} />
        <Text style={styles.script}>{t('brand.sloganLight')}</Text>
      </View>
      <Animated.Text style={[styles.hint, { opacity: hint }]}>{t('ob.splashHint')}</Animated.Text>
      <Text style={styles.footer}>{t('brand.est')}</Text>
      <HomeIndicator light />
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  center: { alignItems: 'center', gap: 28 },
  script: { fontFamily: fonts.hand, color: colors.inkFaded, fontSize: 22, transform: [{ rotate: '-2deg' }] },
  hint: {
    position: 'absolute',
    bottom: 84,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: colors.goldLight,
    fontFamily: fonts.hand,
    fontSize: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: colors.inkFaded,
    fontFamily: fonts.type,
    fontSize: 10,
    letterSpacing: 2,
  },
});
