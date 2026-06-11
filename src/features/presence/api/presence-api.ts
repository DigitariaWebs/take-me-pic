import { supabase } from '@/shared/lib/supabase';
import type { PresenceStatus, Tables } from '@/shared/lib/supabase';

export type NearbyHelper = Tables<'profiles'>;

// PostGIS geography is written as EWKT — note the lng/lat order and SRID 4326.
function pointEwkt(lat: number, lng: number): string {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

export const presenceApi = {
  // Write a scoped presence row. Called ONLY on explicit map-visibility opt-in
  // after a location-permission grant — never on a timer (no heartbeat).
  async setAvailability(params: {
    userId: string;
    lat: number;
    lng: number;
    shareRadiusM?: number;
    status?: PresenceStatus;
  }): Promise<void> {
    const { userId, lat, lng, shareRadiusM = 2000, status = 'available' } = params;
    const { error } = await supabase.from('presence').upsert(
      {
        user_id: userId,
        status,
        location: pointEwkt(lat, lng),
        share_radius_m: shareRadiusM,
      } as never,
      { onConflict: 'user_id' },
    );
    if (error) throw error;
  },

  // Turn visibility off: mark offline and drop the precise location server-side.
  async goOffline(userId: string): Promise<void> {
    const { error } = await supabase.from('presence').upsert(
      { user_id: userId, status: 'offline', location: null } as never,
      { onConflict: 'user_id' },
    );
    if (error) throw error;
  },

  // Radius lookup via the PostGIS RPC. Server-side geo + safety filtering — the
  // client never filters a global set by distance.
  async findAvailableHelpers(params: {
    lat: number;
    lng: number;
    radiusM: number;
  }): Promise<NearbyHelper[]> {
    const { lat, lng, radiusM } = params;
    // Cast works around a supabase-js generic-resolution quirk where the rpc
    // overload falls back to the no-args signature; runtime args are verified.
    const { data, error } = await supabase.rpc('find_available_helpers', {
      lat,
      lng,
      radius_m: radiusM,
    } as never);
    if (error) throw error;
    return (data ?? []) as NearbyHelper[];
  },
};
