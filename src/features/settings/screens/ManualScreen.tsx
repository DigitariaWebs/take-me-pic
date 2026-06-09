import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar } from '@/shared/ui/iOSChrome';
import { Squiggle } from '@/shared/ui/Squiggle';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { manualSecrets } from '@/shared/data/mock';
import { t } from '@/shared/lib/i18n';

// Extended tips shown when a card is expanded
const EXTENDED_TIP: Record<string, string> = {
  "La règle des tiers": "Divise ton cadre mentalement en 9 zones égales. Place les sujets importants aux 4 intersections pour un résultat immédiatement plus dynamique. Évite le centre sauf pour les portraits symétriques.",
  "Lignes directrices": "Routes, escaliers, couloirs, horizons marins — toute ligne qui part d'un coin vers l'autre guide l'œil du spectateur. Cherche les diagonales plutôt que les horizontales, elles donnent du mouvement.",
  "Espace négatif": "Le vide autour d'un sujet n'est pas du gaspillage, c'est une respiration. Un ciel vide sur 2/3 du cadre peut donner plus de force au personnage en bas que d'essayer de tout remplir.",
  "Heure dorée": "La lumière rasante du matin ou du soir crée des ombres longues et des teintes chaudes dorées ou orangées. Règle ton réveil 45 min avant le lever du soleil pour arriver sur place et choisir ton angle tranquillement.",
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  intro: { fontFamily: fonts.hand, fontSize: 22, color: colors.goldDeep, transform: [{ rotate: '-2deg' }] },
  title: { fontFamily: fonts.serifBold, fontSize: 30, letterSpacing: -0.6, lineHeight: 32, color: colors.ink },
  subtitle: { fontFamily: fonts.serifItalic, fontStyle: 'italic', fontSize: 14, color: colors.inkFaded, marginTop: 6 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 22,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.cardWhite,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.hand,
    fontSize: 18,
    color: colors.ink,
    padding: 0,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    padding: 12,
    alignItems: 'flex-start',
  },
  thumbBig: { width: 120, height: 90, borderWidth: 1.5, borderColor: colors.ink },
  thumbSm: { width: 80, height: 60, borderWidth: 1.5, borderColor: colors.ink },
  gridLine: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(184,137,58,0.6)' },
  gridHLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(184,137,58,0.6)' },
  cardLabel: { fontFamily: fonts.type, fontSize: 9, letterSpacing: 1.4, fontWeight: '700' },
  cardTitle: { fontFamily: fonts.serifBold, fontSize: 15, marginTop: 2, color: colors.ink },
  cardBody: { fontFamily: fonts.hand, fontSize: 16, color: colors.ink, marginTop: 4, lineHeight: 18 },
  cardExtended: {
    fontFamily: fonts.hand,
    fontSize: 15,
    color: colors.inkFaded,
    marginTop: 8,
    lineHeight: 20,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    paddingTop: 8,
  },
  expandHint: {
    fontFamily: fonts.type,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 6,
    opacity: 0.7,
  },
});

/** 20 · Manuel illustré. */
export default function Manual() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Build color map from active palette
  const colorMap = useMemo(() => ({
    gold: colors.goldDeep,
    blue: colors.stampBlue,
    green: colors.stampGreen,
    sunset: colors.sunset,
  }), [colors]);

  const filtered = manualSecrets.filter((s) =>
    query.trim() === '' || s.title.toLowerCase().includes(query.toLowerCase())
  );

  function toggleExpand(title: string) {
    setExpandedTitle((prev) => (prev === title ? null : title));
  }

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<Pressable onPress={() => router.back()}><Text style={styles.back}>{t('discover.back')}</Text></Pressable>}
          title={t('discover.manualTitle')}
          right={
            <Pressable onPress={() => { setShowSearch((v) => !v); if (showSearch) setQuery(''); }} hitSlop={8}>
              {showSearch
                ? <X size={22} color={colors.ink} />
                : <Search size={22} color={colors.ink} />
              }
            </Pressable>
          }
        />
      </View>

      {showSearch && (
        <View style={styles.searchRow}>
          <Search size={16} color={colors.goldDeep} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('discover.searchPlaceholder')}
            placeholderTextColor={colors.inkFaded}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={16} color={colors.inkFaded} />
            </Pressable>
          )}
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        {!showSearch && (
          <View style={{ paddingHorizontal: 22, paddingTop: 6 }}>
            <Text style={styles.intro}>{t('manual.intro')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Text style={styles.title}>{t('manual.title')} </Text>
              <Squiggle style={styles.title}>{t('manual.titleHighlight')}</Squiggle>
              <Text style={styles.title}>.</Text>
            </View>
            <Text style={styles.subtitle}>{t('manual.subtitle')}</Text>
          </View>
        )}

        {filtered.length === 0 && (
          <View style={{ paddingHorizontal: 22, paddingTop: 30, alignItems: 'center' }}>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>{t('discover.noResults', { q: query })}</Text>
          </View>
        )}

        <View style={{ paddingHorizontal: 22, paddingTop: showSearch ? 8 : 18, gap: 14 }}>
          {filtered.map((secret, i) => {
            const accent = colorMap[secret.color];
            const isBig = secret.big;
            const isExpanded = expandedTitle === secret.title;
            const originalIndex = manualSecrets.findIndex((s) => s.title === secret.title);
            return (
              <Pressable
                key={secret.title}
                onPress={() => toggleExpand(secret.title)}
                style={[
                  styles.card,
                  originalIndex === 0 && {
                    shadowColor: colors.ink,
                    shadowOpacity: 1,
                    shadowOffset: { width: 4, height: 4 },
                    shadowRadius: 0,
                    elevation: 4,
                  },
                  { transform: [{ rotate: `${originalIndex === 2 ? 0.5 : -0.5}deg` }] },
                  isExpanded && { borderColor: accent, borderWidth: 2 },
                ]}
              >
                <Image
                  source={{ uri: secret.thumb }}
                  style={isBig ? styles.thumbBig : styles.thumbSm}
                />
                {isBig && (
                  <View pointerEvents="none" style={[StyleSheet.absoluteFill, { width: 120, top: 14, left: 14, height: 90 }]}>
                    <View style={[styles.gridLine, { left: '33%' }]} />
                    <View style={[styles.gridLine, { left: '66%' }]} />
                    <View style={[styles.gridHLine, { top: '33%' }]} />
                    <View style={[styles.gridHLine, { top: '66%' }]} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardLabel, { color: accent }]}>{t('manual.secret', { n: String(originalIndex + 1).padStart(2, '0') })}</Text>
                  <Text style={[styles.cardTitle, isBig && { fontSize: 18 }]}>{secret.title}</Text>
                  <Text style={styles.cardBody}>{secret.body}</Text>
                  {isExpanded && EXTENDED_TIP[secret.title] && (
                    <Text style={[styles.cardExtended, { borderTopColor: accent }]}>{EXTENDED_TIP[secret.title]}</Text>
                  )}
                  <Text style={[styles.expandHint, { color: accent }]}>{isExpanded ? t('discover.readLess') : t('discover.readMore')}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </PaperBackground>
  );
}
