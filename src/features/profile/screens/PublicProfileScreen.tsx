import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Camera, MoreHorizontal, Share2 } from 'lucide-react-native';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { HandMap } from '@/shared/ui/HandMap';
import { Polaroid } from '@/shared/ui/Polaroid';
import { Stamp } from '@/shared/ui/Stamp';
import { Chip } from '@/shared/ui/Chip';
import { Button } from '@/shared/ui/Button';
import { Tape } from '@/shared/ui/Tape';
import { Flag } from '@/shared/ui/Flag';
import { findUser, galleryPhotos } from '@/shared/data/mock';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';
import { useRole } from '@/shared/providers/RoleProvider';

/**
 * 06 · Carte de visite — bottom sheet style ("nearby" mini profile).
 * 16 · Page de quelqu'un d'autre — full-page public profile ("?full=1").
 */

// ─── styles factory ───────────────────────────────────────────────────────────
const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.paperWarm,
      borderTopWidth: 1.5,
      borderColor: colors.ink,
      paddingHorizontal: 22,
      paddingTop: 18,
    },
    grabber: {
      width: 60,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.inkFaded,
      opacity: 0.4,
      alignSelf: 'center',
      marginBottom: 18,
    },
    name: { fontFamily: fonts.serifBold, fontSize: 24, color: colors.ink, letterSpacing: -0.4 },
    rating: { fontFamily: fonts.hand, fontSize: 18, color: colors.goldDeep, marginTop: 4 },
    chipRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
    verifiedStamp: {
      borderWidth: 1.5,
      borderColor: colors.stampGreen,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 4,
      backgroundColor: colors.cardWhite,
      transform: [{ rotate: '-4deg' }],
    },
    verifiedText: { fontFamily: fonts.type, fontSize: 10, color: colors.stampGreen, fontWeight: '700' },
    bio: {
      fontFamily: fonts.hand,
      fontSize: 20,
      color: colors.ink,
      marginTop: 16,
      marginBottom: 16,
      paddingLeft: 12,
      borderLeftWidth: 3,
      borderColor: colors.gold,
      lineHeight: 24,
    },
    stats: {
      flexDirection: 'row',
      gap: 14,
      paddingVertical: 14,
      borderTopWidth: 1.5,
      borderBottomWidth: 1.5,
      borderColor: colors.inkLine,
      borderStyle: 'dashed',
      marginBottom: 18,
    },
    stat: { flex: 1 },
    statValue: { fontFamily: fonts.serifBlack, fontSize: 22, color: colors.ink },
    statLabel: { fontFamily: fonts.type, fontSize: 9, color: colors.inkFaded, letterSpacing: 1, marginTop: 2 },
    coverIcon: { color: colors.onInk },
    handle: { fontFamily: fonts.hand, fontSize: 17, color: colors.inkFaded, marginTop: 2 },
    publicBio: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink, marginTop: 10 },
    statStrip: {
      flexDirection: 'row',
      marginTop: 18,
      borderWidth: 1.5,
      borderColor: colors.ink,
      backgroundColor: colors.cardWhite,
    },
    statCell: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRightWidth: 1.5,
      borderColor: colors.inkLine,
      borderStyle: 'dashed',
    },
    statBig: { fontFamily: fonts.serifBold, fontSize: 18, color: colors.ink },
    statSmall: { fontFamily: fonts.type, fontSize: 9, color: colors.inkFaded, letterSpacing: 1 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16 },
    gridImg: { width: '32%', aspectRatio: 1, borderWidth: 1.5, borderColor: colors.ink },
  });

