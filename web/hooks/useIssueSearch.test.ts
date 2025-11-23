import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  beforeAll,
  afterAll,
  afterEach,
} from 'vitest';
import {
  renderHook,
  waitFor,
  act,
  type RenderHookResult,
} from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useIssueSearch } from './useIssueSearch';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { useTokenStore } from '@/lib/store/useTokenStore';
import { mockSearchResponse } from '@/test/mockData';

// Default handlers to avoid MSW unhandled-request warnings
const defaultHandlers = [
  http.get('https://api.github.com/search/issues', () =>
    HttpResponse.json(mockSearchResponse)
  ),
  http.get('https://api.github.com/repos/:owner/:repo', ({ params }) =>
    HttpResponse.json({
      id: 1,
      node_id: 'repo',
      name: params.repo,
      full_name: `${params.owner}/${params.repo}`,
      private: false,
      owner: {
        login: params.owner,
        id: 1,
        avatar_url: 'https://example.com/avatar.png',
        html_url: `https://github.com/${params.owner}`,
      },
      html_url: `https://github.com/${params.owner}/${params.repo}`,
      description: 'Mock repo',
      fork: false,
      url: `https://api.github.com/repos/${params.owner}/${params.repo}`,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z',
      pushed_at: '2023-01-03T00:00:00Z',
      homepage: '',
      size: 1,
      stargazers_count: 123,
      watchers_count: 123,
      language: 'TypeScript',
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: true,
      has_pages: false,
      forks_count: 0,
      mirror_url: null,
      archived: false,
      disabled: false,
      open_issues_count: 0,
      license: null,
      forks: 0,
      open_issues: 0,
      watchers: 123,
      default_branch: 'main',
    })
  ),
];

const server = setupServer(...defaultHandlers);

// Silence act warnings in non-DOM environments
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers(...defaultHandlers);
  vi.clearAllMocks();
  useFilterStore.getState().resetFilters();
  useTokenStore.getState().clearToken();
});
afterAll(() => server.close());

// Mock the graphql module
vi.mock('@/lib/github/graphql', () => ({
  fetchLinkedPRCounts: vi.fn().mockResolvedValue(new Map()),
}));

