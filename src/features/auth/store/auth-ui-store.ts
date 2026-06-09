import { create } from 'zustand';

type AuthUiStore = {
  rememberedEmail: string;
  setRememberedEmail: (email: string) => void;
  clear: () => void;
};

export const useAuthUiStore = create<AuthUiStore>((set) => ({
  rememberedEmail: '',
  setRememberedEmail: (email) => set({ rememberedEmail: email }),
  clear: () => set({ rememberedEmail: '' }),
}));
