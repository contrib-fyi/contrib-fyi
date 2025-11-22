'use client';

import { useEffect, useState } from 'react';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { searchIssues, SearchIssuesResponse } from '@/lib/github/client';
import { IssueRow } from './IssueRow';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function IssueList() {
  const { language, label, sort, searchQuery } = useFilterStore();
  const [data, setData] = useState<SearchIssuesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1); // Reset page when filters change
  }, [language, label, sort, searchQuery]);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      setError(null);
      try {
        const qParts = ['is:issue', 'is:open'];

        // Add language filters (space-separated for OR condition)
        if (language.length > 0) {
          const langQuery = language.map((l) => `language:"${l}"`).join(' ');
          qParts.push(langQuery);
        }

        // Add label filters (space-separated for OR condition)
        if (label.length > 0) {
          const labelQuery = label.map((l) => `label:"${l}"`).join(' ');
          qParts.push(labelQuery);
        }

        // Add search query
        if (searchQuery) qParts.push(searchQuery);

        const q = qParts.join(' ');

        const res = await searchIssues({
          q,
          sort,
          order: 'desc',
          per_page: 20,
          page,
        });
        setData(res);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch issues');
        }
      } finally {
        setLoading(false);
      }
    };

    // Debounce could be added here, but for now direct call
    const timeoutId = setTimeout(fetchIssues, 300);
    return () => clearTimeout(timeoutId);
  }, [language, label, sort, searchQuery, page]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-lg font-semibold text-red-500">Error</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
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
          onClick={() => setPage((p) => p + 1)}
          disabled={data.items.length < 20} // Simple check, ideally check total_count
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
