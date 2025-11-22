'use client';

import { GitHubIssue } from './client';

const BODY_PREVIEW_LIMIT = 2000;

export interface IssueSnapshotUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface IssueSnapshotLabel {
  id: number;
  name: string;
  color: string;
  description: string;
}

export interface IssueSnapshot {
  id: number;
  node_id: string;
  html_url: string;
  repository_url: string;
  number: number;
  state: string;
  title: string;
  body: string;
  user: IssueSnapshotUser;
  labels: IssueSnapshotLabel[];
  comments: number;
  created_at: string;
  updated_at: string;
  repository?: GitHubIssue['repository'];
}

export function toIssueSnapshot(issue: GitHubIssue): IssueSnapshot {
  return {
    id: issue.id,
    node_id: issue.node_id,
    html_url: issue.html_url,
    repository_url: issue.repository_url,
    number: issue.number,
    state: issue.state,
    title: issue.title,
    body: issue.body?.slice(0, BODY_PREVIEW_LIMIT) ?? '',
    user: {
      login: issue.user.login,
      id: issue.user.id,
      avatar_url: issue.user.avatar_url,
      html_url: issue.user.html_url,
    },
    labels: issue.labels.map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
      description: label.description,
    })),
    comments: issue.comments,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    repository: issue.repository,
  };
}
