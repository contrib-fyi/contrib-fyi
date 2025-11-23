import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from './useFilterStore';

describe('useFilterStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useFilterStore.setState({
      language: [],
      label: ['help wanted'],
      sort: 'created',
      searchQuery: '',
      onlyNoComments: false,
      minStars: null,
    });
    localStorage.clear();
  });

  it('should have default values', () => {
    const state = useFilterStore.getState();

    expect(state.language).toEqual([]);
    expect(state.label).toEqual(['help wanted']);
    expect(state.sort).toBe('created');
    expect(state.searchQuery).toBe('');
    expect(state.onlyNoComments).toBe(false);
    expect(state.minStars).toBeNull();
  });

  it('should set language', () => {
    const { setLanguage } = useFilterStore.getState();

    setLanguage(['TypeScript', 'JavaScript']);

    expect(useFilterStore.getState().language).toEqual([
      'TypeScript',
      'JavaScript',
    ]);
  });

  it('should set label', () => {
    const { setLabel } = useFilterStore.getState();

    setLabel(['good first issue', 'bug']);

    expect(useFilterStore.getState().label).toEqual([
      'good first issue',
      'bug',
    ]);
  });

  it('should set sort', () => {
    const { setSort } = useFilterStore.getState();

    setSort('updated');

    expect(useFilterStore.getState().sort).toBe('updated');
  });

  it('should set search query', () => {
    const { setSearchQuery } = useFilterStore.getState();

    setSearchQuery('authentication');

    expect(useFilterStore.getState().searchQuery).toBe('authentication');
  });

  it('should set onlyNoComments', () => {
    const { setOnlyNoComments } = useFilterStore.getState();

    setOnlyNoComments(true);

    expect(useFilterStore.getState().onlyNoComments).toBe(true);
  });

  it('should set minStars', () => {
    const { setMinStars } = useFilterStore.getState();

    setMinStars(500);

    expect(useFilterStore.getState().minStars).toBe(500);
  });

  it('should reset filters to default', () => {
    const { setLanguage, setLabel, setSort, setMinStars, resetFilters } =
      useFilterStore.getState();

    // Modify all filters
    setLanguage(['Python']);
    setLabel(['bug']);
    setSort('comments');
    setMinStars(1000);

    // Reset
    resetFilters();

    const state = useFilterStore.getState();
    expect(state.language).toEqual([]);
    expect(state.label).toEqual(['help wanted']);
    expect(state.sort).toBe('created');
    expect(state.searchQuery).toBe('');
    expect(state.onlyNoComments).toBe(false);
    expect(state.minStars).toBeNull();
  });

  it('should persist state to localStorage', () => {
    const { setLanguage, setLabel } = useFilterStore.getState();

    setLanguage(['Rust']);
    setLabel(['enhancement']);

    // Check localStorage
    const stored = localStorage.getItem('contrib-fyi-filters');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.language).toEqual(['Rust']);
    expect(parsed.state.label).toEqual(['enhancement']);
  });

  it('should handle empty language array', () => {
    const { setLanguage } = useFilterStore.getState();

    setLanguage(['TypeScript']);
    setLanguage([]);

    expect(useFilterStore.getState().language).toEqual([]);
  });

  it('should handle empty label array', () => {
    const { setLabel } = useFilterStore.getState();

    setLabel([]);

    expect(useFilterStore.getState().label).toEqual([]);
  });

  it('should handle null minStars', () => {
    const { setMinStars } = useFilterStore.getState();

    setMinStars(100);
    setMinStars(null);

    expect(useFilterStore.getState().minStars).toBeNull();
  });
});
