'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      language: [],
      label: ['help wanted'], // Default label
      sort: 'created',
      searchQuery: '',
      setLanguage: (language) => set({ language }),
      setLabel: (label) => set({ label }),
      setSort: (sort) => set({ sort }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      resetFilters: () =>
        set({
          language: [],
          label: ['help wanted'],
          sort: 'created',
          searchQuery: '',
        }),
    }),
    {
      name: 'contrib-fyi-filters',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        language: state.language,
        label: state.label,
        sort: state.sort,
        searchQuery: state.searchQuery,
      }),
    }
  )
);
