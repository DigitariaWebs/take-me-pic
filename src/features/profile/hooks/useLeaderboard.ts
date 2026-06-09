import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profile-api';

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
};

export function useLeaderboard(limit = 50) {
  return useQuery({
    queryKey: [...leaderboardKeys.all, limit],
    queryFn: () => profileApi.getLeaderboard(limit),
  });
}
