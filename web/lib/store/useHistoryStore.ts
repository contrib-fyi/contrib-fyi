import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GitHubIssue } from '../github/client';

interface HistoryState {
  history: (GitHubIssue & { viewedAt: number })[];
  addToHistory: (issue: GitHubIssue) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addToHistory: (issue) => {
        const { history } = get();
        // Remove if already exists to move it to top
        const filtered = history.filter((h) => h.id !== issue.id);
        const newEntry = { ...issue, viewedAt: Date.now() };
        // Keep max 50 items
        set({ history: [newEntry, ...filtered].slice(0, 50) });
      },
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'contrib-fyi-history',
    }
  )
);
