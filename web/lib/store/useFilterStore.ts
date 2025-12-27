'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FilterState {
  language: string[];
  label: string[];
  sort: 'created' | 'updated' | 'comments';
  searchQuery: string;
  onlyNoComments: boolean;
  onlyNoLinkedPRs: boolean;
  minStars: number | null;
  setLanguage: (language: string[]) => void;
  setLabel: (label: string[]) => void;
  setSort: (sort: 'created' | 'updated' | 'comments') => void;
  setSearchQuery: (query: string) => void;
  setOnlyNoComments: (onlyNoComments: boolean) => void;
  setOnlyNoLinkedPRs: (onlyNoLinkedPRs: boolean) => void;
  setMinStars: (minStars: number | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      language: [],
      label: ['help wanted'], // Default label
      sort: 'created',
      searchQuery: '',
      onlyNoComments: false,
      onlyNoLinkedPRs: false,
      minStars: null,
      setLanguage: (language) => set({ language }),
      setLabel: (label) => set({ label }),
      setSort: (sort) => set({ sort }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setOnlyNoComments: (onlyNoComments) => set({ onlyNoComments }),
      setOnlyNoLinkedPRs: (onlyNoLinkedPRs) => set({ onlyNoLinkedPRs }),
      setMinStars: (minStars) => set({ minStars }),
      resetFilters: () =>
        set({
          language: [],
          label: ['help wanted'],
          sort: 'created',
          searchQuery: '',
          onlyNoComments: false,
          onlyNoLinkedPRs: false,
          minStars: null,
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
        onlyNoComments: state.onlyNoComments,
        onlyNoLinkedPRs: state.onlyNoLinkedPRs,
        minStars: state.minStars,
      }),
    }
  )
);
