import { create } from 'zustand';
import type { AuthSession, AuthUser } from '@/types/domain';

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setSession: (session: AuthSession) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  setSession: ({ accessToken, user }) => set({ accessToken, user }),
  clear: () => set({ accessToken: null, user: null }),
}));
