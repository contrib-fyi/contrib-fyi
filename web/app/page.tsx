import { FilterBar } from '@/components/features/filters/FilterBar';
import { IssueList } from '@/components/features/issues/IssueList';

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Find Issues</h1>
        <p className="text-muted-foreground text-lg">
          Discover{' '}
          <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text font-extrabold text-transparent dark:from-blue-400 dark:to-cyan-300">
            &quot;Help Wanted&quot;
          </span>{' '}
          and{' '}
          <span className="bg-linear-to-r from-purple-600 to-pink-500 bg-clip-text font-extrabold text-transparent dark:from-purple-400 dark:to-pink-300">
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
