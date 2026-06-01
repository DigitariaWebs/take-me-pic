import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImageIcon as Img } from 'lucide-react-native';
import { HandMap } from '@/components/HandMap';
import { Polaroid } from '@/components/Polaroid';
import { Compass } from '@/components/Compass';
import { Chip } from '@/components/Chip';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { spots } from '@/data/mock';
import { t } from '@/i18n';

type FilterKey = 'lever' | 'coucher' | 'portrait' | 'archi';

const FILTER_KEYS: FilterKey[] = ['lever', 'coucher', 'portrait', 'archi'];

// Each polaroid pinned on the map has a filter tag
const MAP_PINS = [
  { id: spots[0].id, hero: spots[0].hero, caption: 'Pont des Arts', rotate: -8, top: 220, left: 50,  filters: ['coucher'] as FilterKey[] },
  { id: 'sp2', hero: 'https://picsum.photos/seed/sp2/200/200', caption: '',     rotate: 6,  top: 290, left: 210, noCaption: true, filters: ['lever', 'portrait'] as FilterKey[] },
  { id: 'sp3', hero: 'https://picsum.photos/seed/sp3/200/200', caption: '',     rotate: -3, top: 380, left: 80,  noCaption: true, filters: ['archi'] as FilterKey[] },
  { id: 'sp4', hero: 'https://picsum.photos/seed/sp4/200/200', caption: 'Lafayette', rotate: 8, top: 360, left: 230, filters: ['archi', 'portrait'] as FilterKey[] },
  { id: 'sp5', hero: 'https://picsum.photos/seed/sp5/200/200', caption: '',     rotate: -5, top: 460, left: 140, noCaption: true, filters: ['lever'] as FilterKey[] },
];

/** 17 · Carte au trésor. */
export default function SpotsMap() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);

  function toggleFilter(key: FilterKey) {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function isVisible(pinFilters: FilterKey[]) {
    if (activeFilters.length === 0) return true;
    return activeFilters.some((f) => pinFilters.includes(f));
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.paperWarm }}>
      <HandMap />
      <View style={[styles.top, { top: insets.top + 6 }]}>
        <View style={styles.searchBox}>
          <Img size={18} color={colors.goldDeep} />
          <Text style={styles.searchText}>{t('spots.near', { n: 128 })}</Text>
        </View>
      </View>

      <View style={[styles.filters, { top: insets.top + 70 }]}>
        {FILTER_KEYS.map((key) => {
          const labelKey = `discover.filter${key.charAt(0).toUpperCase()}${key.slice(1)}` as const;
          return (
            <Chip
              key={key}
              variant={activeFilters.includes(key) ? 'filled' : 'outline'}
              onPress={() => toggleFilter(key)}
            >
              {t(labelKey)}
            </Chip>
          );
        })}
      </View>

      <Compass size={48} style={{ position: 'absolute', top: insets.top + 120, right: 18 }} />

      {MAP_PINS.map((pin) =>
        isVisible(pin.filters) ? (
          <View key={pin.id} style={{ position: 'absolute', top: pin.top, left: pin.left }}>
            <Pressable onPress={() => router.push(`/spots/${pin.id}`)}>
              <Polaroid
                width={pin.noCaption ? 78 : 92}
                height={pin.noCaption ? 64 : 78}
                captionSize={11}
                caption={pin.caption || undefined}
                noCaption={pin.noCaption}
                rotate={pin.rotate}
                source={{ uri: pin.hero }}
              />
            </Pressable>
          </View>
        ) : null
      )}

      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} viewBox="0 0 390 844">
        <Path d="M 100 280 Q 180 320 240 330 T 280 410 T 200 510" stroke={colors.stampRed} strokeWidth={2} fill="none" strokeDasharray="2 5" opacity={0.55} />
      </Svg>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.cardScroll, { bottom: insets.bottom + 102 }]}
        style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 102 }}
      >
        {isVisible(['coucher']) && (
          <Pressable onPress={() => router.push(`/spots/${spots[0].id}`)} style={styles.spotCard}>
            <Polaroid width={64} height={56} noCaption rotate={-3} source={{ uri: spots[0].hero }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.spotTitle}>{spots[0].name} {t('discover.atSunset')}</Text>
              <Text style={styles.spotMeta}>★ {spots[0].rating} · 230 m</Text>
              <View style={{ marginTop: 4 }}>
                <Chip color="gold" size="sm">🌇 19H</Chip>
              </View>
            </View>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  top: { position: 'absolute', left: 14, right: 14, flexDirection: 'row', gap: 8, zIndex: 5 },
  searchBox: {
    flex: 1,
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 4,
  },
  searchText: { fontFamily: fonts.hand, fontSize: 18, color: colors.ink },
  filters: { position: 'absolute', left: 14, right: 14, flexDirection: 'row', gap: 6, zIndex: 5 },
  cardScroll: { paddingHorizontal: 14, gap: 12 },
  spotCard: {
    minWidth: 280,
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 0,
    elevation: 4,
  },
  spotTitle: { fontFamily: fonts.serifBold, fontSize: 14, lineHeight: 16, color: colors.ink },
  spotMeta: { fontFamily: fonts.hand, fontSize: 15, color: colors.goldDeep, marginTop: 2 },
});
