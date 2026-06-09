import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSession, onAuthStateChange } from '@/shared/lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const Ctx = createContext<AuthState>({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = (): AuthState => useContext(Ctx);