export default function UserPage() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, full, dist } = useLocalSearchParams<{ id: string; full?: string; dist?: string }>();
  const user = useMemo(() => findUser(id), [id]);
  const [following, setFollowing] = useState(false);
  const { isHelper } = useRole();

  if (full === '1') return <FullProfile userId={id} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.paperWarm }}>
      <HandMap style={{ opacity: 0.85 }} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(42,31,26,0.18)' }]} pointerEvents="none" />
      {/* Pin marker so it reads like a tap from the map */}
      <View style={{ position: 'absolute', top: 200, left: 170 }}>
        <Polaroid width={48} height={48} dark noCaption source={{ uri: user.avatar }} />
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.grabber} />

        <View style={{ flexDirection: 'row', gap: 18, alignItems: 'flex-start' }}>
          {/* Tapping the photo opens the full public profile */}
          <Pressable onPress={() => router.push({ pathname: '/user/[id]', params: { id: user.id, full: '1' } })}>
            <Polaroid
              width={120}
              height={120}
              source={{ uri: user.avatar }}
              caption={`${user.firstName}, ${user.age}`}
              captionSize={14}
              rotate={-4}
            />
          </Pressable>
          <View style={{ flex: 1, paddingTop: 8 }}>
            <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.rating}>
              ★ {user.rating.toFixed(1).replace('.', ',')} · {user.photosCount} photos · {dist ? `${dist} m` : user.city}
            </Text>
            <View style={styles.chipRow}>
              {user.languages.map((l) => (
                <Chip key={l} leading={<Flag size={15}>{l}</Flag>} size="sm">
                  {' '}
                </Chip>
              ))}
            </View>
            {user.verified && (
              <View style={{ marginTop: 10, alignSelf: 'flex-start' }}>
                <View style={styles.verifiedStamp}>
                  <Text style={styles.verifiedText}>{t('miniProfile.verified')}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Follow button row */}
        <View style={{ marginTop: 10, alignSelf: 'flex-start' }}>
          <Chip
            variant={following ? 'filled' : 'outline'}
            color={following ? 'green' : 'ink'}
            onPress={() => setFollowing((v) => !v)}
          >
            {following ? t('flow.following') : t('flow.follow')}
          </Chip>
        </View>

        <Text style={styles.bio}>{user.bio}</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.goldDeep }]}>{user.karma}</Text>
            <Text style={styles.statLabel}>{t('miniProfile.karma')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.photosCount}</Text>
            <Text style={styles.statLabel}>{t('miniProfile.photos')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{t('flow.memberYears')}</Text>
            <Text style={styles.statLabel}>{t('miniProfile.member')}</Text>
          </View>
        </View>

        <Button
          full
          variant="ink"
          icon={<Camera size={18} color={colors.paperWarm} />}
          onPress={() => router.replace({ pathname: '/request/sent', params: { id: user.id } })}
        >
          {isHelper ? t('flow.offerPhoto') : t('flow.askPhoto')}
        </Button>
        <View style={{ marginTop: 8 }}>
          <Button
            full
            variant="ghost"
            icon={<MessageCircle size={16} color={colors.ink} />}
            onPress={() => router.push(`/chat/${user.id}`)}
          >
            {t('miniProfile.sendMessage')}
          </Button>
        </View>
      </View>
    </View>
  );
}

type ProfileTab = 'photos' | 'spots' | 'aimés';

