'use client';

import { usePickStore } from '@/lib/store/usePickStore';
import { IssueRow } from '@/components/features/issues/IssueRow';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PicksPage() {
  const { picks } = usePickStore();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Picks</h1>
        <p className="text-muted-foreground">
          Issues you have saved for later.
        </p>
      </div>

      {picks.length === 0 ? (
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            You haven&apos;t picked any issues yet.
          </p>
          <Button asChild>
            <Link href="/">Browse Issues</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {picks.map((issue) => (
            <IssueRow key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
