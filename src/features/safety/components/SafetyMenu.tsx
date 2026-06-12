import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { fonts, type ThemeColors } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { t } from '@/shared/lib/i18n';
import { REPORT_REASONS } from '../lib/report-reasons';
import { useBlockUser, useUnblockUser, useIsBlocked } from '../hooks/useBlocks';
import { useSubmitReport } from '../hooks/useSubmitReport';
import type { ReportTarget } from '../api/safety-api';

/**
 * Target a SafetyMenu acts on. A profile reports the user (`reported_user_id`);
 * a chat reports the conversation (`conversation_id`, per WEB-BACKEND-SYNC §4)
 * while still being able to block the other user.
 */
export type SafetyMenuTarget =
  | { kind: 'user'; userId: string }
  | { kind: 'conversation'; conversationId: number; userId: string };

/**
 * Imperative safety menu. Returns `open()` for the trigger's onPress and a
 * `modal` node the caller renders once. Keeps report/block wiring out of each
 * screen.
 */
export function useSafetyMenu(target: SafetyMenuTarget): { open: () => void; modal: React.ReactNode } {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [reasonVisible, setReasonVisible] = useState(false);

  const blockedUserId = target.userId;
  const isBlocked = useIsBlocked(blockedUserId);
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const submitReport = useSubmitReport();

  const reportTarget: ReportTarget =
    target.kind === 'conversation'
      ? { kind: 'conversation', conversation_id: target.conversationId }
      : { kind: 'user', reported_user_id: target.userId };

  const reportLabel =
    target.kind === 'conversation' ? t('safety.reportConversation') : t('safety.reportUser');

  function confirmBlock() {
    Alert.alert(t('safety.confirmBlockTitle'), t('safety.confirmBlockMsg'), [
      { text: t('safety.cancel'), style: 'cancel' },
      {
        text: t('safety.blockUser'),
        style: 'destructive',
        onPress: () =>
          blockUser.mutate(blockedUserId, {
            onSuccess: () => Alert.alert(t('safety.blocked')),
            onError: () => Alert.alert(t('safety.errorGeneric')),
          }),
      },
    ]);
  }

  function confirmUnblock() {
    Alert.alert(t('safety.confirmUnblockTitle'), '', [
      { text: t('safety.cancel'), style: 'cancel' },
      {
        text: t('safety.unblockUser'),
        onPress: () =>
          unblockUser.mutate(blockedUserId, {
            onSuccess: () => Alert.alert(t('safety.unblocked')),
            onError: () => Alert.alert(t('safety.errorGeneric')),
          }),
      },
    ]);
  }

  function open() {
    const blocked = isBlocked.data === true;
    Alert.alert('', undefined, [
      { text: reportLabel, style: 'destructive', onPress: () => setReasonVisible(true) },
      blocked
        ? { text: t('safety.unblockUser'), onPress: confirmUnblock }
        : { text: t('safety.blockUser'), style: 'destructive', onPress: confirmBlock },
      { text: t('safety.cancel'), style: 'cancel' },
    ]);
  }

  function chooseReason(reasonId: string) {
    setReasonVisible(false);
    submitReport.mutate(
      { reason: reasonId, target: reportTarget },
      {
        onSuccess: () => Alert.alert(t('safety.reportSubmitted')),
        onError: () => Alert.alert(t('safety.errorGeneric')),
      },
    );
  }

  const modal = (
    <Modal
      visible={reasonVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setReasonVisible(false)}
    >
      <Pressable style={styles.backdrop} onPress={() => setReasonVisible(false)} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{t('safety.reportTitle')}</Text>
          <Pressable onPress={() => setReasonVisible(false)} hitSlop={10}>
            <X size={20} color={colors.ink} />
          </Pressable>
        </View>
        {REPORT_REASONS.map((r) => (
          <Pressable key={r.id} style={styles.reasonRow} onPress={() => chooseReason(r.id)}>
            <Text style={styles.reasonLabel}>{t(r.labelKey)}</Text>
          </Pressable>
        ))}
      </View>
    </Modal>
  );

  return { open, modal };
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.paper,
    borderTopWidth: 1.5,
    borderColor: colors.ink,
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetTitle: { fontFamily: fonts.serifBold, fontSize: 18, color: colors.ink },
  reasonRow: {
    paddingVertical: 16,
    borderBottomWidth: 1.5,
    borderColor: colors.inkLine,
    borderStyle: 'dashed',
  },
  reasonLabel: { fontFamily: fonts.hand, fontSize: 18, color: colors.ink },
});
