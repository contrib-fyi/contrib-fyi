import { GitHubIssue, GitHubRepository } from '@/lib/github/client';
import { IssueSnapshot, toIssueSnapshot } from '@/lib/github/issueSnapshot';
import { parseRepoFromIssueUrl } from '@/lib/github/urlParser';

export class IssueTransformer {
  static toSnapshots(issues: GitHubIssue[]): IssueSnapshot[] {
    return issues.map(toIssueSnapshot);
  }

  static toGraphQLInput(
    snapshots: IssueSnapshot[]
  ): Pick<GitHubIssue, 'id' | 'node_id'>[] {
    return snapshots.map((snapshot) => ({
      id: snapshot.id,
      node_id: snapshot.node_id,
    }));
  }

  static enrichWithPRCounts(
    snapshots: IssueSnapshot[],
    prCounts: Map<number, number>
  ): IssueSnapshot[] {
    return snapshots.map((snapshot) => {
      const count = prCounts.get(snapshot.id);
      if (count === undefined) return snapshot;
      return { ...snapshot, linked_pr_count: count };
    });
  }

  static enrichWithRepositories(
    snapshots: IssueSnapshot[],
    repositories: Map<string, GitHubRepository>
  ): IssueSnapshot[] {
    return snapshots.map((snapshot) => {
      if (snapshot.repository) return snapshot;

      const repoInfo = parseRepoFromIssueUrl(snapshot.html_url);
      if (!repoInfo) return snapshot;

      const repository = repositories.get(repoInfo.fullName);
      if (!repository) return snapshot;

      return { ...snapshot, repository };
    });
  }
}
