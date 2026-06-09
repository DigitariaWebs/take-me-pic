import {
  exchangeTokenHashForSession,
  sendPasswordReset,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  resendSignupVerification,
  updatePassword,
  verifyOtp,
} from '@/shared/lib/supabase';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { EmailPasswordCredentials, OtpCredentials } from '../types';

export const authApi = {
  login: (credentials: EmailPasswordCredentials) => signInWithPassword(credentials),
  signup: (credentials: EmailPasswordCredentials) => signUpWithPassword(credentials),
  verifyOtp: (credentials: OtpCredentials) => verifyOtp(credentials),
  resendSignupVerification: (email: string) => resendSignupVerification(email),
  resetPassword: (email: string) => sendPasswordReset(email),
  updatePassword: (password: string) => updatePassword(password),
  exchangeTokenHashForSession: (params: {
    tokenHash: string;
    type: EmailOtpType;
  }) => exchangeTokenHashForSession(params),
  logout: () => signOut(),
};
