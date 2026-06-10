import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSession, onAuthStateChange } from '@/shared/lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthState>({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Pull the current session straight from the Supabase client. The client
  // already holds the session synchronously once sign-in/verify resolves, while
  // onAuthStateChange only notifies on the next tick — so callers that navigate
  // immediately after authenticating must await this to avoid a stale
  // signed-out read at the route gate.
  const refresh = useCallback(async () => {
    const current = await getSession();
    setSession(current);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    void getSession().then((current) => {
      if (!isMounted) return;
      setSession(current);
      setIsLoading(false);
    });
    const unsubscribe = onAuthStateChange((next) => setSession(next));
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    isLoading,
    isAuthenticated: session !== null,
    refresh,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = (): AuthState => useContext(Ctx);
