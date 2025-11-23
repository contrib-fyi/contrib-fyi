import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ComponentProps } from 'react';
import { FilterBar } from './FilterBar';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { useTokenStore } from '@/lib/store/useTokenStore';
import type { Option } from '@/components/ui/multi-select';

// Mock stores
vi.mock('@/lib/store/useFilterStore');
vi.mock('@/lib/store/useTokenStore');

// Mock child components
vi.mock('@/components/ui/multi-select', () => ({
  MultiSelect: ({
    options,
    selected,
    onChange,
    placeholder,
  }: MockMultiSelectProps) => (
    <div data-testid="multi-select">
      <span>{placeholder}</span>
      <select
        multiple
        value={selected}
        onChange={(e) =>
          onChange(
            Array.from(e.target.selectedOptions, (option) => option.value)
          )
        }
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

type MockMultiSelectProps = {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
} & ComponentProps<'div'>;

describe('FilterBar', () => {
  const mockSetLanguage = vi.fn();
  const mockSetLabel = vi.fn();
  const mockSetSort = vi.fn();
  const mockSetSearchQuery = vi.fn();
  const mockSetOnlyNoComments = vi.fn();
  const mockSetMinStars = vi.fn();
  const mockResetFilters = vi.fn();
  const mockedUseFilterStore = vi.mocked(useFilterStore);
  const mockedUseTokenStore = vi.mocked(useTokenStore);
  const setTokenSelectorResult = (tokenValue: string | null) => {
    const tokenState = {
      token: tokenValue,
      setToken: vi.fn(),
      clearToken: vi.fn(),
    } as ReturnType<typeof useTokenStore>;

    mockedUseTokenStore.mockImplementation(((
      selector?: (state: ReturnType<typeof useTokenStore>) => unknown
    ) => {
      if (selector) {
        return selector(tokenState);
      }
      return tokenState;
    }) as typeof useTokenStore);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockFilterState = {
      language: [],
      label: [],
      sort: 'created' as const,
      searchQuery: '',
      onlyNoComments: false,
      minStars: null,
      setLanguage: mockSetLanguage,
      setLabel: mockSetLabel,
      setSort: mockSetSort,
      setSearchQuery: mockSetSearchQuery,
      setOnlyNoComments: mockSetOnlyNoComments,
      setMinStars: mockSetMinStars,
      resetFilters: mockResetFilters,
    } satisfies ReturnType<typeof useFilterStore>;

    mockedUseFilterStore.mockReturnValue(mockFilterState);
    mockedUseFilterStore.subscribe = vi
      .fn(() => vi.fn())
      .mockName('useFilterStore.subscribe') as typeof useFilterStore.subscribe;

    setTokenSelectorResult('mock-token');
  });

  it('renders search input', () => {
    render(<FilterBar />);
    expect(screen.getByPlaceholderText('Search issues...')).toBeInTheDocument();
  });

  it('updates search query on Enter key', () => {
    render(<FilterBar />);
    const input = screen.getByPlaceholderText('Search issues...');
    fireEvent.change(input, { target: { value: 'react' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockSetSearchQuery).toHaveBeenCalledWith('react');
  });

  it('renders "Search" button and triggers search', () => {
    render(<FilterBar />);
    const searchButton = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(searchButton);
    expect(mockSetSearchQuery).toHaveBeenCalled();
  });

  it('renders "Reset" button and resets filters', () => {
    render(<FilterBar />);
    const resetButton = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetButton);
    expect(mockResetFilters).toHaveBeenCalled();
  });

  it('renders "More filters" button', () => {
    render(<FilterBar />);
    expect(
      screen.getByRole('button', { name: /More filters/i })
    ).toBeInTheDocument();
  });

  it('opens advanced filters dialog', async () => {
    render(<FilterBar />);
    const moreFiltersButton = screen.getByRole('button', {
      name: /More filters/i,
    });
    fireEvent.click(moreFiltersButton);

    expect(await screen.findByText('Advanced filters')).toBeInTheDocument();
    expect(
      screen.getByText('Only issues with zero comments')
    ).toBeInTheDocument();
  });

  it('shows "Minimum Stars" input in advanced filters when token is present', async () => {
    setTokenSelectorResult('mock-token');
    render(<FilterBar />);
    fireEvent.click(screen.getByRole('button', { name: /More filters/i }));

    expect(await screen.findByText('Minimum Stars')).toBeInTheDocument();
  });

  it('hides "Minimum Stars" input in advanced filters when token is missing', async () => {
    setTokenSelectorResult(null);
    render(<FilterBar />);
    fireEvent.click(screen.getByRole('button', { name: /More filters/i }));

    // Wait for dialog to open
    await screen.findByText('Advanced filters');
    expect(screen.queryByText('Minimum Stars')).not.toBeInTheDocument();
  });
});
