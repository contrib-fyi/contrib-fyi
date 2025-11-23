import { describe, expect, it } from 'vitest';

import { IssueTransformer } from './IssueTransformer';
import { mockIssue, mockRepository } from '@/test/mockData';

describe('IssueTransformer', () => {
  it('converts GitHub issues to snapshots', () => {
    const snapshots = IssueTransformer.toSnapshots([mockIssue]);
    expect(snapshots).toHaveLength(1);
    expect(snapshots[0]).toMatchObject({
      id: mockIssue.id,
      node_id: mockIssue.node_id,
      html_url: mockIssue.html_url,
      repository: mockIssue.repository,
    });
  });

  it('builds GraphQL input from snapshots', () => {
    const snapshots = IssueTransformer.toSnapshots([mockIssue]);
    const input = IssueTransformer.toGraphQLInput(snapshots);
    expect(input).toEqual([{ id: mockIssue.id, node_id: mockIssue.node_id }]);
  });

  it('enriches snapshots with PR counts', () => {
    const snapshots = IssueTransformer.toSnapshots([mockIssue]);
    const enriched = IssueTransformer.enrichWithPRCounts(
      snapshots,
      new Map([[mockIssue.id, 3]])
    );
    expect(enriched[0].linked_pr_count).toBe(3);
  });

  it('enriches snapshots with repositories map', () => {
    const snapshots = IssueTransformer.toSnapshots([
      { ...mockIssue, repository: undefined },
    ]);
    const repoMap = new Map([[mockRepository.full_name, mockRepository]]);

    const enriched = IssueTransformer.enrichWithRepositories(
      snapshots,
      repoMap
    );

    expect(enriched[0].repository).toBe(mockRepository);
  });
});
