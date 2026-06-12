import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import {
  getPushPermissionStatus,
  requestPushPermission,
  type PushPermissionStatus,
} from '../lib/push';

/**
 * Tracks OS push permission for the in-app fallback banner. Re-checks when the
 * app returns to the foreground, so the banner clears after the user enables
 * notifications in Settings.
 */
export function usePushPermission() {
  const [status, setStatus] = useState<PushPermissionStatus | null>(null);

  const refresh = useCallback(async () => {
    setStatus(await getPushPermissionStatus());
  }, []);

  useEffect(() => {
    void refresh();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  // First denial happens in-app; once the OS has a hard answer the only way back
  // is the system settings screen.
  const enable = useCallback(async () => {
    const current = await getPushPermissionStatus();
    if (current === 'undetermined') {
      const next = await requestPushPermission();
      setStatus(next);
      if (next === 'granted') return;
    }
    await Linking.openSettings().catch(() => {});
  }, []);

  return { status, refresh, enable };
}
