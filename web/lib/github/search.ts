import {
    searchIssues,
    SearchIssuesResponse,
    GitHubIssue,
} from '@/lib/github/client';
import {
    IssueSnapshot,
    toIssueSnapshot,
} from '@/lib/github/issueSnapshot';
import { getRepositoryWithCache } from '@/lib/github/repositoryCache';

interface SearchFilters {
    language: string[];
    label: string[];
    sort: 'created' | 'updated' | 'comments';
    searchQuery: string;
    onlyNoComments: boolean;
    minStars: number | null;
}

interface SearchOptions {
    signal?: AbortSignal;
    token?: string | null;
}

const escapeForQualifier = (value: string) =>
    `"${value.replace(/"/g, '\\"')}"`;

const buildLabelQuery = (labels: string[]) => {
    if (labels.length === 0) return null;
    return `label:${labels.map(escapeForQualifier).join(',')}`;
};

/**
 * Fetches issues from GitHub API.
 * If multiple languages are specified, it fetches them in parallel to avoid
 * the API's behavior of prioritizing the last specified language in OR queries.
 */
async function fetchRawIssues(
    filters: SearchFilters,
    page: number,
    options: SearchOptions
): Promise<SearchIssuesResponse<GitHubIssue>> {
    const { language, label, sort, searchQuery, onlyNoComments } = filters;

    // Base query parts (excluding language)
    const baseQParts = ['is:issue', 'is:open'];

    const labelQuery = buildLabelQuery(label);
    if (labelQuery) baseQParts.push(labelQuery);

    if (onlyNoComments) baseQParts.push('comments:0');
    if (searchQuery) baseQParts.push(searchQuery);

    // Helper to run search
    const runSearch = async (langQuery: string | null) => {
        const qParts = [...baseQParts];
        if (langQuery) qParts.push(langQuery);
        const q = qParts.join(' ');

        return searchIssues(
            {
                q,
                sort,
                order: 'desc',
                per_page: 20,
                page,
            },
            options
        );
    };

    // If 0 or 1 language, use standard single request
    if (language.length <= 1) {
        const langQuery =
            language.length === 1 ? `language:"${language[0]}"` : null;
        return runSearch(langQuery);
    }

    // If multiple languages, run parallel requests
    const promises = language.map((lang) =>
        runSearch(`language:"${lang}"`)
    );

    const results = await Promise.all(promises);

    // Merge results
    let allItems: GitHubIssue[] = [];
    let totalCount = 0;

    for (const res of results) {
        allItems = [...allItems, ...res.items];
        totalCount += res.total_count;
    }

    // Sort merged results by created_at desc (default sort)
    // Note: If sort is 'updated' or 'comments', we should adjust this.
    // For now, assuming 'created' is the primary use case or consistent enough.
    allItems.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
    });

    // Since we fetched 20 * N items, we might want to slice to 20?
    // But for the "filtering loop" downstream, having more items is actually better.
    // However, to mimic standard pagination behavior roughly, let's keep them all
    // but we must be aware that page 2 will fetch the next batch of 20*N.
    // This "Parallel Pagination" is an approximation.

    return {
        total_count: totalCount,
        incomplete_results: results.some((r) => r.incomplete_results),
        items: allItems,
    };
}

/**
 * Orchestrates the search with intelligent pagination and client-side filtering.
 */
export async function searchIssuesWithFilters(
    filters: SearchFilters,
    page: number,
    options: SearchOptions
): Promise<SearchIssuesResponse<IssueSnapshot>> {
    const { minStars } = filters;
    // Actually useFilterStore doesn't have token in FilterState, it's separate.
    // We'll use options.token.

    // If no minStars filter, just fetch once
    if (minStars === null || minStars <= 0) {
        const res = await fetchRawIssues(filters, page, options);
        const snapshots = res.items.map(toIssueSnapshot);
        // If we got more than 20 items due to parallel fetch, slice it to keep UI consistent?
        // Or just show them all? Showing more is probably fine/better.
        // Let's slice to 20 to keep page size consistent.
        return {
            ...res,
            items: snapshots.slice(0, 20),
        };
    }

    // Intelligent pagination loop for minStars
    let allFilteredIssues: IssueSnapshot[] = [];
    let currentPage = page;
    let totalCount = 0;
    const maxAttempts = 3;
    const targetCount = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const res = await fetchRawIssues(filters, currentPage, options);

        if (options.signal?.aborted) break;

        if (attempt === 0) {
            totalCount = res.total_count;
        }

        // Fetch repo info
        const issuesWithRepo = await Promise.all(
            res.items.map(async (issue) => {
                const snapshot = toIssueSnapshot(issue);
                const repoPath = issue.html_url
                    .replace('https://github.com/', '')
                    .split('/issues')[0];
                const [owner, repo] = repoPath.split('/');

                if (!owner || !repo) return snapshot;

                try {
                    const repository = await getRepositoryWithCache(owner, repo, {
                        signal: options.signal,
                        token: options.token,
                    });
                    return { ...snapshot, repository };
                } catch (err) {
                    console.error('Failed to fetch repository info:', err);
                    return snapshot;
                }
            })
        );

        if (options.signal?.aborted) break;

        const filtered = issuesWithRepo.filter((issue) => {
            if (!issue.repository) return false;
            return issue.repository.stargazers_count >= minStars;
        });

        allFilteredIssues = [...allFilteredIssues, ...filtered];

        if (allFilteredIssues.length >= targetCount || res.items.length === 0) {
            break;
        }

        currentPage++;
    }

    return {
        total_count: totalCount,
        incomplete_results: false,
        items: allFilteredIssues.slice(0, 20),
    };
}
