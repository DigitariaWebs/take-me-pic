import { useMemo } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import { X, Camera } from 'lucide-react-native';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar, HomeIndicator } from '@/shared/ui/iOSChrome';
import { Stamp } from '@/shared/ui/Stamp';
import { Button } from '@/shared/ui/Button';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { useAuth } from '@/shared/providers';
import { useProfile } from '@/features/profile';
import { useBroadcastRequest } from '../hooks/useBroadcastRequest';
import { t } from '@/shared/lib/i18n';

// ─── styles factory ───────────────────────────────────────────────────────────
const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    pliNo: { fontFamily: fonts.type, fontSize: 11, color: colors.inkFaded },
    center: { flex: 1, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
    postcard: {
      width: 300,
      backgroundColor: colors.cardWhite,
      borderWidth: 1.5,
      borderColor: colors.ink,
      padding: 22,
      transform: [{ rotate: '-3deg' }],
      shadowColor: '#3c2814',
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 18 },
      shadowRadius: 24,
      elevation: 6,
      position: 'relative',
    },
    cornerStamp: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 64,
      height: 80,
      borderWidth: 1.5,
      borderColor: colors.inkFaded,
      borderStyle: 'dashed',
      backgroundColor: colors.stampRed,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stampInner: { color: colors.polaroid, fontFamily: fonts.type, fontSize: 9, textAlign: 'center', lineHeight: 11 },
    toLabel: { fontFamily: fonts.type, fontSize: 10, color: colors.inkFaded, letterSpacing: 1.5 },
    toAddr: { fontFamily: fonts.hand, fontSize: 22, color: colors.ink, lineHeight: 24 },
    divider: { borderTopWidth: 1.5, borderColor: colors.inkLine, borderStyle: 'dashed', marginTop: 18, paddingTop: 14 },
    handwriting: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink, lineHeight: 26 },
    avatarWrap: { marginTop: 30, width: 130, height: 130, alignItems: 'center', justifyContent: 'center' },
    pulse: {
      position: 'absolute',
      width: 156,
      height: 156,
      borderRadius: 78,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.gold,
    },
    avatarBorder: { position: 'absolute', width: 132, height: 132, borderRadius: 66, borderWidth: 1.5, borderColor: colors.gold },
    avatar: { width: 122, height: 122, borderRadius: 61 },
    acceptStamp: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    waiting: { fontFamily: fonts.hand, fontSize: 22, color: colors.ink, marginTop: 16, textAlign: 'center' },
    help: { fontFamily: fonts.serifItalic, fontStyle: 'italic', color: colors.inkFaded, fontSize: 13, marginTop: 4, textAlign: 'center', maxWidth: 240 },
    cancelledMsg: { fontFamily: fonts.hand, fontSize: 22, color: colors.stampRed, marginTop: 16, textAlign: 'center' },
    cta: { position: 'absolute', left: 22, right: 22 },
  });

/** Pli envoyé — broadcasts a help request and waits for a nearby helper to accept. */
export default function RequestSent() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { state, request, conversationId, cancel } = useBroadcastRequest(user?.id);

  const accepted = state === 'accepted';
  const cancelled = state === 'cancelled';
  const { data: helper } = useProfile(accepted ? request?.helper_id ?? '' : '');
  const helperName = helper?.first_name ?? '';
  const helperAvatar = helper?.avatar_url ?? null;

  const pulse = useRef(new Animated.Value(0)).current;
  const acceptAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 2400, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (accepted) {
      Animated.spring(acceptAnim, { toValue: 1, friction: 5, tension: 130, useNativeDriver: true }).start();
    }
  }, [accepted, acceptAnim]);

  // Once accepted and the conversation is linked, continue to the chat.
  useEffect(() => {
    if (accepted && conversationId != null) {
      const tmr = setTimeout(() => router.replace(`/chat/${conversationId}`), 1500);
      return () => clearTimeout(tmr);
    }
  }, [accepted, conversationId, router]);

  useEffect(() => {
    if (cancelled) {
      const tmr = setTimeout(() => router.replace('/(tabs)'), 900);
      return () => clearTimeout(tmr);
    }
  }, [cancelled, router]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.15] });
  const opacity = pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 0, 0] });
  const stampScale = acceptAnim.interpolate({ inputRange: [0, 1], outputRange: [2, 1] });
  const stampRotate = acceptAnim.interpolate({ inputRange: [0, 1], outputRange: ['-30deg', '-10deg'] });
  const stampOpacity = acceptAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.95, 0.92] });

  return (
    <PaperBackground tone="paper2">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={
            <Pressable onPress={() => router.back()}>
              <X size={20} color={colors.ink} />
            </Pressable>
          }
          title={<Text style={styles.pliNo}>{t('requestSent.pliNo', { n: request ? String(request.id) : '—' })}</Text>}
          right={null}
        />
      </View>

      <View style={styles.center}>
        {/* Postcard — addressed to "a nearby photographer", revealing the helper on accept */}
        <View style={styles.postcard}>
          <View style={styles.cornerStamp}>
            <Text style={styles.stampInner}>{`TMP\n★\n0,02€`}</Text>
          </View>
          <View style={{ paddingRight: 90 }}>
            <Text style={styles.toLabel}>{t('flow.postcardTo')}</Text>
            <Text style={styles.toAddr}>{accepted && helperName ? helperName : 'un photographe\nprès de toi'}</Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.handwriting}>
            {accepted && helperName ? t('flow.accepted', { name: helperName }) : t('requestSent.sub')}
          </Text>
          <View style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -60, marginTop: -60 }}>
            <Stamp size={120} fontSize={11} color={accepted ? 'green' : 'red'} rotate={-18}>{t('requestSent.stamp') + '\n★'}</Stamp>
          </View>
        </View>

        {/* Search indicator → helper avatar with pulse + accept stamp */}
        <View style={styles.avatarWrap}>
          {!accepted && <Animated.View style={[styles.pulse, { transform: [{ scale }], opacity }]} />}
          <View style={[styles.avatarBorder, accepted && { borderColor: colors.stampGreen }]} />
          {accepted && helperAvatar ? (
            <Image source={{ uri: helperAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.paper2, alignItems: 'center', justifyContent: 'center' }]}>
              <Camera size={44} color={colors.inkFaded} />
            </View>
          )}
          {accepted && (
            <Animated.View
              pointerEvents="none"
              style={[styles.acceptStamp, { opacity: stampOpacity, transform: [{ scale: stampScale }, { rotate: stampRotate }] }]}
            >
              <Stamp size={120} fontSize={13} color="green" rotate={0}>{`ACCEPTÉ\n★\n✓`}</Stamp>
            </Animated.View>
          )}
        </View>

        {cancelled ? (
          <Text style={styles.cancelledMsg}>{t('flow.cancelled')}</Text>
        ) : accepted ? (
          <>
            <Text style={[styles.waiting, { color: colors.stampGreen }]}>{t('flow.accepted', { name: helperName })}</Text>
            <Text style={styles.help}>{t('flow.goMeet')}</Text>
          </>
        ) : (
          <>
            <Text style={styles.waiting}>On cherche un photographe près de toi…</Text>
            <Text style={styles.help}>{t('requestSent.sub')}</Text>
          </>
        )}
      </View>

      <View style={[styles.cta, { bottom: insets.bottom + 26 }]}>
        <Button full variant="ghost" onPress={() => void cancel()} disabled={cancelled || accepted}>
          {cancelled ? t('flow.cancelled') : t('requestSent.cancel')}
        </Button>
      </View>
      <HomeIndicator />
    </PaperBackground>
  );
}
