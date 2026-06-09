import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Image as ImageIcon, Camera, MapPin, FileText } from 'lucide-react-native';
import { fonts, radii, shadow, spacing, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import type { AttachmentKind } from '@/features/chat/types';
import { t } from '@/shared/lib/i18n';

type Tile = {
  kind: AttachmentKind;
  label: string;
  icon: React.ReactNode;
};

export function AttachmentSheet({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (kind: AttachmentKind) => void;
}) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const tiles: Tile[] = [
    {
      kind: 'photo',
      label: t('chatUi.attachPhoto'),
      icon: <ImageIcon size={32} color={colors.gold} strokeWidth={1.5} />,
    },
    {
      kind: 'camera',
      label: t('chatUi.attachCamera'),
      icon: <Camera size={32} color={colors.gold} strokeWidth={1.5} />,
    },
    {
      kind: 'position',
      label: t('chatUi.attachPosition'),
      icon: <MapPin size={32} color={colors.gold} strokeWidth={1.5} />,
    },
    {
      kind: 'document',
      label: t('chatUi.attachDocument'),
      icon: <FileText size={32} color={colors.gold} strokeWidth={1.5} />,
    },
  ];

  function handlePick(kind: AttachmentKind) {
    onPick(kind);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.sheet, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>{t('chatUi.attachShare')}</Text>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <X size={20} color={colors.ink} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* 2x2 tile grid */}
        <View style={styles.grid}>
          {tiles.map((tile) => (
            <Pressable
              key={tile.kind}
              style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
              onPress={() => handlePick(tile.kind)}
            >
              {/* hard-ink offset layer */}
              <View style={styles.tileOffset} />
              {/* tile card surface */}
              <View style={styles.tileSurface}>
                {tile.icon}
                <Text style={styles.tileLabel}>{tile.label}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const TILE_SIZE = 130;

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.lg,
  },

  // ── Header ─────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: spacing.md,
  },
  headerSpacer: {
    width: 36,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radii.sm,
  },

  divider: {
    height: 1.5,
    backgroundColor: colors.inkLine,
    marginBottom: spacing.xl,
  },

  // ── Grid ───────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
  },

  // ── Individual tile ────────────────────────────────────
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    // extra room for the hard-shadow offset
    marginRight: 4,
    marginBottom: 4,
  },
  tilePressed: {
    opacity: 0.85,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  // The dark offset "shadow" layer sitting behind the card surface
  tileOffset: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: colors.ink,
    borderRadius: radii.md,
  },
  // The paper card surface
  tileSurface: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: colors.cardWhite,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadow.card,
  },
  tileLabel: {
    fontFamily: fonts.type,
    fontSize: 13,
    color: colors.ink2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
