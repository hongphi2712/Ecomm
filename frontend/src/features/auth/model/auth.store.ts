import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/shared/types/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      updateUser: (updatedData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedData } : null,
        })),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // saves to localStorage
      partialize: (state) => ({ 
        accessToken: state.accessToken, 
        refreshToken: state.refreshToken,
        user: state.user 
      }),
    }
  )
);
