import { supabase } from '@/shared/lib/supabase';
import type { Tables } from '@/shared/lib/supabase';

export type NotificationRow = Tables<'notifications'>;

/**
 * Routing payload carried in `notifications.data` (and the push payload). The
 * server triggers (migration 0009) write exactly these shapes; the tap handler
 * narrows on `type`.
 */
export type NotificationRoute =
  | { type: 'request_accepted'; request_id: number }
  | { type: 'incoming_request'; request_id: number }
  | { type: 'new_message'; conversation_id: number };

export const notificationsApi = {
  // RLS (`notifications_self`) scopes every read/write to auth.uid(); no explicit
  // user filter needed.
  async list(limit = 50): Promise<NotificationRow[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async markRead(id: number): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() } as never)
      .eq('id', id)
      .is('read_at', null);
    if (error) throw error;
  },

  async markAllRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() } as never)
      .is('read_at', null);
    if (error) throw error;
  },
};
