import { create } from 'zustand';

interface FilterState {
  language: string[];
  label: string[];
  sort: 'created' | 'updated' | 'comments';
  searchQuery: string;
  setLanguage: (language: string[]) => void;
  setLabel: (label: string[]) => void;
  setSort: (sort: 'created' | 'updated' | 'comments') => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  language: [],
  label: [], // Default label
  sort: 'created',
  searchQuery: '',
  setLanguage: (language) => set({ language }),
  setLabel: (label) => set({ label }),
  setSort: (sort) => set({ sort }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  resetFilters: () =>
    set({
      language: [],
      label: [],
      sort: 'created',
      searchQuery: '',
    }),
}));
