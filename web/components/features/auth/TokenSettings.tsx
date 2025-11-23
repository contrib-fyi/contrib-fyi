'use client';

import { useState } from 'react';
import { Key, Eye, EyeOff, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTokenStore } from '@/lib/store/useTokenStore';
import { Badge } from '@/components/ui/badge';

export function TokenSettings() {
  const { token, setToken, clearToken } = useTokenStore();
  const [inputValue, setInputValue] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setInputValue(token ?? '');
    } else {
      setInputValue('');
      setShowToken(false);
    }
  };

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setToken(trimmed);
    setInputValue('');
    setOpen(false);
  };

  const handleClear = () => {
    clearToken();
    setInputValue('');
    setOpen(false);
  };

  const isTokenSet = !!token;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="GitHub Token Settings"
        >
          <Key className="h-5 w-5" />
          {isTokenSet && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">GitHub Token</h4>
              {isTokenSet && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Add your Personal Access Token for higher rate limits and
              repository info.
            </p>
            <p className="text-muted-foreground text-xs italic">
              🔒 Stored securely in this browser session only and never sent to
              our servers.
            </p>
          </div>

          {/* Feature Unlock Callout */}
          <div className="rounded-lg border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-3">
            <div className="flex items-start gap-2">
              <div className="shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3.5 w-3.5 text-white"
                >
                  <path d="M9.153 5.408C10.42 3.136 11.053 2 12 2c.947 0 1.58 1.136 2.847 3.408l.328.588c.36.646.54.969.82 1.182.28.213.63.292 1.33.45l.636.144c2.46.557 3.689.835 3.982 1.776.292.94-.546 1.921-2.223 3.882l-.434.507c-.476.557-.715.836-.822 1.18-.107.345-.071.717.001 1.46l.066.677c.253 2.617.38 3.925-.386 4.506-.766.582-1.918.051-4.22-1.009l-.597-.274c-.654-.302-.981-.452-1.328-.452-.347 0-.674.15-1.329.452l-.595.274c-2.303 1.06-3.455 1.59-4.22 1.01-.767-.582-.64-1.89-.387-4.507l.066-.676c.072-.744.108-1.116 0-1.46-.106-.345-.345-.624-.821-1.18l-.434-.508c-1.677-1.96-2.515-2.941-2.223-3.882.293-.941 1.523-1.22 3.983-1.776l.636-.144c.699-.158 1.048-.237 1.329-.45.28-.213.46-.536.82-1.182l.328-.588z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-sm font-semibold text-transparent dark:from-blue-400 dark:to-purple-400">
                  Additional Features with Token
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  • Repository star counts <br /> • Filter by minimum stars <br /> • Linked pull request counts
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <div className="relative">
              <Input
                id="token"
                type={showToken ? 'text' : 'password'}
                placeholder={
                  isTokenSet ? '••••••••••••••••' : 'ghp_xxxxxxxxxxxx'
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-full px-3"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1" size="sm">
              Save
            </Button>
            {isTokenSet && (
              <Button
                onClick={handleClear}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Clear
              </Button>
            )}
          </div>

          <div className="border-t pt-3">
            <a
              href="https://github.com/settings/tokens/new?description=Contrib.fyi&scopes=public_repo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
            >
              <span>Need a token? Create one on GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
