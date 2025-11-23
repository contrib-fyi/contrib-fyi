import { useState, useEffect, useMemo } from 'react';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { useTokenStore } from '@/lib/store/useTokenStore';
import { SearchIssuesResponse } from '@/lib/github/client';
import { IssueSnapshot } from '@/lib/github/issueSnapshot';
import { searchIssuesWithFilters } from '@/lib/github/search';

export function useIssueSearch() {
  const {
    language,
    label,
    sort,
    searchQuery,
    onlyNoComments,
    minStars,
    resetFilters,
  } = useFilterStore();
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
        const res = await searchIssuesWithFilters(
          {
            language,
            label,
            sort,
            searchQuery,
            onlyNoComments,
            minStars,
          },
          page,
          {
            signal: controller.signal,
            token,
          }
        );

        if (!controller.signal.aborted && isSubscribed) {
          setData(res);
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

  const refresh = () => {
    setRefreshKey((key) => key + 1);
  };

  return {
    data,
    loading,
    error,
    page,
    setPage,
    refresh,
    totalPages,
    resetFilters,
  };
}
