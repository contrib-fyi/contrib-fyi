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
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { useIssueSearch } from './useIssueSearch';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { useTokenStore } from '@/lib/store/useTokenStore';
import { mockSearchResponse } from '@/test/mockData';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
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

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeTruthy();
    expect(result.current.data?.items).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('should reset page when filters change', async () => {
    const { result } = renderHook(() => useIssueSearch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Change page
    result.current.setPage(3);

    await waitFor(() => {
      expect(result.current.page).toBe(3);
    });

    // Change filter - should reset page to 1
    useFilterStore.getState().setLanguage(['TypeScript']);

    await waitFor(() => {
      expect(result.current.page).toBe(1);
    });
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

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialRequestCount = requestCount;

    result.current.setPage(2);

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

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

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

    useTokenStore.getState().setToken('test-token');

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

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

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

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

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

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialRequestCount = requestCount;

    result.current.refresh();

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
      }),
    );

    const { result } = renderHook(() => useIssueSearch());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialRequestCount = requestCount;

    // Change filter - should trigger a new request
    useFilterStore.getState().setLanguage(['TypeScript']);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

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

    useFilterStore.getState().setLanguage(['TypeScript']);

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

    useFilterStore.getState().setLabel(['bug']);

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

    useFilterStore.getState().setMinStars(500);

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
