import { GitHubRateLimitError } from '@/lib/github/client';
import { IssueSnapshot } from '@/lib/github/issueSnapshot';
import { getRepositoryWithCache } from '@/lib/github/repositoryCache';
import { parseRepoFromIssueUrl } from '@/lib/github/urlParser';

type Options = {
  signal?: AbortSignal;
  token?: string | null;
};

export class RepositoryService {
  async enrichSnapshots(
    snapshots: IssueSnapshot[],
    options: Options = {}
  ): Promise<IssueSnapshot[]> {
    return Promise.all(
      snapshots.map(async (snapshot) => {
        if (snapshot.repository) return snapshot;

        const repoInfo = parseRepoFromIssueUrl(snapshot.html_url);
        if (!repoInfo) return snapshot;

        try {
          const repository = await getRepositoryWithCache(
            repoInfo.owner,
            repoInfo.repo,
            {
              signal: options.signal,
              token: options.token ?? undefined,
            }
          );
          return { ...snapshot, repository };
        } catch (err) {
          if (err instanceof GitHubRateLimitError) {
            console.warn(
              'GitHub rate limit hit while enriching repository info; skipping.'
            );
            return snapshot;
          }
          console.error('Failed to fetch repository info:', err);
          return snapshot;
        }
      })
    );
  }

  async filterByMinStars(
    snapshots: IssueSnapshot[],
    minStars: number,
    options: Options = {}
  ): Promise<IssueSnapshot[]> {
    const enriched = await this.enrichSnapshots(snapshots, options);
    return enriched.filter(
      (snapshot) =>
        snapshot.repository && snapshot.repository.stargazers_count >= minStars
    );
  }
}

export const repositoryService = new RepositoryService();
