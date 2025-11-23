import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
  afterEach,
} from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  getRepositoryWithCache,
  clearRepositoryCache,
} from './repositoryCache';
import { mockRepository } from '@/test/mockData';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  clearRepositoryCache();
});
afterAll(() => server.close());

describe('Repository Cache', () => {
  beforeEach(() => {
    clearRepositoryCache();
  });

  describe('getRepositoryWithCache', () => {
    it('should fetch repository data on first call', async () => {
      let requestCount = 0;

      server.use(
        http.get('https://api.github.com/repos/test-owner/test-repo', () => {
          requestCount++;
          return HttpResponse.json(mockRepository);
        })
      );

      const result = await getRepositoryWithCache('test-owner', 'test-repo');

      expect(result.full_name).toBe('test-owner/test-repo');
      expect(requestCount).toBe(1);
    });

    it('should return cached data on subsequent calls', async () => {
      let requestCount = 0;

      server.use(
        http.get('https://api.github.com/repos/test-owner/test-repo', () => {
          requestCount++;
          return HttpResponse.json(mockRepository);
        })
      );

      // First call
      await getRepositoryWithCache('test-owner', 'test-repo');

      // Second call - should use cache
      const result = await getRepositoryWithCache('test-owner', 'test-repo');

      expect(result.full_name).toBe('test-owner/test-repo');
      expect(requestCount).toBe(1); // Only one API call
    });

    it('should use case-insensitive cache keys', async () => {
      let requestCount = 0;

      server.use(
        http.get('https://api.github.com/repos/Test-Owner/Test-Repo', () => {
          requestCount++;
          return HttpResponse.json(mockRepository);
        })
      );

      // First call with original case
      await getRepositoryWithCache('Test-Owner', 'Test-Repo');

      // Second call with different case - should use cache
      const result = await getRepositoryWithCache('test-owner', 'test-repo');

      expect(result.full_name).toBe('test-owner/test-repo');
      expect(requestCount).toBe(1);
    });

    it('should cache separately for different tokens', async () => {
      let requestCount = 0;
      let lastToken: string | null = null;

      server.use(
        http.get(
          'https://api.github.com/repos/test-owner/test-repo',
          ({ request }) => {
            requestCount++;
            lastToken = request.headers.get('Authorization');
            return HttpResponse.json(mockRepository);
          }
        )
      );

      // First call with token1
      await getRepositoryWithCache('test-owner', 'test-repo', {
        token: 'token1',
      });
      expect(lastToken).toBe('Bearer token1');

      // Second call with token2 - should make a new request
      await getRepositoryWithCache('test-owner', 'test-repo', {
        token: 'token2',
      });
      expect(lastToken).toBe('Bearer token2');

      expect(requestCount).toBe(2);
    });

    it('should cache separately for anonymous requests', async () => {
      let requestCount = 0;

      server.use(
        http.get('https://api.github.com/repos/test-owner/test-repo', () => {
          requestCount++;
          return HttpResponse.json(mockRepository);
        })
      );

      // Anonymous call
      await getRepositoryWithCache('test-owner', 'test-repo');

      // Authenticated call - should make a new request
      await getRepositoryWithCache('test-owner', 'test-repo', {
        token: 'test-token',
      });

      expect(requestCount).toBe(2);
    });

    it('should cache the same token consistently', async () => {
      let requestCount = 0;

      server.use(
        http.get('https://api.github.com/repos/test-owner/test-repo', () => {
          requestCount++;
          return HttpResponse.json(mockRepository);
        })
      );

      const token = 'same-token-123';

      // First call
      await getRepositoryWithCache('test-owner', 'test-repo', { token });

      // Second call with same token - should use cache
      await getRepositoryWithCache('test-owner', 'test-repo', { token });

      // Third call with same token - should still use cache
      await getRepositoryWithCache('test-owner', 'test-repo', { token });

      expect(requestCount).toBe(1);
    });

    it('should handle different repositories separately', async () => {
      let requestCount = 0;

      server.use(
        http.get('https://api.github.com/repos/:owner/:repo', ({ params }) => {
          requestCount++;
          return HttpResponse.json({
            ...mockRepository,
            full_name: `${params.owner}/${params.repo}`,
          });
        })
      );

      await getRepositoryWithCache('owner1', 'repo1');
      await getRepositoryWithCache('owner2', 'repo2');

      expect(requestCount).toBe(2);
    });

    it('should pass abort signal to fetch', async () => {
      server.use(
        http.get(
          'https://api.github.com/repos/test-owner/test-repo',
          async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return HttpResponse.json(mockRepository);
          }
        )
      );

      const controller = new AbortController();
      const promise = getRepositoryWithCache('test-owner', 'test-repo', {
        signal: controller.signal,
      });

      controller.abort();

      await expect(promise).rejects.toThrow();
    });

    it('should propagate API errors', async () => {
      server.use(
        http.get('https://api.github.com/repos/test-owner/test-repo', () => {
          return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
        })
      );

      await expect(
        getRepositoryWithCache('test-owner', 'test-repo')
      ).rejects.toThrow();
    });
  });

  describe('clearRepositoryCache', () => {
    it('should clear all cached repositories', async () => {
      let requestCount = 0;

      server.use(
        http.get('https://api.github.com/repos/test-owner/test-repo', () => {
          requestCount++;
          return HttpResponse.json(mockRepository);
        })
      );

      // First call
      await getRepositoryWithCache('test-owner', 'test-repo');

      // Clear cache
      clearRepositoryCache();

      // Second call - should make a new request
      await getRepositoryWithCache('test-owner', 'test-repo');

      expect(requestCount).toBe(2);
    });
  });
});
