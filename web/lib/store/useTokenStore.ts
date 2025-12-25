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

/**
 * Encodes a token to base64, handling UTF-8 characters properly.
 * Falls back to returning the original token if encoding fails.
 */
const encodeToken = (token: string): string => {
  if (typeof btoa !== 'function') {
    return token;
  }

  try {
    // Try standard btoa for ASCII strings
    return btoa(token);
  } catch {
    // If btoa fails (non-Latin1 chars), use TextEncoder for UTF-8 support
    try {
      if (typeof TextEncoder !== 'undefined') {
        const bytes = new TextEncoder().encode(token);
        const binString = Array.from(bytes, (byte) =>
          String.fromCodePoint(byte)
        ).join('');
        return btoa(binString);
      }
    } catch {
      // If all encoding attempts fail, return token as-is
      // This should not happen in modern browsers
    }
    return token;
  }
};

/**
 * Decodes a base64-encoded token, handling UTF-8 characters properly.
 * Falls back to returning the original value if decoding fails.
 */
const decodeToken = (value: string): string => {
  if (typeof atob !== 'function') {
    return value;
  }

  try {
    const decoded = atob(value);

    // Check if the decoded string contains high bytes (non-ASCII)
    // which indicates it was encoded using TextEncoder
    if (/[\x80-\xFF]/.test(decoded)) {
      try {
        if (typeof TextDecoder !== 'undefined') {
          const bytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
          return new TextDecoder().decode(bytes);
        }
      } catch {
        // If TextDecoder fails, return the atob result
        return decoded;
      }
    }

    return decoded;
  } catch {
    // If decoding fails, return value as-is
    return value;
  }
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
