import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="animate-in fade-in-50 flex flex-col items-center justify-center py-16 text-center duration-500">
      <div className="bg-muted/50 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <SearchX className="text-muted-foreground h-10 w-10" />
      </div>
      <h3 className="text-xl font-semibold">No issues found</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        We couldn&apos;t find any issues matching your current filters. Try
        adjusting your search terms or clearing some filters.
      </p>
      <Button variant="outline" className="mt-6" onClick={onReset}>
        Clear all filters
      </Button>
    </div>
  );
}