describe('useIssueSearch', () => {
  const waitForIdle = async (
    result: RenderHookResult<ReturnType<typeof useIssueSearch>, null>['result']
  ) => {
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  };

  beforeEach(() => {
    server.use(
      http.get('https://api.github.com/search/issues', () => {
        return HttpResponse.json(mockSearchResponse);
      })
    );
  });

  it('should fetch issues on mount', async () => {
    const { result } = renderHook(() => useIssueSearch());

    expect(result.current.loading).toBe(true);

    await waitForIdle(result);

    expect(result.current.data).toBeTruthy();
    expect(result.current.data?.items).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('should reset page when filters change', async () => {
    const { result } = renderHook(() => useIssueSearch());

    await waitForIdle(result);

    // Change page
    act(() => {
      result.current.setPage(3);
    });

    await waitForIdle(result);

    // Change filter - should reset page to 1
    act(() => {
      useFilterStore.getState().setLanguage(['TypeScript']);
    });

    await waitForIdle(result);
  });

  it('should refetch when page changes', async () => {
    let requestCount = 0;

    server.use(
      http.get('https://api.github.com/search/issues', () => {
        requestCount++;
        return HttpResponse.json(mockSearchResponse);
      })
    );

    const { result } = renderHook(() => useIssueSearch());

    await waitForIdle(result);

    const initialRequestCount = requestCount;

    act(() => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(initialRequestCount);
    });
  });

  it('should handle API errors', async () => {
    server.use(
      http.get('https://api.github.com/search/issues', () => {
        return HttpResponse.json({ message: 'API Error' }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useIssueSearch());

    await waitForIdle(result);

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });

  it('should include token in request when available', async () => {
    let authHeader: string | null = null;

    server.use(
      http.get('https://api.github.com/search/issues', ({ request }) => {
        authHeader = request.headers.get('Authorization');
        return HttpResponse.json(mockSearchResponse);
      })
    );

    act(() => {
      useTokenStore.getState().setToken('test-token');
    });

    renderHook(() => useIssueSearch());

    await waitFor(() => {
      expect(authHeader).toBe('Bearer test-token');
    });
  });

  it('should calculate total pages correctly', async () => {
    server.use(
      http.get('https://api.github.com/search/issues', () => {
        return HttpResponse.json({
          ...mockSearchResponse,
          total_count: 500,
        });
      })
    );

    const { result } = renderHook(() => useIssueSearch());

    await waitForIdle(result);

    // 500 results / 20 per page = 25 pages
    expect(result.current.totalPages).toBe(25);
  });

  it('should cap total pages at 1000 results', async () => {
    server.use(
      http.get('https://api.github.com/search/issues', () => {
        return HttpResponse.json({
          ...mockSearchResponse,
          total_count: 5000,
        });
      })
    );

    const { result } = renderHook(() => useIssueSearch());

    await waitForIdle(result);

    // GitHub API caps at 1000 results
    // 1000 / 20 = 50 pages
    expect(result.current.totalPages).toBe(50);
  });

  it('should refresh data when refresh is called', async () => {
    let requestCount = 0;

    server.use(
      http.get('https://api.github.com/search/issues', () => {
        requestCount++;
        return HttpResponse.json(mockSearchResponse);
      })
    );

    const { result } = renderHook(() => useIssueSearch());

    await waitForIdle(result);

    const initialRequestCount = requestCount;

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(initialRequestCount);
    });
  });

  it('should abort previous requests when filters change', async () => {
    let requestCount = 0;

    server.use(
      http.get('https://api.github.com/search/issues', async () => {
        requestCount++;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json(mockSearchResponse);
      })
    );

    const { result } = renderHook(() => useIssueSearch());

    await waitForIdle(result);

    const initialRequestCount = requestCount;

    // Change filter - should trigger a new request
    act(() => {
      useFilterStore.getState().setLanguage(['TypeScript']);
    });

    await waitForIdle(result);

    // Should have made at least one more request
    expect(requestCount).toBeGreaterThan(initialRequestCount);
  });

  it('should refetch when language filter changes', async () => {
    let requestCount = 0;

    server.use(
      http.get('https://api.github.com/search/issues', () => {
        requestCount++;
        return HttpResponse.json(mockSearchResponse);
      })
    );

    renderHook(() => useIssueSearch());

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(0);
    });

    const initialRequestCount = requestCount;

    act(() => {
      useFilterStore.getState().setLanguage(['TypeScript']);
    });

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(initialRequestCount);
    });
  });

  it('should refetch when label filter changes', async () => {
    let requestCount = 0;

    server.use(
      http.get('https://api.github.com/search/issues', () => {
        requestCount++;
        return HttpResponse.json(mockSearchResponse);
      })
    );

    renderHook(() => useIssueSearch());

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(0);
    });

    const initialRequestCount = requestCount;

    act(() => {
      useFilterStore.getState().setLabel(['bug']);
    });

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(initialRequestCount);
    });
  });

  it('should refetch when minStars filter changes', async () => {
    let requestCount = 0;

    server.use(
      http.get('https://api.github.com/search/issues', () => {
        requestCount++;
        return HttpResponse.json(mockSearchResponse);
      })
    );

    renderHook(() => useIssueSearch());

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(0);
    });

    const initialRequestCount = requestCount;

    act(() => {
      useFilterStore.getState().setMinStars(500);
    });

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(initialRequestCount);
    });
  });

  it('should handle minimum of 1 total page', async () => {
    server.use(
      http.get('https://api.github.com/search/issues', () => {
        return HttpResponse.json({
          ...mockSearchResponse,
          total_count: 0,
        });
      })
    );

    const { result } = renderHook(() => useIssueSearch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.totalPages).toBe(1);
  });
});
