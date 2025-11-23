import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHistoryStore } from './useHistoryStore';
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

describe('useHistoryStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useHistoryStore.setState({ history: [] });
    localStorage.clear();
    vi.clearAllTimers();
  });

  it('should start with empty history', () => {
    const state = useHistoryStore.getState();
    expect(state.history).toEqual([]);
  });

  it('should add an issue to history', () => {
    const { addToHistory } = useHistoryStore.getState();
    const issue = createMockIssue(1);

    addToHistory(issue);

    const state = useHistoryStore.getState();
    expect(state.history).toHaveLength(1);
    expect(state.history[0].id).toBe(1);
    expect(state.history[0].viewedAt).toBeDefined();
  });

  it('should add viewedAt timestamp', () => {
    const { addToHistory } = useHistoryStore.getState();
    const issue = createMockIssue(1);

    const beforeTime = Date.now();
    addToHistory(issue);
    const afterTime = Date.now();

    const state = useHistoryStore.getState();
    expect(state.history[0].viewedAt).toBeGreaterThanOrEqual(beforeTime);
    expect(state.history[0].viewedAt).toBeLessThanOrEqual(afterTime);
  });

  it('should add new items at the beginning', () => {
    const { addToHistory } = useHistoryStore.getState();

    addToHistory(createMockIssue(1));
    addToHistory(createMockIssue(2));
    addToHistory(createMockIssue(3));

    const state = useHistoryStore.getState();
    expect(state.history[0].id).toBe(3);
    expect(state.history[1].id).toBe(2);
    expect(state.history[2].id).toBe(1);
  });

  it('should move existing item to top when re-added', () => {
    const { addToHistory } = useHistoryStore.getState();
    const issue1 = createMockIssue(1);

    addToHistory(issue1);
    addToHistory(createMockIssue(2));
    addToHistory(createMockIssue(3));

    // Re-add issue 1
    addToHistory(issue1);

    const state = useHistoryStore.getState();
    expect(state.history).toHaveLength(3);
    expect(state.history[0].id).toBe(1); // Moved to top
    expect(state.history[1].id).toBe(3);
    expect(state.history[2].id).toBe(2);
  });

  it('should update viewedAt timestamp when re-adding', () => {
    const { addToHistory } = useHistoryStore.getState();
    const issue = createMockIssue(1);

    addToHistory(issue);
    const firstViewedAt = useHistoryStore.getState().history[0].viewedAt;

    // Wait a bit and re-add
    vi.useFakeTimers();
    vi.advanceTimersByTime(1000);

    addToHistory(issue);
    const secondViewedAt = useHistoryStore.getState().history[0].viewedAt;

    vi.useRealTimers();

    expect(secondViewedAt).toBeGreaterThan(firstViewedAt);
  });

  it('should limit history to 50 items', () => {
    const { addToHistory } = useHistoryStore.getState();

    // Add 60 issues
    for (let i = 1; i <= 60; i++) {
      addToHistory(createMockIssue(i));
    }

    const state = useHistoryStore.getState();
    expect(state.history).toHaveLength(50);

    // The most recent 50 should be kept (60 down to 11)
    expect(state.history[0].id).toBe(60);
    expect(state.history[49].id).toBe(11);
  });

  it('should clear history', () => {
    const { addToHistory, clearHistory } = useHistoryStore.getState();

    addToHistory(createMockIssue(1));
    addToHistory(createMockIssue(2));
    addToHistory(createMockIssue(3));

    clearHistory();

    const state = useHistoryStore.getState();
    expect(state.history).toEqual([]);
  });

  it('should persist history to localStorage', () => {
    const { addToHistory } = useHistoryStore.getState();
    const issue = createMockIssue(1);

    addToHistory(issue);

    const stored = localStorage.getItem('contrib-fyi-history');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.history).toHaveLength(1);
    expect(parsed.state.history[0].id).toBe(1);
    expect(parsed.state.history[0].viewedAt).toBeDefined();
  });

  it('should maintain history order after re-adding multiple items', () => {
    const { addToHistory } = useHistoryStore.getState();

    addToHistory(createMockIssue(1));
    addToHistory(createMockIssue(2));
    addToHistory(createMockIssue(3));
    addToHistory(createMockIssue(4));

    // Re-add issue 2
    addToHistory(createMockIssue(2));

    const state = useHistoryStore.getState();
    expect(state.history.map((h) => h.id)).toEqual([2, 4, 3, 1]);
  });

  it('should preserve all issue properties', () => {
    const { addToHistory } = useHistoryStore.getState();
    const issue = createMockIssue(1);

    addToHistory(issue);

    const state = useHistoryStore.getState();
    const historyEntry = state.history[0];

    expect(historyEntry.title).toBe(issue.title);
    expect(historyEntry.body).toBe(issue.body);
    expect(historyEntry.user.login).toBe(issue.user.login);
    expect(historyEntry.html_url).toBe(issue.html_url);
  });
});
