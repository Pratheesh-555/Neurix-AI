import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user:  null,

      setAuth: (token, user) => set({ token, user }),

      updateUser: (updates) =>
        set((s) => ({ user: s.user ? { ...s.user, ...updates } : updates })),

      logout: () => {
        set({ token: null, user: null });
        window.location.href = '/login';
      },
    }),
    { name: 'auth-storage' }
  )
);

export default useAuthStore;
