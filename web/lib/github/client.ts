import { TokenService } from '@/lib/services/TokenService';

export interface GitHubIssue {
  id: number;
  node_id: string;
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  number: number;
  state: string;
  title: string;
  body: string;
  user: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
  labels: {
    id: number;
    node_id: string;
    url: string;
    name: string;
    color: string;
    default: boolean;
    description: string;
  }[];
  assignee: null | object;
  assignees: object[];
  milestone: null | object;
  locked: boolean;
  active_lock_reason: null | string;
  comments: number;
  pull_request?: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
  };
  closed_at: null | string;
  created_at: string;
  updated_at: string;
  repository?: GitHubRepository; // Manually populated if needed
}

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  mirror_url: null | string;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: null | object;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
}

interface RequestOptions {
  signal?: AbortSignal;
  token?: string | null;
}

export interface SearchIssuesResponse<TIssue = GitHubIssue> {
  total_count: number;
  incomplete_results: boolean;
  items: TIssue[];
}

export interface SearchParams {
  q: string;
  sort?: 'created' | 'updated' | 'comments';
  order?: 'desc' | 'asc';
  per_page?: number;
  page?: number;
}

const BASE_URL = 'https://api.github.com';

export async function searchIssues(
  params: SearchParams,
  options?: RequestOptions
): Promise<SearchIssuesResponse<GitHubIssue>> {
  const searchParams = new URLSearchParams();
  searchParams.append('q', params.q);
  if (params.sort) searchParams.append('sort', params.sort);
  if (params.order) searchParams.append('order', params.order);
  if (params.per_page)
    searchParams.append('per_page', params.per_page.toString());
  if (params.page) searchParams.append('page', params.page.toString());

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  // Add GitHub token if available (for higher rate limits)
  const token = options?.token ?? TokenService.getInstance().getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${BASE_URL}/search/issues?${searchParams.toString()}`,
    {
      headers,
      signal: options?.signal,
    }
  );

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Rate Limit Exceeded');
    }
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }

  return response.json();
}

export async function getRepository(
  owner: string,
  repo: string,
  options?: RequestOptions
): Promise<GitHubRepository> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  // Add GitHub token if available (for higher rate limits)
  const token = options?.token ?? TokenService.getInstance().getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/repos/${owner}/${repo}`, {
    headers,
    signal: options?.signal,
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Rate Limit Exceeded');
    }
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }

  return response.json();
}
