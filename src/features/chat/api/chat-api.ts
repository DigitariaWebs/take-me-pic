import { supabase } from '@/shared/lib/supabase';
import type { Tables } from '@/shared/lib/supabase';

export type Message = Tables<'messages'>;

export const chatApi = {
  // History for a conversation. RLS (messages_member_read) restricts this to
  // participants — non-members get an empty set.
  async list(conversationId: number): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  // Send a text message. RLS (messages_send) enforces sender_id = auth.uid()
  // AND participant membership.
  async send(params: { conversationId: number; senderId: string; body: string }): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: params.conversationId,
        sender_id: params.senderId,
        body: params.body,
      } as never)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  // The other participant's user id (for the chat header).
  async getOtherParticipantId(conversationId: number, meId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', meId)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data as { user_id: string } | null)?.user_id ?? null;
  },
};
