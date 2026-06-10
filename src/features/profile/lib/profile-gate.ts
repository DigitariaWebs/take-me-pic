import type { User } from '@supabase/supabase-js';
import type { Profile } from '../api/profile-api';

export const MIN_TRUSTED_PROFILE_AGE = 13;

export type TrustedProfileGateState =
  | 'loading'
  | 'signed_out'
  | 'email_unverified'
  | 'profile_missing'
  | 'blocked'
  | 'error'
  | 'ready';

export type TrustedProfileInput = {
  first_name: string;
  username: string;
  age: number;
  city: string;
  languages: string[];
};

type ProfileGateInput = {
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  profile: Profile | null | undefined;
  isProfileLoading: boolean;
  isProfileError: boolean;
};

export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, '').toLowerCase();
}

export function isEmailVerified(user: User | null): boolean {
  if (!user) {
    return false;
  }

  return Boolean(user.email_confirmed_at);
}

export function isTrustedProfile(profile: Profile | null | undefined): profile is Profile {
  if (!profile) {
    return false;
  }

  return (
    profile.first_name.trim().length > 0 &&
    normalizeUsername(profile.username).length > 0 &&
    typeof profile.age === 'number' &&
    profile.age >= MIN_TRUSTED_PROFILE_AGE &&
    typeof profile.city === 'string' &&
    profile.city.trim().length > 0 &&
    Array.isArray(profile.languages) &&
    profile.languages.length > 0
  );
}

export function validateTrustedProfileInput(input: TrustedProfileInput): boolean {
  return (
    input.first_name.trim().length > 0 &&
    normalizeUsername(input.username).length > 0 &&
    Number.isFinite(input.age) &&
    input.age >= MIN_TRUSTED_PROFILE_AGE &&
    input.city.trim().length > 0 &&
    input.languages.length > 0
  );
}

export function getTrustedProfileGateState(input: ProfileGateInput): TrustedProfileGateState {
  if (input.isAuthLoading) {
    return 'loading';
  }

  if (!input.isAuthenticated || !input.user) {
    return 'signed_out';
  }

  if (!isEmailVerified(input.user)) {
    return 'email_unverified';
  }

  if (input.isProfileLoading) {
    return 'loading';
  }

  if (input.isProfileError) {
    return 'error';
  }

  if (!isTrustedProfile(input.profile)) {
    return 'profile_missing';
  }

  if (input.profile.is_banned) {
    return 'blocked';
  }

  return 'ready';
}

export function canUseHelpNetwork(state: TrustedProfileGateState): boolean {
  return state === 'ready';
}
