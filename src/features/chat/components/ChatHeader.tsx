import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react-native';
import { fonts, spacing, radii, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { DashedLine } from '@/shared/ui/DashedLine';
import type { ChatPartner } from '@/features/chat/types';

interface ChatHeaderProps {
  user: ChatPartner;
  status: string;
  onBack: () => void;
  onCall: () => void;
  onVideo: () => void;
  onMore?: () => void;
}

export function ChatHeader({
  user,
  status,
  onBack,
  onCall,
  onVideo,
  onMore,
}: ChatHeaderProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const firstName = user.firstName;
  const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
  const displayName = lastInitial ? `${firstName} ${lastInitial}.` : firstName;

  return (
    <View style={styles.wrapper}>
      {/* Main row */}
      <View style={styles.row}>
        {/* Back button */}
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Retour"
          accessibilityRole="button"
        >
          <ArrowLeft size={22} color={colors.ink} strokeWidth={2.2} />
        </Pressable>

        {/* Avatar + name/status */}
        <View style={styles.identity}>
          {/* Avatar with ink/gold ring */}
          <View style={styles.avatarRingOuter}>
            <View style={styles.avatarRingInner}>
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Name and status */}
          <View style={styles.nameBlock}>
            <Text style={styles.nameText} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.statusText} numberOfLines={1}>
              {status}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            onPress={onCall}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityLabel="Appeler"
            accessibilityRole="button"
          >
            <Phone size={18} color={colors.ink2} strokeWidth={2} />
          </Pressable>

          <Pressable
            onPress={onVideo}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityLabel="Video"
            accessibilityRole="button"
          >
            <Video size={18} color={colors.ink2} strokeWidth={2} />
          </Pressable>

          {onMore ? (
            <Pressable
              onPress={onMore}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel="Plus d'options"
              accessibilityRole="button"
            >
              <MoreVertical size={18} color={colors.ink2} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Dashed bottom divider */}
      <View style={styles.dividerRow}>
        <DashedLine color={colors.kraft} />
      </View>
    </View>
  );
}

const AVATAR_SIZE = 42;
const RING_OUTER = AVATAR_SIZE + 6; // 48px — ring gap + border
const ICON_BTN_SIZE = 36;

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrapper: {
    backgroundColor: colors.paper,
    paddingTop: spacing.sm,
    paddingBottom: 0,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardWhite,
    borderWidth: 1,
    borderColor: colors.inkLine,
    flexShrink: 0,
  },

  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
  },

  // Two-layer ring: outer = gold, inner = paper gap, then image
  avatarRingOuter: {
    width: RING_OUTER,
    height: RING_OUTER,
    borderRadius: RING_OUTER / 2,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: 2,
    flexShrink: 0,
    backgroundColor: colors.paper,
    // subtle ink shadow
    shadowColor: colors.ink,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  avatarRingInner: {
    flex: 1,
    borderRadius: RING_OUTER / 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.inkLine,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  nameBlock: {
    flex: 1,
    overflow: 'hidden',
  },

  nameText: {
    fontFamily: fonts.serifBold,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: 0.2,
  },

  statusText: {
    fontFamily: fonts.hand,
    fontSize: 14,
    color: colors.stampGreen,
    marginTop: 1,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },

  iconBtn: {
    width: ICON_BTN_SIZE,
    height: ICON_BTN_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardWhite,
    borderWidth: 1,
    borderColor: colors.inkLine,
  },

  pressed: {
    opacity: 0.6,
  },

  dividerRow: {
    paddingHorizontal: spacing.md,
  },

  divider: {
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.kraft,
    borderStyle: 'dashed',
  },
});
