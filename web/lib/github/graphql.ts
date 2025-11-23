import { GitHubIssue } from './client';

interface GraphQLResponse<T> {
  data: T;
  errors?: { message: string }[];
}

interface TimelineNode {
  source?: {
    __typename: string;
  };
}

interface IssueNode {
  timelineItems?: {
    nodes: TimelineNode[];
  };
}

interface GraphQLData {
  nodes: (IssueNode | null)[];
}

/**
 * Fetches the count of linked PRs for a list of issues using GraphQL.
 * This looks for CrossReferencedEvent where the source is a PullRequest.
 */
export async function fetchLinkedPRCounts(
  issues: GitHubIssue[],
  token: string,
  signal?: AbortSignal
): Promise<Map<number, number>> {
  if (issues.length === 0) return new Map();

  // We use node_id to identify issues in GraphQL
  const nodeIds = issues.map((i) => i.node_id);

  // Construct the query
  // We want to count CrossReferencedEvents where the source is a PR.
  // Unfortunately, filtering by source type in `timelineItems` is not directly supported in a simple count.
  // However, `timelineItems` with `itemTypes: [CROSS_REFERENCED_EVENT]` gives us the events.
  // We can't easily filter by "source is PR" in the query itself without fetching the nodes.
  // But usually cross-referenced events ARE from PRs or other Issues.
  // To be precise, we should fetch the nodes and filter client-side, but that might be heavy.
  // Let's try to just get the count of CrossReferencedEvents.
  // Note: This might include references from other Issues too, but that's also a "link".
  // If the user specifically wants "PRs", we might need to fetch the items.
  // Let's fetch the first 10 items and check their source.

  const query = `
    query($ids: [ID!]!) {
      nodes(ids: $ids) {
        ... on Issue {
          timelineItems(first: 20, itemTypes: [CROSS_REFERENCED_EVENT]) {
            nodes {
              ... on CrossReferencedEvent {
                source {
                  __typename
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { ids: nodeIds },
      }),
      signal,
    });

    if (!response.ok) {
      console.error('GraphQL request failed:', response.statusText);
      return new Map();
    }

    const json: GraphQLResponse<GraphQLData> = await response.json();

    if (json.errors) {
      console.error('GraphQL errors:', json.errors);
      return new Map();
    }

    const result = new Map<number, number>();

    json.data.nodes.forEach((node, index) => {
      if (!node || !node.timelineItems) return;

      const prCount = node.timelineItems.nodes.filter(
        (item) => item.source && item.source.__typename === 'PullRequest'
      ).length;

      // Map back to issue ID (we rely on the order of nodes matching the input ids)
      // The `nodes` query returns items in the same order as requested IDs.
      const issueId = issues[index].id;
      result.set(issueId, prCount);
    });

    return result;
  } catch (error) {
    console.error('Failed to fetch linked PR counts:', error);
    return new Map();
  }
}
