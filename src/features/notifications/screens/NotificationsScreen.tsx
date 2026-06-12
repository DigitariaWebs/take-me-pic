import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, MapPin, BellOff } from 'lucide-react-native';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar } from '@/shared/ui/iOSChrome';
import { Polaroid } from '@/shared/ui/Polaroid';
import { Stamp } from '@/shared/ui/Stamp';
import { Chip } from '@/shared/ui/Chip';
import { Button } from '@/shared/ui/Button';
import { Squiggle } from '@/shared/ui/Squiggle';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import type { NotificationKind } from '@/shared/lib/supabase';
import { t } from '@/shared/lib/i18n';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../hooks/useNotifications';
import { usePushPermission } from '../hooks/usePushPermission';
import { routeFromNotificationData } from '../lib/push';
import type { NotificationRow } from '../api/notifications-api';

type FilterKind = 'toutes' | 'demandes' | 'karma' | 'communauté';

const FILTER_KINDS: Record<FilterKind, NotificationKind | null> = {
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

type NotifVM = {
  id: number;
  kind: NotificationKind;
  body: string;
  meta?: string;
  emphasis?: 'gold' | 'red' | 'normal';
  read: boolean;
  isToday: boolean;
  time: string;
  data: NotificationRow['data'];
};

/** Short relative label shown under each card. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMin = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  return `il y a ${diffD} j`;
}

function isSameDay(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function toViewModel(row: NotificationRow): NotifVM {
  const emphasis = row.emphasis === 'gold' || row.emphasis === 'red' || row.emphasis === 'normal'
    ? row.emphasis
    : undefined;
  return {
    id: row.id,
    kind: row.kind,
    body: row.body,
    meta: row.meta ?? undefined,
    emphasis,
    read: row.read_at != null,
    isToday: isSameDay(row.created_at),
    time: relativeTime(row.created_at),
    data: row.data,
  };
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  markAll: { fontFamily: fonts.hand, fontSize: 16, color: colors.goldDeep },
  markAllDone: { color: colors.stampGreen },
  headline: { fontFamily: fonts.hand, fontSize: 24, color: colors.ink, lineHeight: 28 },
  chipRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  sectionLabel: { fontFamily: fonts.type, fontSize: 10, color: colors.inkFaded, letterSpacing: 1.8, marginBottom: 8 },
  emptyText: { fontFamily: fonts.hand, fontSize: 16, color: colors.inkFaded, textAlign: 'center', marginTop: 40 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 22,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: 'rgba(217,181,102,0.15)',
  },
  bannerTitle: { fontFamily: fonts.serifBold, fontSize: 13, color: colors.ink },
  bannerBody: { fontFamily: fonts.hand, fontSize: 13, color: colors.inkFaded, marginTop: 1 },
});

/** 27 · La pile de notes. */
export default function Notifications() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const { data: rows, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const { status: pushStatus, enable: enablePush } = usePushPermission();

  const [activeFilter, setActiveFilter] = useState<FilterKind>('toutes');

  const notifs = useMemo(() => (rows ?? []).map(toViewModel), [rows]);
  const kindFilter = FILTER_KINDS[activeFilter];

  const filtered = kindFilter ? notifs.filter((n) => n.kind === kindFilter) : notifs;
  const todayFiltered = filtered.filter((n) => n.isToday);
  const earlierFiltered = filtered.filter((n) => !n.isToday);

  const unreadCount = notifs.filter((n) => !n.read).length;
  const allRead = notifs.length > 0 && unreadCount === 0;
  const showPushBanner = pushStatus != null && pushStatus !== 'granted';

  function handleMarkAll() {
    if (unreadCount > 0) markAll.mutate();
  }

  function openNotif(n: NotifVM) {
    if (!n.read) markRead.mutate(n.id);
    routeFromNotificationData(n.data);
  }

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={<View style={{ width: 30 }} />}
          title={t('notifications.title')}
          right={
            <Pressable onPress={handleMarkAll} hitSlop={8} disabled={allRead}>
              <Text style={[styles.markAll, allRead && styles.markAllDone]}>
                {allRead ? t('setx.allRead') : t('notifications.markAll')}
              </Text>
            </Pressable>
          }
        />
      </View>

      {showPushBanner ? (
        <Pressable style={styles.banner} onPress={enablePush} testID="push-off-banner">
          <BellOff size={20} color={colors.ink} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{t('notifications.pushOffTitle')}</Text>
            <Text style={styles.bannerBody}>{t('notifications.pushOffBody')}</Text>
          </View>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
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
          {isLoading ? (
            <View style={{ paddingTop: 40, alignItems: 'center', gap: 12 }}>
              <ActivityIndicator color={colors.goldDeep} />
              <Text style={styles.emptyText}>{t('notifications.loading')}</Text>
            </View>
          ) : (
            <>
              {/* Today */}
              {todayFiltered.length > 0 ? (
                <>
                  <Text style={styles.sectionLabel}>{t('notifications.today')}</Text>
                  <View style={{ gap: 10 }}>
                    {todayFiltered.map((n, i) => (
                      <Card key={n.id} n={n} rotate={i % 2 === 0 ? -0.4 : 0.4} onPress={() => openNotif(n)}>
                        {n.kind === 'request' && (
                          <Button
                            size="sm"
                            variant="gold"
                            style={{ paddingHorizontal: 10 }}
                            onPress={() => openNotif(n)}
                          >
                            {t('notifications.view')}
                          </Button>
                        )}
                      </Card>
                    ))}
                  </View>
                </>
              ) : null}

              {/* Earlier */}
              {earlierFiltered.length > 0 ? (
                <>
                  <Text style={[styles.sectionLabel, { marginTop: 18 }]}>{t('notifications.yesterday')}</Text>
                  <View style={{ gap: 10 }}>
                    {earlierFiltered.map((n, i) => (
                      <Card key={n.id} n={n} rotate={i % 2 === 0 ? -0.3 : 0.4} onPress={() => openNotif(n)} />
                    ))}
                  </View>
                </>
              ) : null}

              {filtered.length === 0 ? (
                <Text style={styles.emptyText}>{t('setx.emptyNotifs')}</Text>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </PaperBackground>
  );
}

function Card({
  n,
  rotate,
  onPress,
  children,
}: {
  n: NotifVM;
  rotate: number;
  onPress: () => void;
  children?: React.ReactNode;
}) {
  const colors = useThemeColors();
  const isRead = n.read;

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
        <Polaroid width={38} height={32} noCaption rotate={-3} />
      )}
      <View style={{ flex: 1 }}>
        <RichText text={n.body} />
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
