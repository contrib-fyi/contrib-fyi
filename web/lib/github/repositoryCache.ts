'use client';

import { getRepository, GitHubRepository } from './client';

const repositoryCache = new Map<string, GitHubRepository>();

export async function getRepositoryWithCache(
  owner: string,
  repo: string,
  signal?: AbortSignal
): Promise<GitHubRepository> {
  const key = `${owner}/${repo}`.toLowerCase();
  const cached = repositoryCache.get(key);
  if (cached) {
    return cached;
  }

  const repoData = await getRepository(owner, repo, { signal });
  repositoryCache.set(key, repoData);
  return repoData;
}

export function clearRepositoryCache() {
  repositoryCache.clear();
}
