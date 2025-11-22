'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

interface TokenState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const STORAGE_KEY = 'contrib-fyi-token';

const encodeToken = (token: string) => {
  if (typeof btoa === 'function') {
    return btoa(token);
  }
  return token;
};

const decodeToken = (value: string) => {
  if (typeof atob === 'function') {
    return atob(value);
  }
  return value;
};

const secureSessionStorage: StateStorage = {
  getItem: (name) => {
    if (typeof sessionStorage === 'undefined') return null;
    const value = sessionStorage.getItem(name);
    if (!value) return null;
    try {
      const parsed = JSON.parse(value);
      if (parsed?.state?.token) {
        parsed.state.token = decodeToken(parsed.state.token);
      }
      return JSON.stringify(parsed);
    } catch {
      return value;
    }
  },
  setItem: (name, value) => {
    if (typeof sessionStorage === 'undefined') return;
    try {
      const parsed = JSON.parse(value);
      if (parsed?.state?.token) {
        parsed.state.token = encodeToken(parsed.state.token);
      }
      sessionStorage.setItem(name, JSON.stringify(parsed));
    } catch {
      sessionStorage.setItem(name, value);
    }
  },
  removeItem: (name) => {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(name);
  },
};

export const useTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => secureSessionStorage),
    }
  )
);
