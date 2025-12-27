import { describe, expect, it } from 'vitest';

import { SearchStrategyFactory } from './SearchStrategyFactory';
import { StandardSearchStrategy } from './StandardSearchStrategy';
import { StarFilteredSearchStrategy } from './StarFilteredSearchStrategy';

describe('SearchStrategyFactory', () => {
  it('returns StandardSearchStrategy when minStars is null or 0', () => {
    const baseFilters = {
      language: [],
      label: [],
      sort: 'created' as const,
      searchQuery: '',
      onlyNoComments: false,
      onlyNoLinkedPRs: false,
      minStars: null,
    };

    expect(SearchStrategyFactory.create(baseFilters)).toBeInstanceOf(
      StandardSearchStrategy
    );
    expect(
      SearchStrategyFactory.create({ ...baseFilters, minStars: 0 })
    ).toBeInstanceOf(StandardSearchStrategy);
  });

  it('returns StarFilteredSearchStrategy when minStars > 0', () => {
    const filters = {
      language: [],
      label: [],
      sort: 'created' as const,
      searchQuery: '',
      onlyNoComments: false,
      onlyNoLinkedPRs: false,
      minStars: 5,
    };

    expect(SearchStrategyFactory.create(filters)).toBeInstanceOf(
      StarFilteredSearchStrategy
    );
  });
});
