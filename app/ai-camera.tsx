import { useMemo } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Sparkles, Image as ImageIcon, Repeat, Settings2 } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { HomeIndicator } from '@/components/iOSChrome';
import { Chip } from '@/components/Chip';
import { useThemeColors } from '@/components/ThemeContext';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { t } from '@/i18n';

/** Canned framing suggestions that cycle on "↻ autre". */
const SUGGESTION_KEYS = [
  'eco.suggestion0',
  'eco.suggestion1',
  'eco.suggestion2',
  'eco.suggestion3',
] as const;

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  topRow: { paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 },
  label: { backgroundColor: colors.polaroid, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: colors.ink, flexDirection: 'row', alignItems: 'center', gap: 8 },
  labelText: { fontFamily: fonts.type, fontSize: 11, color: colors.ink },
  square: { width: 36, height: 36, backgroundColor: colors.polaroid, borderWidth: 1.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  subjectBox: { position: 'absolute', left: 60, width: 240, height: 340, borderWidth: 2.5, borderColor: colors.goldLight, shadowColor: 'rgba(184,137,58,0.2)', shadowOpacity: 1, shadowOffset: { width: 0, height: 0 }, shadowRadius: 0, elevation: 0 },
  detected: { position: 'absolute', top: -30, left: 0, backgroundColor: colors.inkSurface, paddingHorizontal: 8, paddingVertical: 3 },
  detectedText: { color: colors.goldLight, fontFamily: fonts.type, fontSize: 10, letterSpacing: 1 },
  horizon: { position: 'absolute', alignSelf: 'center', backgroundColor: 'rgba(63,107,63,0.92)', paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1.5, borderColor: colors.ink },
  horizonText: { color: colors.polaroid, fontFamily: fonts.hand, fontSize: 16 },
  suggestion: { position: 'absolute', left: 16, right: 16, backgroundColor: colors.cardWhite, borderWidth: 1.5, borderColor: colors.ink, padding: 12, transform: [{ rotate: '-1.5deg' }] },
  suggestionLabel: { fontFamily: fonts.type, fontSize: 10, color: colors.goldDeep, letterSpacing: 1.4, fontWeight: '700' },
  suggestionBody: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink, marginTop: 4, lineHeight: 24 },
  shutter: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 30 },
  shutterBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.goldLight, borderWidth: 5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
});

/** 22 · L'œil bienveillant. */
export default function AICamera() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Suggestion cycling state
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [goodConfirmed, setGoodConfirmed] = useState(false);

  // Flash animation for shutter
  const flashOpacity = useRef(new Animated.Value(0)).current;

  function handleShutter() {
    // Flash effect
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      router.replace('/session/gallery');
    });
  }

  function handleOther() {
    setGoodConfirmed(false);
    setSuggestionIndex((i) => (i + 1) % SUGGESTION_KEYS.length);
  }

  function handleGood() {
    setGoodConfirmed(true);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image source={{ uri: 'https://picsum.photos/seed/aishot/400/900' }} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent', 'rgba(0,0,0,0.55)'] as unknown as readonly [string, string, string, string]}
        locations={[0, 0.2, 0.65, 1] as unknown as readonly [number, number, number, number]}
        style={StyleSheet.absoluteFill}
      />

      {/* Flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: flashOpacity, zIndex: 99 }]}
      />

      <View style={[styles.topRow, { paddingTop: insets.top + 12 }]}>
        <View style={styles.label}>
          <Sparkles size={14} color={colors.goldDeep} />
          <Text style={styles.labelText}>{t('aiHelper.label')}</Text>
        </View>
        <Pressable style={styles.square}>
          <Settings2 size={18} color={colors.ink} />
        </Pressable>
      </View>

      {/* Subject box */}
      <View style={[styles.subjectBox, { top: insets.top + 140 }]} pointerEvents="none">
        <View style={styles.detected}>
          <Text style={styles.detectedText}>{t('session.detected', { n: 3 })}</Text>
        </View>
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />
      </View>

      <View style={[styles.horizon, { top: '48%' }]}>
        <Text style={styles.horizonText}>{t('aiHelper.horizon')}</Text>
      </View>

      <View style={[styles.suggestion, { bottom: 200 }]}>
        <Text style={styles.suggestionLabel}>{t('aiHelper.label')}</Text>
        <Text style={styles.suggestionBody}>{t(SUGGESTION_KEYS[suggestionIndex])}</Text>
        <Svg width={30} height={30} style={{ position: 'absolute', bottom: -16, right: 30 }}>
          <Path d="M 15 0 L 15 24 M 8 18 L 15 25 L 22 18" stroke={colors.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
        </Svg>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
          <Chip
            size="sm"
            variant={goodConfirmed ? 'filled' : 'outline'}
            onPress={handleGood}
          >
            {goodConfirmed ? t('eco.noted') : t('aiHelper.good')}
          </Chip>
          <Chip size="sm" onPress={handleOther}>{t('aiHelper.other')}</Chip>
        </View>
      </View>

      <View style={[styles.shutter, { bottom: insets.bottom + 90 }]}>
        <View style={styles.square}><ImageIcon size={20} color={colors.ink} /></View>
        <Pressable
          style={styles.shutterBtn}
          onPress={handleShutter}
        >
          <Sparkles size={22} color={colors.ink} />
        </Pressable>
        <View style={styles.square}><Repeat size={20} color={colors.ink} /></View>
      </View>
      <HomeIndicator light />
    </View>
  );
}

function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const colors = useThemeColors();
  const map: Record<string, object> = {
    tl: { top: -4, left: -4, borderTopWidth: 3, borderLeftWidth: 3 },
    tr: { top: -4, right: -4, borderTopWidth: 3, borderRightWidth: 3 },
    bl: { bottom: -4, left: -4, borderBottomWidth: 3, borderLeftWidth: 3 },
    br: { bottom: -4, right: -4, borderBottomWidth: 3, borderRightWidth: 3 },
  };
  return <View style={[{ position: 'absolute', width: 16, height: 16, borderColor: colors.goldLight }, map[pos]]} />;
}
