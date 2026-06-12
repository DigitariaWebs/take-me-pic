import { usePushRegistration } from '../hooks/usePushRegistration';

/**
 * Headless mount point for push registration + tap deep-linking. Lives inside
 * the authenticated app shell so it has the auth context but renders nothing.
 */
export function PushRegistrar(): null {
  usePushRegistration();
  return null;
}
