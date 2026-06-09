import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth-api';

export function useResetPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.resetPassword(email),
  });
}
