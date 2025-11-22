'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IssueSnapshot } from '@/lib/github/issueSnapshot';

interface HistoryEntry extends IssueSnapshot {
  viewedAt: number;
}

interface HistoryState {
  history: HistoryEntry[];
  addToHistory: (issue: IssueSnapshot) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 50;

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addToHistory: (issue) => {
        const { history } = get();
        // Remove if already exists to move it to top
        const filtered = history.filter((h) => h.id !== issue.id);
        const newEntry: HistoryEntry = {
          ...issue,
          viewedAt: Date.now(),
        };
        set({ history: [newEntry, ...filtered].slice(0, MAX_HISTORY) });
      },
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'contrib-fyi-history',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
