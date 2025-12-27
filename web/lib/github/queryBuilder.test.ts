import { describe, expect, it } from 'vitest';

import {
  IssueQueryBuilder,
  buildQueryFromFilters,
} from '@/lib/github/queryBuilder';

describe('IssueQueryBuilder', () => {
  it('builds base query with labels and search query', () => {
    const q = buildQueryFromFilters(
      {
        label: ['help wanted', 'bug'],
        onlyNoComments: false,
        onlyNoLinkedPRs: false,
        searchQuery: 'is:good-first-issue',
        language: [],
      },
      null
    );
    expect(q).toContain('is:issue');
    expect(q).toContain('is:open');
    expect(q).toContain('label:"help wanted","bug"');
    expect(q).toContain('is:good-first-issue');
  });

  it('escapes double quotes in labels', () => {
    const q = buildQueryFromFilters(
      {
        label: ['foo"bar'],
        onlyNoComments: false,
        onlyNoLinkedPRs: false,
        searchQuery: '',
        language: [],
      },
      null
    );
    expect(q).toContain('label:"foo\\"bar"');
  });

  it('adds language when provided', () => {
    const builder = IssueQueryBuilder.create()
      .withBaseFilters()
      .withLanguage('TypeScript');
    expect(builder.build()).toContain('language:"TypeScript"');
  });

  it('clone produces independent builders', () => {
    const original = IssueQueryBuilder.create()
      .withBaseFilters()
      .withSearchQuery('abc');
    const clone = original.clone().withLanguage('Go');

    expect(original.build()).not.toContain('language:');
    expect(clone.build()).toContain('language:"Go"');
  });

  it('handles no-comments filter', () => {
    const q = buildQueryFromFilters(
      {
        label: [],
        onlyNoComments: true,
        onlyNoLinkedPRs: false,
        searchQuery: '',
        language: [],
      },
      null
    );
    expect(q).toContain('comments:0');
  });

  it('handles no-linked-prs filter', () => {
    const q = buildQueryFromFilters(
      {
        label: [],
        onlyNoComments: false,
        onlyNoLinkedPRs: true,
        searchQuery: '',
        language: [],
      },
      null
    );
    expect(q).toContain('-linked:pr');
  });
});
