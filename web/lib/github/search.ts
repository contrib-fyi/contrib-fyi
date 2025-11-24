import {
  searchIssues,
  SearchIssuesResponse,
  GitHubIssue,
} from '@/lib/github/client';
import { IssueSnapshot } from '@/lib/github/issueSnapshot';
import { fetchLinkedPRCounts } from '@/lib/github/graphql';
import { GITHUB_API, SEARCH_CONFIG } from '@/lib/constants/github';
import { IssueTransformer } from '@/lib/github/transformers/IssueTransformer';
import { repositoryService } from '@/lib/github/services/RepositoryService';
import { IssueQueryBuilder } from '@/lib/github/queryBuilder';

interface SearchFilters {
  language: string[];
  label: string[];
  sort: 'created' | 'updated' | 'comments';
  searchQuery: string;
  onlyNoComments: boolean;
  minStars: number | null;
}

interface SearchOptions {
  signal?: AbortSignal;
  token?: string | null;
}

/**
 * Fetches issues from GitHub API.
 * If multiple languages are specified, it fetches them in parallel to avoid
 * the API's behavior of prioritizing the last specified language in OR queries.
 */
async function fetchRawIssues(
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
    const langQuery =
      language.length === 1 ? `language:"${language[0]}"` : null;
    return runSearch(langQuery);
  }

  // If multiple languages, run parallel requests
  const promises = language.map((lang) => runSearch(lang));

  const results = await Promise.all(promises);

  // Merge results
  let allItems: GitHubIssue[] = [];
  let totalCount = 0;

  for (const res of results) {
    allItems = [...allItems, ...res.items];
    totalCount += res.total_count;
  }

  // Sort merged results by created_at desc (default sort)
  // Note: If sort is 'updated' or 'comments', we should adjust this.
  // For now, assuming 'created' is the primary use case or consistent enough.
  allItems.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  // Since we fetched 20 * N items, we might want to slice to 20?
  // But for the "filtering loop" downstream, having more items is actually better.
  // However, to mimic standard pagination behavior roughly, let's keep them all
  // but we must be aware that page 2 will fetch the next batch of 20*N.
  // This "Parallel Pagination" is an approximation.

  return {
    total_count: totalCount,
    incomplete_results: results.some((r) => r.incomplete_results),
    items: allItems,
  };
}

/**
 * Orchestrates the search with intelligent pagination and client-side filtering.
 */
export async function searchIssuesWithFilters(
  filters: SearchFilters,
  page: number,
  options: SearchOptions
): Promise<SearchIssuesResponse<IssueSnapshot>> {
  const { minStars } = filters;
  // Actually useFilterStore doesn't have token in FilterState, it's separate.
  // We'll use options.token.

  // If no minStars filter, just fetch once
  if (minStars === null || minStars <= 0) {
    const res = await fetchRawIssues(filters, page, options);
    const snapshots = IssueTransformer.toSnapshots(res.items).slice(0, 20);

    if (!options.token) {
      return {
        ...res,
        items: snapshots,
      };
    }

    const prCounts = await fetchLinkedPRCounts(
      res.items.slice(0, 20),
      options.token,
      options.signal
    );
    const enriched = IssueTransformer.enrichWithPRCounts(snapshots, prCounts);

    return {
      ...res,
      items: enriched,
    };
  }

  // Intelligent pagination loop for minStars
  let allFilteredIssues: IssueSnapshot[] = [];
  let currentPage = page;
  let totalCount = 0;
  const maxAttempts = SEARCH_CONFIG.STAR_FILTER_MAX_ATTEMPTS;
  const targetCount = SEARCH_CONFIG.STAR_FILTER_TARGET_COUNT;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetchRawIssues(filters, currentPage, options);

    if (options.signal?.aborted) break;

    if (attempt === 0) {
      totalCount = res.total_count;
    }

    // Fetch repo info
    const snapshots = IssueTransformer.toSnapshots(res.items);
    const issuesWithRepo = await repositoryService.enrichSnapshots(snapshots, {
      signal: options.signal,
      token: options.token,
    });

    if (options.signal?.aborted) break;

    const filtered = issuesWithRepo.filter((issue) => {
      if (!issue.repository) return false;
      return issue.repository.stargazers_count >= minStars;
    });

    allFilteredIssues = [...allFilteredIssues, ...filtered];

    if (allFilteredIssues.length >= targetCount || res.items.length === 0) {
      break;
    }

    currentPage++;
  }

  const finalItems = allFilteredIssues.slice(0, 20);

  // Fetch linked PR counts if token is available
  if (options.token && finalItems.length > 0) {
    // We need the original GitHubIssue objects to pass to fetchLinkedPRCounts
    // But we only have IssueSnapshot here. We need to reconstruct or store the original issues.
    // Actually, we can use the node_id from IssueSnapshot to query GraphQL.
    // Let's create a minimal GitHubIssue-like object for the GraphQL function.
    const issuesForGraphQL = IssueTransformer.toGraphQLInput(
      finalItems
    ) as GitHubIssue[];

    const prCounts = await fetchLinkedPRCounts(
      issuesForGraphQL,
      options.token,
      options.signal
    );

    const enriched = IssueTransformer.enrichWithPRCounts(finalItems, prCounts);

    return {
      total_count: totalCount,
      incomplete_results: false,
      items: enriched,
    };
  }

  return {
    total_count: totalCount,
    incomplete_results: false,
    items: finalItems,
  };
}
