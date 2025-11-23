import { describe, it, expect, beforeEach } from 'vitest';
import { usePickStore } from './usePickStore';
import type { IssueSnapshot } from '@/lib/github/issueSnapshot';

const createMockIssue = (id: number): IssueSnapshot => ({
  id,
  node_id: `node_${id}`,
  html_url: `https://github.com/test/repo/issues/${id}`,
  repository_url: 'https://api.github.com/repos/test/repo',
  number: id,
  state: 'open',
  title: `Test Issue ${id}`,
  body: 'Test body',
  user: {
    login: 'test-user',
    id: 1,
    avatar_url: 'https://avatars.githubusercontent.com/u/1',
    html_url: 'https://github.com/test-user',
  },
  labels: [],
  comments: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
});

describe('usePickStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    usePickStore.setState({ picks: [] });
    localStorage.clear();
  });

  it('should start with empty picks', () => {
    const state = usePickStore.getState();
    expect(state.picks).toEqual([]);
  });

  it('should add a pick', () => {
    const { addPick } = usePickStore.getState();
    const issue = createMockIssue(1);

    addPick(issue);

    const state = usePickStore.getState();
    expect(state.picks).toHaveLength(1);
    expect(state.picks[0].id).toBe(1);
  });

  it('should not add duplicate picks', () => {
    const { addPick } = usePickStore.getState();
    const issue = createMockIssue(1);

    addPick(issue);
    addPick(issue);

    const state = usePickStore.getState();
    expect(state.picks).toHaveLength(1);
  });

  it('should add new picks at the beginning', () => {
    const { addPick } = usePickStore.getState();

    addPick(createMockIssue(1));
    addPick(createMockIssue(2));
    addPick(createMockIssue(3));

    const state = usePickStore.getState();
    expect(state.picks[0].id).toBe(3);
    expect(state.picks[1].id).toBe(2);
    expect(state.picks[2].id).toBe(1);
  });

  it('should remove a pick', () => {
    const { addPick, removePick } = usePickStore.getState();

    addPick(createMockIssue(1));
    addPick(createMockIssue(2));

    removePick(1);

    const state = usePickStore.getState();
    expect(state.picks).toHaveLength(1);
    expect(state.picks[0].id).toBe(2);
  });

  it('should check if an issue is picked', () => {
    const { addPick, isPicked } = usePickStore.getState();
    const issue = createMockIssue(1);

    expect(isPicked(1)).toBe(false);

    addPick(issue);

    expect(isPicked(1)).toBe(true);
    expect(isPicked(2)).toBe(false);
  });

  it('should limit picks to 200 items', () => {
    const { addPick } = usePickStore.getState();

    // Add 250 issues
    for (let i = 1; i <= 250; i++) {
      addPick(createMockIssue(i));
    }

    const state = usePickStore.getState();
    expect(state.picks).toHaveLength(200);

    // The most recent 200 should be kept (250 down to 51)
    expect(state.picks[0].id).toBe(250);
    expect(state.picks[199].id).toBe(51);
  });

  it('should persist picks to localStorage', () => {
    const { addPick } = usePickStore.getState();
    const issue = createMockIssue(1);

    addPick(issue);

    const stored = localStorage.getItem('contrib-fyi-picks');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.picks).toHaveLength(1);
    expect(parsed.state.picks[0].id).toBe(1);
  });

  it('should handle removing non-existent pick', () => {
    const { addPick, removePick } = usePickStore.getState();

    addPick(createMockIssue(1));
    removePick(999); // Non-existent ID

    const state = usePickStore.getState();
    expect(state.picks).toHaveLength(1);
  });

  it('should maintain pick order after removal', () => {
    const { addPick, removePick } = usePickStore.getState();

    addPick(createMockIssue(1));
    addPick(createMockIssue(2));
    addPick(createMockIssue(3));
    addPick(createMockIssue(4));

    removePick(2);

    const state = usePickStore.getState();
    expect(state.picks.map((p) => p.id)).toEqual([4, 3, 1]);
  });
});
