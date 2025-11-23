import type { GitHubIssue, GitHubRepository } from '@/lib/github/client';

export const mockRepository: GitHubRepository = {
  id: 1,
  node_id: 'MDEwOlJlcG9zaXRvcnkx',
  name: 'test-repo',
  full_name: 'test-owner/test-repo',
  private: false,
  owner: {
    login: 'test-owner',
    id: 1,
    avatar_url: 'https://avatars.githubusercontent.com/u/1',
    html_url: 'https://github.com/test-owner',
  },
  html_url: 'https://github.com/test-owner/test-repo',
  description: 'A test repository',
  fork: false,
  url: 'https://api.github.com/repos/test-owner/test-repo',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  pushed_at: '2024-01-15T00:00:00Z',
  homepage: 'https://example.com',
  size: 100,
  stargazers_count: 500,
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
};

export const mockIssue: GitHubIssue = {
  id: 1,
  node_id: 'MDU6SXNzdWUx',
  url: 'https://api.github.com/repos/test-owner/test-repo/issues/1',
  repository_url: 'https://api.github.com/repos/test-owner/test-repo',
  labels_url:
    'https://api.github.com/repos/test-owner/test-repo/issues/1/labels{/name}',
  comments_url:
    'https://api.github.com/repos/test-owner/test-repo/issues/1/comments',
  events_url:
    'https://api.github.com/repos/test-owner/test-repo/issues/1/events',
  html_url: 'https://github.com/test-owner/test-repo/issues/1',
  number: 1,
  state: 'open',
  title: 'Test Issue',
  body: 'This is a test issue body',
  user: {
    login: 'test-user',
    id: 2,
    avatar_url: 'https://avatars.githubusercontent.com/u/2',
    html_url: 'https://github.com/test-user',
  },
  labels: [
    {
      id: 1,
      node_id: 'MDU6TGFiZWwx',
      url: 'https://api.github.com/repos/test-owner/test-repo/labels/help%20wanted',
      name: 'help wanted',
      color: '008672',
      default: true,
      description: 'Extra attention is needed',
    },
  ],
  assignee: null,
  assignees: [],
  milestone: null,
  locked: false,
  active_lock_reason: null,
  comments: 3,
  closed_at: null,
  created_at: '2024-01-10T00:00:00Z',
  updated_at: '2024-01-12T00:00:00Z',
  repository: mockRepository,
};

export const mockIssueWithoutComments: GitHubIssue = {
  ...mockIssue,
  id: 2,
  number: 2,
  title: 'Issue without comments',
  comments: 0,
};

export const mockIssueWithHighStars: GitHubIssue = {
  ...mockIssue,
  id: 3,
  number: 3,
  title: 'High star issue',
  repository: {
    ...mockRepository,
    stargazers_count: 1000,
  },
};

export const mockSearchResponse = {
  total_count: 100,
  incomplete_results: false,
  items: [mockIssue, mockIssueWithoutComments],
};
