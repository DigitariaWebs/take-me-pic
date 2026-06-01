import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperBackground } from '@/components/PaperBackground';
import { NavBar } from '@/components/iOSChrome';
import { Polaroid } from '@/components/Polaroid';
import { Chip } from '@/components/Chip';
import { allUsers } from '@/data/mock';
import { fonts, type ThemeColors } from '@/theme/tokens';
import { useThemeColors } from '@/components/ThemeContext';
import { t } from '@/i18n';

type FilterTab = 'tous' | 'actifs' | 'archivés';

const FILTER_TAB_LABEL_KEYS: Record<FilterTab, string> = {
  tous: 'setx.msgFilterAll',
  actifs: 'setx.msgFilterActive',
  archivés: 'setx.msgFilterArchived',
};

// Stable preview messages & metadata per user slot (index-based)
const PREVIEWS = [
  { text: 'arrive dans 2 min ↓', when: '9:42', active: true, archived: false },
  { text: 'merci pour la photo !', when: 'hier', active: true, archived: false },
  { text: 'tu es libre samedi ?', when: 'hier', active: false, archived: false },
  { text: 'on se revoit à Lisbonne', when: 'lun.', active: false, archived: true },
  { text: 'super spot, merci !', when: 'dim.', active: false, archived: true },
];

// Users who have unread messages (by index in allUsers.slice(1))
const INITIALLY_UNREAD = new Set([0, 1, 3]);

type ConvMeta = {
  archived: boolean;
};

// ─── styles factory ───────────────────────────────────────────────────────────
const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    brand: { fontFamily: fonts.serifBold, fontSize: 26, letterSpacing: -0.5, color: colors.ink },
    tabs: { flexDirection: 'row', gap: 8 },
    empty: { fontFamily: fonts.hand, fontSize: 18, color: colors.inkFaded, textAlign: 'center', marginTop: 32 },

    // Search
    searchWrapper: {
      borderWidth: 1.5,
      borderColor: colors.inkLine,
      backgroundColor: colors.cardWhite,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    searchInput: {
      fontFamily: fonts.hand,
      fontSize: 17,
      color: colors.ink,
    },

    // Conversation row
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.cardWhite,
      padding: 10,
      borderWidth: 1.5,
      borderColor: colors.inkLine,
    },
    whoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    who: { fontFamily: fonts.serifBold, fontSize: 15, color: colors.ink2 },
    whoUnread: { color: colors.ink },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.stampRed,
    },
    preview: { fontFamily: fonts.hand, fontSize: 16, color: colors.inkFaded },
    previewUnread: { color: colors.ink, fontFamily: fonts.serifBold },
    when: { fontFamily: fonts.type, fontSize: 11, color: colors.inkFaded },

    // Action sheet
    sheetOverlay: {
      flex: 1,
      backgroundColor: colors.inkSoft,
      justifyContent: 'flex-end',
    },
    sheetContainer: {
      backgroundColor: colors.paper,
      borderTopWidth: 2,
      borderTopColor: colors.inkLine,
      paddingBottom: 32,
      paddingHorizontal: 22,
      paddingTop: 12,
    },
    sheetHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.inkLine,
      alignSelf: 'center',
      marginBottom: 16,
    },
    sheetTitle: {
      fontFamily: fonts.serifBold,
      fontSize: 16,
      color: colors.inkFaded,
      marginBottom: 12,
      textAlign: 'center',
    },
    sheetAction: {
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.inkLine,
    },
    sheetActionText: {
      fontFamily: fonts.hand,
      fontSize: 20,
      color: colors.ink,
      textAlign: 'center',
    },
    sheetActionDestructive: {},
    sheetActionDestructiveText: {
      color: colors.stampRed,
    },
    sheetCancel: {
      marginTop: 10,
      paddingVertical: 14,
      borderWidth: 1.5,
      borderColor: colors.inkLine,
      backgroundColor: colors.cardWhite,
    },
    sheetCancelText: {
      fontFamily: fonts.serifBold,
      fontSize: 16,
      color: colors.ink2,
      textAlign: 'center',
    },
  });

/**
 * Inbox tab. Each conversation is a journal entry preview with a chat
 * handoff to `/chat/[id]`.
 */
