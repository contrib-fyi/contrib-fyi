export const GITHUB_API = {
  BASE_URL: 'https://api.github.com',
  DEFAULT_PAGE_SIZE: 20,
  MAX_SEARCH_RESULTS: 1000,
} as const;

export const SEARCH_CONFIG = {
  STAR_FILTER_MAX_ATTEMPTS: 3,
  STAR_FILTER_TARGET_COUNT: 10,
} as const;
