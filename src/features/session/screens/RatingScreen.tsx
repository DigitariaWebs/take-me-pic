import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar, HomeIndicator } from '@/shared/ui/iOSChrome';
import { Polaroid } from '@/shared/ui/Polaroid';
import { Tape } from '@/shared/ui/Tape';
import { Chip } from '@/shared/ui/Chip';
import { Button } from '@/shared/ui/Button';
import { Squiggle } from '@/shared/ui/Squiggle';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { ratingApi } from '../api/rating-api';
import { t } from '@/shared/lib/i18n';

const PLACEHOLDER_AVATAR = 'https://i.pravatar.cc/300?img=12';

/** 12 · Tampon de remerciement. */
export default function Rating() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { request } = useLocalSearchParams<{ request?: string }>();
  const requestId = request ? Number(request) : null;

  // Star rating: 0 = none selected
  const [rating, setRating] = useState(0);

  // Keyword chip multi-select
  const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set());

  // Controlled comment input
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (requestId == null || rating === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await ratingApi.submit({ requestId, stars: rating, comment: comment.trim() || null });
      router.replace('/(tabs)/moi');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'rating error');
      setSubmitting(false);
    }
  }

  function toggleTag(index: number) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  const tags = t('rating.tags') as unknown as string[];

  const starRotations = [-6, 3, -2, 4, -3];

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.replace('/(tabs)/moi')}><X size={20} color={colors.ink} /></Pressable>}
          title={t('flow.ratingNavTitle')}
          right={<View style={{ width: 30 }} />}
        />
      </View>

      <View style={{ paddingHorizontal: 24, alignItems: 'center' }}>
        <View style={{ transform: [{ rotate: '-4deg' }] }}>
          <Polaroid width={160} height={160} caption="merci ★" source={{ uri: PLACEHOLDER_AVATAR }}>
            <Tape rotate={2} style={{ position: 'absolute', top: -10, left: 50 }} />
          </Polaroid>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
          <Text style={styles.title}>{t('flow.rateSeeker')}</Text>
        </View>
        <Text style={styles.sub}>{t('rating.sub')}</Text>

        {/* Tappable star rating */}
        <View style={styles.stars}>
          {[0, 1, 2, 3, 4].map((i) => {
            const filled = i < rating;
            return (
              <Pressable
                key={i}
                onPress={() => setRating(i + 1)}
                style={{ transform: [{ rotate: `${starRotations[i]}deg` }] }}
              >
                <Svg width={48} height={48} viewBox="0 0 100 100">
                  <Polygon
                    points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35"
                    fill={filled ? colors.goldDeep : 'rgba(42,31,26,0.12)'}
                    stroke={colors.goldDeep}
                    strokeWidth={4}
                  />
                </Svg>
              </Pressable>
            );
          })}
        </View>

        {/* Keyword chips — multi-select toggle */}
        <View style={[styles.chipRow, { marginVertical: 18 }]}>
          {tags.map((tag, i) => {
            const isSelected = selectedTags.has(i);
            return (
              <Chip
                key={tag}
                color={isSelected ? 'gold' : (i < 3 ? 'gold' : 'ink')}
                variant={isSelected ? 'filled' : 'outline'}
                onPress={() => toggleTag(i)}
              >
                {tag}
              </Chip>
            );
          })}
        </View>

        {/* Controlled comment input */}
        <TextInput
          style={styles.commentBox}
          value={comment}
          onChangeText={setComment}
          placeholder="Écris un mot (optionnel)"
          placeholderTextColor={colors.inkFaded}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.karmaPanel}>
        <View style={styles.karmaDot}>
          <Text style={styles.karmaDotText}>+15{'\n'}★</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.karmaUp}>{t('rating.youEarn')}</Text>
          <Text style={styles.karmaTitle}>{t('rating.karmaPlus', { n: 15 })}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.karmaUp}>{t('rating.balance')}</Text>
          <Text style={styles.karmaBalance}>348</Text>
        </View>
      </View>

      <View style={[styles.cta, { bottom: insets.bottom + 26 }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          full
          variant="gold"
          onPress={() => void submit()}
          loading={submitting}
          disabled={rating === 0 || requestId == null}
        >
          {t('rating.cta')}
        </Button>
      </View>
      <HomeIndicator />
    </PaperBackground>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  title: { fontFamily: fonts.serifBold, fontSize: 22, color: colors.ink, letterSpacing: -0.4, lineHeight: 24 },
  sub: { fontFamily: fonts.hand, fontSize: 20, color: colors.inkFaded, marginTop: 4 },
  error: { fontFamily: fonts.hand, fontSize: 15, color: colors.stampRed, textAlign: 'center', marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 8, marginTop: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  commentBox: {
    width: '100%',
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 54,
    fontFamily: fonts.hand,
    fontSize: 18,
    color: colors.ink,
  },
  karmaPanel: {
    marginHorizontal: 22,
    marginTop: 18,
    backgroundColor: colors.inkSurface,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: colors.inkSurface,
    shadowColor: colors.goldDeep,
    shadowOpacity: 1,
    shadowOffset: { width: 5, height: 5 },
    shadowRadius: 0,
    elevation: 4,
  },
  karmaDot: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  karmaDotText: { color: colors.goldLight, fontFamily: fonts.type, fontSize: 11, textAlign: 'center', lineHeight: 13 },
  karmaUp: { fontFamily: fonts.type, fontSize: 10, color: colors.goldLight, letterSpacing: 1.2 },
  karmaTitle: { fontFamily: fonts.serifBold, fontSize: 22, color: colors.onInk },
  karmaBalance: { fontFamily: fonts.serifBold, fontSize: 18, color: colors.onInk },
  cta: { position: 'absolute', left: 22, right: 22 },
});
