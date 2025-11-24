const escapeForQualifier = (value: string) => `"${value.replace(/"/g, '\\"')}"`;

export class IssueQueryBuilder {
  private parts: string[];

  private constructor(parts: string[] = []) {
    this.parts = parts;
  }

  static create(): IssueQueryBuilder {
    return new IssueQueryBuilder();
  }

  clone(): IssueQueryBuilder {
    return new IssueQueryBuilder([...this.parts]);
  }

  withBaseFilters(): this {
    this.parts.push('is:issue', 'is:open');
    return this;
  }

  withLabels(labels: string[]): this {
    if (labels.length === 0) return this;
    const escaped = labels.map(escapeForQualifier).join(',');
    this.parts.push(`label:${escaped}`);
    return this;
  }

  withNoComments(enabled: boolean): this {
    if (enabled) this.parts.push('comments:0');
    return this;
  }

  withSearchQuery(query: string): this {
    if (query) this.parts.push(query);
    return this;
  }

  withLanguage(language: string | null): this {
    if (language) {
      this.parts.push(`language:${escapeForQualifier(language)}`);
    }
    return this;
  }

  build(): string {
    return this.parts.join(' ');
  }
}

/**
 * Build a query string for the given filters. If languageOverride is provided,
 * it is used instead of filters.language.
 */
export function buildQueryFromFilters(
  filters: {
    label: string[];
    onlyNoComments: boolean;
    searchQuery: string;
    language: string[];
  },
  languageOverride: string | null = null
): string {
  const builder = IssueQueryBuilder.create()
    .withBaseFilters()
    .withLabels(filters.label)
    .withNoComments(filters.onlyNoComments)
    .withSearchQuery(filters.searchQuery);

  const language =
    languageOverride !== null
      ? languageOverride
      : (filters.language[0] ?? null);

  builder.withLanguage(language);
  return builder.build();
}
