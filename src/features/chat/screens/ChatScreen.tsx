'use client';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { t } from '@/shared/lib/i18n';

import { PaperBackground } from '@/shared/ui/PaperBackground';
import { ChatHeader } from '@/features/chat/components/ChatHeader';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { QuickReplies } from '@/features/chat/components/QuickReplies';
import { Composer } from '@/features/chat/components/Composer';

import type { ChatMessage, ChatPartner } from '@/features/chat/types';
import { fonts } from '@/shared/constants/tokens';
import { useThemeColors } from '@/shared/providers/ThemeProvider';
import { useAuth } from '@/shared/providers';
import { useProfile } from '@/features/profile';
import { chatApi } from '@/features/chat/api/chat-api';
import { useConversation, type ChatItem } from '@/features/chat/hooks/useConversation';
import { useSafetyMenu, type SafetyMenuTarget } from '@/features/safety';

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// View-model item → the bubble's ChatMessage shape. Failure is surfaced by a
// retry affordance under the bubble (see render), not a bubble status.
function toChatMessage(item: ChatItem, index: number): ChatMessage {
  return {
    id: item.key,
    kind: 'text',
    text: item.body,
    incoming: item.incoming,
    time: fmtTime(item.createdAt),
    status: item.incoming ? undefined : item.status === 'sending' ? 'sending' : 'read',
    rotate: index % 2 === 0 ? -1 : 1,
  };
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = id ? Number(id) : null;

  const { user } = useAuth();
  const meId = user?.id;
  const { items, send, retry } = useConversation(conversationId, meId);

  // The other participant (for the header) + the session this chat belongs to.
  const [otherId, setOtherId] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<number | null>(null);
  useEffect(() => {
    if (conversationId == null || !meId) return;
    let active = true;
    void chatApi.getOtherParticipantId(conversationId, meId).then((oid) => {
      if (active) setOtherId(oid);
    });
    void chatApi.getHelpRequestId(conversationId).then((rid) => {
      if (active) setRequestId(rid);
    });
    return () => {
      active = false;
    };
  }, [conversationId, meId]);
  const { data: other } = useProfile(otherId ?? '');

  // Reporting from a chat targets the conversation (WEB-BACKEND-SYNC §4); the
  // overflow menu also lets the user block the other participant.
  const safetyTarget: SafetyMenuTarget =
    conversationId != null
      ? { kind: 'conversation', conversationId, userId: otherId ?? '' }
      : { kind: 'user', userId: otherId ?? '' };
  const safety = useSafetyMenu(safetyTarget);
  const canModerate = conversationId != null && Boolean(otherId);

  const headerUser = {
    firstName: other?.first_name ?? '',
    lastName: other?.last_name ?? null,
    avatar: other?.avatar_url ?? 'https://i.pravatar.cc/300?img=12',
  } as unknown as ChatPartner;

  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(timer);
  }, [items]);

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    send(trimmed);
    setInput('');
  }

  // Photos / voice / calls belong to TASK-007 (session photo transfer) and are
  // out of scope for text chat — keep the affordances but defer.
  const comingSoon = () => Alert.alert(t('chatUi.callAlertTitle'), t('chatUi.callAlertBody'));

  return (
    <PaperBackground tone="paper">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={{ paddingTop: insets.top }}>
          <ChatHeader
            user={headerUser}
            status={t('chatUi.headerStatus')}
            onBack={() => router.back()}
            onCall={comingSoon}
            onVideo={comingSoon}
            onMore={canModerate ? safety.open : undefined}
          />
        </View>
        {safety.modal}

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {items.map((item, i) => (
            <View key={item.key}>
              <MessageBubble message={toChatMessage(item, i)} />
              {item.status === 'failed' && (
                <Pressable onPress={() => retry(item.key)} style={styles.retry}>
                  <Text style={[styles.retryText, { color: colors.stampRed }]}>
                    échec — toucher pour renvoyer
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
          <View style={styles.scrollBottom} />
        </ScrollView>

        <QuickReplies onSend={handleSend} />

        <Composer
          value={input}
          onChangeText={setInput}
          onSend={() => handleSend(input)}
          onAttach={() =>
            requestId != null
              ? router.push(`/session/gallery?request=${requestId}`)
              : comingSoon()
          }
          onRecordStart={comingSoon}
          onRecordStop={comingSoon}
          recording={false}
          recordSeconds={0}
        />

        <View style={{ height: insets.bottom }} />
      </KeyboardAvoidingView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: { paddingVertical: 8 },
  scrollBottom: { height: 8 },
  retry: { alignSelf: 'flex-end', paddingHorizontal: 18, paddingTop: 2 },
  retryText: { fontFamily: fonts.hand, fontSize: 13 },
});
