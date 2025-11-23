import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SearchIssuesResponse } from '@/lib/github/client';
import { IssueList } from './IssueList';
import { IssueSnapshot } from '@/lib/github/issueSnapshot';
import { useIssueSearch } from '@/hooks/useIssueSearch';
import React from 'react';

vi.mock('@/hooks/useIssueSearch');

// Mock IssueRow component
vi.mock('./IssueRow', () => ({
  IssueRow: ({ issue }: { issue: IssueSnapshot }) => (
    <div data-testid="issue-row">{issue.title}</div>
  ),
}));

describe('IssueList', () => {
  const mockIssues: IssueSnapshot[] = [
    {
      id: 1,
      node_id: 'node_1',
      html_url: 'url',
      repository_url: 'repo_url',
      number: 1,
      state: 'open',
      title: 'Issue 1',
      body: 'body',
      user: { login: 'user', id: 1, avatar_url: 'url', html_url: 'url' },
      labels: [],
      comments: 0,
      created_at: 'date',
      updated_at: 'date',
    },
    {
      id: 2,
      node_id: 'node_2',
      html_url: 'url',
      repository_url: 'repo_url',
      number: 2,
      state: 'open',
      title: 'Issue 2',
      body: 'body',
      user: { login: 'user', id: 1, avatar_url: 'url', html_url: 'url' },
      labels: [],
      comments: 0,
      created_at: 'date',
      updated_at: 'date',
    },
  ];

  const mockedUseIssueSearch = vi.mocked(useIssueSearch);

  const createHookReturn = (
    overrides: Partial<ReturnType<typeof useIssueSearch>>
  ): ReturnType<typeof useIssueSearch> => ({
    data: null,
    loading: false,
    error: null,
    page: 1,
    setPage: vi.fn(),
    refresh: vi.fn(),
    totalPages: 1,
    resetFilters: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    mockedUseIssueSearch.mockReset();
  });

  it('renders loading skeletons when loading', () => {
    mockedUseIssueSearch.mockReturnValue(
      createHookReturn({ loading: true, data: null })
    );

    const { container } = render(<IssueList />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
    expect(screen.queryByText('Issue 1')).not.toBeInTheDocument();
  });

  it('renders error message and retry button', () => {
    const refresh = vi.fn();
    mockedUseIssueSearch.mockReturnValue(
      createHookReturn({ error: 'Test Error', refresh })
    );

    render(<IssueList />);

    expect(screen.getByRole('heading', { name: /Error/i })).toBeInTheDocument();
    const retryButton = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryButton);
    expect(refresh).toHaveBeenCalled();
  });

  it('renders empty state when no issues found', () => {
    mockedUseIssueSearch.mockReturnValue(
      createHookReturn({
        data: { total_count: 0, incomplete_results: false, items: [] },
      })
    );

    render(<IssueList />);

    expect(screen.getByText('No issues found')).toBeInTheDocument();
  });

  it('renders list of issues', () => {
    const data: SearchIssuesResponse<IssueSnapshot> = {
      total_count: 2,
      incomplete_results: false,
      items: mockIssues,
    };
    mockedUseIssueSearch.mockReturnValue(createHookReturn({ data }));

    render(<IssueList />);

    expect(screen.getByText('Issue 1')).toBeInTheDocument();
    expect(screen.getByText('Issue 2')).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    let nextPageValue = 0;
    const setPageMock = vi.fn((value: React.SetStateAction<number>) => {
      nextPageValue =
        typeof value === 'function'
          ? (value as (p: number) => number)(1)
          : value;
    });
    mockedUseIssueSearch.mockReturnValue(
      createHookReturn({
        data: {
          total_count: 100,
          incomplete_results: false,
          items: mockIssues,
        },
        page: 1,
        totalPages: 5,
        setPage: setPageMock as React.Dispatch<React.SetStateAction<number>>,
      })
    );

    render(<IssueList />);

    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);
    expect(setPageMock).toHaveBeenCalled();
    expect(nextPageValue).toBe(2);
  });
});
