import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Check, CheckCheck, Clock, Play } from 'lucide-react-native';
import { Tape } from '@/components/Tape';
import { fonts, radii, shadow, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import type { ChatMessage, MessageStatus } from '@/components/chat/types';
import { fmtDuration } from '@/components/chat/types';

// ─── Waveform ──────────────────────────────────────────────────────────────────
// 14 bars of varied heights to simulate a voice-message waveform.
const BAR_HEIGHTS = [6, 10, 14, 8, 18, 12, 20, 10, 16, 8, 14, 6, 12, 9];

function Waveform({ outgoing }: { outgoing: boolean }) {
  const colors = useThemeColors();
  // Outgoing: goldLight tinted. Incoming: use inkFaded token so it reads on
  // both light cardWhite (#fbf6e9) and dark cardWhite (#2a2018) surfaces.
  const barColor = outgoing ? 'rgba(217,181,102,0.7)' : colors.inkFaded;
  return (
    <View style={waveformStyles.waveform}>
      {BAR_HEIGHTS.map((h, i) => (
        <View
          key={i}
          style={[
            waveformStyles.waveBar,
            {
              height: h,
              backgroundColor: barColor,
            },
          ]}
        />
      ))}
    </View>
  );
}

// Waveform styles have no colour tokens — keep module-level
const waveformStyles = StyleSheet.create({
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
});

// ─── Delivery indicator ────────────────────────────────────────────────────────
function DeliveryIcon({ status }: { status: MessageStatus }) {
  const colors = useThemeColors();
  const size = 13;
  if (status === 'sending') {
    return <Clock size={size} color={colors.goldLight} strokeWidth={2} />;
  }
  if (status === 'read') {
    return <CheckCheck size={size} color={colors.gold} strokeWidth={2.5} />;
  }
  // sent
  return <Check size={size} color={colors.goldLight} strokeWidth={2.5} />;
}

// ─── MessageBubble ─────────────────────────────────────────────────────────────
export function MessageBubble({ message }: { message: ChatMessage }) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { kind, incoming, rotate = 0 } = message;

  // ── System message ────────────────────────────────────────────────────────
  if (kind === 'system') {
    return (
      <View style={styles.systemRow}>
        <Text style={styles.systemText}>
          {message.text ?? ''}
        </Text>
      </View>
    );
  }

  // ── Shared bubble container ───────────────────────────────────────────────
  const bubbleAlign = incoming ? styles.alignStart : styles.alignEnd;

  // ── Text bubble ──────────────────────────────────────────────────────────
  if (kind === 'text') {
    const bubbleStyle = incoming ? styles.bubbleIncoming : styles.bubbleOutgoing;
    const textStyle = incoming ? styles.textIncoming : styles.textOutgoing;

    // Hard shadow offset layer (paper feel)
    const shadowColor = incoming ? colors.kraft : colors.ink2;

    return (
      <View style={[styles.row, bubbleAlign]}>
        {/* Hard-offset shadow layer */}
        <View
          style={[
            styles.hardShadowBase,
            bubbleStyle,
            {
              backgroundColor: shadowColor,
              transform: [{ rotate: `${rotate}deg` }, { translateX: 4 }, { translateY: 4 }],
              position: 'absolute',
              zIndex: 0,
            },
          ]}
        />

        {/* Bubble itself */}
        <View
          style={[
            styles.bubble,
            bubbleStyle,
            { transform: [{ rotate: `${rotate}deg` }], zIndex: 1 },
          ]}
        >
          {/* Tape accent — incoming only, top corner */}
          {incoming && (
            <View style={styles.tapeWrapper} pointerEvents="none">
              <Tape color="cream" width={44} height={18} rotate={-6} />
            </View>
          )}

          <Text style={[styles.messageText, textStyle]}>
            {message.text ?? ''}
          </Text>

          {/* Meta row: time + delivery */}
          <View style={styles.metaRow}>
            <Text style={[styles.metaTime, incoming ? styles.metaTimeIncoming : styles.metaTimeOutgoing]}>
              {message.time}
            </Text>
            {!incoming && message.status && (
              <View style={styles.statusIcon}>
                <DeliveryIcon status={message.status} />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  // ── Image bubble ─────────────────────────────────────────────────────────
  if (kind === 'image') {
    const bubbleStyle = incoming ? styles.bubbleIncoming : styles.bubbleOutgoing;
    const shadowColor = incoming ? colors.kraft : colors.ink2;

    return (
      <View style={[styles.row, bubbleAlign]}>
        {/* Hard shadow */}
        <View
          style={[
            styles.hardShadowBase,
            styles.imageBubble,
            {
              backgroundColor: shadowColor,
              transform: [{ rotate: `${rotate}deg` }, { translateX: 4 }, { translateY: 4 }],
              position: 'absolute',
              zIndex: 0,
            },
          ]}
        />

        {/* Polaroid-style image card */}
        <View
          style={[
            styles.imageBubble,
            bubbleStyle,
            { transform: [{ rotate: `${rotate}deg` }], zIndex: 1, padding: 6 },
          ]}
        >
          {message.imageUri ? (
            <Image
              source={{ uri: message.imageUri }}
              style={styles.imageContent}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imageContent, styles.imagePlaceholder]} />
          )}
          <Text style={[styles.metaTime, styles.metaTimeIncoming, { marginTop: 4, textAlign: 'center' }]}>
            {message.time}
          </Text>
        </View>
      </View>
    );
  }

  // ── Voice bubble ─────────────────────────────────────────────────────────
  if (kind === 'voice') {
    const bubbleStyle = incoming ? styles.bubbleIncoming : styles.bubbleOutgoing;
    const shadowColor = incoming ? colors.kraft : colors.ink2;
    const playColor = incoming ? colors.ink : colors.goldLight;
    const durationColor = incoming ? colors.inkFaded : 'rgba(217,181,102,0.85)';

    return (
      <View style={[styles.row, bubbleAlign]}>
        {/* Hard shadow */}
        <View
          style={[
            styles.hardShadowBase,
            styles.voiceBubble,
            {
              backgroundColor: shadowColor,
              transform: [{ rotate: `${rotate}deg` }, { translateX: 4 }, { translateY: 4 }],
              position: 'absolute',
              zIndex: 0,
            },
          ]}
        />

        <View
          style={[
            styles.voiceBubble,
            bubbleStyle,
            { transform: [{ rotate: `${rotate}deg` }], zIndex: 1 },
          ]}
        >
          {/* Play icon in circle */}
          <View
            style={[
              styles.playCircle,
              { borderColor: incoming ? colors.kraft : colors.goldLight },
            ]}
          >
            <Play size={14} color={playColor} strokeWidth={2.5} fill={playColor} />
          </View>

          {/* Waveform */}
          <Waveform outgoing={!incoming} />

          {/* Duration */}
          <Text style={[styles.durationText, { color: durationColor }]}>
            {fmtDuration(message.voiceSeconds ?? 0)}
          </Text>
        </View>
      </View>
    );
  }

  return null;
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  // ── Layout ────────────────────────────────────────────────────────────────
  row: {
    maxWidth: '78%',
    marginVertical: 5,
    // position relative so the hard-shadow abs layer stays clipped to row
    position: 'relative',
  },
  alignStart: {
    alignSelf: 'flex-start',
    marginLeft: 12,
  },
  alignEnd: {
    alignSelf: 'flex-end',
    marginRight: 12,
  },

  // ── System ────────────────────────────────────────────────────────────────
  systemRow: {
    alignSelf: 'center',
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  systemText: {
    fontFamily: fonts.type,
    fontSize: 10,
    color: colors.inkFaded,
    textAlign: 'center',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // ── Shared bubble ─────────────────────────────────────────────────────────
  bubble: {
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingTop: 18,   // room for the tape accent on incoming
    paddingBottom: 8,
    borderWidth: 1.5,
    overflow: 'visible',
  },
  bubbleIncoming: {
    backgroundColor: colors.cardWhite,
    borderColor: colors.ink,
    // soft card shadow
    ...shadow.card,
  },
  bubbleOutgoing: {
    backgroundColor: colors.inkSurface,
    borderColor: colors.inkSurface,
    ...shadow.card,
  },

  // Hard-offset shadow base layer (shared shape properties)
  hardShadowBase: {
    borderRadius: radii.sm,
    opacity: 0.25,
  },

  // ── Tape accent ───────────────────────────────────────────────────────────
  tapeWrapper: {
    position: 'absolute',
    top: -8,
    left: 10,
    zIndex: 10,
  },

  // ── Text ──────────────────────────────────────────────────────────────────
  messageText: {
    fontFamily: fonts.hand,
    fontSize: 17,
    lineHeight: 23,
  },
  textIncoming: {
    color: colors.ink,
  },
  textOutgoing: {
    color: colors.goldLight,
    textAlign: 'right',
  },

  // ── Meta row ──────────────────────────────────────────────────────────────
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  metaTime: {
    fontFamily: fonts.type,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  metaTimeIncoming: {
    color: colors.inkFaded,
  },
  metaTimeOutgoing: {
    color: 'rgba(217,181,102,0.7)',
  },
  statusIcon: {
    marginLeft: 1,
  },

  // ── Image bubble ─────────────────────────────────────────────────────────
  imageBubble: {
    borderRadius: radii.sm,
    borderWidth: 1.5,
    padding: 6,
    overflow: 'hidden',
  },
  imageContent: {
    width: 180,
    height: 180,
    borderRadius: radii.xs,
    backgroundColor: colors.kraft,
  },
  imagePlaceholder: {
    backgroundColor: colors.kraftDeep,
    opacity: 0.4,
  },

  // ── Voice bubble ──────────────────────────────────────────────────────────
  voiceBubble: {
    borderRadius: radii.sm,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 180,
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  durationText: {
    fontFamily: fonts.type,
    fontSize: 10,
    letterSpacing: 0.5,
    flexShrink: 0,
  },
});
