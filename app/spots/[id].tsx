import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navigation, Bookmark, Camera, Heart, Share2 } from 'lucide-react-native';
import { PaperBackground } from '@/components/PaperBackground';
import { Polaroid } from '@/components/Polaroid';
import { Stamp } from '@/components/Stamp';
import { Button } from '@/components/Button';
import { spots } from '@/data/mock';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { t } from '@/i18n';

// Angle labels are resolved via t() at render time
const ANGLE_KEYS = ['angleFullFrame', 'angleBacklight', 'angleSide'] as const;

/** 18 · Page du spot. */
export default function SpotDetail() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const spot = spots.find((s) => s.id === id) ?? spots[0];

  const [hearted, setHearted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [selectedAngle, setSelectedAngle] = useState<number | null>(null);

  return (
    <PaperBackground tone="paper">
      <View style={{ height: 320 }}>
        <Image source={{ uri: spot.hero }} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'transparent', 'transparent', 'rgba(0,0,0,0.55)'] as unknown as readonly [string, string, string, string]}
          locations={[0, 0.25, 0.6, 1] as unknown as readonly [number, number, number, number]}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Pressable onPress={() => router.back()}><Text style={styles.back}>{t('discover.back')}</Text></Pressable>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <Pressable onPress={() => setHearted((v) => !v)} hitSlop={8}>
              <Heart
                size={22}
                color={colors.goldLight}
                fill={hearted ? colors.goldLight : 'transparent'}
              />
            </Pressable>
            <Share2 size={22} color={colors.polaroid} />
          </View>
        </View>
        <View style={{ position: 'absolute', bottom: 18, left: 20, right: 20 }}>
          <View style={styles.bestBadge}>
            <Text style={styles.bestBadgeText}>{t('spotDetail.bestAt')}</Text>
          </View>
          <Text style={styles.title}>{spot.name}</Text>
          <Text style={styles.meta}>★ {spot.rating} · {t('discover.reviews', { n: spot.reviews })} · {spot.city}</Text>
        </View>
        <View style={{ position: 'absolute', top: 120, right: 14 }}>
          <Stamp shape="rect" color="white" size={84} fontSize={8} rotate={8}>{`VISITÉ\n★ ★ ★\n${spot.reviews} FOIS`}</Stamp>
        </View>
      </View>

      <View style={{ paddingHorizontal: 22, paddingTop: 18, flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Button full variant="ink" icon={<Navigation size={18} color={colors.paperWarm} />} onPress={() => router.push('/itinerary')}>
            {t('spotDetail.directions')}
          </Button>
        </View>
        <Pressable
          onPress={() => setBookmarked((v) => !v)}
          style={[styles.iconBtn, bookmarked && { backgroundColor: colors.goldLight }]}
        >
          <Bookmark size={18} color={bookmarked ? colors.cardWhite : colors.ink} fill={bookmarked ? colors.goldLight : 'transparent'} />
        </Pressable>
        <View>
          <Button variant="paper" icon={<Camera size={18} color={colors.ink} />}>{' '}</Button>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <View style={{ paddingHorizontal: 22, paddingTop: 18 }}>
          <Text style={styles.section}>{t('spotDetail.angles')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginTop: 10 }}>
            {spot.thumbs.map((src, i) => {
              const chosen = selectedAngle === i;
              return (
                <Pressable key={i} onPress={() => setSelectedAngle(chosen ? null : i)}>
                  <View style={chosen ? styles.angleSelected : undefined}>
                    <Polaroid
                      width={108}
                      height={80}
                      rotate={i === 1 ? 2 : i === 2 ? -2 : -3}
                      caption={`${i + 1} · ${t(`discover.${ANGLE_KEYS[i]}`)}`}
                      captionSize={12}
                      source={{ uri: src }}
                    />
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
          {selectedAngle !== null && (
            <Text style={styles.angleHint}>{t('discover.angleChosen', { label: t(`discover.${ANGLE_KEYS[selectedAngle]}`) })}</Text>
          )}
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 18, gap: 10 }}>
          <Text style={styles.section}>{t('spotDetail.tips')}</Text>
          {spot.tips.map((tip, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
              <Polaroid width={38} height={32} noCaption rotate={i % 2 ? 2 : -3} source={{ uri: tip.user.avatar }} />
              <View style={[styles.tipCard, { transform: [{ rotate: `${i % 2 ? 0.6 : -0.5}deg` }] }]}>
                <Text style={styles.tipUser}>{tip.user.firstName} · {tip.relative}</Text>
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </PaperBackground>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 22, color: colors.polaroid },
  bestBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    transform: [{ rotate: '-3deg' }],
  },
  bestBadgeText: { color: colors.goldLight, fontFamily: fonts.type, fontSize: 9, fontWeight: '700' },
  title: { fontFamily: fonts.serifBold, color: colors.polaroid, fontSize: 30, letterSpacing: -0.6, marginTop: 8 },
  meta: { fontFamily: fonts.hand, color: 'rgba(253,249,237,0.85)', fontSize: 18, marginTop: 2 },
  section: { fontFamily: fonts.hand, fontSize: 22, color: colors.ink },
  tipCard: { flex: 1, backgroundColor: colors.cardWhite, borderWidth: 1.5, borderColor: colors.inkLine, padding: 8 },
  tipUser: { fontFamily: fonts.serifBold, fontSize: 12, color: colors.ink },
  tipText: { fontFamily: fonts.hand, fontSize: 18, color: colors.ink, lineHeight: 22, marginTop: 2 },
  angleSelected: {
    borderWidth: 2.5,
    borderColor: colors.goldDeep,
    shadowColor: colors.goldDeep,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  angleHint: {
    fontFamily: fonts.hand,
    fontSize: 16,
    color: colors.goldDeep,
    marginTop: 6,
    transform: [{ rotate: '-1deg' }],
  },
  iconBtn: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardWhite,
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 3,
  },
});
