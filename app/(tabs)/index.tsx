import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, SlidersHorizontal, Camera, X, Check } from 'lucide-react-native';
import { HandMap } from '@/components/HandMap';
import { Compass } from '@/components/Compass';
import { Pin } from '@/components/Pin';
import { JournalSwitch } from '@/components/JournalSwitch';
import { Ticket } from '@/components/Ticket';
import { Chip } from '@/components/Chip';
import { Flag } from '@/components/Flag';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors, useTheme } from '@/components/ThemeContext';
import { nearby, seekers, type User } from '@/data/mock';
import { useRole } from '@/components/RoleContext';
import { t } from '@/i18n';

/** 05 · La carte du quartier — real map via expo-maps, branded indicators. */

// Neighbourhood definitions with mock lat/lng near Paris
type Neighbourhood = {
  label: string;
  latitude: number;
  longitude: number;
};

const NEIGHBOURHOODS: Neighbourhood[] = [
  { label: 'le Marais',         latitude: 48.8578, longitude: 2.3622 },
  { label: 'Montmartre',        latitude: 48.8867, longitude: 2.3431 },
  { label: 'Bastille',          latitude: 48.8533, longitude: 2.3692 },
  { label: 'Saint-Germain',     latitude: 48.8539, longitude: 2.3336 },
  { label: 'Le Canal',          latitude: 48.8717, longitude: 2.3614 },
  { label: 'Belleville',        latitude: 48.8711, longitude: 2.3808 },
  { label: 'Pigalle',           latitude: 48.8820, longitude: 2.3370 },
  { label: 'Quartier latin',    latitude: 48.8499, longitude: 2.3470 },
  { label: 'Bercy',             latitude: 48.8333, longitude: 2.3829 },
  { label: 'Champs-Élysées',    latitude: 48.8698, longitude: 2.3079 },
  { label: 'Trocadéro',         latitude: 48.8616, longitude: 2.2890 },
  { label: 'Oberkampf',         latitude: 48.8654, longitude: 2.3784 },
  { label: 'Montorgueil',       latitude: 48.8645, longitude: 2.3470 },
  { label: 'Batignolles',       latitude: 48.8870, longitude: 2.3190 },
];

const DEFAULT_NEIGHBOURHOOD = NEIGHBOURHOODS[0];

// Deterministic golden-angle scatter so all nearby travellers spread evenly
// around the centre (no overlap), with the first one closest.
const GOLDEN = 2.399963229728653;
const SCATTER = nearby.map((_, i) => {
  const radius = 0.0011 + (i / nearby.length) * 0.0085; // ~120 m … ~1.1 km out
  const angle = i * GOLDEN;
  return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
});

// Seekers (people who NEED a photo) scattered with a different phase offset.
const SEEKER_SCATTER = seekers.map((_, i) => {
  const radius = 0.0013 + (i / Math.max(1, seekers.length)) * 0.008;
  const angle = i * GOLDEN + 1.1;
  return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
});
const SEEKER_DISTANCE_M = SEEKER_SCATTER.map((s) => Math.round(Math.sqrt(s.dx * s.dx + s.dy * s.dy) * 111000));

// Language filter options
type LangOption = { flag: string; labelKey: string; code: string };
const LANG_OPTIONS: LangOption[] = [
  { flag: '🇫🇷', labelKey: 'carte.langFr', code: 'fr' },
  { flag: '🇬🇧', labelKey: 'carte.langEn', code: 'en' },
  { flag: '🇪🇸', labelKey: 'carte.langEs', code: 'es' },
  { flag: '🇲🇦', labelKey: 'carte.langAr', code: 'ar' },
  { flag: '🇵🇹', labelKey: 'carte.langPt', code: 'pt' },
];

const DISTANCE_OPTIONS = ['500 m', '1 km', '2 km'] as const;
type DistanceOption = (typeof DISTANCE_OPTIONS)[number];

// Maximum metres for each distance bucket (used to cosmetically filter pins)
const DISTANCE_MAX_M: Record<DistanceOption, number> = {
  '500 m': 500,
  '1 km':  1000,
  '2 km':  2000,
};

