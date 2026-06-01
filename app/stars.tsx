import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Info } from 'lucide-react-native';
import { PaperBackground } from '@/components/PaperBackground';
import { NavBar } from '@/components/iOSChrome';
import { Polaroid } from '@/components/Polaroid';
import { Tape } from '@/components/Tape';
import { Squiggle } from '@/components/Squiggle';
import { Chip } from '@/components/Chip';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { ines, sami, marc, leaderboard } from '@/data/mock';
import { t } from '@/i18n';

type PeriodKey = 'semaine' | 'mois' | 'toujours';

const PERIOD_KEYS: PeriodKey[] = ['semaine', 'mois', 'toujours'];
const PERIOD_I18N: Record<PeriodKey, string> = {
  semaine: 'discover.periodWeek',
  mois: 'discover.periodMonth',
  toujours: 'discover.periodAllTime',
};

const SUBTITLE_I18N: Record<PeriodKey, string> = {
  semaine: 'discover.subtitleWeek',
  mois: 'discover.subtitleMonth',
  toujours: 'discover.subtitleAllTime',
};

// Simulate different podium data per period
const PODIUM_DATA: Record<PeriodKey, {
  rank1: { user: { firstName: string; avatar: string }; score: number };
  rank2: { user: { firstName: string; avatar: string }; score: number };
  rank3: { user: { firstName: string; avatar: string }; score: number };
}> = {
  semaine: {
    rank1: { user: ines, score: 3420 },
    rank2: { user: sami, score: 2180 },
    rank3: { user: marc, score: 1890 },
  },
  mois: {
    rank1: { user: ines, score: 14200 },
    rank2: { user: marc, score: 9800 },
    rank3: { user: sami, score: 8750 },
  },
  toujours: {
    rank1: { user: ines, score: 98400 },
    rank2: { user: sami, score: 76000 },
    rank3: { user: marc, score: 62100 },
  },
};

const LEADERBOARD_SCORES: Record<PeriodKey, number[]> = {
  semaine:  [1240, 1088, 912, 844],
  mois:     [5200, 4100, 3750, 2980],
  toujours: [38000, 30500, 26100, 18800],
};

