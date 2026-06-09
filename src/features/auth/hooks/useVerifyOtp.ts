import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth-api';
import type { OtpCredentials } from '../types';

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (credentials: OtpCredentials) => authApi.verifyOtp(credentials),
  });
}
