import { describe, it, expect } from 'vitest';
import { parseRepoFromIssueUrl } from './urlParser';

describe('parseRepoFromIssueUrl', () => {
  it('parses owner and repo from issue URL', () => {
    const res = parseRepoFromIssueUrl(
      'https://github.com/owner/repo/issues/123'
    );
    expect(res).toEqual({
      owner: 'owner',
      repo: 'repo',
      fullName: 'owner/repo',
    });
  });

  it('returns null for non-issue URL', () => {
    const res = parseRepoFromIssueUrl('https://github.com/owner/repo/pull/1');
    expect(res).toBeNull();
  });

  it('returns null for malformed URL', () => {
    const res = parseRepoFromIssueUrl('https://github.com/owner');
    expect(res).toBeNull();
  });
});
