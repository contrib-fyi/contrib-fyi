import { SearchIssuesResponse } from '@/lib/github/client';
import { IssueSnapshot } from '@/lib/github/issueSnapshot';
import {
  SearchFilters,
  SearchOptions,
} from '@/lib/github/strategies/SearchStrategy';
import { SearchStrategyFactory } from '@/lib/github/strategies/SearchStrategyFactory';

/**
 * Orchestrates the search with intelligent pagination and client-side filtering.
 */
export async function searchIssuesWithFilters(
  filters: SearchFilters,
  page: number,
  options: SearchOptions
): Promise<SearchIssuesResponse<IssueSnapshot>> {
  const strategy = SearchStrategyFactory.create(filters);
  return strategy.execute(filters, page, options);
}
