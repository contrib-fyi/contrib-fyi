export interface GitHubRepoIdentifier {
  owner: string;
  repo: string;
  fullName: string;
}

export function parseRepoFromIssueUrl(
  issueUrl: string
): GitHubRepoIdentifier | null {
  try {
    const repoPath = issueUrl
      .replace('https://github.com/', '')
      .split('/issues')[0];
    const [owner, repo] = repoPath.split('/');
    if (!owner || !repo) return null;
    return { owner, repo, fullName: `${owner}/${repo}` };
  } catch {
    return null;
  }
}
