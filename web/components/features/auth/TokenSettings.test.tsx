import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenSettings } from './TokenSettings';

type TokenStoreState = {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
};

const mockStore: TokenStoreState = {
  token: null,
  setToken: vi.fn((token: string) => {
    mockStore.token = token;
  }),
  clearToken: vi.fn(() => {
    mockStore.token = null;
  }),
};

vi.mock('@/lib/store/useTokenStore', () => {
  const useTokenStore = vi.fn(<T,>(selector?: (state: TokenStoreState) => T) =>
    selector ? selector(mockStore) : (mockStore as unknown as T)
  );

  return { useTokenStore };
});

describe('TokenSettings', () => {
  beforeEach(() => {
    mockStore.token = null;
    vi.clearAllMocks();
  });

  const openPopover = () => {
    render(<TokenSettings />);
    fireEvent.click(
      screen.getByRole('button', { name: 'GitHub Token Settings' })
    );
  };

  it('saves trimmed token and closes popover', () => {
    openPopover();

    const input = screen.getByLabelText('Token');
    fireEvent.change(input, { target: { value: '  ghp_testtoken  ' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockStore.setToken).toHaveBeenCalledWith('ghp_testtoken');
    expect(mockStore.token).toBe('ghp_testtoken');
    expect(screen.queryByLabelText('Token')).not.toBeInTheDocument();
  });

  it('clears existing token', () => {
    mockStore.token = 'existing-token';

    openPopover();

    const clearButton = screen.getByRole('button', { name: 'Clear' });
    fireEvent.click(clearButton);

    expect(mockStore.clearToken).toHaveBeenCalled();
    expect(mockStore.token).toBeNull();
  });

  it('toggles token visibility', () => {
    openPopover();

    const input = screen.getByLabelText('Token') as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggleButton = input
      .closest('div')!
      .querySelector('button') as HTMLButtonElement;
    fireEvent.click(toggleButton);
    expect(input.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(input.type).toBe('password');
  });
});
