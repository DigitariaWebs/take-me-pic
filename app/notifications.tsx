import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, MapPin } from 'lucide-react-native';
import { PaperBackground } from '@/components/PaperBackground';
import { NavBar } from '@/components/iOSChrome';
import { Polaroid } from '@/components/Polaroid';
import { Stamp } from '@/components/Stamp';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import { Squiggle } from '@/components/Squiggle';
import { useThemeColors } from '@/components/ThemeContext';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { notifications as rawNotifications, type Notification } from '@/data/mock';
import { t } from '@/i18n';
import { useRole } from '@/components/RoleContext';

type FilterKind = 'toutes' | 'demandes' | 'karma' | 'communauté';

const FILTER_KINDS: Record<FilterKind, Notification['kind'] | null> = {
  toutes: null,
  demandes: 'request',
  karma: 'karma',
  communauté: 'community',
};

const FILTER_LABEL_KEYS: Record<FilterKind, string> = {
  toutes: 'setx.filterAll',
  demandes: 'setx.filterRequests',
  karma: 'setx.filterKarma',
  communauté: 'setx.filterCommunity',
};

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  markAll: { fontFamily: fonts.hand, fontSize: 16, color: colors.goldDeep },
  markAllDone: { color: colors.stampGreen },
  headline: { fontFamily: fonts.hand, fontSize: 24, color: colors.ink, lineHeight: 28 },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  sectionLabel: { fontFamily: fonts.type, fontSize: 10, color: colors.inkFaded, letterSpacing: 1.8, marginBottom: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  kindBox: { width: 38, height: 38, backgroundColor: colors.stampGreen, alignItems: 'center', justifyContent: 'center' },
  cardMeta: { fontFamily: fonts.hand, fontSize: 13, color: colors.inkFaded, marginTop: 2 },
  emptyText: { fontFamily: fonts.hand, fontSize: 16, color: colors.inkFaded, textAlign: 'center', marginTop: 40 },
});

/** 27 · La pile de notes. */
export default function Notifications() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { role } = useRole();

  const [activeFilter, setActiveFilter] = useState<FilterKind>('toutes');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [notifs, setNotifs] = useState<Notification[]>(rawNotifications);

  const kindFilter = FILTER_KINDS[activeFilter];

  /** Build a role-aware body for request notifications. */
  function requestBody(n: Notification): string {
    if (n.kind !== 'request') return n.body;
    if (role === 'helper') {
      // Extract name + dist from mock body "**Yasmine** demande une photo à 120 m"
      const nameMatch = n.body.match(/\*\*([^*]+)\*\*/);
      const distMatch = n.body.match(/à (\d+\s*m)/);
      const name = nameMatch ? nameMatch[1] : "Quelqu'un";
      const dist = distMatch ? distMatch[1] : '?';
      return t('setx.notifRequestHelper', { name: `**${name}**`, dist });
    }
    // seeker — confirmation that someone accepted
    const nameMatch = n.body.match(/\*\*([^*]+)\*\*/);
    const name = nameMatch ? nameMatch[1] : "Quelqu'un";
    return t('setx.notifRequestSeeker', { name: `**${name}**` });
  }

  // Split by "today" (first 3) vs "yesterday" (rest) using original index
  const todayIds = new Set(notifs.slice(0, 3).map((n) => n.id));
  const yesterdayIds = new Set(notifs.slice(3).map((n) => n.id));

  const filtered = kindFilter ? notifs.filter((n) => n.kind === kindFilter) : notifs;
  const todayFiltered = filtered.filter((n) => todayIds.has(n.id));
  const yesterdayFiltered = filtered.filter((n) => yesterdayIds.has(n.id));

  const unreadCount = notifs.filter((n) => !readIds.has(n.id)).length;

  function handleMarkAll() {
    setReadIds(new Set(notifs.map((n) => n.id)));
  }

  function handleCardPress(n: Notification) {
    setReadIds((prev) => new Set([...prev, n.id]));
    if (n.kind === 'request') {
      router.push('/request/incoming');
    }
  }

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<View style={{ width: 30 }} />}
          title={t('notifications.title')}
          right={
            <Pressable onPress={handleMarkAll} hitSlop={8}>
              <Text style={[styles.markAll, readIds.size === notifs.length && styles.markAllDone]}>
                {readIds.size === notifs.length ? t('setx.allRead') : t('notifications.markAll')}
              </Text>
            </Pressable>
          }
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <View style={{ paddingHorizontal: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
            <Text style={styles.headline}>
              {unreadCount > 0 ? `${unreadCount} nouvelle${unreadCount > 1 ? 's' : ''}` : 'tout lu'}{'\n'}
            </Text>
            <Squiggle style={styles.headline}>{t('notifications.newHighlight')}</Squiggle>
          </View>

          {/* ── Filter chips ── */}
          <View style={[styles.chipRow, { marginTop: 14 }]}>
            {(Object.keys(FILTER_KINDS) as FilterKind[]).map((f) => (
              <Chip
                key={f}
                variant={activeFilter === f ? 'filled' : 'outline'}
                onPress={() => setActiveFilter(f)}
              >
                {t(FILTER_LABEL_KEYS[f])}
              </Chip>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 18 }}>
          {/* Today */}
          {todayFiltered.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>{t('notifications.today')}</Text>
              <View style={{ gap: 10 }}>
                {todayFiltered.map((n, i) => (
                  <Card
                    key={n.id}
                    n={n}
                    rotate={i === 0 ? -0.4 : 0.4}
                    isRead={readIds.has(n.id)}
                    onPress={() => handleCardPress(n)}
                    overrideBody={n.kind === 'request' ? requestBody(n) : undefined}
                  >
                    {n.kind === 'request' && (
                      <Button
                        size="sm"
                        variant="gold"
                        style={{ paddingHorizontal: 10 }}
                        onPress={() => {
                          setReadIds((prev) => new Set([...prev, n.id]));
                          router.push('/request/incoming');
                        }}
                      >
                        {t('notifications.view')}
                      </Button>
                    )}
                  </Card>
                ))}
              </View>
            </>
          ) : null}

          {/* Yesterday */}
          {yesterdayFiltered.length > 0 ? (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 18 }]}>{t('notifications.yesterday')}</Text>
              <View style={{ gap: 10 }}>
                {yesterdayFiltered.map((n, i) => (
                  <Card
                    key={n.id}
                    n={n}
                    rotate={i === 0 ? -0.3 : i === 2 ? 0.4 : 0}
                    isRead={readIds.has(n.id)}
                    onPress={() => handleCardPress(n)}
                    overrideBody={n.kind === 'request' ? requestBody(n) : undefined}
                  />
                ))}
              </View>
            </>
          ) : null}

          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>{t('setx.emptyNotifs')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </PaperBackground>
  );
}