// Distance (m) derived from each user's scatter radius (deg → metres ≈ ×111000)
const SCATTER_DISTANCE_M = SCATTER.map((s) => Math.round(Math.sqrt(s.dx * s.dx + s.dy * s.dy) * 111000));

// Minimum-rating filter options
const RATING_OPTIONS = [
  { labelKey: 'carte.ratingAll', min: 0 },
  { labelKey: 'carte.rating45', min: 4.5 },
  { labelKey: 'carte.rating48', min: 4.8 },
] as const;

// Sort options
const SORT_OPTIONS = [
  { key: 'proche', labelKey: 'carte.sortNearest' },
  { key: 'note', labelKey: 'carte.sortBestRated' },
  { key: 'karma', labelKey: 'carte.sortKarma' },
] as const;
type SortKey = (typeof SORT_OPTIONS)[number]['key'];

// react-native-maps is a native module (not in Expo Go). Lazy-require it only in
// real builds; fall back to the illustrated HandMap in Expo Go. We use RN-Maps
// (not expo-maps) because it renders fully custom React views as markers — so our
// polaroid-avatar + name pins ride the map natively and pan/zoom perfectly with it.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const RNMaps = isExpoGo ? null : require('react-native-maps');
const MapView = RNMaps?.default;
const Marker = RNMaps?.Marker;

