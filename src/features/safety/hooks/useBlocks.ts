import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/providers';
import { nearbyKeys } from '@/features/presence';
import { blockApi, type BlockedUser } from '../api/safety-api';

export const blockKeys = {
  list: ['blocks', 'list'] as const,
  is: (blockedId: string) => ['blocks', 'is', blockedId] as const,
};

export function useBlockedUsers() {
  return useQuery<BlockedUser[]>({
    queryKey: blockKeys.list,
    queryFn: () => blockApi.listBlocked(),
  });
}

export function useIsBlocked(blockedId: string | null | undefined) {
  const { user } = useAuth();
  return useQuery<boolean>({
    queryKey: blockKeys.is(blockedId ?? ''),
    queryFn: () => blockApi.isBlocked({ blockerId: user!.id, blockedId: blockedId! }),
    enabled: Boolean(user?.id && blockedId),
  });
}

/** Invalidate the block list + nearby matching so a blocked user disappears. */
function useInvalidateAfterBlockChange() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['blocks'] });
    void queryClient.invalidateQueries({ queryKey: nearbyKeys.all });
  };
}

export function useBlockUser() {
  const { user } = useAuth();
  const invalidate = useInvalidateAfterBlockChange();
  return useMutation({
    mutationFn: (blockedId: string) => blockApi.block({ blockerId: user!.id, blockedId }),
    onSuccess: invalidate,
  });
}

export function useUnblockUser() {
  const { user } = useAuth();
  const invalidate = useInvalidateAfterBlockChange();
  return useMutation({
    mutationFn: (blockedId: string) => blockApi.unblock({ blockerId: user!.id, blockedId }),
    onSuccess: invalidate,
  });
}
