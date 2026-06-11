import { useQuery } from '@tanstack/react-query';
import { presenceApi, type NearbyHelper } from '../api/presence-api';
import type { Coords } from './useMapPresence';

export const nearbyKeys = {
  all: ['nearby-helpers'] as const,
  near: (lat: number, lng: number, radiusM: number) =>
    [...nearbyKeys.all, lat.toFixed(3), lng.toFixed(3), radiusM] as const,
};

/**
 * Available helpers within a radius via the `find_available_helpers` RPC.
 * Geo + safety filtering is server-side; the client never distance-filters a
 * global set. Short staleTime gives a fast return to the map without polling.
 */
export function useNearbyHelpers(center: Coords | null, radiusM: number, enabled: boolean) {
  return useQuery<NearbyHelper[]>({
    queryKey: nearbyKeys.near(center?.lat ?? 0, center?.lng ?? 0, radiusM),
    queryFn: () => presenceApi.findAvailableHelpers({ lat: center!.lat, lng: center!.lng, radiusM }),
    enabled: enabled && center !== null,
    staleTime: 30_000,
  });
}
