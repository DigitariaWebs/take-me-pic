import { supabase } from '@/shared/lib/supabase';
import type { StoreKind } from '@/shared/lib/supabase';

export const pushApi = {
  /**
   * Bind this device's Expo push token to the authenticated user. `token` is
   * globally unique, so `on conflict (token)` re-binds a device that was
   * previously registered to another account (stale/replaced-token handling).
   */
  async registerToken(params: { userId: string; token: string; platform: StoreKind }): Promise<void> {
    const { error } = await supabase
      .from('push_tokens')
      .upsert(
        { user_id: params.userId, token: params.token, platform: params.platform } as never,
        { onConflict: 'token' },
      );
    if (error) throw error;
  },

  async removeToken(token: string): Promise<void> {
    const { error } = await supabase.from('push_tokens').delete().eq('token', token);
    if (error) throw error;
  },
};
