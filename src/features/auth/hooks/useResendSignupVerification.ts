import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth-api';

export function useResendSignupVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendSignupVerification(email),
  });
}
