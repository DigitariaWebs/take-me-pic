import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperBackground } from '@/shared/ui/PaperBackground';
import { NavBar } from '@/shared/ui/iOSChrome';
import { Polaroid } from '@/shared/ui/Polaroid';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';
import { useBlockedUsers, useUnblockUser } from '../hooks/useBlocks';
import type { BlockedUser } from '../api/safety-api';

export default function BlockedUsersScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: blocked, isLoading } = useBlockedUsers();
  const unblock = useUnblockUser();

  return (
    <PaperBackground tone="paper">
      <View style={{ paddingTop: insets.top }}>
        <NavBar
          left={
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.back}>← {t('common.back')}</Text>
            </Pressable>
          }
          title={t('safety.blockedUsersTitle')}
          right={<View style={{ width: 30 }} />}
        />
      </View>

      {isLoading ? (
        <View style={{ paddingTop: 60, alignItems: 'center' }}>
          <ActivityIndicator color={colors.goldDeep} />
        </View>
      ) : (
        <FlatList
          data={blocked ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: insets.bottom + 30 }}
          ListEmptyComponent={<Text style={styles.empty}>{t('safety.blockedEmpty')}</Text>}
          renderItem={({ item }) => (
            <Row
              item={item}
              styles={styles}
              colors={colors}
              pending={unblock.isPending}
              onUnblock={() => unblock.mutate(item.id)}
            />
          )}
        />
      )}
    </PaperBackground>
  );
}

function Row({
  item,
  styles,
  colors,
  pending,
  onUnblock,
}: {
  item: BlockedUser;
  styles: ReturnType<typeof makeStyles>;
  colors: ThemeColors;
  pending: boolean;
  onUnblock: () => void;
}) {
  return (
    <View style={styles.row}>
      <Polaroid width={42} height={36} noCaption rotate={-3} source={item.avatar_url ? { uri: item.avatar_url } : undefined} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.first_name}</Text>
        <Text style={styles.username}>{item.username}</Text>
      </View>
      <Pressable style={styles.unblockBtn} onPress={onUnblock} disabled={pending} hitSlop={6}>
        <Text style={styles.unblockText}>{t('safety.unblockUser')}</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  back: { fontFamily: fonts.hand, fontSize: 20, color: colors.ink },
  empty: { fontFamily: fonts.hand, fontSize: 16, color: colors.inkFaded, textAlign: 'center', marginTop: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderColor: colors.inkLine,
    borderStyle: 'dashed',
  },
  name: { fontFamily: fonts.serifBold, fontSize: 15, color: colors.ink },
  username: { fontFamily: fonts.hand, fontSize: 13, color: colors.inkFaded, marginTop: 1 },
  unblockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.cardWhite,
  },
  unblockText: { fontFamily: fonts.hand, fontSize: 14, color: colors.ink },
});
