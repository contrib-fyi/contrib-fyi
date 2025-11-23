import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ComponentProps, PropsWithChildren } from 'react';
import { IssueRow } from './IssueRow';
import { IssueSnapshot } from '@/lib/github/issueSnapshot';
import { usePickStore } from '@/lib/store/usePickStore';
import { useTokenStore } from '@/lib/store/useTokenStore';

// Mock stores
vi.mock('@/lib/store/usePickStore');
vi.mock('@/lib/store/useTokenStore');

// Mock child components to simplify testing
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, style }: MockBadgeProps) => (
    <div className={className} style={style}>
      {children}
    </div>
  ),
}));

// Mock IssueDetailModal to just render children (button)
vi.mock('./IssueDetailModal', () => ({
  IssueDetailModal: ({ children }: PropsWithChildren) => <div>{children}</div>,
}));

type MockBadgeProps = PropsWithChildren<
  ComponentProps<'div'> & { style?: Record<string, string> }
>;

describe('IssueRow', () => {
  const mockIssue: IssueSnapshot = {
    id: 1,
    node_id: 'node_1',
    html_url: 'https://github.com/owner/repo/issues/1',
    repository_url: 'https://api.github.com/repos/owner/repo',
    number: 123,
    state: 'open',
    title: 'Test Issue Title',
    body: 'Test Body',
    user: {
      login: 'testuser',
      id: 1,
      avatar_url: 'https://example.com/avatar.png',
      html_url: 'https://github.com/testuser',
    },
    labels: [
      { id: 1, name: 'bug', color: 'ff0000', description: 'desc' },
      { id: 2, name: 'help wanted', color: '00ff00', description: 'desc' },
    ],
    comments: 5,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    repository: {
      id: 100,
      node_id: 'repo_1',
      name: 'repo',
      full_name: 'owner/repo',
      private: false,
      owner: {
        login: 'owner',
        id: 2,
        avatar_url: 'https://example.com/owner.png',
        html_url: 'https://github.com/owner',
      },
      html_url: 'https://github.com/owner/repo',
      description: 'Test Repository',
      fork: false,
      url: 'https://api.github.com/repos/owner/repo',
      created_at: '2022-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      pushed_at: '2023-01-02T00:00:00Z',
      homepage: 'https://example.com',
      size: 1000,
      stargazers_count: 50,
      watchers_count: 50,
      language: 'TypeScript',
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: true,
      has_pages: false,
      forks_count: 10,
      mirror_url: null,
      archived: false,
      disabled: false,
      open_issues_count: 5,
      license: null,
      forks: 10,
      open_issues: 5,
      watchers: 50,
      default_branch: 'main',
    },
  };

  const mockAddPick = vi.fn();
  const mockRemovePick = vi.fn();
  const mockIsPicked = vi.fn();
  const mockedUsePickStore = vi.mocked(usePickStore);
  const mockedUseTokenStore = vi.mocked(useTokenStore);

  const setTokenSelectorResult = (tokenValue: string | null) => {
    const tokenState = {
      token: tokenValue,
      setToken: vi.fn(),
      clearToken: vi.fn(),
    } as ReturnType<typeof useTokenStore>;

    mockedUseTokenStore.mockImplementation(((
      selector?: (state: ReturnType<typeof useTokenStore>) => unknown
    ) => {
      if (selector) {
        return selector(tokenState);
      }
      return tokenState;
    }) as typeof useTokenStore);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUsePickStore.mockReturnValue({
      addPick: mockAddPick,
      removePick: mockRemovePick,
      isPicked: mockIsPicked,
      picks: [],
    });
    setTokenSelectorResult('mock-token');
  });

  it('renders issue details correctly', () => {
    render(<IssueRow issue={mockIssue} />);

    expect(screen.getByText('Test Issue Title')).toBeInTheDocument();
    // Issue number is not rendered in the row currently
    expect(screen.getByText('owner/repo')).toBeInTheDocument();
    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('help wanted')).toBeInTheDocument();
  });

  it('renders "Pick" button when issue is not picked', () => {
    mockIsPicked.mockReturnValue(false);
    render(<IssueRow issue={mockIssue} />);

    const button = screen.getByRole('button', { name: /Pick/i });
    expect(button).toBeInTheDocument();
    expect(screen.queryByText('Picked')).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(mockAddPick).toHaveBeenCalledWith(mockIssue);
    expect(mockRemovePick).not.toHaveBeenCalled();
  });

  it('renders "Picked" button when issue is picked', () => {
    mockIsPicked.mockReturnValue(true);
    render(<IssueRow issue={mockIssue} />);

    const button = screen.getByRole('button', { name: /Picked/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockRemovePick).toHaveBeenCalledWith(mockIssue.id);
    expect(mockAddPick).not.toHaveBeenCalled();
  });

  it('displays star count when token is present', () => {
    setTokenSelectorResult('mock-token');
    render(<IssueRow issue={mockIssue} />);
    expect(screen.getByText('50')).toBeInTheDocument(); // Stars
  });

  it('does NOT display star count when token is missing', () => {
    setTokenSelectorResult(null);
    render(<IssueRow issue={mockIssue} />);
    expect(screen.queryByText('50')).not.toBeInTheDocument();
  });

  it('displays comment count', () => {
    render(<IssueRow issue={mockIssue} />);
    expect(screen.getByText('5')).toBeInTheDocument(); // Comments
  });
});
