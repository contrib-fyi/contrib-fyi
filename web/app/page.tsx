import { FilterBar } from '@/components/features/filters/FilterBar';
import { IssueList } from '@/components/features/issues/IssueList';

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Find Issues</h1>
        <p className="text-muted-foreground text-lg">
          Discover{' '}
          <span className="text-primary font-bold">
            &quot;Help Wanted&quot;
          </span>{' '}
          and{' '}
          <span className="font-bold text-orange-500 dark:text-orange-400">
            &quot;Good First Issue&quot;
          </span>{' '}
          tasks across GitHub.
        </p>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border shadow">
        <FilterBar />
        <IssueList />
      </div>
    </div>
  );
}
