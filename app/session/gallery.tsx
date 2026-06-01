import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Share2, Download, Heart, Star } from 'lucide-react-native';
import { PaperBackground } from '@/components/PaperBackground';
import { NavBar, HomeIndicator } from '@/components/iOSChrome';
import { Polaroid } from '@/components/Polaroid';
import { Stamp } from '@/components/Stamp';
import { Button } from '@/components/Button';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { galleryPhotos, leo } from '@/data/mock';
import { t } from '@/i18n';
import { useRole } from '@/components/RoleContext';

/** 11 · Pellicule de la session. */
export default function Gallery() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isHelper } = useRole();

  // Favorite state: set of photo indexes
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  // "tout garder" confirmed state
  const [keptAll, setKeptAll] = useState(false);

  function toggleFavorite(index: number) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.back()}><Text style={styles.back}>← {t('common.back')}</Text></Pressable>}
          title={isHelper ? t('flow.galleryHelper', { name: leo.firstName }) : t('flow.gallerySeeker', { name: leo.firstName })}
          right={<Share2 size={22} color={colors.ink} />}
        />
      </View>

      <View style={{ paddingHorizontal: 22, paddingBottom: 14 }}>
        <Text style={styles.heading}>{t('gallery.title', { n: 8, name: leo.firstName })}</Text>
        <Text style={styles.subHeading}>{t('gallery.subtitle')} ☼</Text>
        <Text style={styles.mono}>{t('gallery.available', { time: '23 H 12 MIN' })}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 100 }}>
        {/* Hero photo — index 0 */}
        <Pressable onPress={() => toggleFavorite(0)} style={styles.hero}>
          <Image source={{ uri: galleryPhotos[0].uri }} style={StyleSheet.absoluteFill} />
          <View style={styles.cornersInner} pointerEvents="none" />
          {favorites.has(0) ? (
            <View style={{ position: 'absolute', top: 14, right: 14 }}>
              <Stamp shape="rect" color="gold" size={70} fontSize={9} rotate={-6}>★ PRÉFÉRÉE</Stamp>
            </View>
          ) : (
            <View style={styles.starHint}>
              <Star size={18} color={colors.polaroid} />
            </View>
          )}
          <Text style={styles.heroDate}>15·VI·26 — 09:46</Text>
        </Pressable>

        <View style={styles.grid}>
          {galleryPhotos.slice(1).map((p, i) => {
            const idx = i + 1;
            const isFav = favorites.has(idx);
            return (
              <Pressable key={i} onPress={() => toggleFavorite(idx)} style={{ position: 'relative' }}>
                <Polaroid
                  width={92}
                  height={82}
                  rotate={(i % 2 === 0 ? -2 : 1.5)}
                  source={{ uri: p.uri }}
                  noCaption
                  dark={false}
                />
                {isFav && (
                  <View style={styles.favStar}>
                    <Star size={14} color={colors.goldDeep} fill={colors.goldDeep} />
                  </View>
                )}
              </Pressable>
            );
          })}
          <View style={{ width: 92, alignItems: 'center', justifyContent: 'center' }}>
            <Polaroid width={92} height={82} dark noCaption rotate={1.5}>
              <Text style={styles.plus}>+3</Text>
            </Polaroid>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.actions, { bottom: insets.bottom + 26 }]}>
        <Button
          variant="paper"
          full
          icon={<Download size={18} color={colors.ink} />}
          style={{ flex: 1 }}
          onPress={() => setKeptAll(true)}
          disabled={keptAll}
        >
          {keptAll ? t('flow.keptAll') : t('gallery.keepAll')}
        </Button>
        <View style={{ width: 10 }} />
        <Button
          variant="gold"
          full
          icon={<Heart size={18} color={colors.ink} />}
          style={{ flex: 1 }}
          onPress={() => router.push('/session/rating')}
        >
          {t('gallery.rate', { name: leo.firstName })}
        </Button>
      </View>
      <HomeIndicator />
    </PaperBackground>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  heading: { fontFamily: fonts.hand, fontSize: 24, color: colors.ink, lineHeight: 28 },
  subHeading: { fontFamily: fonts.hand, fontSize: 22, color: colors.goldDeep },
  mono: { fontFamily: fonts.type, fontSize: 10, color: colors.inkFaded, letterSpacing: 1.4, marginTop: 6 },
  hero: {
    height: 220,
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#3c2814',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 4,
  },
  cornersInner: { position: 'absolute', inset: 8 as unknown as number, borderColor: colors.inkFaded },
  heroDate: { position: 'absolute', bottom: 8, right: 10, fontFamily: fonts.type, fontSize: 10, color: colors.polaroid, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2 },
  starHint: { position: 'absolute', top: 14, right: 14, backgroundColor: 'rgba(0,0,0,0.35)', padding: 6, borderRadius: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14, justifyContent: 'flex-start' },
  plus: { position: 'absolute', top: 24, left: 0, right: 0, textAlign: 'center', color: colors.goldLight, fontFamily: fonts.hand, fontSize: 26 },
  favStar: { position: 'absolute', top: 4, right: 4, backgroundColor: colors.cardWhite, borderRadius: 10, padding: 2 },
  actions: { position: 'absolute', left: 22, right: 22, flexDirection: 'row' },
});
