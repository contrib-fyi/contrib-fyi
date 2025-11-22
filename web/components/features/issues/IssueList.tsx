'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { searchIssues, SearchIssuesResponse } from '@/lib/github/client';
import { IssueRow } from './IssueRow';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTokenStore } from '@/lib/store/useTokenStore';
import { IssueSnapshot, toIssueSnapshot } from '@/lib/github/issueSnapshot';

const buildOrQuery = (
  values: string[],
  formatter: (value: string) => string
) => {
  if (values.length === 0) return null;
  if (values.length === 1) return formatter(values[0]);
  return `(${values.map(formatter).join(' OR ')})`;
};

export function IssueList() {
  const { language, label, sort, searchQuery } = useFilterStore();
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
  }, [language, label, sort, searchQuery]);

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

        // Add label filters (explicit OR condition)
        const labelQuery = buildOrQuery(label, (lbl) => `label:"${lbl}"`);
        if (labelQuery) {
          qParts.push(labelQuery);
        }

        // Add search query
        if (searchQuery) qParts.push(searchQuery);

        const q = qParts.join(' ');

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
  }, [language, label, sort, searchQuery, page, token, refreshKey]);

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
          <div key={i} className="flex flex-col gap-2 rounded-lg border p-4">
            <div className="flex justify-between">
              <div className="w-3/4 space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
            <div className="mt-2 flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-muted-foreground">
          No issues found matching your criteria.
        </p>
      </div>
    );
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
