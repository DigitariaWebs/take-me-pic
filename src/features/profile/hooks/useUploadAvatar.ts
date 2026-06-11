import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAvatar } from '@/shared/lib/supabase';
import { profileApi } from '../api/profile-api';
import { profileKeys } from './useProfile';

type UploadAvatarInput = {
  userId: string;
  data: ArrayBuffer | Blob | Uint8Array;
  contentType?: string;
  ext?: string;
};

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    // Upload to storage first, then persist avatar_url only once the upload
    // succeeds — so a failed upload never leaves the profile pointing at a
    // missing object (no partially broken trusted profile).
    mutationFn: async ({ userId, data, contentType, ext }: UploadAvatarInput) => {
      const avatarUrl = await uploadAvatar({ userId, data, contentType, ext });
      return profileApi.update(userId, { avatar_url: avatarUrl });
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.detail(profile.id), profile);
    },
  });
}
