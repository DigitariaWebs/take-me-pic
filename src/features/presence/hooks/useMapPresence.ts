import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import { presenceApi } from '../api/presence-api';

export type Coords = { lat: number; lng: number };

/**
 * Map presence controller. Presence is written ONLY on explicit user actions —
 * turning visibility on, or tapping the current-location refresh — never on a
 * timer (no heartbeat). A denied location permission never writes precise
 * presence.
 */
export function useMapPresence(userId: string | undefined) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Resolve a fresh GPS fix. Returns null (and flags denial) without writing
  // anything if permission is not granted.
  const locate = useCallback(async (): Promise<Coords | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setPermissionDenied(true);
      return null;
    }
    setPermissionDenied(false);
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    setCoords(c);
    return c;
  }, []);

  // Visibility ON: locate, then write one presence row. No write if denied.
  const enable = useCallback(async () => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      const c = await locate();
      if (!c) {
        setVisible(false);
        return;
      }
      await presenceApi.setAvailability({ userId, lat: c.lat, lng: c.lng });
      setVisible(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'presence error');
      setVisible(false);
    } finally {
      setBusy(false);
    }
  }, [userId, locate]);

  // Visibility OFF: clear presence server-side.
  const disable = useCallback(async () => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      await presenceApi.goOffline(userId);
      setVisible(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'presence error');
    } finally {
      setBusy(false);
    }
  }, [userId]);

  const toggle = useCallback(
    (next: boolean) => {
      if (next) void enable();
      else void disable();
    },
    [enable, disable],
  );

  // Explicit current-location refresh: re-locate and, if visible, push one update.
  const refresh = useCallback(async () => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      const c = await locate();
      if (c && visible) await presenceApi.setAvailability({ userId, lat: c.lat, lng: c.lng });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'presence error');
    } finally {
      setBusy(false);
    }
  }, [userId, visible, locate]);

  return { visible, coords, permissionDenied, error, busy, toggle, refresh };
}
