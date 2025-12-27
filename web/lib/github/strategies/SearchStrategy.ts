import { SearchIssuesResponse } from '@/lib/github/client';
import { IssueSnapshot } from '@/lib/github/issueSnapshot';

export interface SearchFilters {
  language: string[];
  label: string[];
  sort: 'created' | 'updated' | 'comments';
  searchQuery: string;
  onlyNoComments: boolean;
  onlyNoLinkedPRs: boolean;
  minStars: number | null;
}

export interface SearchOptions {
  signal?: AbortSignal;
  token?: string | null;
}

export interface SearchStrategy {
  execute(
    filters: SearchFilters,
    page: number,
    options: SearchOptions
  ): Promise<SearchIssuesResponse<IssueSnapshot>>;
}
