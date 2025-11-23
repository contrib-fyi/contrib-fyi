import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GitHubRateLimitError } from '@/lib/github/client';
import { IssueTransformer } from '@/lib/github/transformers/IssueTransformer';
import { repositoryService } from './RepositoryService';
import {
  mockIssue,
  mockIssueWithHighStars,
  mockRepository,
} from '@/test/mockData';

vi.mock('@/lib/github/repositoryCache', () => ({
  getRepositoryWithCache: vi.fn(),
}));

const { getRepositoryWithCache } = vi.mocked(
  await import('@/lib/github/repositoryCache')
);

describe('RepositoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enriches snapshots with repository data', async () => {
    getRepositoryWithCache.mockResolvedValue(mockRepository);
    const snapshots = IssueTransformer.toSnapshots([
      { ...mockIssue, repository: undefined },
    ]);

    const enriched = await repositoryService.enrichSnapshots(snapshots, {
      token: 'abc',
    });

    expect(enriched[0].repository).toBe(mockRepository);
    expect(getRepositoryWithCache).toHaveBeenCalledWith(
      'test-owner',
      'test-repo',
      {
        signal: undefined,
        token: 'abc',
      }
    );
  });

  it('filters by minStars using repository data', async () => {
    getRepositoryWithCache.mockResolvedValue(mockIssueWithHighStars.repository!);
    const snapshots = IssueTransformer.toSnapshots([
      { ...mockIssue, repository: undefined },
    ]);

    const filtered = await repositoryService.filterByMinStars(snapshots, 800, {
      token: null,
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].repository?.stargazers_count).toBe(1000);
  });

  it('swallows rate limit errors and returns original snapshot', async () => {
    getRepositoryWithCache.mockRejectedValue(new GitHubRateLimitError());
    const snapshots = IssueTransformer.toSnapshots([
      { ...mockIssue, repository: undefined },
    ]);

    const enriched = await repositoryService.enrichSnapshots(snapshots);

    expect(enriched[0].repository).toBeUndefined();
  });
});
