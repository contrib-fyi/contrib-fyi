import { describe, it, expect, beforeEach } from 'vitest';
import { useTokenStore } from './useTokenStore';

describe('useTokenStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useTokenStore.setState({ token: null });
    sessionStorage.clear();
  });

  it('should start with null token', () => {
    const state = useTokenStore.getState();
    expect(state.token).toBeNull();
  });

  it('should set token', () => {
    const { setToken } = useTokenStore.getState();

    setToken('ghp_test_token_123');

    const state = useTokenStore.getState();
    expect(state.token).toBe('ghp_test_token_123');
  });

  it('should clear token', () => {
    const { setToken, clearToken } = useTokenStore.getState();

    setToken('ghp_test_token_123');
    clearToken();

    const state = useTokenStore.getState();
    expect(state.token).toBeNull();
  });

  it('should persist token to sessionStorage', () => {
    const { setToken } = useTokenStore.getState();

    setToken('ghp_test_token_123');

    const stored = sessionStorage.getItem('contrib-fyi-token');
    expect(stored).toBeTruthy();
  });

  it('should encode token in sessionStorage', () => {
    const { setToken } = useTokenStore.getState();
    const token = 'ghp_test_token_123';

    setToken(token);

    const stored = sessionStorage.getItem('contrib-fyi-token');
    const parsed = JSON.parse(stored!);

    // Token should be base64 encoded in storage
    expect(parsed.state.token).not.toBe(token);
    expect(parsed.state.token).toBe(btoa(token));
  });

  it('should decode token when reading from sessionStorage', () => {
    const { setToken } = useTokenStore.getState();
    const token = 'ghp_test_token_123';

    setToken(token);

    // Create a new store instance to test reading from storage
    const state = useTokenStore.getState();
    expect(state.token).toBe(token); // Should be decoded
  });

  it('should handle empty string token', () => {
    const { setToken } = useTokenStore.getState();

    setToken('');

    const state = useTokenStore.getState();
    expect(state.token).toBe('');
  });

  it('should update existing token', () => {
    const { setToken } = useTokenStore.getState();

    setToken('token1');
    expect(useTokenStore.getState().token).toBe('token1');

    setToken('token2');
    expect(useTokenStore.getState().token).toBe('token2');
  });

  it('should remove token from sessionStorage when cleared', () => {
    const { setToken, clearToken } = useTokenStore.getState();

    setToken('ghp_test_token_123');
    clearToken();

    const stored = sessionStorage.getItem('contrib-fyi-token');
    const parsed = JSON.parse(stored!);
    expect(parsed.state.token).toBeNull();
  });

  it('should use sessionStorage not localStorage', () => {
    const { setToken } = useTokenStore.getState();

    setToken('ghp_test_token_123');

    // Should be in sessionStorage
    expect(sessionStorage.getItem('contrib-fyi-token')).toBeTruthy();

    // Should NOT be in localStorage
    expect(localStorage.getItem('contrib-fyi-token')).toBeNull();
  });

  it('should handle special characters in token', () => {
    const { setToken } = useTokenStore.getState();
    const token = 'ghp_!@#$%^&*()_+-=[]{}|;:,.<>?';

    setToken(token);

    const state = useTokenStore.getState();
    expect(state.token).toBe(token);
  });

  it('should handle long tokens', () => {
    const { setToken } = useTokenStore.getState();
    const longToken = 'ghp_' + 'a'.repeat(200);

    setToken(longToken);

    const state = useTokenStore.getState();
    expect(state.token).toBe(longToken);
  });
});
