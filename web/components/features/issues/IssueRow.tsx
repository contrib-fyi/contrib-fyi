'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Star,
  MessageSquare,
  Clock,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePickStore } from '@/lib/store/usePickStore';
import { useHistoryStore } from '@/lib/store/useHistoryStore';
import { IssueDetailModal } from './IssueDetailModal';
import { GitHubRepository } from '@/lib/github/client';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getRepositoryWithCache } from '@/lib/github/repositoryCache';
import { IssueSnapshot } from '@/lib/github/issueSnapshot';
import { useTokenStore } from '@/lib/store/useTokenStore';

interface IssueRowProps {
  issue: IssueSnapshot;
}

export function IssueRow({ issue }: IssueRowProps) {
  const { addPick, removePick, isPicked } = usePickStore();
  const { addToHistory } = useHistoryStore();
  const token = useTokenStore((state) => state.token);
  const picked = isPicked(issue.id);
  const [repository, setRepository] = useState<GitHubRepository | null>(
    issue.repository || null
  );

  // Extract owner and repo from html_url or repository_url
  // html_url: https://github.com/owner/repo/issues/123
  const repoPath = issue.html_url
    .replace('https://github.com/', '')
    .split('/issues')[0];
  const [owner, repo] = repoPath.split('/');

  // Fetch repository info if not already available
  useEffect(() => {
    if (issue.repository || !owner || !repo) {
      return;
    }

    const controller = new AbortController();

    getRepositoryWithCache(owner, repo, {
      signal: controller.signal,
      token,
    })
      .then((repoData) => {
        if (!controller.signal.aborted) {
          setRepository(repoData);
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Failed to fetch repository info:', err);
      });

    return () => {
      controller.abort();
    };
  }, [issue.repository, owner, repo, token]);

  const handlePickToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (picked) {
      removePick(issue.id);
    } else {
      addPick(issue);
    }
  };

  const handleView = () => {
    addToHistory(issue);
  };

  return (
    <div className="group hover:bg-muted/50 flex flex-col gap-2 rounded-lg border p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-md active:scale-[0.99]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 gap-3">
          {/* User Avatar */}
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={issue.user.avatar_url} alt={issue.user.login} />
            <AvatarFallback>
              {issue.user.login.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Issue Content */}
          <div className="min-w-0 flex-1 space-y-2">
            {/* Title */}
            <div className="flex items-center gap-2">
              <IssueDetailModal issue={issue}>
                <button
                  onClick={handleView}
                  className="line-clamp-2 min-w-0 text-left text-lg font-semibold break-all hover:underline"
                >
                  {issue.title}
                </button>
              </IssueDetailModal>
              <a
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Repository and metadata */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <a
                href={`https://github.com/${repoPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground inline-block max-w-[200px] truncate align-bottom font-medium hover:underline sm:max-w-[300px]"
              >
                {repoPath}
              </a>
              <span className="flex items-center gap-1">
                <span className="text-muted-foreground">by</span>
                <a
                  href={`https://github.com/${issue.user.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                >
                  {issue.user.login}
                </a>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(issue.updated_at), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Labels and language badge */}
            <div className="flex flex-wrap gap-2">
              {repository?.language && (
                <Badge variant="secondary" className="text-xs">
                  {repository.language}
                </Badge>
              )}
              {issue.labels.map((label) => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  className="text-xs font-normal"
                  style={{
                    backgroundColor: `#${label.color}20`,
                    color: `#${label.color}`,
                    borderColor: `#${label.color}40`,
                  }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Stats and Pick button */}
        <div className="flex w-full flex-row items-center justify-between gap-2 sm:w-auto sm:flex-col sm:items-end">
          {/* Stats */}
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            {repository && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {repository.stargazers_count.toLocaleString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {issue.comments}
            </span>
          </div>

          {/* Pick button */}
          <Button
            variant={picked ? 'secondary' : 'outline'}
            size="sm"
            onClick={handlePickToggle}
            className={
              picked
                ? 'border-yellow-200 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 dark:border-yellow-900'
                : ''
            }
          >
            <Bookmark
              className={`mr-1 h-4 w-4 ${picked ? 'fill-current' : ''}`}
            />
            {picked ? 'Picked' : 'Pick'}
          </Button>
        </div>
      </div>
    </div>
  );
}
