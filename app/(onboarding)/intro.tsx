import { useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperBackground } from '@/components/PaperBackground';
import { Polaroid } from '@/components/Polaroid';
import { Tape } from '@/components/Tape';
import { Stamp } from '@/components/Stamp';
import { Button } from '@/components/Button';
import { HomeIndicator } from '@/components/iOSChrome';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { Squiggle } from '@/components/Squiggle';
import { useLocale, type LocaleTag } from '@/i18n';
import { t } from '@/i18n';

/** 02 · Page d'introduction — swipeable 3-page carousel + FR/EN. */

type StampColor = 'red' | 'gold' | 'green' | 'blue';
type Poly = {
  uri: string;
  caption?: string;
  w: number;
  h: number;
  top: number;
  left?: number;
  right?: number;
  rotate: number;
  tape?: 'cream' | 'red';
  captionSize?: number;
};
type Collage = {
  polys: Poly[];
  stamp?: { text: string; color: StampColor; top: number; left?: number; right?: number; size?: number; rotate?: number };
  note?: { text: string; top: number; left?: number; right?: number; arrow?: boolean };
};

const pic = (s: string) => `https://picsum.photos/seed/${s}/400/400`;

const COLLAGES: Collage[] = [
  {
    polys: [
      { uri: pic('parisfriends'), caption: 'les copains à Paris ✿', w: 208, h: 184, top: 0, left: 8, rotate: -6, tape: 'cream' },
      { uri: pic('marrakesh'), caption: 'Marrakech', w: 126, h: 114, top: 44, right: 0, rotate: 8, captionSize: 14 },
      { uri: pic('lisbon'), caption: 'Lisboa', w: 134, h: 122, top: 206, left: 128, rotate: -3, captionSize: 14 },
    ],
    stamp: { text: 'Capturé\nensemble\n★ TMP ★', color: 'red', top: 248, left: 12, size: 80, rotate: -14 },
    note: { text: 'eux ! ils nous\nont pris en photo', top: 312, right: 4, arrow: true },
  },
  {
    polys: [
      { uri: pic('pontdesarts'), caption: 'Pont des Arts ☼', w: 200, h: 178, top: 6, right: 10, rotate: 5, tape: 'red' },
      { uri: pic('sunsetspot'), caption: "l'heure dorée", w: 132, h: 120, top: 52, left: 0, rotate: -7, captionSize: 14 },
      { uri: pic('rooftopview'), caption: "vue d'en haut", w: 138, h: 126, top: 214, left: 110, rotate: 3, captionSize: 14 },
    ],
    stamp: { text: '★ SPOT\nsecret ★', color: 'green', top: 250, left: 16, size: 80, rotate: 10 },
    note: { text: 'le meilleur\nangle ↗', top: 18, left: 16, arrow: false },
  },
  {
    polys: [
      { uri: 'https://i.pravatar.cc/300?img=12', caption: 'Léo ★', w: 150, h: 134, top: 4, left: 20, rotate: -5, tape: 'cream' },
      { uri: 'https://i.pravatar.cc/300?img=22', caption: 'Inès ★', w: 120, h: 108, top: 60, right: 8, rotate: 7, captionSize: 14 },
      { uri: 'https://i.pravatar.cc/300?img=33', caption: 'Sami ★', w: 124, h: 112, top: 212, left: 120, rotate: -3, captionSize: 14 },
    ],
    stamp: { text: 'TOP 3 %\n★ ★ ★\nkarma', color: 'gold', top: 232, left: 18, size: 84, rotate: -12 },
    note: { text: '+15 ★\nmerci !', top: 36, left: 14, arrow: false },
  },
];

const TAPE_LEFT = [76, 60, 50];

function CollageView({ cfg, index }: { cfg: Collage; index: number }) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.collage}>
      {cfg.polys.map((p, i) => (
        <View
          key={i}
          style={{ position: 'absolute', top: p.top, left: p.left, right: p.right, transform: [{ rotate: `${p.rotate}deg` }] }}
        >
          <Polaroid width={p.w} height={p.h} caption={p.caption} captionSize={p.captionSize} source={{ uri: p.uri }}>
            {p.tape ? (
              <Tape color={p.tape} rotate={2} style={{ position: 'absolute', top: -12, left: TAPE_LEFT[index] }} />
            ) : null}
          </Polaroid>
        </View>
      ))}
      {cfg.stamp ? (
        <View style={{ position: 'absolute', top: cfg.stamp.top, left: cfg.stamp.left, right: cfg.stamp.right, transform: [{ rotate: `${cfg.stamp.rotate ?? -10}deg` }] }}>
          <Stamp size={cfg.stamp.size ?? 80} fontSize={10} color={cfg.stamp.color}>
            {cfg.stamp.text}
          </Stamp>
        </View>
      ) : null}
      {cfg.note ? (
        <>
          {cfg.note.arrow ? (
            <Svg width={80} height={60} style={{ position: 'absolute', top: cfg.note.top - 10, right: 52 }} viewBox="0 0 80 60">
              <Path d="M 70 10 Q 40 20 20 50" stroke={colors.ink} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeDasharray="3 3" />
              <Path d="M 15 45 L 22 50 L 14 55" stroke={colors.ink} strokeWidth={1.8} fill="none" strokeLinecap="round" />
            </Svg>
          ) : null}
          <Text
            style={[
              styles.note,
              { top: cfg.note.top, left: cfg.note.left, right: cfg.note.right },
            ]}
          >
            {cfg.note.text}
          </Text>
        </>
      ) : null}
    </View>
  );
}

