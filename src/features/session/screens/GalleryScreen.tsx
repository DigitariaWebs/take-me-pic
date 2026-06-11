import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Share2, Heart, Star, Plus } from 'lucide-react-native';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar, HomeIndicator } from '@/shared/ui/iOSChrome';
import { Polaroid } from '@/shared/ui/Polaroid';
import { Stamp } from '@/shared/ui/Stamp';
import { Button } from '@/shared/ui/Button';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { useAuth } from '@/shared/providers';
import { useSessionPhotos } from '../hooks/useSessionPhotos';
import { t } from '@/shared/lib/i18n';

/** Pellicule de la session — real session photos for a help request. */
export default function Gallery() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { request } = useLocalSearchParams<{ request?: string }>();
  const requestId = request ? Number(request) : null;
  const { user } = useAuth();

  const { photos, loading, uploading, uploadError, pickAndUpload, retry } = useSessionPhotos(requestId, user?.id);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  function toggleFavorite(id: number) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const hero = photos[0];
  const rest = photos.slice(1);

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.back()}><Text style={styles.back}>← {t('common.back')}</Text></Pressable>}
          title="Pellicule"
          right={<Share2 size={22} color={colors.ink} />}
        />
      </View>

      <View style={{ paddingHorizontal: 22, paddingBottom: 14 }}>
        <Text style={styles.heading}>{photos.length} photo(s)</Text>
        <Text style={styles.subHeading}>{t('gallery.subtitle')} ☼</Text>
        {uploadError ? <Text style={styles.error}>{uploadError}</Text> : null}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 100 }}>
        {requestId == null ? (
          <Text style={styles.empty}>Ouvre la pellicule depuis une session.</Text>
        ) : loading ? (
          <ActivityIndicator color={colors.ink} style={{ marginTop: 40 }} />
        ) : photos.length === 0 ? (
          <Text style={styles.empty}>Aucune photo encore. Ajoute la première.</Text>
        ) : (
          <>
            {hero?.url && (
              <Pressable onPress={() => toggleFavorite(hero.id)} style={styles.hero}>
                <Image source={{ uri: hero.url }} style={StyleSheet.absoluteFill} />
                {favorites.has(hero.id) ? (
                  <View style={{ position: 'absolute', top: 14, right: 14 }}>
                    <Stamp shape="rect" color="gold" size={70} fontSize={9} rotate={-6}>★ PRÉFÉRÉE</Stamp>
                  </View>
                ) : (
                  <View style={styles.starHint}><Star size={18} color={colors.polaroid} /></View>
                )}
              </Pressable>
            )}

            <View style={styles.grid}>
              {rest.map((p, i) => (
                <Pressable key={p.id} onPress={() => toggleFavorite(p.id)} style={{ position: 'relative' }}>
                  <Polaroid width={92} height={82} rotate={i % 2 === 0 ? -2 : 1.5} source={{ uri: p.url ?? undefined }} noCaption />
                  {favorites.has(p.id) && (
                    <View style={styles.favStar}><Star size={14} color={colors.goldDeep} fill={colors.goldDeep} /></View>
                  )}
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.actions, { bottom: insets.bottom + 26 }]}>
        <Button
          variant="paper"
          full
          icon={uploading ? <ActivityIndicator color={colors.ink} /> : <Plus size={18} color={colors.ink} />}
          style={{ flex: 1 }}
          onPress={() => (uploadError ? void retry() : void pickAndUpload())}
          disabled={uploading || requestId == null}
        >
          {uploadError ? 'réessayer' : 'ajouter une photo'}
        </Button>
        <View style={{ width: 10 }} />
        <Button
          variant="gold"
          full
          icon={<Heart size={18} color={colors.ink} />}
          style={{ flex: 1 }}
          onPress={() => router.push('/session/rating')}
        >
          {t('gallery.rate', { name: '' })}
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
  error: { fontFamily: fonts.hand, fontSize: 15, color: colors.stampRed, marginTop: 6 },
  empty: { fontFamily: fonts.hand, fontSize: 18, color: colors.inkFaded, textAlign: 'center', marginTop: 50 },
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
