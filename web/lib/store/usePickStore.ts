'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IssueSnapshot } from '@/lib/github/issueSnapshot';

const MAX_PICKS = 200;

interface PickState {
  picks: IssueSnapshot[];
  addPick: (issue: IssueSnapshot) => void;
  removePick: (issueId: number) => void;
  isPicked: (issueId: number) => boolean;
}

export const usePickStore = create<PickState>()(
  persist(
    (set, get) => ({
      picks: [],
      addPick: (issue) => {
        const { picks } = get();
        if (picks.some((p) => p.id === issue.id)) {
          return;
        }
        set({ picks: [issue, ...picks].slice(0, MAX_PICKS) });
      },
      removePick: (issueId) => {
        set({ picks: get().picks.filter((p) => p.id !== issueId) });
      },
      isPicked: (issueId) => {
        return get().picks.some((p) => p.id === issueId);
      },
    }),
    {
      name: 'contrib-fyi-picks',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
