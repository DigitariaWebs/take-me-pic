'use client';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { t } from '@/shared/lib/i18n';

import { PaperBackground } from '@/shared/ui/PaperBackground';
import { ChatHeader } from '@/features/chat/components/ChatHeader';
import { MessageBubble } from '@/features/chat/components/MessageBubble';
import { TypingIndicator } from '@/features/chat/components/TypingIndicator';
import { QuickReplies } from '@/features/chat/components/QuickReplies';
import { Composer } from '@/features/chat/components/Composer';
import { AttachmentSheet } from '@/features/chat/components/AttachmentSheet';

import type { ChatMessage, AttachmentKind } from '@/features/chat/types';
import { findUser } from '@/shared/data/mock';

// ─── ID counter (module-level, never Math.random at module scope) ─────────────
let _msgId = 0;
function nextId(): string {
  _msgId += 1;
  return `m${_msgId}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function nowTime(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

// Deterministic picsum image seeds so we never call Math.random at module scope
const IMAGE_SEEDS = ['paris42', 'lens50', 'street', 'place'];
let _imageSeedIdx = 0;
function nextImageUri(): string {
  const seed = IMAGE_SEEDS[_imageSeedIdx % IMAGE_SEEDS.length];
  _imageSeedIdx += 1;
  return `https://picsum.photos/seed/${seed}/400/400`;
}

const MAP_URI = 'https://picsum.photos/seed/map77/400/300';

// ─── Canned replies (no emoji, rotating) ─────────────────────────────────────
const CANNED_REPLY_KEYS = [
  'chatUi.canned0',
  'chatUi.canned1',
  'chatUi.canned2',
  'chatUi.canned3',
  'chatUi.canned4',
  'chatUi.canned5',
] as const;
let _replyIdx = 0;
function nextCannedReply(): string {
  const r = t(CANNED_REPLY_KEYS[_replyIdx % CANNED_REPLY_KEYS.length]);
  _replyIdx += 1;
  return r;
}

// ─── Seed messages (NO emoji, clean) ─────────────────────────────────────────
const SEED_MESSAGES: ChatMessage[] = [
  {
    id: nextId(),
    kind: 'system',
    text: t('chatUi.sessionBanner', { time: '9:42' }),
    incoming: true,
    time: '9:42',
  },
  {
    id: nextId(),
    kind: 'text',
    text: t('chatUi.seedMsg1'),
    incoming: true,
    time: '9:43',
    rotate: -1,
  },
  {
    id: nextId(),
    kind: 'text',
    text: t('chatUi.seedMsg2'),
    incoming: false,
    time: '9:44',
    status: 'read',
    rotate: 1,
  },
  {
    id: nextId(),
    kind: 'text',
    text: t('chatUi.seedMsg3'),
    incoming: true,
    time: '9:44',
    rotate: -1.5,
  },
  {
    id: nextId(),
    kind: 'text',
    text: t('chatUi.seedMsg4'),
    incoming: false,
    time: '9:45',
    status: 'read',
    rotate: -1,
  },
];

