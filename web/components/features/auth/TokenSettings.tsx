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

  const handleSave = () => {
    if (inputValue.trim()) {
      setToken(inputValue.trim());
      setInputValue('');
      setOpen(false);
    }
  };

  const handleClear = () => {
    clearToken();
    setInputValue('');
    setOpen(false);
  };

  const isTokenSet = !!token;

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
              🔒 Your token is stored locally in your browser only and never
              sent to our servers.
            </p>
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
