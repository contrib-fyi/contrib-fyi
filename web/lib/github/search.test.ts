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
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { searchIssuesWithFilters } from './search';
import {
  mockIssue,
  mockIssueWithoutComments,
  mockRepository,
} from '@/test/mockData';
import type { GitHubIssue } from './client';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

// Mock the graphql module
vi.mock('./graphql', () => ({
  fetchLinkedPRCounts: vi.fn().mockResolvedValue(new Map()),
}));

describe('GitHub Search', () => {
  describe('searchIssuesWithFilters - basic search', () => {
    beforeEach(() => {
      server.use(
        http.get('https://api.github.com/search/issues', () => {
          return HttpResponse.json({
            total_count: 100,
            incomplete_results: false,
            items: [mockIssue, mockIssueWithoutComments],
          });
        })
      );
    });

    it('should search with basic filters', async () => {
      const result = await searchIssuesWithFilters(
        {
          language: [],
          label: ['help wanted'],
          sort: 'created',
          searchQuery: '',
          onlyNoComments: false,
          minStars: null,
        },
        1,
        {}
      );

      expect(result.items).toHaveLength(2);
      expect(result.total_count).toBe(100);
      expect(result.items[0].title).toBe('Test Issue');
    });

    it('should filter issues with no comments when onlyNoComments is true', async () => {
      server.use(
        http.get('https://api.github.com/search/issues', ({ request }) => {
          const url = new URL(request.url);
          const query = url.searchParams.get('q');
          expect(query).toContain('comments:0');

          return HttpResponse.json({
            total_count: 50,
            incomplete_results: false,
            items: [mockIssueWithoutComments],
          });
        })
      );

      const result = await searchIssuesWithFilters(
        {
          language: [],
          label: ['help wanted'],
          sort: 'created',
          searchQuery: '',
          onlyNoComments: true,
          minStars: null,
        },
        1,
        {}
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0].comments).toBe(0);
    });

    it('should include search query in the request', async () => {
      server.use(
        http.get('https://api.github.com/search/issues', ({ request }) => {
          const url = new URL(request.url);
          const query = url.searchParams.get('q');
          expect(query).toContain('authentication');

          return HttpResponse.json({
            total_count: 10,
            incomplete_results: false,
            items: [mockIssue],
          });
        })
      );

      await searchIssuesWithFilters(
        {
          language: [],
          label: [],
          sort: 'created',
          searchQuery: 'authentication',
          onlyNoComments: false,
          minStars: null,
        },
        1,
        {}
      );
    });

    it('should limit results to 20 items', async () => {
      const manyIssues = Array.from({ length: 30 }, (_, i) => ({
        ...mockIssue,
        id: i,
        number: i,
      }));

      server.use(
        http.get('https://api.github.com/search/issues', () => {
          return HttpResponse.json({
            total_count: 200,
            incomplete_results: false,
            items: manyIssues,
          });
        })
      );

      const result = await searchIssuesWithFilters(
        {
          language: [],
          label: [],
          sort: 'created',
          searchQuery: '',
          onlyNoComments: false,
          minStars: null,
        },
        1,
        {}
      );

      expect(result.items.length).toBeLessThanOrEqual(20);
    });
  });

  describe('searchIssuesWithFilters - multi-language search', () => {
    it('should make parallel requests for multiple languages', async () => {
      const requestUrls: string[] = [];

      server.use(
        http.get('https://api.github.com/search/issues', ({ request }) => {
          requestUrls.push(request.url);
          const url = new URL(request.url);
          const query = url.searchParams.get('q');

          if (query?.includes('language:"TypeScript"')) {
            return HttpResponse.json({
              total_count: 50,
              incomplete_results: false,
              items: [{ ...mockIssue, id: 1 }],
            });
          } else if (query?.includes('language:"JavaScript"')) {
            return HttpResponse.json({
              total_count: 30,
              incomplete_results: false,
              items: [{ ...mockIssue, id: 2 }],
            });
          }

          return HttpResponse.json({
            total_count: 0,
            incomplete_results: false,
            items: [],
          });
        })
      );

      const result = await searchIssuesWithFilters(
        {
          language: ['TypeScript', 'JavaScript'],
          label: [],
          sort: 'created',
          searchQuery: '',
          onlyNoComments: false,
          minStars: null,
        },
        1,
        {}
      );

      expect(requestUrls.length).toBe(2);
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.total_count).toBe(80); // 50 + 30
    });
  });

  describe('searchIssuesWithFilters - star filtering', () => {
    beforeEach(() => {
      // Clear default handlers for this test suite
      server.resetHandlers();
    });

    it('should fetch repository data and filter by stars', async () => {
      // Create enough high-star issues to reach targetCount (10)
      const issues = Array.from({ length: 20 }, (_, i) => ({
        ...mockIssue,
        id: i + 1,
        number: i + 1,
        html_url: `https://github.com/repo${i}/test/issues/${i + 1}`,
      })) as GitHubIssue[];

      server.use(
        http.get('https://api.github.com/search/issues', () => {
          return HttpResponse.json({
            total_count: 100,
            incomplete_results: false,
            items: issues,
          });
        }),
        http.get('https://api.github.com/repos/:owner/:repo', ({ params }) => {
          const owner = params.owner as string;
          // Every other repo (repo1, repo3, repo5, etc.) has high stars
          const repoNum = parseInt(owner.replace('repo', ''));
          const starCount = repoNum % 2 === 1 ? 1000 : 50;

          return HttpResponse.json({
            ...mockRepository,
            full_name: `${owner}/test`,
            stargazers_count: starCount,
          });
        }),
      );

      const result = await searchIssuesWithFilters(
        {
          language: [],
          label: [],
          sort: 'created',
          searchQuery: '',
          onlyNoComments: false,
          minStars: 500,
        },
        1,
        { token: 'test-token' },
      );

      // Should have 10 high star issues (targetCount), limited to 20 in final output
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.length).toBeLessThanOrEqual(20);
      // All returned items should have high stars
      result.items.forEach((item) => {
        expect(item.repository?.stargazers_count).toBeGreaterThanOrEqual(500);
      });
    });

    it("should fetch multiple pages when initial results don't match star filter", async () => {
      let pageRequests = 0;

      server.use(
        http.get('https://api.github.com/search/issues', ({ request }) => {
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get('page') || '1');
          pageRequests++;

          if (page === 1) {
            return HttpResponse.json({
              total_count: 100,
              incomplete_results: false,
              items: [
                {
                  ...mockIssue,
                  id: 1,
                  html_url: 'https://github.com/lowstar1/repo/issues/1',
                },
              ],
            });
          } else if (page === 2) {
            return HttpResponse.json({
              total_count: 100,
              incomplete_results: false,
              items: [
                {
                  ...mockIssue,
                  id: 2,
                  html_url: 'https://github.com/highstar/repo/issues/2',
                },
              ],
            });
          }

          return HttpResponse.json({
            total_count: 100,
            incomplete_results: false,
            items: [],
          });
        }),
        http.get('https://api.github.com/repos/lowstar1/repo', () => {
          return HttpResponse.json({
            ...mockRepository,
            stargazers_count: 50,
          });
        }),
        http.get('https://api.github.com/repos/highstar/repo', () => {
          return HttpResponse.json({
            ...mockRepository,
            stargazers_count: 1000,
          });
        })
      );

      const result = await searchIssuesWithFilters(
        {
          language: [],
          label: [],
          sort: 'created',
          searchQuery: '',
          onlyNoComments: false,
          minStars: 500,
        },
        1,
        { token: 'test-token' }
      );

      expect(pageRequests).toBeGreaterThan(1);
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('should respect maxAttempts limit for pagination', async () => {
      let pageRequests = 0;

      server.use(
        http.get('https://api.github.com/search/issues', ({ request }) => {
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get('page') || '1');
          pageRequests++;

          // Always return low-star issues
          return HttpResponse.json({
            total_count: 100,
            incomplete_results: false,
            items: [
              {
                ...mockIssue,
                id: page,
                html_url: `https://github.com/lowstar/repo/issues/${page}`,
              },
            ],
          });
        }),
        http.get('https://api.github.com/repos/lowstar/repo', () => {
          return HttpResponse.json({
            ...mockRepository,
            stargazers_count: 10,
          });
        })
      );

      await searchIssuesWithFilters(
        {
          language: [],
          label: [],
          sort: 'created',
          searchQuery: '',
          onlyNoComments: false,
          minStars: 500,
        },
        1,
        { token: 'test-token' }
      );

      // Should stop at maxAttempts (3)
      expect(pageRequests).toBeLessThanOrEqual(3);
    });
  });

  describe('searchIssuesWithFilters - label filtering', () => {
    it('should properly escape labels with special characters', async () => {
      server.use(
        http.get('https://api.github.com/search/issues', ({ request }) => {
          const url = new URL(request.url);
          const query = url.searchParams.get('q');

          // The label should be escaped and quoted
          expect(query).toContain('label:"help wanted"');

          return HttpResponse.json({
            total_count: 10,
            incomplete_results: false,
            items: [mockIssue],
          });
        })
      );

      await searchIssuesWithFilters(
        {
          language: [],
          label: ['help wanted'],
          sort: 'created',
          searchQuery: '',
          onlyNoComments: false,
          minStars: null,
        },
        1,
        {}
      );
    });

    it('should support multiple labels', async () => {
      server.use(
        http.get('https://api.github.com/search/issues', ({ request }) => {
          const url = new URL(request.url);
          const query = url.searchParams.get('q');

          expect(query).toContain('label:"help wanted","good first issue"');

          return HttpResponse.json({
            total_count: 10,
            incomplete_results: false,
            items: [mockIssue],
          });
        })
      );

      await searchIssuesWithFilters(
        {
          language: [],
          label: ['help wanted', 'good first issue'],
          sort: 'created',
          searchQuery: '',
          onlyNoComments: false,
          minStars: null,
        },
        1,
        {}
      );
    });
  });

  describe('searchIssuesWithFilters - abort signal', () => {
    it('should respect abort signal', async () => {
      const controller = new AbortController();

      server.use(
        http.get('https://api.github.com/search/issues', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            total_count: 10,
            incomplete_results: false,
            items: [mockIssue],
          });
        })
      );

      const promise = searchIssuesWithFilters(
        {
          language: [],
          label: [],
          sort: 'created',
          searchQuery: '',
          onlyNoComments: false,
          minStars: null,
        },
        1,
        { signal: controller.signal }
      );

      controller.abort();

      await expect(promise).rejects.toThrow();
    });
  });
});