// ─── styles factory ───────────────────────────────────────────────────────────
const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // ── custom map markers ────────────────────────────────────────────────────
    pinTag: {
      backgroundColor: colors.cardWhite,
      borderWidth: 1.5,
      borderColor: colors.ink,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginBottom: 3,
      shadowColor: colors.ink,
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 3,
      elevation: 3,
    },
    pinTagText: { fontFamily: fonts.serifBold, fontSize: 12, color: colors.ink },
    seekerTag: {
      backgroundColor: colors.cardWhite,
      borderWidth: 1.5,
      borderColor: colors.sunset,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginBottom: 3,
      alignItems: 'center',
      maxWidth: 150,
      shadowColor: colors.ink,
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 3,
      elevation: 3,
    },
    seekerTagName: { fontFamily: fonts.serifBold, fontSize: 12, color: colors.ink },
    seekerTagNote: { fontFamily: fonts.hand, fontSize: 12, color: colors.sunset, marginTop: -1 },
    // ── helper / seeker segmented toggle ──────────────────────────────────────
    segWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 6 },
    segGroup: {
      flexDirection: 'row',
      backgroundColor: colors.cardWhite,
      borderWidth: 1.5,
      borderColor: colors.ink,
      borderRadius: 999,
      padding: 3,
      shadowColor: colors.ink,
      shadowOpacity: 1,
      shadowOffset: { width: 2, height: 2 },
      shadowRadius: 0,
      elevation: 4,
    },
    segItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 999,
    },
    segItemActive: { backgroundColor: colors.inkSurface },
    segText: { fontFamily: fonts.hand, fontSize: 16, color: colors.ink },
    segTextActive: { color: colors.onInk },
    selfRing: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(90,138,163,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    selfDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.stampBlue,
      borderWidth: 3,
      borderColor: colors.polaroid,
    },
    // ── top bar ───────────────────────────────────────────────────────────────
    topBar: { position: 'absolute', left: 14, right: 14, flexDirection: 'row', gap: 8, zIndex: 5 },
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
    searchSquare: {
      width: 44,
      height: 44,
      backgroundColor: colors.cardWhite,
      borderWidth: 1.5,
      borderColor: colors.ink,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.ink,
      shadowOpacity: 1,
      shadowOffset: { width: 3, height: 3 },
      shadowRadius: 0,
      elevation: 4,
    },
    // ── filter badge ──────────────────────────────────────────────────────────
    badge: {
      position: 'absolute',
      top: -5,
      right: -5,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.stampRed,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
      borderWidth: 1.5,
      borderColor: colors.cardWhite,
    },
    badgeText: {
      fontFamily: fonts.handBold,
      fontSize: 11,
      color: colors.cardWhite,
      lineHeight: 13,
    },
    // ── dev note ──────────────────────────────────────────────────────────────
    devNote: {
      position: 'absolute',
      alignSelf: 'center',
      backgroundColor: colors.cardWhite,
      borderWidth: 1.5,
      borderColor: colors.ink,
      borderStyle: 'dashed',
      paddingHorizontal: 14,
      paddingVertical: 8,
      zIndex: 4,
    },
    devNoteText: { fontFamily: fonts.hand, fontSize: 15, color: colors.inkFaded, textAlign: 'center', lineHeight: 18 },
    // ── availability ticket ───────────────────────────────────────────────────
    availability: { position: 'absolute', left: 14, right: 14, zIndex: 5 },
    camWell: { width: 46, height: 46, backgroundColor: colors.goldLight, alignItems: 'center', justifyContent: 'center' },
    availTitle: { fontFamily: fonts.serifBold, fontSize: 15, color: colors.onInk },
    availSub: { fontFamily: fonts.hand, fontSize: 16, color: colors.goldLight, marginTop: 2 },
    availSubMuted: { color: colors.inkFaded, opacity: 0.55 },
    // ── sheet shared ─────────────────────────────────────────────────────────
    sheet: {
      flex: 1,
      backgroundColor: colors.paper,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 14,
    },
    sheetTitle: {
      fontFamily: fonts.serifBold,
      fontSize: 20,
      color: colors.ink,
    },
    sheetClose: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.cardWhite,
      borderWidth: 1.5,
      borderColor: colors.ink,
      shadowColor: colors.ink,
      shadowOpacity: 1,
      shadowOffset: { width: 2, height: 2 },
      shadowRadius: 0,
      elevation: 3,
    },
    sheetDivider: {
      height: 1.5,
      backgroundColor: colors.inkLine,
      marginHorizontal: 20,
    },
    sheetBody: {
      paddingHorizontal: 20,
      paddingVertical: 18,
      gap: 0,
    },
    locSearch: {
      marginHorizontal: 20,
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.cardWhite,
      borderWidth: 1.5,
      borderColor: colors.ink,
      borderRadius: 4,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    locSearchInput: { flex: 1, fontFamily: fonts.serif, fontSize: 16, color: colors.ink },
    locEmpty: { fontFamily: fonts.hand, fontSize: 18, color: colors.inkFaded, textAlign: 'center', paddingVertical: 20 },
    // ── neighbourhood list ────────────────────────────────────────────────────
    neighbourRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.inkLine,
    },
    neighbourRowActive: {
      backgroundColor: colors.paper2,
      marginHorizontal: -4,
      paddingHorizontal: 8,
      borderRadius: 4,
      borderBottomColor: colors.transparent,
    },
    neighbourLabel: {
      fontFamily: fonts.hand,
      fontSize: 20,
      color: colors.ink,
    },
    neighbourLabelActive: {
      fontFamily: fonts.handBold,
      color: colors.goldDeep,
    },
    // ── filter rows ───────────────────────────────────────────────────────────
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    filterLabel: {
      fontFamily: fonts.hand,
      fontSize: 18,
      color: colors.ink,
    },
    filterHint: {
      fontFamily: fonts.serif,
      fontSize: 12,
      color: colors.inkFaded,
      marginTop: 1,
    },
    resetText: {
      fontFamily: fonts.hand,
      fontSize: 17,
      color: colors.stampRed,
    },
    filterSectionTitle: {
      fontFamily: fonts.serifBold,
      fontSize: 14,
      color: colors.inkFaded,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginTop: 16,
      marginBottom: 12,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    // ── apply button ──────────────────────────────────────────────────────────
    sheetFooter: {
      paddingHorizontal: 20,
      paddingTop: 10,
      borderTopWidth: 1.5,
      borderTopColor: colors.inkLine,
      backgroundColor: colors.paper,
    },
    applyButton: {
      backgroundColor: colors.ink,
      paddingVertical: 14,
      alignItems: 'center',
      shadowColor: colors.ink,
      shadowOpacity: 1,
      shadowOffset: { width: 3, height: 3 },
      shadowRadius: 0,
      elevation: 4,
    },
    applyButtonText: {
      fontFamily: fonts.serifBold,
      fontSize: 16,
      color: colors.paperWarm,
      letterSpacing: 0.5,
    },
  });

