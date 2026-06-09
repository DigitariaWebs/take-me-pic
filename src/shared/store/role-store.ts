import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Role = 'helper' | 'seeker';

const STORAGE_KEY = '@tmp/role';

type RoleStore = {
  role: Role;
  hasHydrated: boolean;
  setRole: (role: Role) => void;
  toggle: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useRoleStore = create<RoleStore>()(
  persist(
    (set, get) => ({
      role: 'seeker',
      hasHydrated: false,
      setRole: (role) => set({ role }),
      toggle: () => set({ role: get().role === 'helper' ? 'seeker' : 'helper' }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ role: state.role }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
