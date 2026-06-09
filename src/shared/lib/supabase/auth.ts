import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './client';

export type AuthChangeHandler = (session: Session | null) => void;

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
}): Promise<Session | null> {
  const { data, error } = await supabase.auth.signUp(params);
  if (error) throw error;
  return data.session;
}

export async function verifyOtp(params: {
  email: string;
  token: string;
}): Promise<Session | null> {
  const { data, error } = await supabase.auth.verifyOtp({
    email: params.email,
    token: params.token,
    type: 'email',
  });
  if (error) throw error;
  return data.session;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
