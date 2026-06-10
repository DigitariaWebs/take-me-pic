import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, type UpdateProfileInput } from '../api/profile-api';
import { profileKeys } from './useProfile';

type UpdateProfileMutationInput = {
  id: string;
  profile: UpdateProfileInput;
};

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, profile }: UpdateProfileMutationInput) => profileApi.update(id, profile),
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.detail(profile.id), profile);
    },
  });
}
