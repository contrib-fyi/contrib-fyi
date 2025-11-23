import { describe, it, expect } from 'vitest';
import { toIssueSnapshot } from './issueSnapshot';
import { GitHubIssue } from './client';

describe('toIssueSnapshot', () => {
  const mockIssue: GitHubIssue = {
    id: 12345,
    node_id: 'node_1',
    url: 'https://api.github.com/repos/owner/repo/issues/123',
    repository_url: 'https://api.github.com/repos/owner/repo',
    labels_url:
      'https://api.github.com/repos/owner/repo/issues/123/labels{/name}',
    comments_url: 'https://api.github.com/repos/owner/repo/issues/123/comments',
    events_url: 'https://api.github.com/repos/owner/repo/issues/123/events',
    html_url: 'https://github.com/owner/repo/issues/123',
    number: 123,
    state: 'open',
    title: 'Test Issue',
    body: 'This is a test issue body.',
    user: {
      login: 'testuser',
      id: 1,
      avatar_url: 'https://example.com/avatar.png',
      html_url: 'https://github.com/testuser',
    },
    labels: [
      {
        id: 1,
        node_id: 'label_1',
        url: 'https://api.github.com/repos/owner/repo/labels/bug',
        name: 'bug',
        color: 'ff0000',
        default: false,
        description: 'Something is broken',
      },
      {
        id: 2,
        node_id: 'label_2',
        url: 'https://api.github.com/repos/owner/repo/labels/help%20wanted',
        name: 'help wanted',
        color: '00ff00',
        default: false,
        description: 'Extra attention is needed',
      },
    ],
    assignee: null,
    assignees: [],
    milestone: null,
    locked: false,
    active_lock_reason: null,
    comments: 5,
    closed_at: null,
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
    pull_request: undefined,
  };

  it('should convert a valid GitHubIssue to IssueSnapshot', () => {
    const snapshot = toIssueSnapshot(mockIssue);

    expect(snapshot).toEqual({
      id: 12345,
      node_id: 'node_1',
      html_url: 'https://github.com/owner/repo/issues/123',
      repository_url: 'https://api.github.com/repos/owner/repo',
      number: 123,
      state: 'open',
      title: 'Test Issue',
      body: 'This is a test issue body.',
      user: {
        login: 'testuser',
        id: 1,
        avatar_url: 'https://example.com/avatar.png',
        html_url: 'https://github.com/testuser',
      },
      labels: [
        {
          id: 1,
          name: 'bug',
          color: 'ff0000',
          description: 'Something is broken',
        },
        {
          id: 2,
          name: 'help wanted',
          color: '00ff00',
          description: 'Extra attention is needed',
        },
      ],
      comments: 5,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      repository: mockIssue.repository, // Repository is passed through as-is
    });
  });

  it('should truncate body if it exceeds 2000 characters', () => {
    const longBody = 'a'.repeat(2500);
    const issueWithLongBody = { ...mockIssue, body: longBody };
    const snapshot = toIssueSnapshot(issueWithLongBody);

    expect(snapshot.body.length).toBe(2000);
    expect(snapshot.body).toBe(longBody.slice(0, 2000));
  });

  it('should handle nullish body', () => {
    const issueWithNullBody = {
      ...mockIssue,
      body: null,
    } as unknown as GitHubIssue;
    const snapshot = toIssueSnapshot(issueWithNullBody);
    expect(snapshot.body).toBe('');
  });

  it('should handle empty labels', () => {
    const issueWithNoLabels = { ...mockIssue, labels: [] };
    const snapshot = toIssueSnapshot(issueWithNoLabels);
    expect(snapshot.labels).toEqual([]);
  });

  it('should handle missing repository description and language', () => {
    // Since repository is passed through, we just check if it matches the input
    const issueWithPartialRepo = {
      ...mockIssue,
      repository: {
        ...mockIssue.repository,
        description: null,
        language: null,
      },
    } as unknown as GitHubIssue;

    const snapshot = toIssueSnapshot(issueWithPartialRepo);
    expect(snapshot.repository?.description).toBeNull();
    expect(snapshot.repository?.language).toBeNull();
  });

  it('should map user fields correctly', () => {
    const snapshot = toIssueSnapshot(mockIssue);

    expect(snapshot.user).toEqual({
      login: mockIssue.user.login,
      id: mockIssue.user.id,
      avatar_url: mockIssue.user.avatar_url,
      html_url: mockIssue.user.html_url,
    });
  });

  it('should preserve comments count and state', () => {
    const snapshot = toIssueSnapshot(mockIssue);
    expect(snapshot.comments).toBe(mockIssue.comments);
    expect(snapshot.state).toBe(mockIssue.state);
  });
});
