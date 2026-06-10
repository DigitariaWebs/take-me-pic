import type { Session, User } from '@supabase/supabase-js';
import type { EmailOtpType } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { supabase } from './client';

export type AuthChangeHandler = (session: Session | null) => void;
export type SignUpResult = {
  session: Session | null;
};
type VerifyTokenHashParams = {
  tokenHash: string;
  type: EmailOtpType;
};
const authRedirectPath = 'auth/callback';

function getAuthRedirectUrl(): string {
  return Linking.createURL(authRedirectPath);
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function onAuthStateChange(handler: AuthChangeHandler): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    handler(session);
  });
  return () => data.subscription.unsubscribe();
}

export async function signInWithPassword(params: {
  email: string;
  password: string;
}): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword(params);
  if (error) throw error;
  return data.session;
}

export async function signUpWithPassword(params: {
  email: string;
  password: string;
}): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });
  if (error) throw error;
  return { session: data.session };
}

export async function verifyOtp(params: {
  email: string;
  token: string;
}): Promise<Session | null> {
  const { data, error } = await supabase.auth.verifyOtp({
    email: params.email,
    token: params.token,
    type: 'signup',
  });
  if (error) throw error;
  return data.session;
}

export async function resendSignupVerification(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });
  if (error) throw error;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl(),
  });
  if (error) throw error;
}

export async function updatePassword(password: string): Promise<User> {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  if (!data.user) throw new Error('Password updated but user session is missing');
  return data.user;
}

export async function exchangeTokenHashForSession(params: VerifyTokenHashParams): Promise<Session | null> {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: params.tokenHash,
    type: params.type,
  });
  if (error) throw error;
  return data.session;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