/** 19 · Tableau d'honneur. */
export default function Stars() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodKey>('semaine');

  const podium = PODIUM_DATA[period];
  const rowScores = LEADERBOARD_SCORES[period];

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.back()}><Text style={styles.back}>{t('discover.back')}</Text></Pressable>}
          title="TMP Stars"
          right={<Info size={22} color={colors.ink} />}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <View style={{ alignItems: 'center', paddingHorizontal: 22, paddingTop: 6 }}>
          <Text style={styles.weekly}>{t(SUBTITLE_I18N[period])}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
            <Text style={styles.title}>{t('stars.title')} </Text>
            <Squiggle style={styles.title}>{t('stars.titleHighlight')}</Squiggle>
          </View>
          <Text style={styles.sub}>{t('stars.sub')}</Text>

          {/* Period filter chips */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
            {PERIOD_KEYS.map((key) => (
              <Chip
                key={key}
                color="gold"
                variant={period === key ? 'filled' : 'outline'}
                size="sm"
                onPress={() => setPeriod(key)}
              >
                {t(PERIOD_I18N[key])}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.podium}>
          <PodiumSlot rank={2} user={podium.rank2.user} score={podium.rank2.score} bar={46} barStyle={silver} rotate={-6} onPress={() => router.push(`/user/${podium.rank2.user.firstName.toLowerCase()}`)} />
          <PodiumSlot rank={1} user={podium.rank1.user} score={podium.rank1.score} bar={74} barStyle={goldGradient} rotate={2} big onPress={() => router.push(`/user/${podium.rank1.user.firstName.toLowerCase()}`)} />
          <PodiumSlot rank={3} user={podium.rank3.user} score={podium.rank3.score} bar={34} barStyle={bronze} rotate={6} onPress={() => router.push(`/user/${podium.rank3.user.firstName.toLowerCase()}`)} />
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 18 }}>
          <View style={styles.list}>
            {leaderboard.map((row, i) => (
              <Pressable
                key={row.user.id}
                onPress={() => router.push(`/user/${row.user.id}`)}
                style={[styles.row, row.isMe && { backgroundColor: 'rgba(217,181,102,0.12)' }, i !== leaderboard.length - 1 && styles.rowDivider]}
              >
                <Text style={styles.rank}>{row.rank}</Text>
                <Polaroid width={36} height={30} noCaption rotate={i % 2 ? 2 : -2} source={{ uri: row.user.avatar }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.who}>{row.user.firstName} {row.user.lastName.charAt(0)}.</Text>
                    {row.isMe && <Chip color="gold" size="sm">{t('stars.you')}</Chip>}
                  </View>
                  <Text style={styles.sub2}>{t('discover.photoStats', { photos: row.user.photosCount, rating: row.user.rating })}</Text>
                </View>
                <Text style={styles.score}>{rowScores[i].toLocaleString('fr-FR')}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </PaperBackground>
  );
}

const goldGradient = ['#d9b566', '#8a6420'] as readonly [string, string];
const silver = ['#c0c0c0', '#a8a8a8'] as readonly [string, string];
const bronze = ['#cd7f32', '#a26021'] as readonly [string, string];

function PodiumSlot({
  rank,
  user,
  score,
  bar,
  barStyle,
  rotate,
  big,
  onPress,
}: {
  rank: number;
  user: { firstName: string; avatar: string };
  score: number;
  bar: number;
  barStyle: readonly [string, string];
  rotate: number;
  big?: boolean;
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center', marginHorizontal: 8 }}>
      <View style={{ transform: [{ rotate: `${rotate}deg` }] }}>
        <Polaroid
          width={big ? 104 : 84}
          height={big ? 90 : 72}
          caption={user.firstName}
          captionSize={big ? 14 : 13}
          source={{ uri: user.avatar }}
        >
          {big && <Tape rotate={3} style={{ position: 'absolute', top: -12, left: 32 }} />}
        </Polaroid>
      </View>
      <Text style={[styles.podiumScore, big && { color: colors.goldDeep, fontSize: 22 }]}>{score.toLocaleString('fr-FR')} ★</Text>
      <View style={[styles.podiumBar, { height: bar, width: big ? 96 : 78 }]}>
        <LinearGradient
          colors={barStyle as unknown as readonly [string, string]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={[styles.podiumRank, { fontSize: big ? 42 : rank === 2 ? 28 : 24 }]}>{rank}</Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  weekly: { fontFamily: fonts.hand, fontSize: 22, color: colors.goldDeep, transform: [{ rotate: '-2deg' }] },
  title: { fontFamily: fonts.serifBold, fontSize: 24, letterSpacing: -0.4, lineHeight: 28, color: colors.ink },
  sub: { fontFamily: fonts.serifItalic, fontStyle: 'italic', color: colors.inkFaded, fontSize: 13, textAlign: 'center', marginTop: 4 },
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginTop: 22, paddingHorizontal: 22 },
  podiumScore: { fontFamily: fonts.hand, fontSize: 18, color: colors.inkFaded, marginTop: 6 },
  podiumBar: {
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  podiumRank: { fontFamily: fonts.serifBlack, color: colors.ink },
  list: {
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14 },
  rowDivider: { borderBottomWidth: 1.5, borderStyle: 'dashed', borderColor: colors.inkLine },
  rank: { width: 22, textAlign: 'center', fontFamily: fonts.serifBold, fontSize: 14, color: colors.ink },
  who: { fontFamily: fonts.serifBold, fontSize: 14, color: colors.ink },
  sub2: { fontFamily: fonts.hand, fontSize: 14, color: colors.inkFaded },
  score: { fontFamily: fonts.type, fontSize: 13, color: colors.goldDeep, fontWeight: '700' },
});
