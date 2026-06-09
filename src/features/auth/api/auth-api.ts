import {
  sendPasswordReset,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  verifyOtp,
} from '@/shared/lib/supabase';
import type { EmailPasswordCredentials, OtpCredentials } from '../types';

export const authApi = {
  login: (credentials: EmailPasswordCredentials) => signInWithPassword(credentials),
  signup: (credentials: EmailPasswordCredentials) => signUpWithPassword(credentials),
  verifyOtp: (credentials: OtpCredentials) => verifyOtp(credentials),
  resetPassword: (email: string) => sendPasswordReset(email),
  logout: () => signOut(),
};
