import { useQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profile-api';

export const profileKeys = {
  all: ['profiles'] as const,
  detail: (id: string) => [...profileKeys.all, 'detail', id] as const,
};

export function useProfile(id: string) {
  return useQuery({
    queryKey: profileKeys.detail(id),
    queryFn: () => profileApi.getById(id),
    enabled: id.length > 0,
  });
}
