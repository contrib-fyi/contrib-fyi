import { GitHubIssue } from '@/lib/github/client';
import { fetchLinkedPRCounts } from '@/lib/github/graphql';
import { SEARCH_CONFIG } from '@/lib/constants/github';
import { repositoryService } from '@/lib/github/services/RepositoryService';
import { IssueTransformer } from '@/lib/github/transformers/IssueTransformer';
import { fetchRawIssues } from './fetchRawIssues';
import { SearchFilters, SearchOptions, SearchStrategy } from './SearchStrategy';

export class StarFilteredSearchStrategy implements SearchStrategy {
  async execute(filters: SearchFilters, page: number, options: SearchOptions) {
    let allFilteredIssues = [] as ReturnType<
      typeof IssueTransformer.toSnapshots
    >;
    let currentPage = page;
    let totalCount = 0;
    const maxAttempts = SEARCH_CONFIG.STAR_FILTER_MAX_ATTEMPTS;
    const targetCount = SEARCH_CONFIG.STAR_FILTER_TARGET_COUNT;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const res = await fetchRawIssues(filters, currentPage, options);

      if (options.signal?.aborted) break;
      if (attempt === 0) totalCount = res.total_count;

      const snapshots = IssueTransformer.toSnapshots(res.items);
      const withRepo = await repositoryService.enrichSnapshots(snapshots, {
        signal: options.signal,
        token: options.token,
      });

      const filtered = withRepo.filter(
        (issue) =>
          issue.repository &&
          issue.repository.stargazers_count >= (filters.minStars ?? 0)
      );

      allFilteredIssues = [...allFilteredIssues, ...filtered];

      if (allFilteredIssues.length >= targetCount || res.items.length === 0) {
        break;
      }

      currentPage++;
    }

    const finalItems = allFilteredIssues.slice(0, 20);

    if (!options.token || finalItems.length === 0) {
      return {
        total_count: totalCount,
        incomplete_results: false,
        items: finalItems,
      };
    }

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
}
