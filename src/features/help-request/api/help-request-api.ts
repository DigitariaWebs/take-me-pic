import { supabase } from '@/shared/lib/supabase';
import type { RequestStatus, Tables } from '@/shared/lib/supabase';

export type HelpRequest = Tables<'help_requests'>;

// Shape returned by accept_help_request (the RPC creates/links the conversation).
export type AcceptResult = {
  help_request_id: number;
  conversation_id: number | null;
  status: RequestStatus;
  requester_id: string;
  helper_id: string | null;
  accepted_at: string | null;
};

function pointEwkt(lat: number, lng: number): string {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

export const helpRequestApi = {
  // Broadcast a help request from the requester's current location. expires_at is
  // left to the server default; status defaults to 'requested'.
  async create(params: {
    requesterId: string;
    lat: number;
    lng: number;
    peopleCount?: number;
    note?: string | null;
  }): Promise<HelpRequest> {
    const { requesterId, lat, lng, peopleCount = 1, note = null } = params;
    const { data, error } = await supabase
      .from('help_requests')
      .insert({
        requester_id: requesterId,
        location: pointEwkt(lat, lng),
        people_count: peopleCount,
        note,
      } as never)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  // Cancel only while still open — the status guard makes cancel-after-accept a
  // no-op (the row is no longer 'requested').
  async cancel(id: number): Promise<void> {
    const { error } = await supabase
      .from('help_requests')
      .update({ status: 'cancelled' } as never)
      .eq('id', id)
      .eq('status', 'requested');
    if (error) throw error;
  },

  // Atomic accept via the RPC — all races (duplicate accept, expiry, own-request,
  // banned) are resolved server-side; it also creates/links the conversation.
  async accept(requestId: number): Promise<AcceptResult> {
    const { data, error } = await supabase.rpc('accept_help_request', {
      request_id: requestId,
    } as never);
    if (error) throw error;
    const rows = (data ?? []) as AcceptResult[];
    return rows[0];
  },

  async getById(id: number): Promise<HelpRequest | null> {
    const { data, error } = await supabase.from('help_requests').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },
};
