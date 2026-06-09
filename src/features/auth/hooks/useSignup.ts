import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth-api';
import type { EmailPasswordCredentials } from '../types';

export function useSignup() {
  return useMutation({
    mutationFn: (credentials: EmailPasswordCredentials) => authApi.signup(credentials),
  });
}
