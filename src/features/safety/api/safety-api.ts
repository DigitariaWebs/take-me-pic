import { supabase } from '@/shared/lib/supabase';
import type { Tables } from '@/shared/lib/supabase';

/** Exactly one of these target columns is set per report (WEB-BACKEND-SYNC §4). */
export type ReportTarget =
  | { kind: 'user'; reported_user_id: string }
  | { kind: 'conversation'; conversation_id: number }
  | { kind: 'help_request'; help_request_id: number }
  | { kind: 'message'; message_id: number }
  | { kind: 'post'; post_id: number }
  | { kind: 'comment'; comment_id: number };

export type BlockedUser = Pick<Tables<'profiles'>, 'id' | 'first_name' | 'username' | 'avatar_url'> & {
  blocked_at: string;
};

export type MyBanStatus = { isBanned: boolean; permanent: boolean; expiresAt: string | null };

function targetColumn(target: ReportTarget): Record<string, string | number> {
  switch (target.kind) {
    case 'user': return { reported_user_id: target.reported_user_id };
    case 'conversation': return { conversation_id: target.conversation_id };
    case 'help_request': return { help_request_id: target.help_request_id };
    case 'message': return { message_id: target.message_id };
    case 'post': return { post_id: target.post_id };
    case 'comment': return { comment_id: target.comment_id };
  }
}

export const reportApi = {
  // Inserts exactly one target + reason; `status` defaults to 'open' server-side.
  // RLS (reports_insert) enforces reporter_id = auth.uid().
  async submit(params: { reporterId: string; reason: string; target: ReportTarget }): Promise<void> {
    const reason = params.reason.trim();
    if (!reason) throw new Error('A reason is required.');
    const { error } = await supabase
      .from('reports')
      .insert({ reporter_id: params.reporterId, reason, ...targetColumn(params.target) } as never);
    if (error) throw error;
  },
};

export const blockApi = {
  // Idempotent: re-blocking the same user is a no-op.
  async block(params: { blockerId: string; blockedId: string }): Promise<void> {
    const { error } = await supabase
      .from('blocks')
      .upsert(
        { blocker_id: params.blockerId, blocked_id: params.blockedId } as never,
        { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true },
      );
    if (error) throw error;
  },

  async unblock(params: { blockerId: string; blockedId: string }): Promise<void> {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', params.blockerId)
      .eq('blocked_id', params.blockedId);
    if (error) throw error;
  },

  async isBlocked(params: { blockerId: string; blockedId: string }): Promise<boolean> {
    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', params.blockerId)
      .eq('blocked_id', params.blockedId)
      .maybeSingle();
    if (error) throw error;
    return data != null;
  },

  // Two reads (blocks, then the blocked profiles) to avoid depending on a
  // specific embed/FK-constraint name.
  async listBlocked(): Promise<BlockedUser[]> {
    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_id, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = (data ?? []) as { blocked_id: string; created_at: string }[];
    const ids = rows.map((r) => r.blocked_id);
    if (ids.length === 0) return [];

    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, first_name, username, avatar_url')
      .in('id', ids);
    if (pErr) throw pErr;

    const blockedAt = new Map(rows.map((r) => [r.blocked_id, r.created_at]));
    const profileRows = (profiles ?? []) as Pick<BlockedUser, 'id' | 'first_name' | 'username' | 'avatar_url'>[];
    return profileRows.map((p) => ({ ...p, blocked_at: blockedAt.get(p.id) ?? '' }));
  },
};

export const banApi = {
  // Reads the caller's OWN active ban via the SECURITY DEFINER RPC (bans RLS is
  // staff-only). Zero rows => not banned.
  async myStatus(): Promise<MyBanStatus> {
    const { data, error } = await supabase.rpc('my_ban_status' as never);
    if (error) throw error;
    const rows = (data ?? []) as { is_banned: boolean; permanent: boolean; expires_at: string | null }[];
    const row = rows[0];
    if (!row) return { isBanned: false, permanent: false, expiresAt: null };
    return { isBanned: row.is_banned, permanent: row.permanent, expiresAt: row.expires_at };
  },
};
