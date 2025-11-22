import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GitHubIssue } from '../github/client';

interface PickState {
  picks: GitHubIssue[];
  addPick: (issue: GitHubIssue) => void;
  removePick: (issueId: number) => void;
  isPicked: (issueId: number) => boolean;
}

export const usePickStore = create<PickState>()(
  persist(
    (set, get) => ({
      picks: [],
      addPick: (issue) => {
        const { picks } = get();
        if (!picks.some((p) => p.id === issue.id)) {
          set({ picks: [issue, ...picks] });
        }
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
    }
  )
);
