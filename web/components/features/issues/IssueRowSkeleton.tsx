import { Skeleton } from '@/components/ui/skeleton';

export function IssueRowSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 gap-3">
          {/* Avatar Skeleton */}
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

          {/* Content Skeleton */}
          <div className="min-w-0 flex-1 space-y-2">
            {/* Title */}
            <Skeleton className="h-7 w-3/4" />

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>

            {/* Labels */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right side: Stats and Button */}
        <div className="flex w-full flex-row items-center justify-between gap-2 sm:w-auto sm:flex-col sm:items-end">
          {/* Stats */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-8" />
          </div>

          {/* Button */}
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>
    </div>
  );
}
