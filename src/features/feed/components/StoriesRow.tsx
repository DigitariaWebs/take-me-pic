import React, { useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { fonts, spacing, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import type { User } from '@/features/feed/types';
import { t } from '@/shared/lib/i18n';

interface StoriesRowProps {
  users: User[];
  onAddStory: () => void;
  onOpenStory: (u: User) => void;
}

const ITEM_SIZE = 64;
const RING_OFFSET = 3;
const RING_SIZE = ITEM_SIZE + RING_OFFSET * 2;

export function StoriesRow({ users, onAddStory, onOpenStory }: StoriesRowProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* "ton spot" add-story button */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onAddStory}
        style={styles.item}
        accessibilityLabel="Ajouter une story"
        accessibilityRole="button"
      >
        <View style={styles.addSquare}>
          <Plus size={22} color={colors.inkFaded} strokeWidth={1.8} />
        </View>
        <Text style={styles.label} numberOfLines={1}>{t('feed.tonSpot')}</Text>
      </TouchableOpacity>

      {/* User story avatars */}
      {users.map((user) => (
        <TouchableOpacity
          key={user.id}
          activeOpacity={0.75}
          onPress={() => onOpenStory(user)}
          style={styles.item}
          accessibilityLabel={`Story de ${user.firstName}`}
          accessibilityRole="button"
        >
          <View style={styles.ringOuter}>
            {/* Gold ring accent — layered Polaroid mini feel */}
            <View style={styles.ringInner}>
              <Image
                source={{ uri: user.avatar } as ImageSourcePropType}
                style={styles.avatarImage}
              />
            </View>
            {/* Tape corner accent — top-right tiny sliver */}
            <View style={styles.tapeAccent} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {user.firstName}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },

  item: {
    alignItems: 'center',
    gap: 6,
    width: RING_SIZE,
  },

  /* --- "ton spot" add button --- */
  addSquare: {
    width: RING_SIZE,
    height: RING_SIZE,
    backgroundColor: colors.paperWarm,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    // Hard ink offset shadow via elevation + shadow props
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 2,
  },

  /* --- Avatar ring frame --- */
  ringOuter: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: 4,
    // Gold ring border — Polaroid white + gold edge feel
    borderWidth: 2,
    borderColor: colors.gold,
    padding: RING_OFFSET - 2,
    backgroundColor: colors.polaroid,
    // Hard ink offset shadow
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 0,
    elevation: 3,
    overflow: 'visible',
  },

  ringInner: {
    flex: 1,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: colors.kraft,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  /* Small tape strip peeking from top-right corner */
  tapeAccent: {
    position: 'absolute',
    top: -4,
    right: 6,
    width: 14,
    height: 7,
    backgroundColor: 'rgba(184, 137, 58, 0.35)',
    transform: [{ rotate: '8deg' }],
    borderRadius: 1,
  },

  /* Name label */
  label: {
    fontFamily: fonts.hand,
    fontSize: 13,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 15,
    maxWidth: RING_SIZE + 4,
  },
});
