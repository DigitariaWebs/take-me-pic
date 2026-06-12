import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import type { StoreKind } from '@/shared/lib/supabase';

export type PushPermissionStatus = 'granted' | 'denied' | 'undetermined';

// Foreground presentation: a push that lands while the app is open still shows
// a banner. The in-app `notifications` row is the canonical record either way.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Map the running OS to the `store_kind` enum used by `push_tokens.platform`. */
export function platformToStoreKind(): StoreKind | null {
  if (Platform.OS === 'ios') return 'apple';
  if (Platform.OS === 'android') return 'google';
  return null;
}

export async function getPushPermissionStatus(): Promise<PushPermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as PushPermissionStatus;
}

export async function requestPushPermission(): Promise<PushPermissionStatus> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status as PushPermissionStatus;
}

/** Android requires a channel before notifications display; safe to call repeatedly. */
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.HIGH,
  }).catch(() => {});
}

/**
 * Mint the device's Expo push token. Returns null on a simulator/emulator
 * (no push capability) or when the EAS projectId is unavailable, so callers can
 * fall back to the in-app path without crashing.
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId;
  if (!projectId) return null;
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch {
    return null;
  }
}

/**
 * Deep-link from a tapped notification into the right screen, driven by the
 * `data` payload the server triggers attach. Unknown/missing targets degrade to
 * the notifications list rather than crashing.
 */
export function routeFromNotificationData(data: unknown): void {
  if (!data || typeof data !== 'object') return;
  const d = data as Record<string, unknown>;
  switch (d.type) {
    case 'incoming_request':
      router.push('/request/incoming');
      break;
    case 'request_accepted':
      router.push('/request/sent');
      break;
    case 'new_message':
      if (d.conversation_id != null) {
        router.push(`/chat/${d.conversation_id}`);
      } else {
        router.push('/notifications');
      }
      break;
    default:
      router.push('/notifications');
  }
}
