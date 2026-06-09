import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth-api';

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (password: string) => authApi.updatePassword(password),
  });
}
