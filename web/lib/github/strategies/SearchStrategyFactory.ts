import { SearchFilters, SearchStrategy } from './SearchStrategy';
import { StandardSearchStrategy } from './StandardSearchStrategy';
import { StarFilteredSearchStrategy } from './StarFilteredSearchStrategy';

export class SearchStrategyFactory {
  static create(filters: SearchFilters): SearchStrategy {
    if (filters.minStars && filters.minStars > 0) {
      return new StarFilteredSearchStrategy();
    }
    return new StandardSearchStrategy();
  }
}
