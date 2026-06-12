import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/shared/providers';
import { pushApi } from '../api/push-api';
import {
  ensureAndroidChannel,
  getExpoPushToken,
  getPushPermissionStatus,
  platformToStoreKind,
  requestPushPermission,
  routeFromNotificationData,
} from '../lib/push';

/**
 * Registers the device push token for the authenticated user and wires push
 * taps to deep links. Mounted once near the root (see PushRegistrar). Runs
 * whenever an authenticated user is present — covering first login, post
 * profile-completion, and every subsequent launch — and is a no-op on
 * simulators (which cannot mint a token) or when permission is not granted.
 */
export function usePushRegistration() {
  const { isAuthenticated, user } = useAuth();
  const registeredToken = useRef<string | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      registeredToken.current = null;
      return;
    }
    let cancelled = false;

    void (async () => {
      await ensureAndroidChannel();
      let status = await getPushPermissionStatus();
      if (status === 'undetermined') status = await requestPushPermission();
      if (cancelled || status !== 'granted') return;

      const platform = platformToStoreKind();
      if (!platform) return;

      const token = await getExpoPushToken();
      if (cancelled || !token || registeredToken.current === token) return;

      try {
        await pushApi.registerToken({ userId, token, platform });
        registeredToken.current = token;
      } catch {
        // Best-effort: a failed write retries on the next auth/foreground cycle.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userId]);

  // Route from a tapped notification (warm) and from a cold start launched by
  // tapping a notification.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      routeFromNotificationData(response.notification.request.content.data);
    });
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) routeFromNotificationData(response.notification.request.content.data);
    });
    return () => sub.remove();
  }, []);
}
