import type { Session } from '@supabase/supabase-js';

export type EmailPasswordCredentials = {
  email: string;
  password: string;
};

export type OtpCredentials = {
  email: string;
  token: string;
};

export type SignupResult = {
  session: Session | null;
};
