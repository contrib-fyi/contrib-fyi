import {
  searchIssues,
  SearchIssuesResponse,
  GitHubIssue,
} from '@/lib/github/client';
import { GITHUB_API } from '@/lib/constants/github';
import { IssueQueryBuilder } from '@/lib/github/queryBuilder';
import { SearchFilters, SearchOptions } from './SearchStrategy';

/**
 * Fetches issues from GitHub API.
 * If multiple languages are specified, it fetches them in parallel to avoid
 * the API's behavior of prioritizing the last specified language in OR queries.
 */
export async function fetchRawIssues(
  filters: SearchFilters,
  page: number,
  options: SearchOptions
): Promise<SearchIssuesResponse<GitHubIssue>> {
  const { language, label, sort, searchQuery, onlyNoComments } = filters;

  const baseBuilder = IssueQueryBuilder.create()
    .withBaseFilters()
    .withLabels(label)
    .withNoComments(onlyNoComments)
    .withSearchQuery(searchQuery);

  const runSearch = async (lang: string | null) => {
    const q = baseBuilder.clone().withLanguage(lang).build();

    return searchIssues(
      {
        q,
        sort,
        order: 'desc',
        per_page: GITHUB_API.DEFAULT_PAGE_SIZE,
        page,
      },
      options
    );
  };

  // If 0 or 1 language, use standard single request
  if (language.length <= 1) {
    const langQuery = language.length === 1 ? language[0] : null;
    return runSearch(langQuery);
  }

  // If multiple languages, run parallel requests
  const results = await Promise.all(language.map((lang) => runSearch(lang)));

  // Merge results
  let allItems: GitHubIssue[] = [];
  let totalCount = 0;

  for (const res of results) {
    allItems = [...allItems, ...res.items];
    totalCount += res.total_count;
  }

  // Sort merged results by created_at desc (default sort)
  allItems.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  return {
    total_count: totalCount,
    incomplete_results: results.some((r) => r.incomplete_results),
    items: allItems,
  };
}
