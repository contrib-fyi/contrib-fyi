import { STORAGE_KEYS } from '@/lib/constants/storageKeys';

export class TokenService {
  private static instance: TokenService;

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_GITHUB_TOKEN ?? null;
    }

    // Prefer sessionStorage (aligned with useTokenStore)
    const sessionEncoded = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    if (sessionEncoded) {
      try {
        return atob(JSON.parse(sessionEncoded)?.state?.token ?? '');
      } catch {
        // fall through to other sources
      }
    }

    // Fallback: legacy localStorage key
    const legacy = localStorage.getItem('github_token');
    if (legacy) return legacy;

    return null;
  }

  setToken(token: string) {
    if (typeof window === 'undefined') return;
    try {
      const encoded = btoa(token);
      sessionStorage.setItem(
        STORAGE_KEYS.TOKEN,
        JSON.stringify({ state: { token: encoded } })
      );
    } catch {
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }
  }

  clearToken() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem('github_token');
  }
}