export default function MessagesTab() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('tous');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [archivedOverrides, setArchivedOverrides] = useState<Map<string, boolean>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');

  // Action sheet state
  const [sheetTarget, setSheetTarget] = useState<string | null>(null);

  const users = allUsers.slice(1); // exclude self

  function isUnread(userId: string, slotIndex: number): boolean {
    if (readIds.has(userId)) return false;
    return INITIALLY_UNREAD.has(slotIndex);
  }

  function getMeta(userId: string, originalIdx: number): { active: boolean; archived: boolean; text: string; when: string } {
    const base = PREVIEWS[originalIdx] ?? PREVIEWS[PREVIEWS.length - 1];
    const archivedOverride = archivedOverrides.get(userId);
    return {
      ...base,
      archived: archivedOverride !== undefined ? archivedOverride : base.archived,
    };
  }

  function handleRowPress(userId: string) {
    setReadIds((prev) => new Set([...prev, userId]));
    router.push(`/chat/${userId}`);
  }

  function handleLongPress(userId: string) {
    setSheetTarget(userId);
  }

  function handleMarkRead(userId: string) {
    setReadIds((prev) => new Set([...prev, userId]));
    setSheetTarget(null);
  }

  function handleArchive(userId: string) {
    setArchivedOverrides((prev) => new Map(prev).set(userId, true));
    setSheetTarget(null);
    if (activeFilter === 'actifs') {
      // conversation disappears from actifs — no extra feedback needed
    }
  }

  function handleDelete(userId: string) {
    setSheetTarget(null);
    Alert.alert(
      t('setx.msgDeleteTitle'),
      t('setx.msgDeleteBody'),
      [
        { text: t('setx.msgDeleteCancel'), style: 'cancel' },
        {
          text: t('setx.msgDeleteConfirm'),
          style: 'destructive',
          onPress: () => setDeletedIds((prev) => new Set([...prev, userId])),
        },
      ],
    );
  }

  const filters: FilterTab[] = ['tous', 'actifs', 'archivés'];

  const trimmedQuery = searchQuery.trim().toLowerCase();

  const visibleUsers = users.filter((u, i) => {
    if (deletedIds.has(u.id)) return false;
    const meta = getMeta(u.id, i);
    if (activeFilter === 'actifs') {
      if (meta.archived) return false;
      if (!meta.active) return false;
    }
    if (activeFilter === 'archivés') {
      if (!meta.archived) return false;
    }
    if (trimmedQuery) {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      if (!fullName.includes(trimmedQuery)) return false;
    }
    return true;
  });

  // Find the user for the action sheet
  const sheetUser = sheetTarget ? users.find((u) => u.id === sheetTarget) ?? null : null;
  const sheetOriginalIdx = sheetUser ? users.findIndex((u) => u.id === sheetUser.id) : -1;
  const sheetUnread = sheetUser ? isUnread(sheetUser.id, sheetOriginalIdx) : false;

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          title={<Text style={styles.brand}>messages</Text>}
          right={<View style={{ width: 30 }} />}
        />
      </View>

      {/* Search bar */}
      <View style={{ paddingHorizontal: 22, paddingTop: 8 }}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('setx.msgSearch')}
            placeholderTextColor={colors.inkFaded}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Filter chips */}
      <View style={{ paddingHorizontal: 22, paddingTop: 8 }}>
        <View style={styles.tabs}>
          {filters.map((f) => (
            <Chip
              key={f}
              variant={activeFilter === f ? 'filled' : 'outline'}
              onPress={() => setActiveFilter(f)}
            >
              {t(FILTER_TAB_LABEL_KEYS[f])}
            </Chip>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 110, paddingTop: 16, gap: 10 }}>
        {visibleUsers.length === 0 && (
          <Text style={styles.empty}>{t('setx.msgEmpty')}</Text>
        )}
        {visibleUsers.map((u, visibleIdx) => {
          // Find original index for metadata & unread logic
          const originalIdx = users.findIndex((uu) => uu.id === u.id);
          const meta = getMeta(u.id, originalIdx);
          const unread = isUnread(u.id, originalIdx);

          return (
            <Pressable
              key={u.id}
              style={styles.row}
              onPress={() => handleRowPress(u.id)}
              onLongPress={() => handleLongPress(u.id)}
              delayLongPress={400}
            >
              <Polaroid
                width={42}
                height={36}
                noCaption
                source={{ uri: u.avatar }}
                rotate={visibleIdx % 2 ? 2 : -3}
              />
              <View style={{ flex: 1 }}>
                <View style={styles.whoRow}>
                  <Text style={[styles.who, unread && styles.whoUnread]}>
                    {u.firstName} {u.lastName.charAt(0)}.
                  </Text>
                  {unread && <View style={styles.unreadDot} />}
                </View>
                <Text style={[styles.preview, unread && styles.previewUnread]} numberOfLines={1}>
                  {meta.text}
                </Text>
              </View>
              <Text style={styles.when}>{meta.when}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Action sheet Modal */}
      <Modal
        visible={sheetTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetTarget(null)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setSheetTarget(null)}>
          <Pressable style={styles.sheetContainer} onPress={() => {}}>
            {/* Header */}
            <View style={styles.sheetHandle} />
            {sheetUser && (
              <Text style={styles.sheetTitle}>
                {sheetUser.firstName} {sheetUser.lastName.charAt(0)}.
              </Text>
            )}

            {/* Mark as read — only shown if unread */}
            {sheetUnread && (
              <Pressable
                style={styles.sheetAction}
                onPress={() => sheetTarget && handleMarkRead(sheetTarget)}
              >
                <Text style={styles.sheetActionText}>{t('setx.msgMarkRead')}</Text>
              </Pressable>
            )}

            {/* Archive */}
            <Pressable
              style={styles.sheetAction}
              onPress={() => sheetTarget && handleArchive(sheetTarget)}
            >
              <Text style={styles.sheetActionText}>{t('setx.msgArchive')}</Text>
            </Pressable>

            {/* Delete */}
            <Pressable
              style={[styles.sheetAction, styles.sheetActionDestructive]}
              onPress={() => sheetTarget && handleDelete(sheetTarget)}
            >
              <Text style={[styles.sheetActionText, styles.sheetActionDestructiveText]}>
                {t('setx.msgDelete')}
              </Text>
            </Pressable>

            <Pressable style={styles.sheetCancel} onPress={() => setSheetTarget(null)}>
              <Text style={styles.sheetCancelText}>{t('setx.msgCancel')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </PaperBackground>
  );
}
