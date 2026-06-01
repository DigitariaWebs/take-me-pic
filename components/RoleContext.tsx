import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The user's current role on Take Me Pic — the two sides of the marketplace:
 *  - 'seeker'  → I want a photo of me. I browse HELPERS and request photos.
 *  - 'helper'  → I take photos for others. I browse SEEKERS and offer to help.
 *
 * The whole app reads this to render the right side of each screen
 * (map content, CTAs, request direction, session view, profile stats…).
 */
export type Role = 'helper' | 'seeker';

const KEY = '@tmp/role';

type RoleCtx = { role: Role; setRole: (r: Role) => void; toggle: () => void; isHelper: boolean };

const Ctx = createContext<RoleCtx>({
  role: 'seeker',
  setRole: () => {},
  toggle: () => {},
  isHelper: false,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('seeker');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(KEY);
        if (stored === 'helper' || stored === 'seeker') setRoleState(stored);
      } catch {
        /* storage unavailable — keep default */
      }
    })();
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    AsyncStorage.setItem(KEY, r).catch(() => {});
  };

  const toggle = () => setRole(role === 'helper' ? 'seeker' : 'helper');

  return (
    <Ctx.Provider value={{ role, setRole, toggle, isHelper: role === 'helper' }}>
      {children}
    </Ctx.Provider>
  );
}

export const useRole = () => useContext(Ctx);
