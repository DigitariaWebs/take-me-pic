import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribeToTable } from '@/shared/lib/supabase';
import { chatApi, type Message } from '../api/chat-api';

export type ChatItemStatus = 'sending' | 'sent' | 'failed';

// View-model: confirmed (DB) messages plus optimistic/failed outgoing ones.
export type ChatItem = {
  key: string; // real message id, or a temp id while sending
  body: string;
  incoming: boolean;
  createdAt: string;
  status: ChatItemStatus;
};

function fromMessage(m: Message, meId: string | undefined): ChatItem {
  return {
    key: String(m.id),
    body: m.body ?? '',
    incoming: m.sender_id !== meId,
    createdAt: m.created_at,
    status: 'sent',
  };
}

/**
 * Realtime conversation: loads history, appends incoming messages live, and
 * sends with optimistic state + retry. Own messages are reconciled via the send
 * response (realtime only appends other participants' messages, so no dupes).
 */
export function useConversation(conversationId: number | null, meId: string | undefined) {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tempSeq = useRef(0);

  useEffect(() => {
    if (conversationId == null) return;
    let active = true;
    setLoading(true);
    chatApi
      .list(conversationId)
      .then((msgs) => {
        if (!active) return;
        setItems(msgs.map((m) => fromMessage(m, meId)));
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'load error');
        setLoading(false);
      });

    const unsub = subscribeToTable<Message>({
      channel: `conversation_${conversationId}`,
      table: 'messages',
      event: 'INSERT',
      filter: `conversation_id=eq.${conversationId}`,
      onChange: (payload) => {
        const next = payload.new as Message;
        if (next.sender_id === meId) return; // own messages handled by send()
        setItems((prev) => (prev.some((i) => i.key === String(next.id)) ? prev : [...prev, fromMessage(next, meId)]));
      },
    });
    return () => {
      active = false;
      unsub();
    };
  }, [conversationId, meId]);

  const deliver = useCallback(
    async (key: string, body: string) => {
      if (conversationId == null || !meId) return;
      try {
        const msg = await chatApi.send({ conversationId, senderId: meId, body });
        // swap the optimistic item for the confirmed one
        setItems((prev) => prev.map((i) => (i.key === key ? fromMessage(msg, meId) : i)));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'send error');
        setItems((prev) => prev.map((i) => (i.key === key ? { ...i, status: 'failed' } : i)));
      }
    },
    [conversationId, meId],
  );

  const send = useCallback(
    (body: string) => {
      const text = body.trim();
      if (!text) return;
      tempSeq.current += 1;
      const key = `temp-${tempSeq.current}`;
      setItems((prev) => [
        ...prev,
        { key, body: text, incoming: false, createdAt: new Date().toISOString(), status: 'sending' },
      ]);
      void deliver(key, text);
    },
    [deliver],
  );

  const retry = useCallback(
    (key: string) => {
      setItems((prev) => prev.map((i) => (i.key === key ? { ...i, status: 'sending' } : i)));
      const item = items.find((i) => i.key === key);
      if (item) void deliver(key, item.body);
    },
    [items, deliver],
  );

  return { items, loading, error, send, retry };
}