function Card({
  n,
  rotate,
  isRead,
  onPress,
  overrideBody,
  children,
}: {
  n: Notification;
  rotate: number;
  isRead: boolean;
  onPress: () => void;
  overrideBody?: string;
  children?: React.ReactNode;
}) {
  const colors = useThemeColors();

  const inkOffset = !isRead && n.emphasis === 'red'
    ? colors.stampRed
    : !isRead && n.emphasis === 'gold'
    ? colors.goldDeep
    : null;
  const bg = isRead
    ? colors.cardWhite
    : n.emphasis === 'gold'
    ? 'rgba(217,181,102,0.15)'
    : colors.cardWhite;
  const borderColor = isRead
    ? colors.inkLine
    : n.emphasis === 'gold'
    ? colors.goldDeep
    : n.emphasis === 'red'
    ? colors.ink
    : colors.inkLine;

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          borderWidth: 1.5,
          paddingHorizontal: 12,
          paddingVertical: 10,
        },
        {
          backgroundColor: bg,
          borderColor,
          transform: [{ rotate: `${rotate}deg` }],
          shadowColor: inkOffset ?? 'transparent',
          shadowOpacity: inkOffset ? 1 : 0,
          shadowOffset: { width: 3, height: 3 },
          shadowRadius: 0,
          elevation: inkOffset ? 3 : 0,
          opacity: isRead ? 0.6 : 1,
        },
      ]}
    >
      {n.kind === 'request' ? (
        <View style={{ width: 38, height: 38, backgroundColor: colors.stampGreen, alignItems: 'center', justifyContent: 'center' }}>
          <Camera size={18} color={colors.polaroid} />
        </View>
      ) : n.kind === 'spot' ? (
        <View style={{ width: 38, height: 38, backgroundColor: colors.stampBlue, alignItems: 'center', justifyContent: 'center' }}>
          <MapPin size={18} color={colors.polaroid} />
        </View>
      ) : n.kind === 'badge' ? (
        <Stamp shape="circle" color="gold" size={38} fontSize={7}>{`TOP\n3 %\n★`}</Stamp>
      ) : (
        <Polaroid width={38} height={32} noCaption rotate={-3} source={n.avatar ? { uri: n.avatar } : undefined} />
      )}
      <View style={{ flex: 1 }}>
        <RichText text={overrideBody ?? n.body} />
        <Text style={[{ fontFamily: fonts.hand, fontSize: 13, color: colors.inkFaded, marginTop: 2 }, !isRead && n.emphasis === 'red' && { color: colors.stampRed }]}>
          {n.meta ?? n.time}
        </Text>
      </View>
      {n.kind === 'karma' && (
        <Stamp color="gold" size={32} fontSize={7}>+15{'\n'}★</Stamp>
      )}
      {children}
    </Pressable>
  );
}

function RichText({ text }: { text: string }) {
  const colors = useThemeColors();
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
  return (
    <Text style={{ fontFamily: fonts.serif, fontSize: 13, lineHeight: 18, color: colors.ink }}>
      {parts.map((p, i) => {
        if (p.startsWith('**')) {
          return (
            <Text key={i} style={{ fontFamily: fonts.serifBold, color: p.includes('+15') ? colors.goldDeep : colors.ink }}>
              {p.slice(2, -2)}
            </Text>
          );
        }
        if (p.startsWith('*')) {
          return (
            <Text key={i} style={{ fontFamily: fonts.serifItalic, fontStyle: 'italic', color: colors.ink }}>
              {p.slice(1, -1)}
            </Text>
          );
        }
        return p;
      })}
    </Text>
  );
}
