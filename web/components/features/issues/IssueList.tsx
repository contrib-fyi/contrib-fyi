'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { searchIssues, SearchIssuesResponse } from '@/lib/github/client';
import { IssueRow } from './IssueRow';
import { IssueRowSkeleton } from './IssueRowSkeleton';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTokenStore } from '@/lib/store/useTokenStore';
import { IssueSnapshot, toIssueSnapshot } from '@/lib/github/issueSnapshot';
import { getRepositoryWithCache } from '@/lib/github/repositoryCache';

const buildOrQuery = (
  values: string[],
  formatter: (value: string) => string
) => {
  if (values.length === 0) return null;
  if (values.length === 1) return formatter(values[0]);
  return `(${values.map(formatter).join(' OR ')})`;
};

const escapeForQualifier = (value: string) => `"${value.replace(/"/g, '\\"')}"`;

const buildLabelQuery = (labels: string[]) => {
  if (labels.length === 0) return null;
  return `label:${labels.map(escapeForQualifier).join(',')}`;
};

export function IssueList() {
  const { language, label, sort, searchQuery, onlyNoComments, minStars, resetFilters } =
    useFilterStore();
  const token = useTokenStore((state) => state.token);
  const [data, setData] = useState<SearchIssuesResponse<IssueSnapshot> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setPage(1); // Reset page when filters change
  }, [language, label, sort, searchQuery, onlyNoComments, minStars]);

  useEffect(() => {
    const controller = new AbortController();
    let isSubscribed = true;

    const fetchIssues = async () => {
      setLoading(true);
      setError(null);

      try {
        const qParts = ['is:issue', 'is:open'];

        // Add language filters (explicit OR condition)
        const languageQuery = buildOrQuery(
          language,
          (lang) => `language:"${lang}"`
        );
        if (languageQuery) {
          qParts.push(languageQuery);
        }

        // Add label filters (comma-separated OR)
        const labelQuery = buildLabelQuery(label);
        if (labelQuery) {
          qParts.push(labelQuery);
        }

        if (onlyNoComments) {
          qParts.push('comments:0');
        }

        // Add search query
        if (searchQuery) qParts.push(searchQuery);

        const q = qParts.join(' ');

        // Intelligent pagination: fetch multiple pages if minStars filter is active
        if (minStars !== null && minStars > 0) {
          let allFilteredIssues: IssueSnapshot[] = [];
          let currentPage = page;
          let totalCount = 0;
          const maxAttempts = 3; // Try up to 3 pages
          const targetCount = 10; // Try to get at least 10 issues

          for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const res = await searchIssues(
              {
                q,
                sort,
                order: 'desc',
                per_page: 20,
                page: currentPage,
              },
              {
                signal: controller.signal,
                token,
              }
            );

            if (controller.signal.aborted || !isSubscribed) return;

            // Store total count from first response
            if (attempt === 0) {
              totalCount = res.total_count;
            }

            // Fetch repository info for all issues in parallel
            const issuesWithRepo = await Promise.all(
              res.items.map(async (issue) => {
                const snapshot = toIssueSnapshot(issue);

                // Extract owner and repo from html_url
                const repoPath = issue.html_url
                  .replace('https://github.com/', '')
                  .split('/issues')[0];
                const [owner, repo] = repoPath.split('/');

                if (!owner || !repo) {
                  return snapshot;
                }

                try {
                  const repository = await getRepositoryWithCache(owner, repo, {
                    signal: controller.signal,
                    token,
                  });
                  return { ...snapshot, repository };
                } catch (err) {
                  // If we can't fetch repo info, include the issue without filtering
                  console.error('Failed to fetch repository info:', err);
                  return snapshot;
                }
              })
            );

            if (controller.signal.aborted || !isSubscribed) return;

            // Filter by star count
            const filtered = issuesWithRepo.filter((issue) => {
              if (!issue.repository) return false; // Exclude if repo info is missing
              return issue.repository.stargazers_count >= minStars;
            });

            allFilteredIssues = [...allFilteredIssues, ...filtered];

            // Stop if we have enough results or no more items
            if (allFilteredIssues.length >= targetCount || res.items.length === 0) {
              break;
            }

            currentPage++;
          }

          if (!controller.signal.aborted && isSubscribed) {
            // Return up to 20 issues
            const finalIssues = allFilteredIssues.slice(0, 20);
            setData({
              total_count: totalCount,
              incomplete_results: false,
              items: finalIssues,
            });
          }
        } else {
          // No star filter: use original logic
          const res = await searchIssues(
            {
              q,
              sort,
              order: 'desc',
              per_page: 20,
              page,
            },
            {
              signal: controller.signal,
              token,
            }
          );

          if (!controller.signal.aborted && isSubscribed) {
            const snapshots = res.items.map((item) => toIssueSnapshot(item));
            setData({ ...res, items: snapshots });
          }
        }
      } catch (err: unknown) {
        if (controller.signal.aborted || !isSubscribed) return;

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch issues');
        }
      } finally {
        if (!controller.signal.aborted && isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchIssues();

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [
    language,
    label,
    sort,
    searchQuery,
    onlyNoComments,
    minStars,
    page,
    token,
    refreshKey,
  ]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    const MAX_RESULTS = 1000; // GitHub search API caps results at 1000
    const totalResults = Math.min(data.total_count, MAX_RESULTS);
    return Math.max(1, Math.ceil(totalResults / 20));
  }, [data]);

  const handleRetry = () => {
    setRefreshKey((key) => key + 1);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-lg font-semibold text-red-500">Error</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-4" onClick={handleRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <IssueRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  const handleReset = () => {
    resetFilters();
    setRefreshKey((key) => key + 1);
  };

  if (!data || data.items.length === 0) {
    return <EmptyState onReset={handleReset} />;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-4">
        {data.items.map((issue) => (
          <IssueRow key={issue.id} issue={issue} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm font-medium">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
