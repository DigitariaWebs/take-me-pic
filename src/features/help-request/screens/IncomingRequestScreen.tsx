import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react-native';
import { Polaroid } from '@/shared/ui/Polaroid';
import { Stamp } from '@/shared/ui/Stamp';
import { Flag } from '@/shared/ui/Flag';
import { Button } from '@/shared/ui/Button';
import { HomeIndicator } from '@/shared/ui/iOSChrome';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { me } from '@/shared/data/mock';
import { t } from '@/shared/lib/i18n';
import { useRole } from '@/shared/providers/RoleProvider';

// ─── styles factory ───────────────────────────────────────────────────────────
const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    time: { fontFamily: fonts.serifBold, fontSize: 78, color: colors.polaroid, letterSpacing: -2 },
    date: { fontFamily: fonts.hand, fontSize: 22, color: 'rgba(253,249,237,0.8)' },
    note: {
      marginHorizontal: 14,
      backgroundColor: colors.cardWhite,
      borderWidth: 1.5,
      borderColor: colors.ink,
      padding: 16,
      transform: [{ rotate: '-1.5deg' }],
      shadowColor: '#000',
      shadowOpacity: 0.45,
      shadowOffset: { width: 0, height: 20 },
      shadowRadius: 30,
      elevation: 10,
    },
    crease: { position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(42,31,26,0.06)' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    brandMark: { width: 22, height: 22, backgroundColor: colors.inkSurface, alignItems: 'center', justifyContent: 'center' },
    brandLetter: { color: colors.goldLight, fontFamily: fonts.serifBlack, fontSize: 11 },
    brandLabel: { fontFamily: fonts.type, fontSize: 11, color: colors.inkFaded, letterSpacing: 1, flex: 1 },
    countdownBadge: {
      backgroundColor: colors.stampRed,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: colors.ink,
    },
    countdownText: { fontFamily: fonts.type, fontSize: 10, color: colors.polaroid, letterSpacing: 0.5 },
    title: { fontFamily: fonts.hand, fontSize: 22, color: colors.ink, lineHeight: 26 },
    meta: { fontFamily: fonts.serif, fontSize: 13, color: colors.inkFaded, marginTop: 6 },
    actionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
    stampWrap: { position: 'absolute', top: -6, right: -12 },
    swipe: { position: 'absolute', left: 0, right: 0, textAlign: 'center', color: 'rgba(253,249,237,0.65)', fontFamily: fonts.hand, fontSize: 18 },
  });

/** 08 · Un mot sur le pas-de-porte. */
export default function Incoming() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isHelper } = useRole();

  // Countdown from 4:00 = 240 seconds
  const [secondsLeft, setSecondsLeft] = useState(240);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const countdownLabel = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image source={{ uri: 'https://picsum.photos/seed/streetparis/400/900' }} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.8)'] as unknown as readonly [string, string]}
        style={StyleSheet.absoluteFill}
      />

      <View style={{ paddingTop: insets.top + 22, paddingHorizontal: 22, alignItems: 'center' }}>
        <Text style={styles.time}>9:41</Text>
        <Text style={styles.date}>samedi 15 juin</Text>
      </View>

      <View style={[styles.note, { marginTop: 40 }]}>
        <View style={styles.crease} />
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <Text style={styles.brandLetter}>T</Text>
          </View>
          <Text style={styles.brandLabel}>{t('flow.brandInstant')}</Text>
          {/* Ticking countdown */}
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{countdownLabel}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
          <Polaroid width={64} height={60} dark source={{ uri: me.avatar }} noCaption rotate={-4} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {isHelper
                ? t('flow.incomingHelper', { name: me.firstName })
                : t('flow.incomingSeeker', { name: me.firstName })}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
              <Text style={styles.meta}>à 80 m · place des Vosges · 3 personnes · parle </Text>
              <Flag size={13}>🇫🇷</Flag>
              <Text style={styles.meta}> </Text>
              <Flag size={13}>🇬🇧</Flag>
            </View>
          </View>
        </View>
        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <Button variant="ghost" size="sm" full onPress={() => router.back()}>
              {t('incomingRequest.decline')}
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              variant="gold"
              size="sm"
              full
              icon={<Camera size={14} color={colors.ink} />}
              onPress={() => router.replace('/chat/me')}
            >
              {isHelper ? t('flow.acceptHelper') : t('flow.acceptSeeker')}
            </Button>
          </View>
        </View>
        <View style={styles.stampWrap}>
          <Stamp size={56} fontSize={7} color="red" rotate={14}>{countdownLabel + '\n★'}</Stamp>
        </View>
      </View>

      <Text style={[styles.swipe, { bottom: insets.bottom + 30 }]}>{t('incomingRequest.swipe')}</Text>
      <HomeIndicator light />
    </View>
  );
}