/** Custom map marker — the carnet pin (photo) with a name + distance tag. */
function CarnetMapPin({ user, distanceM, highlight }: { user: User; distanceM: number; highlight: boolean }) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={[styles.pinTag, highlight && { borderColor: colors.goldDeep, backgroundColor: colors.goldLight }]}>
        <Text style={styles.pinTagText} numberOfLines={1}>
          {user.firstName} · {distanceM} m
        </Text>
      </View>
      <Pin color={highlight ? 'gold' : 'ink'} size={48} source={{ uri: user.avatar }} />
    </View>
  );
}

/** Seeker marker — someone who NEEDS a photo (sunset pin + their request). */
function SeekerMapPin({ user, note, distanceM }: { user: User; note: string; distanceM: number }) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={styles.seekerTag}>
        <Text style={styles.seekerTagName} numberOfLines={1}>{user.firstName}</Text>
        <Text style={styles.seekerTagNote} numberOfLines={1}>{note} · {distanceM} m</Text>
      </View>
      <Pin color="red" size={46} source={{ uri: user.avatar }} />
    </View>
  );
}

export default function CarteTab() {
  const colors = useThemeColors();
  const { isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ── availability toggle ──────────────────────────────────────────────────
  const [available, setAvailable] = useState(true);

  // ── role drives the map: 'helper' (I help → see seekers) vs 'seeker' (I want a
  //    photo → see helpers). Persisted globally so the whole app adapts.
  const { role, setRole } = useRole();

  // ── neighbourhood / location ─────────────────────────────────────────────
  const [neighbourhood, setNeighbourhood] = useState<Neighbourhood>(DEFAULT_NEIGHBOURHOOD);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const filteredNeighbourhoods = NEIGHBOURHOODS.filter((n) =>
    n.label.toLowerCase().includes(locationQuery.trim().toLowerCase())
  );

  const center = { latitude: neighbourhood.latitude, longitude: neighbourhood.longitude };

  // Smoothly recenter the real map when the chosen neighbourhood changes
  // (initialRegion keeps free panning; animateToRegion just nudges it).
  const mapRef = useRef<{ animateToRegion: (r: object, ms?: number) => void } | null>(null);
  useEffect(() => {
    mapRef.current?.animateToRegion(
      { latitude: center.latitude, longitude: center.longitude, latitudeDelta: 0.016, longitudeDelta: 0.016 },
      650
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neighbourhood]);

  // ── filter sheet state ───────────────────────────────────────────────────
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Staging state (applied only on "appliquer")
  const [stagingAvailNow,  setStagingAvailNow]  = useState(false);
  const [stagingDistance,  setStagingDistance]  = useState<DistanceOption | null>(null);
  const [stagingLanguages, setStagingLanguages] = useState<string[]>([]);
  const [stagingVerified,  setStagingVerified]  = useState(false);
  const [stagingMinRating, setStagingMinRating] = useState(0);
  const [stagingSort,      setStagingSort]      = useState<SortKey>('proche');

  // Applied state
  const [filterAvailNow,  setFilterAvailNow]  = useState(false);
  const [filterDistance,  setFilterDistance]  = useState<DistanceOption | null>(null);
  const [filterLanguages, setFilterLanguages] = useState<string[]>([]);
  const [filterVerified,  setFilterVerified]  = useState(false);
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [filterSort,      setFilterSort]      = useState<SortKey>('proche');

  const openFilterModal = () => {
    // Pre-fill staging from applied
    setStagingAvailNow(filterAvailNow);
    setStagingDistance(filterDistance);
    setStagingLanguages([...filterLanguages]);
    setStagingVerified(filterVerified);
    setStagingMinRating(filterMinRating);
    setStagingSort(filterSort);
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    setFilterAvailNow(stagingAvailNow);
    setFilterDistance(stagingDistance);
    setFilterLanguages([...stagingLanguages]);
    setFilterVerified(stagingVerified);
    setFilterMinRating(stagingMinRating);
    setFilterSort(stagingSort);
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setStagingAvailNow(false);
    setStagingDistance(null);
    setStagingLanguages([]);
    setStagingVerified(false);
    setStagingMinRating(0);
    setStagingSort('proche');
  };

  // Count active filter conditions for the badge
  const activeFilterCount =
    (filterAvailNow ? 1 : 0) +
    (filterDistance !== null ? 1 : 0) +
    (filterLanguages.length > 0 ? 1 : 0) +
    (filterVerified ? 1 : 0) +
    (filterMinRating > 0 ? 1 : 0) +
    (filterSort !== 'proche' ? 1 : 0);

  // ── filtered + sorted pins ──────────────────────────────────────────────────
  const pinnedAll = nearby.map((u, i) => ({
    user: u,
    index: i,
    coordinates: {
      latitude: center.latitude  + SCATTER[i].dy,
      longitude: center.longitude + SCATTER[i].dx,
    },
    distanceM: SCATTER_DISTANCE_M[i],
  }));

  const pinned = pinnedAll
    .filter((p) => {
      if (filterAvailNow && !available) return false;
      if (filterDistance !== null && p.distanceM > DISTANCE_MAX_M[filterDistance]) return false;
      if (filterVerified && !p.user.verified) return false;
      if (filterMinRating > 0 && p.user.rating < filterMinRating) return false;
      if (filterLanguages.length > 0) {
        const userLangs = p.user.languages ?? [];
        const hasLang = filterLanguages.some((code) => {
          const opt = LANG_OPTIONS.find((l) => l.code === code);
          return opt ? userLangs.includes(opt.flag) : false;
        });
        if (!hasLang) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filterSort === 'note') return b.user.rating - a.user.rating;
      if (filterSort === 'karma') return b.user.karma - a.user.karma;
      return a.distanceM - b.distanceM;
    });

  // Seekers, with the same distance / language / verified / rating filters applied.
  const seekerPinned = seekers
    .map((s, i) => ({
      user: s.user,
      note: s.note,
      coordinates: {
        latitude: center.latitude + SEEKER_SCATTER[i].dy,
        longitude: center.longitude + SEEKER_SCATTER[i].dx,
      },
      distanceM: SEEKER_DISTANCE_M[i],
    }))
    .filter((p) => {
      if (filterDistance !== null && p.distanceM > DISTANCE_MAX_M[filterDistance]) return false;
      if (filterVerified && !p.user.verified) return false;
      if (filterMinRating > 0 && p.user.rating < filterMinRating) return false;
      if (filterLanguages.length > 0) {
        const userLangs = p.user.languages ?? [];
        const hasLang = filterLanguages.some((code) => {
          const opt = LANG_OPTIONS.find((l) => l.code === code);
          return opt ? userLangs.includes(opt.flag) : false;
        });
        if (!hasLang) return false;
      }
      return true;
    })
    .sort((a, b) => a.distanceM - b.distanceM);

  const openUser = (id: string, distanceM?: number) => {
    router.push({
      pathname: '/user/[id]',
      params: { id, dist: distanceM != null ? String(distanceM) : '' },
    });
  };

  const toggleStagingLanguage = (code: string) => {
    setStagingLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.paperWarm }}>
      {/* ---- Map layer ---- */}
      {!MapView || !Marker ? (
        <>
          <HandMap />
          <View style={[styles.devNote, { top: insets.top + 120 }]}>
            <Text style={styles.devNoteText}>
              {t('carte.devNote')}
            </Text>
          </View>
        </>
      ) : (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          userInterfaceStyle={isDark ? 'dark' : 'light'}
          initialRegion={{
            latitude: center.latitude,
            longitude: center.longitude,
            latitudeDelta: 0.016,
            longitudeDelta: 0.016,
          }}
          showsCompass={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          showsPointsOfInterest={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {/* Seeker role → see HELPERS to photograph me; helper role → see SEEKERS to help. */}
          {role === 'seeker'
            ? pinned.map((p, i) => (
                <Marker
                  key={p.user.id}
                  coordinate={p.coordinates}
                  anchor={{ x: 0.5, y: 1 }}
                  calloutAnchor={{ x: 0.5, y: 0 }}
                  onPress={() => openUser(p.user.id, p.distanceM)}
                >
                  <CarnetMapPin user={p.user} distanceM={p.distanceM} highlight={i === 0} />
                </Marker>
              ))
            : seekerPinned.map((p) => (
                <Marker
                  key={p.user.id}
                  coordinate={p.coordinates}
                  anchor={{ x: 0.5, y: 1 }}
                  calloutAnchor={{ x: 0.5, y: 0 }}
                  onPress={() => openUser(p.user.id, p.distanceM)}
                >
                  <SeekerMapPin user={p.user} note={p.note} distanceM={p.distanceM} />
                </Marker>
              ))}

          {/* Self marker */}
          {available && (
            <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.selfRing}>
                <View style={styles.selfDot} />
              </View>
            </Marker>
          )}
        </MapView>
      )}

      {/* ---- Carnet chrome overlays (sit on top of the real map) ---- */}
      <View style={[styles.topBar, { top: insets.top + 6 }]}>
        {/* Search box — opens neighbourhood picker */}
        <Pressable style={styles.searchBox} onPress={() => setLocationModalVisible(true)}>
          <Search size={16} color={colors.ink} />
          <Text style={styles.searchText}>{neighbourhood.label}</Text>
        </Pressable>

        {/* Filter button with active-count badge */}
        <Pressable style={styles.searchSquare} onPress={openFilterModal}>
          <SlidersHorizontal size={18} color={colors.ink} />
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Role toggle — sets the global role (helping vs seeking) */}
      <View style={[styles.segWrap, { top: insets.top + 62 }]}>
        <View style={styles.segGroup}>
          <Pressable
            style={[styles.segItem, role === 'helper' && styles.segItemActive]}
            onPress={() => setRole('helper')}
          >
            <Camera size={14} color={role === 'helper' ? colors.onInk : colors.ink} />
            <Text style={[styles.segText, role === 'helper' && styles.segTextActive]}>{t('carte.helpers')}</Text>
          </Pressable>
          <Pressable
            style={[styles.segItem, role === 'seeker' && styles.segItemActive]}
            onPress={() => setRole('seeker')}
          >
            <Search size={14} color={role === 'seeker' ? colors.onInk : colors.ink} />
            <Text style={[styles.segText, role === 'seeker' && styles.segTextActive]}>{t('carte.seekers')}</Text>
          </Pressable>
        </View>
      </View>

      <Compass size={48} style={{ position: 'absolute', top: insets.top + 118, right: 18 }} />

      <View style={[styles.availability, { bottom: 110 }]}>
        <Ticket background={colors.inkSurface} notchColor={colors.paper2} style={{ paddingHorizontal: 18, paddingVertical: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={styles.camWell}>
              {role === 'helper' ? <Camera size={22} color={colors.inkSurface} /> : <Search size={22} color={colors.inkSurface} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.availTitle}>
                {role === 'helper' ? t('map.available') : t('carte.seekTitle')}
              </Text>
              <Text style={[styles.availSub, role === 'helper' && !available && styles.availSubMuted]}>
                {role === 'helper'
                  ? available
                    ? t('map.availableSub')
                    : t('carte.offline')
                  : t('carte.seekSub', { n: pinned.length })}
              </Text>
            </View>
            {role === 'helper' && <JournalSwitch value={available} onValueChange={setAvailable} />}
          </View>
        </Ticket>
      </View>

      {/* ================================================================
          MODAL 1 — Neighbourhood / Location picker
      ================================================================ */}
      <Modal
        visible={locationModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.sheet}>
          {/* Sheet header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('carte.chooseNeighbourhood')}</Text>
            <Pressable onPress={() => setLocationModalVisible(false)} style={styles.sheetClose}>
              <X size={20} color={colors.ink} />
            </Pressable>
          </View>
          {/* Search input */}
          <View style={styles.locSearch}>
            <Search size={16} color={colors.inkFaded} />
            <TextInput
              value={locationQuery}
              onChangeText={setLocationQuery}
              placeholder={t('carte.searchPlaceholder')}
              placeholderTextColor={colors.inkFaded}
              style={styles.locSearchInput}
              autoCorrect={false}
              autoFocus
            />
            {locationQuery.length > 0 && (
              <Pressable onPress={() => setLocationQuery('')} hitSlop={8}>
                <X size={15} color={colors.inkFaded} />
              </Pressable>
            )}
          </View>

          {/* Neighbourhood list */}
          <ScrollView contentContainerStyle={styles.sheetBody} keyboardShouldPersistTaps="handled">
            {filteredNeighbourhoods.length === 0 ? (
              <Text style={styles.locEmpty}>{t('carte.noNeighbourhood')}</Text>
            ) : (
              filteredNeighbourhoods.map((n) => {
                const selected = n.label === neighbourhood.label;
                return (
                  <Pressable
                    key={n.label}
                    style={[styles.neighbourRow, selected && styles.neighbourRowActive]}
                    onPress={() => {
                      setNeighbourhood(n);
                      setLocationQuery('');
                      setLocationModalVisible(false);
                    }}
                  >
                    <Text style={[styles.neighbourLabel, selected && styles.neighbourLabelActive]}>
                      {n.label}
                    </Text>
                    {selected && <Check size={18} color={colors.goldDeep} />}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* ================================================================
          MODAL 2 — Filtres sheet
      ================================================================ */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.sheet}>
          {/* Sheet header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t('carte.filters')}</Text>
            <Pressable onPress={() => setFilterModalVisible(false)} style={styles.sheetClose}>
              <X size={20} color={colors.ink} />
            </Pressable>
          </View>
          <View style={styles.sheetDivider} />

          <ScrollView contentContainerStyle={styles.sheetBody}>
            {/* ── disponibles maintenant ── */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>{t('carte.availNow')}</Text>
              <JournalSwitch value={stagingAvailNow} onValueChange={setStagingAvailNow} />
            </View>

            <View style={styles.sheetDivider} />

            {/* ── distance ── */}
            <Text style={styles.filterSectionTitle}>{t('carte.distance')}</Text>
            <View style={styles.chipsRow}>
              {DISTANCE_OPTIONS.map((d) => (
                <Chip
                  key={d}
                  variant={stagingDistance === d ? 'filled' : 'outline'}
                  color="ink"
                  onPress={() => setStagingDistance(stagingDistance === d ? null : d)}
                >
                  {d}
                </Chip>
              ))}
            </View>

            <View style={styles.sheetDivider} />

            {/* ── langues ── */}
            <Text style={styles.filterSectionTitle}>{t('carte.languages')}</Text>
            <View style={styles.chipsRow}>
              {LANG_OPTIONS.map((lang) => {
                const active = stagingLanguages.includes(lang.code);
                return (
                  <Chip
                    key={lang.code}
                    variant={active ? 'filled' : 'outline'}
                    color="ink"
                    leading={<Flag size={16}>{lang.flag}</Flag>}
                    onPress={() => toggleStagingLanguage(lang.code)}
                  >
                    {t(lang.labelKey)}
                  </Chip>
                );
              })}
            </View>

            <View style={styles.sheetDivider} />

            {/* ── note minimum ── */}
            <Text style={styles.filterSectionTitle}>{t('carte.minRating')}</Text>
            <View style={styles.chipsRow}>
              {RATING_OPTIONS.map((r) => (
                <Chip
                  key={r.labelKey}
                  variant={stagingMinRating === r.min ? 'filled' : 'outline'}
                  color="gold"
                  onPress={() => setStagingMinRating(r.min)}
                >
                  {t(r.labelKey)}
                </Chip>
              ))}
            </View>

            <View style={styles.sheetDivider} />

            {/* ── trier par ── */}
            <Text style={styles.filterSectionTitle}>{t('carte.sortBy')}</Text>
            <View style={styles.chipsRow}>
              {SORT_OPTIONS.map((s) => (
                <Chip
                  key={s.key}
                  variant={stagingSort === s.key ? 'filled' : 'outline'}
                  color="ink"
                  onPress={() => setStagingSort(s.key)}
                >
                  {t(s.labelKey)}
                </Chip>
              ))}
            </View>

            <View style={styles.sheetDivider} />

            {/* ── vérifiés uniquement ── */}
            <View style={styles.filterRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.filterLabel}>{t('carte.verifiedOnly')}</Text>
                <Text style={styles.filterHint}>{t('carte.verifiedHint')}</Text>
              </View>
              <JournalSwitch value={stagingVerified} onValueChange={setStagingVerified} />
            </View>

            <Pressable onPress={resetFilters} style={{ marginTop: 18, alignSelf: 'flex-start' }}>
              <Text style={styles.resetText}>{t('carte.resetAll')}</Text>
            </Pressable>
          </ScrollView>

          {/* Apply button */}
          <View style={[styles.sheetFooter, { paddingBottom: insets.bottom + 16 }]}>
            <Pressable style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>{t('carte.apply')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
