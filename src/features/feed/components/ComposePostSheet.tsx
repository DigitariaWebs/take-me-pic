import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, MapPin, X } from 'lucide-react-native';
import { fonts, radii, spacing, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';
import { Tape } from '@/shared/ui/Tape';
import { Button } from '@/shared/ui/Button';

// ─── hard-shadow helper (mirrors design token pattern) ───────────────────────
const INK_SHADOW_OFFSET = 4;

interface ComposePostSheetProps {
  visible: boolean;
  onClose: () => void;
  onPublish: (caption: string, city: string) => void;
}

export function ComposePostSheet({ visible, onClose, onPublish }: ComposePostSheetProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [caption, setCaption] = useState('');
  const [city, setCity] = useState('');

  function handlePublish() {
    if (!caption.trim()) return;
    onPublish(caption.trim(), city.trim() || 'Paris');
    setCaption('');
    setCity('');
  }

  function handleClose() {
    setCaption('');
    setCity('');
    onClose();
  }

  const canPublish = caption.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── sheet background ───────────────────────────────────────── */}
        <View style={[styles.sheet, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>

          {/* ── header ─────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('feed.nouveauCliche')}</Text>
            <Pressable onPress={handleClose} hitSlop={10} style={styles.closeBtn}>
              <X size={20} color={colors.ink} strokeWidth={2.5} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* ── polaroid-framed photo placeholder ──────────────────── */}
            <View style={styles.polaroidWrapper}>
              {/* hard ink-offset shadow layer */}
              <View style={styles.polaroidShadow} />

              {/* polaroid card */}
              <View style={styles.polaroidCard}>
                {/* photo area */}
                <View style={styles.photoArea}>
                  <Image
                    source={{ uri: 'https://picsum.photos/seed/newpost/600/600' }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />

                  {/* "changer la photo" overlay */}
                  <Pressable style={styles.changePhotoOverlay}>
                    <View style={styles.changePhotoInner}>
                      <Camera size={22} color={colors.onInk} strokeWidth={1.8} />
                      <Text style={styles.changePhotoLabel}>{t('feed.changerPhoto')}</Text>
                    </View>
                  </Pressable>
                </View>

                {/* polaroid caption strip */}
                <View style={styles.polaroidStrip}>
                  <Text style={styles.polaroidStripText}>take me pic</Text>
                </View>
              </View>

              {/* tape accents */}
              <Tape
                color="cream"
                width={58}
                height={20}
                rotate={-4}
                style={styles.tapeTopLeft}
              />
              <Tape
                color="blue"
                width={52}
                height={20}
                rotate={3}
                style={styles.tapeTopRight}
              />
            </View>

            {/* ── caption input ─────────────────────────────────────────── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>légende</Text>
              <View style={styles.captionBox}>
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  placeholder={t('feed.raconteMoment')}
                  placeholderTextColor={colors.inkFaded}
                  multiline
                  numberOfLines={4}
                  style={styles.captionInput}
                  textAlignVertical="top"
                  autoCorrect={false}
                  autoCapitalize="sentences"
                />
              </View>
            </View>

            {/* ── city input ────────────────────────────────────────────── */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>lieu</Text>
              <View style={styles.cityRow}>
                <MapPin size={16} color={colors.inkFaded} />
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder={t('feed.ouCa')}
                  placeholderTextColor={colors.inkFaded}
                  style={styles.cityInput}
                  returnKeyType="done"
                  autoCorrect={false}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* ── publish button ────────────────────────────────────────── */}
            <View style={styles.publishRow}>
              <Button
                variant="gold"
                size="md"
                full
                onPress={handlePublish}
                disabled={!canPublish}
                style={[styles.publishBtn, !canPublish && styles.publishBtnDisabled]}
              >
                {t('feed.publier')}
              </Button>
            </View>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const PHOTO_SIZE = 260;
const POLAROID_H_PAD = 10;
const POLAROID_STRIP_H = 44;
const CARD_W = PHOTO_SIZE + POLAROID_H_PAD * 2;

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  flex: { flex: 1 },

  sheet: {
    flex: 1,
    backgroundColor: colors.paper,
  },

  // ── header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.inkLine,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── scroll ─────────────────────────────────────────────────────────────────
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  // ── polaroid wrapper ───────────────────────────────────────────────────────
  polaroidWrapper: {
    width: CARD_W + INK_SHADOW_OFFSET,
    height: PHOTO_SIZE + POLAROID_H_PAD + POLAROID_STRIP_H + INK_SHADOW_OFFSET,
    marginBottom: spacing.md,
  },

  // hard ink-offset shadow (positioned as background View)
  polaroidShadow: {
    position: 'absolute',
    top: INK_SHADOW_OFFSET,
    left: INK_SHADOW_OFFSET,
    width: CARD_W,
    height: PHOTO_SIZE + POLAROID_H_PAD + POLAROID_STRIP_H,
    backgroundColor: colors.ink,
  },

  // polaroid card sits on top of shadow
  polaroidCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_W,
    height: PHOTO_SIZE + POLAROID_H_PAD + POLAROID_STRIP_H,
    backgroundColor: colors.polaroid,
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
  },

  // photo slot
  photoArea: {
    marginTop: POLAROID_H_PAD,
    marginHorizontal: POLAROID_H_PAD,
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    overflow: 'hidden',
    backgroundColor: colors.kraft,
  },

  // "changer la photo" dim overlay
  changePhotoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(42,31,26,0.42)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoInner: {
    alignItems: 'center',
    gap: 6,
  },
  changePhotoLabel: {
    fontFamily: fonts.hand,
    fontSize: 16,
    color: colors.onInk,
    letterSpacing: 0.2,
  },

  // caption strip at bottom of polaroid
  polaroidStrip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  polaroidStripText: {
    fontFamily: fonts.hand,
    fontSize: 15,
    color: colors.inkFaded,
    letterSpacing: 1,
  },

  // tape decorations
  tapeTopLeft: {
    position: 'absolute',
    top: -8,
    left: 14,
    zIndex: 10,
  },
  tapeTopRight: {
    position: 'absolute',
    top: -6,
    right: 18,
    zIndex: 10,
  },

  // ── form fields ────────────────────────────────────────────────────────────
  fieldGroup: {
    width: '100%',
    gap: 6,
  },
  fieldLabel: {
    fontFamily: fonts.hand,
    fontSize: 18,
    color: colors.ink2,
    paddingLeft: 4,
  },

  // caption multiline box
  captionBox: {
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    // hard ink-offset shadow (bottom-right layer trick via shadow props)
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 2,
  },
  captionInput: {
    fontFamily: fonts.hand,
    fontSize: 20,
    color: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 96,
    lineHeight: 26,
  },

  // city single-line row
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowOffset: { width: 3, height: 3 },
    shadowRadius: 0,
    elevation: 2,
  },
  cityInput: {
    flex: 1,
    fontFamily: fonts.type,
    fontSize: 15,
    color: colors.ink,
    letterSpacing: 0.3,
  },

  // ── publish button ─────────────────────────────────────────────────────────
  publishRow: {
    width: '100%',
    marginTop: spacing.xs,
  },
  publishBtn: {
    borderRadius: radii.sm,
  },
  publishBtnDisabled: {
    opacity: 0.45,
  },
});
