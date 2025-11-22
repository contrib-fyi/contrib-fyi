'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { X, Search } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function FilterBar() {
  const {
    language: appliedLanguage,
    label: appliedLabel,
    sort: appliedSort,
    searchQuery: appliedSearchQuery,
    setLanguage,
    setLabel,
    setSort,
    setSearchQuery,
    resetFilters,
  } = useFilterStore();

  // Local state for pending filter changes
  const [localLanguage, setLocalLanguage] = useState<string[]>(appliedLanguage);
  const [localLabel, setLocalLabel] = useState<string[]>(appliedLabel);
  const [localSort, setLocalSort] = useState<
    'created' | 'updated' | 'comments'
  >(appliedSort);
  const [localSearchQuery, setLocalSearchQuery] = useState(appliedSearchQuery);

  // Sync local state when applied filters change (e.g., from reset)
  useState(() => {
    setLocalLanguage(appliedLanguage);
    setLocalLabel(appliedLabel);
    setLocalSort(appliedSort);
    setLocalSearchQuery(appliedSearchQuery);
  });

  const handleSearch = () => {
    setLanguage(localLanguage);
    setLabel(localLabel);
    setSort(localSort);
    setSearchQuery(localSearchQuery);
  };

  const handleReset = () => {
    resetFilters();
    setLocalLanguage([]);
    setLocalLabel(['help wanted']);
    setLocalSort('created');
    setLocalSearchQuery('');
  };

  // Handle Enter key in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4 border-b p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          <Input
            placeholder="Search issues..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full md:w-[300px]"
          />
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full md:w-auto">
                    <MultiSelect
                      options={[
                        { label: 'C', value: 'c' },
                        { label: 'C++', value: 'c++' },
                        { label: 'C#', value: 'c#' },
                        { label: 'Clojure', value: 'clojure' },
                        { label: 'CMake', value: 'cmake' },
                        { label: 'CSS', value: 'css' },
                        { label: 'Dart', value: 'dart' },
                        { label: 'Dockerfile', value: 'dockerfile' },
                        { label: 'Elixir', value: 'elixir' },
                        { label: 'Emacs Lisp', value: 'emacs lisp' },
                        { label: 'Erlang', value: 'erlang' },
                        { label: 'F#', value: 'f#' },
                        { label: 'Go', value: 'go' },
                        { label: 'Groovy', value: 'groovy' },
                        { label: 'Haskell', value: 'haskell' },
                        { label: 'HCL', value: 'hcl' },
                        { label: 'HTML', value: 'html' },
                        { label: 'Java', value: 'java' },
                        { label: 'JavaScript', value: 'javascript' },
                        { label: 'Jinja', value: 'jinja' },
                        { label: 'JSON', value: 'json' },
                        { label: 'Kotlin', value: 'kotlin' },
                        { label: 'Lua', value: 'lua' },
                        { label: 'Makefile', value: 'makefile' },
                        { label: 'Nix', value: 'nix' },
                        { label: 'Objective-C', value: 'objective-c' },
                        { label: 'OCaml', value: 'ocaml' },
                        { label: 'Perl', value: 'perl' },
                        { label: 'PHP', value: 'php' },
                        { label: 'PowerShell', value: 'powershell' },
                        { label: 'Python', value: 'python' },
                        { label: 'R', value: 'r' },
                        { label: 'Ruby', value: 'ruby' },
                        { label: 'Rust', value: 'rust' },
                        { label: 'Scala', value: 'scala' },
                        { label: 'SCSS', value: 'scss' },
                        { label: 'Shell', value: 'shell' },
                        { label: 'SQL', value: 'sql' },
                        { label: 'Svelte', value: 'svelte' },
                        { label: 'Swift', value: 'swift' },
                        { label: 'TypeScript', value: 'typescript' },
                        { label: 'Vim Script', value: 'vim script' },
                        { label: 'Vue', value: 'vue' },
                        { label: 'YAML', value: 'yaml' },
                        { label: 'Zig', value: 'zig' },
                      ]}
                      selected={localLanguage}
                      onChange={setLocalLanguage}
                      placeholder="Language"
                      className="w-full md:w-[180px]"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by programming language (OR logic)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full md:w-auto">
                    <MultiSelect
                      options={[
                        { label: 'help wanted', value: 'help wanted' },
                        {
                          label: 'good first issue',
                          value: 'good first issue',
                        },
                        { label: 'documentation', value: 'documentation' },
                        { label: 'enhancement', value: 'enhancement' },
                        { label: 'bug', value: 'bug' },
                      ]}
                      selected={localLabel}
                      onChange={setLocalLabel}
                      placeholder="Label"
                      className="w-full md:w-[180px]"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by issue labels (OR logic)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-full md:w-auto">
                    <Select
                      value={localSort}
                      onValueChange={(val) =>
                        setLocalSort(val as 'created' | 'updated' | 'comments')
                      }
                    >
                      <SelectTrigger className="w-full md:w-[140px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created">Newest</SelectItem>
                        <SelectItem value="updated">
                          Recently Updated
                        </SelectItem>
                        <SelectItem value="comments">Most Commented</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sort search results</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-1 md:flex-initial">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button
            variant="ghost"
            onClick={handleReset}
            className="flex-1 md:flex-initial"
          >
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
