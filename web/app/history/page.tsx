'use client';

import { useHistoryStore } from '@/lib/store/useHistoryStore';
import { IssueRow } from '@/components/features/issues/IssueRow';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const { history, clearHistory } = useHistoryStore();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Recently Viewed</h1>
          <p className="text-muted-foreground">
            Issues you have viewed recently.
          </p>
        </div>
        {history.length > 0 && (
          <Button variant="destructive" size="sm" onClick={clearHistory}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            No recently viewed issues.
          </p>
          <Button asChild>
            <Link href="/">Browse Issues</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((issue) => (
            <IssueRow key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
