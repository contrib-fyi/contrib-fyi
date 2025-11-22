'use client';

import { getRepository, GitHubRepository } from './client';

type RepositoryCacheOptions = {
  signal?: AbortSignal;
  token?: string | null;
};

const repositoryCache = new Map<string, GitHubRepository>();

const hashToken = (token: string) => {
  let hash = 0;
  for (let i = 0; i < token.length; i += 1) {
    hash = (hash << 5) - hash + token.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
};

export async function getRepositoryWithCache(
  owner: string,
  repo: string,
  options: RepositoryCacheOptions = {}
): Promise<GitHubRepository> {
  const baseKey = `${owner}/${repo}`.toLowerCase();
  const tokenKey = options.token ? hashToken(options.token) : 'anon';
  const cacheKey = `${baseKey}::${tokenKey}`;

  const cached = repositoryCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const repoData = await getRepository(owner, repo, {
    signal: options.signal,
    token: options.token ?? undefined,
  });
  repositoryCache.set(cacheKey, repoData);
  return repoData;
}

export function clearRepositoryCache() {
  repositoryCache.clear();
}
