import { supabase } from '@/shared/lib/supabase';

export type SubmitRatingResult = {
  rating_id: number;
  ratee_id: string;
  new_karma: number;
};

export const ratingApi = {
  // All validation (participant, active session, one-per-session) + the karma
  // bump are server-owned in the submit_rating RPC; idempotent on re-submit.
  async submit(params: { requestId: number; stars: number; comment?: string | null }): Promise<SubmitRatingResult> {
    const { requestId, stars, comment = null } = params;
    const { data, error } = await supabase.rpc('submit_rating', {
      p_request_id: requestId,
      p_stars: stars,
      p_comment: comment,
    } as never);
    if (error) throw error;
    const rows = (data ?? []) as SubmitRatingResult[];
    return rows[0];
  },
};
