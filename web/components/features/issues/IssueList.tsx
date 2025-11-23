'use client';

import { useIssueSearch } from '@/hooks/useIssueSearch';
import { IssueRow } from './IssueRow';
import { IssueRowSkeleton } from './IssueRowSkeleton';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function IssueList() {
  const {
    data,
    loading,
    error,
    page,
    setPage,
    refresh,
    totalPages,
    resetFilters,
  } = useIssueSearch();

  const handleRetry = () => {
    refresh();
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
    refresh();
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
