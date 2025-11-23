import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { searchIssues, getRepository } from './client';
import { mockSearchResponse, mockRepository } from '@/test/mockData';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GitHub API Client', () => {
  describe('searchIssues', () => {
    it('should successfully search for issues', async () => {
      server.use(
        http.get('https://api.github.com/search/issues', () => {
          return HttpResponse.json(mockSearchResponse);
        })
      );

      const result = await searchIssues({
        q: 'is:issue is:open label:help-wanted',
        per_page: 10,
      });

      expect(result.total_count).toBe(100);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].title).toBe('Test Issue');
    });

    it('should include token in Authorization header when provided', async () => {
      let authHeader: string | null = null;

      server.use(
        http.get('https://api.github.com/search/issues', ({ request }) => {
          authHeader = request.headers.get('Authorization');
          return HttpResponse.json(mockSearchResponse);
        })
      );

      await searchIssues({ q: 'test', per_page: 10 }, { token: 'test-token' });

      expect(authHeader).toBe('Bearer test-token');
    });

    it('should handle rate limit errors (403)', async () => {
      server.use(
        http.get('https://api.github.com/search/issues', () => {
          return HttpResponse.json(
            { message: 'API rate limit exceeded' },
            { status: 403 }
          );
        })
      );

      await expect(searchIssues({ q: 'test', per_page: 10 })).rejects.toThrow(
        'Rate Limit Exceeded'
      );
    });

    it('should handle other API errors', async () => {
      server.use(
        http.get('https://api.github.com/search/issues', () => {
          return HttpResponse.json(
            { message: 'Server Error' },
            { status: 500 }
          );
        })
      );

      await expect(searchIssues({ q: 'test', per_page: 10 })).rejects.toThrow(
        'GitHub API Error'
      );
    });

    it('should properly encode search parameters', async () => {
      let requestUrl: string = '';

      server.use(
        http.get('https://api.github.com/search/issues', ({ request }) => {
          requestUrl = request.url;
          return HttpResponse.json(mockSearchResponse);
        })
      );

      await searchIssues({
        q: 'is:issue is:open',
        sort: 'created',
        order: 'desc',
        per_page: 20,
        page: 2,
      });

      const url = new URL(requestUrl);
      expect(url.searchParams.get('q')).toBe('is:issue is:open');
      expect(url.searchParams.get('sort')).toBe('created');
      expect(url.searchParams.get('order')).toBe('desc');
      expect(url.searchParams.get('per_page')).toBe('20');
      expect(url.searchParams.get('page')).toBe('2');
    });

    it('should support AbortSignal for cancellation', async () => {
      server.use(
        http.get('https://api.github.com/search/issues', async () => {
          // Simulate a slow response
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(mockSearchResponse);
        })
      );

      const controller = new AbortController();
      const promise = searchIssues(
        { q: 'test' },
        { signal: controller.signal }
      );

      controller.abort();

      await expect(promise).rejects.toThrow();
    });
  });

  describe('getRepository', () => {
    it('should successfully fetch repository data', async () => {
      server.use(
        http.get('https://api.github.com/repos/test-owner/test-repo', () => {
          return HttpResponse.json(mockRepository);
        })
      );

      const result = await getRepository('test-owner', 'test-repo');

      expect(result.full_name).toBe('test-owner/test-repo');
      expect(result.stargazers_count).toBe(500);
      expect(result.language).toBe('TypeScript');
    });

    it('should include token in Authorization header when provided', async () => {
      let authHeader: string | null = null;

      server.use(
        http.get(
          'https://api.github.com/repos/test-owner/test-repo',
          ({ request }) => {
            authHeader = request.headers.get('Authorization');
            return HttpResponse.json(mockRepository);
          }
        )
      );

      await getRepository('test-owner', 'test-repo', { token: 'test-token' });

      expect(authHeader).toBe('Bearer test-token');
    });

    it('should handle rate limit errors (403)', async () => {
      server.use(
        http.get('https://api.github.com/repos/test-owner/test-repo', () => {
          return HttpResponse.json(
            { message: 'API rate limit exceeded' },
            { status: 403 }
          );
        })
      );

      await expect(getRepository('test-owner', 'test-repo')).rejects.toThrow(
        'Rate Limit Exceeded'
      );
    });

    it('should handle 404 errors for non-existent repositories', async () => {
      server.use(
        http.get('https://api.github.com/repos/test-owner/test-repo', () => {
          return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
        })
      );

      await expect(getRepository('test-owner', 'test-repo')).rejects.toThrow(
        'GitHub API Error'
      );
    });
  });
});