function FullProfile({ userId }: { userId: string }) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useMemo(() => findUser(userId), [userId]);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('photos');

  const tabs: ProfileTab[] = ['photos', 'spots', 'aimés'];

  // Different seed sets per tab for visual variety
  const tabSeeds: Record<ProfileTab, string[]> = {
    photos: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
    spots: ['s1', 's2', 's3', 's4'],
    aimés: ['a1', 'a2', 'a3', 'a4', 'a5'],
  };

  return (
    <PaperBackground tone="paper">
      {/* Cover photo */}
      <View style={{ height: 220 }}>
        {user.cover ? (
          <Image source={{ uri: user.cover }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
        <View style={{ paddingTop: insets.top + 8, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18 }}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.coverIcon, { fontFamily: fonts.hand, fontSize: 22 }]}>← {t('common.back')}</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <Share2 size={22} color={colors.onInk} />
            <MoreHorizontal size={22} color={colors.onInk} />
          </View>
        </View>
        <View style={{ position: 'absolute', bottom: 14, right: 14 }}>
          <Stamp color="red" size={78} fontSize={8} rotate={-12}>{`MARRAKECH\n★\n2026`}</Stamp>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>
        <View style={{ marginTop: -60, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Polaroid width={130} height={130} rotate={-4} source={{ uri: user.avatar }} caption={`${user.firstName}, ${user.age}`}>
            <Tape color="red" rotate={-3} width={56} style={{ position: 'absolute', top: -10, left: 37 }} />
          </Polaroid>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
            <Button
              variant="paper"
              size="sm"
              icon={<MessageCircle size={14} color={colors.ink} />}
              onPress={() => router.push(`/chat/${user.id}`)}
            >
              {' '}
            </Button>
            <Button
              variant={following ? 'gold' : 'ink'}
              size="sm"
              onPress={() => setFollowing((v) => !v)}
            >
              {following ? t('flow.following') : t('flow.follow')}
            </Button>
          </View>
        </View>

        <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
          <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.handle}>{user.username} · {user.city}</Text>
          {/* Language flags via <Flag> */}
          <View style={[styles.chipRow, { marginTop: 8 }]}>
            {user.languages.map((l) => (
              <Chip key={l} size="sm" leading={<Flag size={14}>{l}</Flag>}>
                {' '}
              </Chip>
            ))}
          </View>
          <Text style={styles.publicBio}>{user.bio}</Text>

          <View style={styles.statStrip}>
            {[
              { v: user.followers ? `${(user.followers / 1000).toFixed(1)}k` : '—', l: t('flow.statFollowers') },
              { v: user.following ? `${user.following}` : '—', l: t('flow.statFollowing') },
              { v: `${user.karma}`, l: t('flow.statKarma'), gold: true },
              { v: `${user.spots ?? 0}`, l: t('flow.statSpots') },
            ].map((s) => (
              <View key={s.l} style={[styles.statCell, s.gold && { backgroundColor: 'rgba(217,181,102,0.3)' }]}>
                <Text style={[styles.statBig, s.gold && { color: colors.goldDeep }]}>{s.v}</Text>
                <Text style={styles.statSmall}>{s.l}</Text>
              </View>
            ))}
          </View>

          {/* Tabs */}
          <View style={[styles.chipRow, { marginTop: 18 }]}>
            {tabs.map((tab) => (
              <Chip
                key={tab}
                variant={activeTab === tab ? 'filled' : 'outline'}
                onPress={() => setActiveTab(tab)}
              >
                {tab === 'photos' ? t('flow.tabPhotos') : tab === 'spots' ? t('flow.tabSpots') : t('flow.tabLiked')}
              </Chip>
            ))}
          </View>

          {/* Tab content */}
          {activeTab === 'photos' && (
            <View style={styles.grid}>
              {tabSeeds.photos.map((seed, i) => (
                <Image
                  key={seed}
                  source={{ uri: `https://picsum.photos/seed/${seed}/200` }}
                  style={styles.gridImg}
                />
              ))}
            </View>
          )}

          {activeTab === 'spots' && (
            <View style={styles.grid}>
              {tabSeeds.spots.map((seed) => (
                <View key={seed} style={[styles.gridImg, { overflow: 'hidden', position: 'relative' }]}>
                  <Image
                    source={{ uri: `https://picsum.photos/seed/${seed}/200` }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                  <View style={{ position: 'absolute', bottom: 4, left: 4 }}>
                    <Stamp color="blue" size={38} fontSize={7} rotate={-6}>SPOT</Stamp>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'aimés' && (
            <View style={styles.grid}>
              {tabSeeds.aimés.map((seed) => (
                <View key={seed} style={[styles.gridImg, { overflow: 'hidden', position: 'relative' }]}>
                  <Image
                    source={{ uri: `https://picsum.photos/seed/${seed}/200` }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                  <View style={{ position: 'absolute', top: 4, right: 4 }}>
                    <Text style={{ fontSize: 14 }}>❤️</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </PaperBackground>
  );
}
