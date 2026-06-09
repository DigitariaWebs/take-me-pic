import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ImageIcon, Grid2x2, Repeat, Sparkles, Zap } from 'lucide-react-native';
import { HomeIndicator } from '@/shared/ui/iOSChrome';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';
import { useRole } from '@/shared/providers/RoleProvider';
import { leo } from '@/shared/data/mock';

const MODES = ['PORTRAIT', 'LARGE', 'CARRÉ'] as const;
type Mode = typeof MODES[number];

/** 10 · Dans le viseur. */
export default function PhotoSession() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isHelper } = useRole();
  const recordPulse = useRef(new Animated.Value(0)).current;

  // Session timer (counts up)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Shot counter
  const [shots, setShots] = useState(0);

  // Flash overlay opacity
  const flashOpacity = useRef(new Animated.Value(0)).current;

  // Mode cycling
  const [modeIndex, setModeIndex] = useState(0);
  const currentMode: Mode = MODES[modeIndex % MODES.length];

  // Record dot pulse
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(recordPulse, { toValue: 1, duration: 2000, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [recordPulse]);

  // Timer tick
  useEffect(() => {
    const id = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const timerMins = Math.floor(elapsedSeconds / 60);
  const timerSecs = elapsedSeconds % 60;
  const timerLabel = `${String(timerMins).padStart(2, '0')}:${String(timerSecs).padStart(2, '0')}`;

  function triggerFlash() {
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.85, duration: 60, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }

  function handleShutter() {
    const newShots = shots + 1;
    triggerFlash();
    setShots(newShots);
    if (newShots >= 3) {
      // Small delay so the user sees the flash before navigating
      setTimeout(() => {
        router.replace('/session/gallery');
      }, 350);
    }
  }

  function handleTerminer() {
    router.replace('/session/gallery');
  }

  function cycleMode() {
    setModeIndex((i) => (i + 1) % MODES.length);
  }

  // Seeker (pose) variant — same photo background, no shutter controls
  if (!isHelper) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Image source={{ uri: 'https://picsum.photos/seed/parisscene/400/900' }} style={StyleSheet.absoluteFill} />

        <View style={[styles.topRow, { paddingTop: insets.top + 12 }]}>
          <View style={styles.sessionTag}>
            <Animated.View
              style={[
                styles.recordDot,
                { opacity: recordPulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
              ]}
            />
            <Text style={styles.sessionTagText}>{t('session.timer', { time: timerLabel })}</Text>
          </View>
        </View>

        {/* Centered pose note */}
        <View style={styles.poseCenterWrap} pointerEvents="none">
          <View style={styles.poseNote}>
            <Text style={styles.poseTitleText}>{t('flow.poseTitle', { name: leo.firstName })}</Text>
          </View>
        </View>

        {/* Coaching line */}
        <View style={[styles.coachNote, { top: 430 }]}>
          <Sparkles size={20} color={colors.goldDeep} />
          <Text style={styles.coachText}>{t('flow.poseHint')}</Text>
        </View>

        {/* Bottom guide line */}
        <View style={[styles.poseLine, { bottom: insets.bottom + 130 }]} pointerEvents="none" />

        {/* See photos button */}
        <View style={[styles.seePhotosWrap, { bottom: insets.bottom + 40 }]}>
          <Pressable style={styles.seePhotosBtn} onPress={() => router.replace('/session/gallery')}>
            <Text style={styles.seePhotosText}>{t('flow.seePhotos')}</Text>
          </Pressable>
        </View>

        <HomeIndicator light />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image source={{ uri: 'https://picsum.photos/seed/parisscene/400/900' }} style={StyleSheet.absoluteFill} />

      {/* Flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: flashOpacity, zIndex: 20 }]}
      />

      <View style={[styles.topRow, { paddingTop: insets.top + 12 }]}>
        <View style={styles.sessionTag}>
          <Animated.View
            style={[
              styles.recordDot,
              { opacity: recordPulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
            ]}
          />
          <Text style={styles.sessionTagText}>{t('session.timer', { time: timerLabel })}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Square styles={styles}><Zap size={18} color={colors.ink} /></Square>
          <Square styles={styles}><Repeat size={18} color={colors.ink} /></Square>
        </View>
      </View>

      {/* Viewfinder */}
      <View style={[styles.viewfinder, { top: insets.top + 90 }]} pointerEvents="none">
        <Corner styles={styles} pos="tl" />
        <Corner styles={styles} pos="tr" />
        <Corner styles={styles} pos="bl" />
        <Corner styles={styles} pos="br" />
        <View style={styles.crossV} />
        <View style={styles.crossH} />
      </View>

      {/* Shot counter badge */}
      {shots > 0 && (
        <View style={[styles.shotBadge, { top: insets.top + 90 + 8, right: 38 }]}>
          <Text style={styles.shotBadgeText}>{shots > 1 ? t('flow.shotMany', { n: shots }) : t('flow.shotOne', { n: shots })}</Text>
        </View>
      )}

      {/* Coaching note */}
      <View style={[styles.coachNote, { top: 430 }]}>
        <Sparkles size={20} color={colors.goldDeep} />
        <Text style={styles.coachText}>{t('session.coachHint')}</Text>
      </View>

      {/* Shutter */}
      <View style={[styles.shutterRow, { bottom: insets.bottom + 90 }]}>
        <Square styles={styles}><ImageIcon size={22} color={colors.ink} /></Square>
        <Pressable
          style={styles.shutter}
          onPress={handleShutter}
        />
        <Square styles={styles}><Grid2x2 size={22} color={colors.ink} /></Square>
      </View>

      {/* Mode label — tapping cycles modes */}
      <Pressable onPress={cycleMode} style={[styles.modesWrap, { bottom: insets.bottom + 30 }]}>
        <Text style={styles.modes}>{currentMode}</Text>
      </Pressable>

      {/* Terminer affordance */}
      <Pressable onPress={handleTerminer} style={[styles.terminerWrap, { top: insets.top + 12, left: 16 }]}>
        <Text style={styles.terminerText}>{t('flow.sessionEnd')}</Text>
      </Pressable>

      <HomeIndicator light />
    </View>
  );
}

function Square({ children, styles }: { children: React.ReactNode; styles: ReturnType<typeof makeStyles> }) {
  return <View style={styles.square}>{children}</View>;
}

function Corner({ pos, styles }: { pos: 'tl' | 'tr' | 'bl' | 'br'; styles: ReturnType<typeof makeStyles> }) {
  const map: Record<typeof pos, object> = {
    tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
    tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
    bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
    br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  };
  return <View style={[styles.corner, map[pos]]} />;
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  topRow: { paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 5 },
  sessionTag: {
    backgroundColor: colors.cardWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.inkSurface,
  },
  recordDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.stampRed },
  sessionTagText: { fontFamily: fonts.type, fontSize: 11, color: colors.inkSurface },
  square: {
    width: 36,
    height: 36,
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.inkSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinder: { position: 'absolute', left: 30, right: 30, bottom: 240 },
  corner: { position: 'absolute', width: 34, height: 34, borderColor: colors.goldLight },
  crossV: { position: 'absolute', top: '50%', left: '50%', width: 1.5, height: 24, backgroundColor: 'rgba(253,249,237,0.6)', marginLeft: -1, marginTop: -12 },
  crossH: { position: 'absolute', top: '50%', left: '50%', width: 24, height: 1.5, backgroundColor: 'rgba(253,249,237,0.6)', marginTop: -1, marginLeft: -12 },
  shotBadge: {
    position: 'absolute',
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: colors.goldLight,
    zIndex: 10,
  },
  shotBadgeText: { fontFamily: fonts.type, fontSize: 10, color: colors.goldLight, letterSpacing: 1.2 },
  coachNote: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    transform: [{ rotate: '-1.5deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 5,
  },
  coachText: { flex: 1, fontFamily: fonts.hand, fontSize: 18, color: colors.ink, lineHeight: 22 },
  shutterRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  shutter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.goldLight,
    borderWidth: 5,
    borderColor: colors.ink,
    shadowColor: 'rgba(253,249,237,0.4)',
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 6,
  },
  modesWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  modes: { color: colors.goldLight, fontFamily: fonts.type, fontSize: 11, letterSpacing: 1.8 },
  terminerWrap: {
    position: 'absolute',
    backgroundColor: 'rgba(253,249,237,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(253,249,237,0.4)',
  },
  terminerText: { fontFamily: fonts.type, fontSize: 10, color: colors.goldLight, letterSpacing: 1.2 },
  // Seeker (pose) variant styles
  poseCenterWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poseNote: {
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.inkSurface,
    paddingHorizontal: 22,
    paddingVertical: 16,
    transform: [{ rotate: '-2deg' }],
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 5,
  },
  poseTitleText: { fontFamily: fonts.hand, fontSize: 26, color: colors.ink, textAlign: 'center' },
  poseLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: colors.goldLight,
    opacity: 0.7,
  },
  seePhotosWrap: { position: 'absolute', left: 22, right: 22, alignItems: 'center' },
  seePhotosBtn: {
    backgroundColor: colors.goldLight,
    borderWidth: 1.5,
    borderColor: colors.ink,
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: 'center',
  },
  seePhotosText: { fontFamily: fonts.type, fontSize: 12, color: colors.ink, letterSpacing: 1.5 },
});
