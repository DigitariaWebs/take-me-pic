import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth-api';
import type { EmailPasswordCredentials } from '../types';

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: EmailPasswordCredentials) => authApi.login(credentials),
  });
}
