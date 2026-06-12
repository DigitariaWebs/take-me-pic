import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react-native';
import { Polaroid } from '@/shared/ui/Polaroid';
import { Stamp } from '@/shared/ui/Stamp';
import { Button } from '@/shared/ui/Button';
import { HomeIndicator } from '@/shared/ui/iOSChrome';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { useProfile } from '@/features/profile';
import { helpRequestApi, type HelpRequest } from '../api/help-request-api';
import { t } from '@/shared/lib/i18n';

// ─── styles factory ───────────────────────────────────────────────────────────
const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    time: { fontFamily: fonts.serifBold, fontSize: 78, color: colors.polaroid, letterSpacing: -2 },
    date: { fontFamily: fonts.hand, fontSize: 22, color: 'rgba(253,249,237,0.8)' },
    note: {
      marginHorizontal: 14,
      backgroundColor: colors.cardWhite,
      borderWidth: 1.5,
      borderColor: colors.ink,
      padding: 16,
      transform: [{ rotate: '-1.5deg' }],
      shadowColor: '#000',
      shadowOpacity: 0.45,
      shadowOffset: { width: 0, height: 20 },
      shadowRadius: 30,
      elevation: 10,
    },
    crease: { position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(42,31,26,0.06)' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    brandMark: { width: 22, height: 22, backgroundColor: colors.inkSurface, alignItems: 'center', justifyContent: 'center' },
    brandLetter: { color: colors.goldLight, fontFamily: fonts.serifBlack, fontSize: 11 },
    brandLabel: { fontFamily: fonts.type, fontSize: 11, color: colors.inkFaded, letterSpacing: 1, flex: 1 },
    countdownBadge: {
      backgroundColor: colors.stampRed,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: colors.ink,
    },
    countdownText: { fontFamily: fonts.type, fontSize: 10, color: colors.polaroid, letterSpacing: 0.5 },
    title: { fontFamily: fonts.hand, fontSize: 22, color: colors.ink, lineHeight: 26 },
    meta: { fontFamily: fonts.serif, fontSize: 13, color: colors.inkFaded, marginTop: 6 },
    actionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
    stampWrap: { position: 'absolute', top: -6, right: -12 },
    swipe: { position: 'absolute', left: 0, right: 0, textAlign: 'center', color: 'rgba(253,249,237,0.65)', fontFamily: fonts.hand, fontSize: 18 },
  });

/** Incoming help request — a helper views an open request and accepts it. */
export default function Incoming() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const requestId = id ? Number(id) : null;

  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: requester } = useProfile(request?.requester_id ?? '');
  const requesterName = requester?.first_name ?? '…';
  const requesterAvatar = requester?.avatar_url ?? null;

  // Load the request.
  useEffect(() => {
    if (requestId == null) return;
    let active = true;
    void helpRequestApi.getById(requestId).then((r) => {
      if (active) setRequest(r);
    });
    return () => {
      active = false;
    };
  }, [requestId]);

  // Countdown to the server-set expiry.
  useEffect(() => {
    if (!request?.expires_at) return;
    const tick = () =>
      setSecondsLeft(Math.max(0, Math.floor((new Date(request.expires_at).getTime() - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [request?.expires_at]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const countdownLabel = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const expired = request != null && secondsLeft <= 0;
  const open = request?.status === 'requested' && !expired;

  async function accept() {
    if (requestId == null || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await helpRequestApi.accept(requestId);
      router.replace(`/chat/${res.conversation_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'acceptation");
      setBusy(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image source={{ uri: 'https://picsum.photos/seed/streetparis/400/900' }} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0.8)'] as unknown as readonly [string, string]}
        style={StyleSheet.absoluteFill}
      />

      <View style={{ paddingTop: insets.top + 22, paddingHorizontal: 22, alignItems: 'center' }}>
        <Text style={styles.time}>{countdownLabel}</Text>
        <Text style={styles.date}>{t('flow.brandInstant')}</Text>
      </View>

      <View style={[styles.note, { marginTop: 40 }]}>
        <View style={styles.crease} />
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <Text style={styles.brandLetter}>T</Text>
          </View>
          <Text style={styles.brandLabel}>{t('flow.brandInstant')}</Text>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{countdownLabel}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
          <Polaroid
            width={64}
            height={60}
            dark
            source={{ uri: requesterAvatar ?? 'https://i.pravatar.cc/300?img=12' }}
            noCaption
            rotate={-4}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t('flow.incomingSeeker', { name: requesterName })}</Text>
            <Text style={styles.meta}>
              {request ? `${request.people_count} personne(s)${request.note ? ` · ${request.note}` : ''}` : '…'}
            </Text>
            {error ? <Text style={[styles.meta, { color: colors.stampRed }]}>{error}</Text> : null}
            {!open && request ? (
              <Text style={[styles.meta, { color: colors.stampRed }]}>{expired ? 'Demande expirée' : 'Demande déjà acceptée'}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <Button variant="ghost" size="sm" full onPress={() => router.back()}>
              {t('incomingRequest.decline')}
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              variant="gold"
              size="sm"
              full
              icon={<Camera size={14} color={colors.ink} />}
              onPress={() => void accept()}
              loading={busy}
              disabled={!open}
            >
              {t('flow.acceptSeeker')}
            </Button>
          </View>
        </View>
        <View style={styles.stampWrap}>
          <Stamp size={56} fontSize={7} color="red" rotate={14}>{countdownLabel + '\n★'}</Stamp>
        </View>
      </View>

      <Text style={[styles.swipe, { bottom: insets.bottom + 30 }]}>{t('incomingRequest.swipe')}</Text>
      <HomeIndicator light />
    </View>
  );
}
