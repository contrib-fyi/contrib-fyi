import { beforeEach, describe, expect, it } from 'vitest';

import { STORAGE_KEYS } from '@/lib/constants/storageKeys';
import { TokenService } from './TokenService';

describe('TokenService', () => {
  const globalWithWindow = globalThis as typeof globalThis & {
    window?: Window;
  };
  let originalWindow: Window & typeof globalThis;
  const service = TokenService.getInstance();

  beforeEach(() => {
    originalWindow = global.window as Window & typeof globalThis;
    localStorage.clear();
    sessionStorage.clear();
    delete process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  });

  it('is a singleton', () => {
    const another = TokenService.getInstance();
    expect(another).toBe(service);
  });

  it('returns env token when running server-side', () => {
    // Simulate server-side by removing window
    globalWithWindow.window = undefined as unknown as Window &
      typeof globalThis;
    process.env.NEXT_PUBLIC_GITHUB_TOKEN = 'server-token';

    const token = service.getToken();
    expect(token).toBe('server-token');

    // Restore jsdom window for other tests
    globalWithWindow.window = originalWindow;
  });

  it('prefers sessionStorage token (encoded)', () => {
    const encoded = btoa('abc123');
    sessionStorage.setItem(
      STORAGE_KEYS.TOKEN,
      JSON.stringify({ state: { token: encoded } })
    );

    const token = service.getToken();
    expect(token).toBe('abc123');
  });

  it('falls back to legacy localStorage token', () => {
    sessionStorage.setItem(STORAGE_KEYS.TOKEN, 'not-json');
    localStorage.setItem('github_token', 'legacy-token');

    const token = service.getToken();
    expect(token).toBe('legacy-token');
  });

  it('setToken stores encoded token and getToken decodes it', () => {
    service.setToken('secret');

    const raw = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.state.token).toBe(btoa('secret'));

    expect(service.getToken()).toBe('secret');
  });

  it('clearToken removes both session and legacy tokens', () => {
    sessionStorage.setItem(STORAGE_KEYS.TOKEN, 'foo');
    localStorage.setItem('github_token', 'bar');

    service.clearToken();

    expect(sessionStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
    expect(localStorage.getItem('github_token')).toBeNull();
  });
});
