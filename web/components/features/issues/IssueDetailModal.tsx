'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Bookmark } from 'lucide-react';
import { usePickStore } from '@/lib/store/usePickStore';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IssueSnapshot } from '@/lib/github/issueSnapshot';

interface IssueDetailModalProps {
  issue: IssueSnapshot;
  children: React.ReactNode;
}

export function IssueDetailModal({ issue, children }: IssueDetailModalProps) {
  const { addPick, removePick, isPicked } = usePickStore();
  const picked = isPicked(issue.id);

  const handlePickToggle = () => {
    if (picked) {
      removePick(issue.id);
    } else {
      addPick(issue);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="mr-8 text-xl leading-normal">
            {issue.title}
          </DialogTitle>
          <DialogDescription className="mt-2 flex items-center gap-2">
            <span>{issue.user.login}</span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(issue.created_at), {
                addSuffix: true,
              })}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 flex flex-wrap gap-2">
          {issue.labels.map((label) => (
            <Badge
              key={label.id}
              variant="secondary"
              className="font-normal"
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

        <div className="text-foreground mt-4 max-w-none text-sm">
          {issue.body ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => (
                  <h1 className="mt-6 mb-4 text-2xl font-bold" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="mt-5 mb-3 border-b pb-1 text-xl font-semibold"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3 className="mt-4 mb-2 text-lg font-semibold" {...props} />
                ),
                p: ({ ...props }) => (
                  <p
                    className="mb-4 leading-relaxed wrap-break-word"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul className="mb-4 list-disc space-y-1 pl-6" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="mb-4 list-decimal space-y-1 pl-6" {...props} />
                ),
                li: ({ ...props }) => <li className="pl-1" {...props} />,
                a: ({ ...props }) => (
                  <a
                    className="text-primary hover:text-primary/80 break-all underline underline-offset-4"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-muted text-muted-foreground my-4 border-l-4 pl-4 italic"
                    {...props}
                  />
                ),
                code: ({
                  className,
                  children,
                  ...props
                }: React.ComponentPropsWithoutRef<'code'>) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !String(children).includes('\n');
                  return isInline ? (
                    <code
                      className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm break-all"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-muted my-4 overflow-x-auto rounded-lg p-4 font-mono text-sm">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
                img: ({ ...props }) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="my-4 h-auto max-w-full rounded-lg border"
                    alt={props.alt || ''}
                    {...props}
                  />
                ),
                table: ({ ...props }) => (
                  <div className="my-4 w-full overflow-y-auto">
                    <table
                      className="w-full border-collapse text-sm"
                      {...props}
                    />
                  </div>
                ),
                th: ({ ...props }) => (
                  <th
                    className="bg-muted border px-4 py-2 text-left font-bold"
                    {...props}
                  />
                ),
                td: ({ ...props }) => (
                  <td className="border px-4 py-2" {...props} />
                ),
              }}
            >
              {issue.body}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">
              No description provided.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant={picked ? 'secondary' : 'outline'}
            onClick={handlePickToggle}
            className={
              picked
                ? 'border-orange-200 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:border-orange-900'
                : ''
            }
          >
            <Bookmark
              className={`mr-2 h-4 w-4 ${picked ? 'fill-current' : ''}`}
            />
            {picked ? 'Picked' : 'Pick'}
          </Button>
          <Button asChild>
            <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
              Open on GitHub
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
