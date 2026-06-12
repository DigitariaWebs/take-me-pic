import { useAuth } from '@/shared/providers';
import { useMyBanStatus } from '@/features/safety/hooks/useBanStatus';
import { useProfile } from './useProfile';
import {
  canUseHelpNetwork,
  getTrustedProfileGateState,
  type TrustedProfileGateState,
} from '../lib/profile-gate';

export function useTrustedProfileGate(): {
  state: TrustedProfileGateState;
  canUseHelpNetwork: boolean;
  email: string;
  retry: () => void;
} {
  const { user, isLoading, isAuthenticated } = useAuth();
  const profile = useProfile(user?.id ?? '');
  // Authoritative ban check against the `bans` table. Fail open: undefined while
  // loading or on error → the gate does not block on the bans signal alone.
  const ban = useMyBanStatus(isAuthenticated && Boolean(user));
  const state = getTrustedProfileGateState({
    isAuthLoading: isLoading,
    isAuthenticated,
    user,
    profile: profile.data,
    isProfileLoading: isAuthenticated && profile.isLoading,
    isProfileError: profile.isError,
    hasActiveBan: ban.data?.isBanned,
  });

  return {
    state,
    canUseHelpNetwork: canUseHelpNetwork(state),
    email: user?.email ?? '',
    retry: () => {
      void profile.refetch();
      void ban.refetch();
    },
  };
}