// ─── Tilt helpers (alternating, no Math.random) ──────────────────────────────
let _tiltFlip = true;
function nextTilt(): number {
  _tiltFlip = !_tiltFlip;
  return _tiltFlip ? 1 : -1;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = findUser(id);

  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [attachVisible, setAttachVisible] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll whenever messages or typing changes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 60);
    return () => clearTimeout(timer);
  }, [messages, typing]);

  // ── sendText ────────────────────────────────────────────────────────────────
  function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const msgId = nextId();
    const outgoing: ChatMessage = {
      id: msgId,
      kind: 'text',
      text: trimmed,
      incoming: false,
      time: nowTime(),
      status: 'sending',
      rotate: nextTilt(),
    };

    setMessages((prev) => [...prev, outgoing]);
    setInput('');

    // After 400 ms → 'sent'
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, status: 'sent' as const } : m))
      );
      // Then simulate reply
      simulateReply();
    }, 400);
  }

  // ── simulateReply ───────────────────────────────────────────────────────────
  function simulateReply() {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply: ChatMessage = {
        id: nextId(),
        kind: 'text',
        text: nextCannedReply(),
        incoming: true,
        time: nowTime(),
        rotate: nextTilt() * -1,
      };
      // Mark all prior outgoing messages as 'read' and push reply
      setMessages((prev) => [
        ...prev.map((m) =>
          !m.incoming && m.status ? { ...m, status: 'read' as const } : m
        ),
        reply,
      ]);
    }, 1400);
  }

  // ── onRecordStart ───────────────────────────────────────────────────────────
  function handleRecordStart() {
    setRecording(true);
    setRecordSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
  }

  // ── onRecordStop ────────────────────────────────────────────────────────────
  function handleRecordStop() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
    // Capture current recordSeconds via functional update
    setRecordSeconds((secs) => {
      if (secs >= 1) {
        const voiceMsg: ChatMessage = {
          id: nextId(),
          kind: 'voice',
          voiceSeconds: secs,
          incoming: false,
          time: nowTime(),
          status: 'sending',
          rotate: nextTilt(),
        };
        setMessages((prev) => [...prev, voiceMsg]);
        // After 400 ms set sent then simulateReply
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === voiceMsg.id ? { ...m, status: 'sent' as const } : m
            )
          );
          simulateReply();
        }, 400);
      }
      return 0;
    });
  }

  // ── onPick (AttachmentSheet) ────────────────────────────────────────────────
  function handlePick(kind: AttachmentKind) {
    setAttachVisible(false);

    let newMsg: ChatMessage;

    if (kind === 'photo' || kind === 'camera') {
      newMsg = {
        id: nextId(),
        kind: 'image',
        imageUri: nextImageUri(),
        incoming: false,
        time: nowTime(),
        status: 'sending',
        rotate: nextTilt(),
      };
    } else if (kind === 'position') {
      newMsg = {
        id: nextId(),
        kind: 'image',
        imageUri: MAP_URI,
        incoming: false,
        time: nowTime(),
        status: 'sending',
        rotate: nextTilt(),
      };
    } else {
      // document
      newMsg = {
        id: nextId(),
        kind: 'text',
        text: t('chatUi.documentSent'),
        incoming: false,
        time: nowTime(),
        status: 'sending',
        rotate: nextTilt(),
      };
    }

    setMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMsg.id ? { ...m, status: 'sent' as const } : m
        )
      );
      simulateReply();
    }, 400);
  }

  // ── Call / Video handlers ───────────────────────────────────────────────────
  function handleCall() {
    Alert.alert(t('chatUi.callAlertTitle'), t('chatUi.callAlertBody'));
  }

  function handleVideo() {
    Alert.alert(t('chatUi.callAlertTitle'), t('chatUi.callAlertBody'));
  }

  return (
    <PaperBackground tone="paper">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header with safe-area top padding */}
        <View style={{ paddingTop: insets.top }}>
          <ChatHeader
            user={user}
            status={t('chatUi.headerStatus')}
            onBack={() => router.back()}
            onCall={handleCall}
            onVideo={handleVideo}
          />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {typing && <TypingIndicator />}
          {/* Bottom padding so last bubble isn't flush */}
          <View style={styles.scrollBottom} />
        </ScrollView>

        {/* Quick replies */}
        <QuickReplies onSend={sendText} />

        {/* Composer */}
        <Composer
          value={input}
          onChangeText={setInput}
          onSend={() => sendText(input)}
          onAttach={() => setAttachVisible(true)}
          onRecordStart={handleRecordStart}
          onRecordStop={handleRecordStop}
          recording={recording}
          recordSeconds={recordSeconds}
        />

        {/* Bottom safe-area padding inside composer area */}
        <View style={{ height: insets.bottom }} />
      </KeyboardAvoidingView>

      {/* Attachment sheet */}
      <AttachmentSheet
        visible={attachVisible}
        onClose={() => setAttachVisible(false)}
        onPick={handlePick}
      />
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  scrollBottom: {
    height: 8,
  },
});
