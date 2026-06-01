import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Mic, Plus, Send } from 'lucide-react-native';
import { fonts, radii, spacing, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { fmtDuration } from '@/components/chat/types';
import { t } from '@/i18n';

export interface ComposerProps {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  onAttach: () => void;
  onRecordStart: () => void;
  onRecordStop: () => void;
  recording: boolean;
  recordSeconds: number;
}

export function Composer({
  value,
  onChangeText,
  onSend,
  onAttach,
  onRecordStart,
  onRecordStop,
  recording,
  recordSeconds,
}: ComposerProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const hasText = value.trim().length > 0;

  // Pulsing animation for the recording dot
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (recording) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => {
      pulseLoop.current?.stop();
    };
  }, [recording, pulseAnim]);

  return (
    <View style={styles.bar}>
      {/* Attach button */}
      <Pressable
        style={({ pressed }) => [styles.squareBtn, pressed && styles.pressed]}
        onPress={onAttach}
        hitSlop={6}
        accessibilityLabel="joindre un fichier"
      >
        <Plus size={20} color={colors.ink2} strokeWidth={2} />
      </Pressable>

      {/* Middle: recording bar or text input */}
      <View style={styles.inputWrap}>
        {recording ? (
          <View style={styles.recordingRow}>
            <Animated.View style={[styles.redDot, { opacity: pulseAnim }]} />
            <Text style={styles.recordingLabel} numberOfLines={1}>
              {t('chatUi.recording') + ' '}
              <Text style={styles.recordingTimer}>{fmtDuration(recordSeconds)}</Text>
            </Text>
            <Text style={styles.cancelHint} numberOfLines={1}>
              {t('chatUi.slideToCancel')}
            </Text>
          </View>
        ) : (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={t('chatUi.composerPlaceholder')}
            placeholderTextColor={colors.inkFaded}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={onSend}
            blurOnSubmit={false}
            accessibilityLabel="zone de saisie du message"
          />
        )}
      </View>

      {/* Right: send or mic */}
      {hasText ? (
        <Pressable
          style={({ pressed }) => [styles.sendBtn, pressed && styles.pressed]}
          onPress={onSend}
          hitSlop={6}
          accessibilityLabel="envoyer"
        >
          <Send size={18} color={colors.gold} strokeWidth={2} />
        </Pressable>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.micBtn,
            recording && styles.micBtnActive,
            pressed && !recording && styles.pressed,
          ]}
          onPressIn={onRecordStart}
          onPressOut={onRecordStop}
          hitSlop={6}
          accessibilityLabel="maintenir pour enregistrer"
        >
          <Mic
            size={20}
            color={recording ? colors.stampRed : colors.ink2}
            strokeWidth={2}
          />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paperWarm,
    borderTopWidth: 1,
    borderTopColor: colors.inkLine,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },

  // Attach button
  squareBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.inkLine,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Input wrapper (grows to fill remaining space)
  inputWrap: {
    flex: 1,
    minHeight: 38,
    maxHeight: 80,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.inkLine,
    backgroundColor: colors.cardWhite,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },

  input: {
    fontFamily: fonts.hand,
    fontSize: 17,
    color: colors.ink,
    paddingVertical: 0, // keep single line tight
  },

  // Recording bar inside the input wrap
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.stampRed,
  },
  recordingLabel: {
    fontFamily: fonts.hand,
    fontSize: 15,
    color: colors.ink,
    flexShrink: 1,
  },
  recordingTimer: {
    fontFamily: fonts.type,
    fontSize: 13,
    color: colors.stampRed,
  },
  cancelHint: {
    fontFamily: fonts.type,
    fontSize: 10,
    color: colors.inkFaded,
    flexShrink: 0,
  },

  // Send button (inkSurface bg, gold icon — stays dark in both modes)
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.inkSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Mic button (paper style, turns active when recording)
  micBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.inkLine,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnActive: {
    borderColor: colors.stampRed,
    backgroundColor: 'rgba(168,54,46,0.08)',
  },

  // Generic press feedback
  pressed: {
    opacity: 0.7,
  },
});
