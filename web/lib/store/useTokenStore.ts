import { create } from 'zustand';

interface TokenState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  token:
    typeof window !== 'undefined' ? localStorage.getItem('github_token') : null,
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('github_token', token);
    }
    set({ token });
  },
  clearToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('github_token');
    }
    set({ token: null });
  },
}));
