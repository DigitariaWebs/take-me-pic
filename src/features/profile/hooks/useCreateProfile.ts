import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, type CreateProfileInput } from '../api/profile-api';
import { profileKeys } from './useProfile';

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProfileInput) => profileApi.create(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.detail(profile.id), profile);
    },
  });
}
