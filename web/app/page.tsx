import { FilterBar } from '@/components/features/filters/FilterBar';
import { IssueList } from '@/components/features/issues/IssueList';

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Find Issues</h1>
        <p className="text-muted-foreground">
          Discover &quot;Help Wanted&quot; and &quot;Good First Issue&quot;
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
