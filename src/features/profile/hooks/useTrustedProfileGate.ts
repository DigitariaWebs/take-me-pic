import { useAuth } from '@/shared/providers';
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
  const state = getTrustedProfileGateState({
    isAuthLoading: isLoading,
    isAuthenticated,
    user,
    profile: profile.data,
    isProfileLoading: isAuthenticated && profile.isLoading,
    isProfileError: profile.isError,
  });

  return {
    state,
    canUseHelpNetwork: canUseHelpNetwork(state),
    email: user?.email ?? '',
    retry: () => {
      void profile.refetch();
    },
  };
}
