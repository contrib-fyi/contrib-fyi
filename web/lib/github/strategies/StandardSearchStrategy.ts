import { fetchLinkedPRCounts } from '@/lib/github/graphql';
import { IssueTransformer } from '@/lib/github/transformers/IssueTransformer';
import { fetchRawIssues } from './fetchRawIssues';
import { SearchFilters, SearchOptions, SearchStrategy } from './SearchStrategy';

export class StandardSearchStrategy implements SearchStrategy {
  async execute(filters: SearchFilters, page: number, options: SearchOptions) {
    const res = await fetchRawIssues(filters, page, options);
    const snapshots = IssueTransformer.toSnapshots(res.items).slice(0, 20);

    if (!options.token) {
      return { ...res, items: snapshots };
    }

    const prCounts = await fetchLinkedPRCounts(
      res.items.slice(0, 20),
      options.token,
      options.signal
    );
    const enriched = IssueTransformer.enrichWithPRCounts(snapshots, prCounts);

    return { ...res, items: enriched };
  }
}