export default function Intro() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [locale, setLocale] = useLocale();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const pages = [0, 1, 2];
  const last = index === pages.length - 1;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const goTo = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
    setIndex(i);
  };

  const onNext = () => {
    if (last) router.push('/(onboarding)/signup');
    else goTo(index + 1);
  };

  return (
    <PaperBackground tone="paper">
      {/* Top bar */}
      <View style={[styles.top, { paddingTop: insets.top + 14 }]}>
        <Pressable onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.skip}>{t('common.skip')} →</Text>
        </Pressable>
        <View style={styles.langGroup}>
          {(['fr', 'en', 'ar', 'es'] as LocaleTag[]).map((tag) => (
            <Pressable key={tag} onPress={() => setLocale(tag)} style={[styles.lang, locale === tag && styles.langOn]}>
              <Text style={[styles.langText, locale === tag && styles.langTextOn]}>{tag.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Swipeable pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={{ flex: 1 }}
      >
        {pages.map((i) => (
          <View key={i} style={{ width }}>
            <CollageView cfg={COLLAGES[i]} index={i} />
            <View style={styles.copy}>
              <Text style={styles.chapter}>{t(`onboarding.p${i}.chapter`)}</Text>
              <Text style={styles.title}>{t(`onboarding.p${i}.title`)}</Text>
              <Squiggle style={styles.title}>{t(`onboarding.p${i}.highlight`)}</Squiggle>
              <Text style={styles.body}>{t(`onboarding.p${i}.body`)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pager dots */}
      <View style={styles.pager}>
        {pages.map((i) => (
          <Pressable key={i} onPress={() => goTo(i)}>
            <View style={[styles.pageDot, i === index && styles.pageDotActive]} />
          </Pressable>
        ))}
      </View>

      {/* Already have an account */}
      <View style={styles.loginRow}>
        <Text style={styles.loginText}>{t('ob.alreadyAccount')}{' '}</Text>
        <Pressable onPress={() => router.replace('/(onboarding)/login')}>
          <Text style={styles.loginLink}>{t('ob.loginLink')}</Text>
        </Pressable>
      </View>

      {/* CTA */}
      <View style={[styles.ctaWrap, { paddingBottom: insets.bottom + 24 }]}>
        <Button full variant={last ? 'gold' : 'ink'} onPress={onNext}>
          {last ? t('onboarding.last') : t('common.next')}
        </Button>
      </View>
      <HomeIndicator />
    </PaperBackground>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  top: {
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skip: { fontFamily: fonts.hand, fontSize: 18, color: colors.inkFaded },
  langGroup: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.cardWhite,
    padding: 3,
  },
  lang: { paddingVertical: 4, paddingHorizontal: 10 },
  langOn: { backgroundColor: colors.inkSurface },
  langText: { fontFamily: fonts.type, fontSize: 11, color: colors.ink },
  langTextOn: { color: colors.onInk },
  collage: { height: 372, position: 'relative', paddingHorizontal: 24, marginTop: 12 },
  note: {
    position: 'absolute',
    fontFamily: fonts.hand,
    fontSize: 16,
    color: colors.ink,
    maxWidth: 100,
    textAlign: 'center',
    transform: [{ rotate: '4deg' }],
    lineHeight: 18,
  },
  copy: { paddingHorizontal: 26, paddingTop: 4 },
  chapter: { fontFamily: fonts.hand, fontSize: 22, color: colors.goldDeep, marginBottom: 2 },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 30,
    color: colors.ink,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  body: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.inkFaded,
    lineHeight: 22,
    marginTop: 12,
  },
  pager: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  pageDot: { width: 8, height: 8, backgroundColor: colors.ink, opacity: 0.3 },
  pageDotActive: { width: 24, opacity: 1 },
  ctaWrap: { paddingHorizontal: 22 },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  loginText: {
    fontFamily: fonts.hand,
    fontSize: 17,
    color: colors.inkFaded,
  },
  loginLink: {
    fontFamily: fonts.hand,
    fontSize: 17,
    color: colors.goldDeep,
    textDecorationLine: 'underline',
  },
});
