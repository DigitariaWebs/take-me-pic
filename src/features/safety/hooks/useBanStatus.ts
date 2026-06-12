import { useQuery } from '@tanstack/react-query';
import { banApi, type MyBanStatus } from '../api/safety-api';

export const banKeys = {
  me: ['ban', 'me'] as const,
};

/**
 * The caller's own active-ban status (via the my_ban_status RPC over the
 * staff-only bans table). Drives the trusted-profile gate. `enabled` is gated on
 * an authenticated user by the caller.
 */
export function useMyBanStatus(enabled: boolean) {
  return useQuery<MyBanStatus>({
    queryKey: banKeys.me,
    queryFn: () => banApi.myStatus(),
    enabled,
    staleTime: 60_000,
  });
}
