'use client';

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from 'react';
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
import { useTokenStore } from '@/lib/store/useTokenStore';
import { X, Search, SlidersHorizontal } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  LANGUAGE_OPTIONS,
  LABEL_OPTIONS,
  SORT_OPTIONS,
} from '@/lib/constants/filters';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';

export function FilterBar() {
  const {
    language: appliedLanguage,
    label: appliedLabel,
    sort: appliedSort,
    searchQuery: appliedSearchQuery,
    onlyNoComments: appliedOnlyNoComments,
    onlyNoLinkedPRs: appliedOnlyNoLinkedPRs,
    minStars: appliedMinStars,
    setLanguage,
    setLabel,
    setSort,
    setSearchQuery,
    setOnlyNoComments,
    setOnlyNoLinkedPRs,
    setMinStars,
    resetFilters,
  } = useFilterStore();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const token = useTokenStore((state) => state.token);

  // Local state for pending filter changes
  const [localLanguage, setLocalLanguage] = useState<string[]>(appliedLanguage);
  const [localLabel, setLocalLabel] = useState<string[]>(appliedLabel);
  const [localSort, setLocalSort] = useState<
    'created' | 'updated' | 'comments'
  >(appliedSort);
  const [localSearchQuery, setLocalSearchQuery] = useState(appliedSearchQuery);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [pendingOnlyNoComments, setPendingOnlyNoComments] = useState(
    appliedOnlyNoComments
  );
  const [pendingOnlyNoLinkedPRs, setPendingOnlyNoLinkedPRs] = useState(
    appliedOnlyNoLinkedPRs
  );
  const [pendingMinStars, setPendingMinStars] = useState<number | ''>(
    appliedMinStars ?? ''
  );

  // Sync local state when applied filters change (e.g., from reset)
  useEffect(() => {
    const unsubscribe = useFilterStore.subscribe((state) => {
      setLocalLanguage(state.language);
      setLocalLabel(state.label);
      setLocalSort(state.sort);
      setLocalSearchQuery(state.searchQuery);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Clear restricted filters when token is removed
  useEffect(() => {
    if (!token && appliedMinStars !== null) {
      setMinStars(null);
    }
  }, [token, appliedMinStars, setMinStars]);

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
    setPendingMinStars('');
    setPendingOnlyNoLinkedPRs(false);
  };

  // Handle Enter key in search input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAdvancedApply = () => {
    setLanguage(localLanguage);
    setLabel(localLabel);
    setSort(localSort);
    setSearchQuery(localSearchQuery);
    setOnlyNoComments(pendingOnlyNoComments);
    setOnlyNoLinkedPRs(pendingOnlyNoLinkedPRs);
    setMinStars(pendingMinStars === '' ? null : Number(pendingMinStars));
    setAdvancedOpen(false);
  };

  const handleAdvancedOpenChange = (open: boolean) => {
    setAdvancedOpen(open);
    if (open) {
      setPendingOnlyNoComments(appliedOnlyNoComments);
      setPendingOnlyNoLinkedPRs(appliedOnlyNoLinkedPRs);
      setPendingMinStars(appliedMinStars ?? '');
    }
  };

  const appliedFilterChips = [
    ...appliedLanguage.map((lang) => ({
      key: `language-${lang}`,
      label: `Language: ${lang}`,
      onRemove: () =>
        setLanguage(appliedLanguage.filter((value) => value !== lang)),
    })),
    ...appliedLabel.map((lbl) => ({
      key: `label-${lbl}`,
      label: `Label: ${lbl}`,
      onRemove: () => setLabel(appliedLabel.filter((value) => value !== lbl)),
    })),
    ...(appliedSearchQuery
      ? [
          {
            key: 'search',
            label: `Search: "${appliedSearchQuery}"`,
            onRemove: () => {
              setSearchQuery('');
              setLocalSearchQuery('');
            },
          },
        ]
      : []),
    ...(appliedOnlyNoComments
      ? [
          {
            key: 'no-comments',
            label: 'No comments',
            onRemove: () => setOnlyNoComments(false),
          },
        ]
      : []),
    ...(appliedOnlyNoLinkedPRs
      ? [
          {
            key: 'no-linked-prs',
            label: 'No linked PRs',
            onRemove: () => setOnlyNoLinkedPRs(false),
          },
        ]
      : []),
    ...(appliedMinStars
      ? [
          {
            key: 'min-stars',
            label: `Min Stars: ${appliedMinStars}`,
            onRemove: () => setMinStars(null),
          },
        ]
      : []),
  ];

  const hasAppliedFilters = appliedFilterChips.length > 0;

  if (!mounted) {
    return <div className="min-h-[140px] space-y-4 border-b p-4" />;
  }

  return (
    <div className="space-y-4 border-b p-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search issues..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full md:max-w-lg"
            />
            {/* Mobile Filter Button */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full overflow-y-auto sm:max-w-md"
                >
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                      Refine your search results.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div className="space-y-4">
                      {/* ... (existing filters) ... */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Language</label>
                        <MultiSelect
                          options={[...LANGUAGE_OPTIONS]}
                          selected={localLanguage}
                          onChange={setLocalLanguage}
                          placeholder="Select languages"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Label</label>
                        <MultiSelect
                          options={[...LABEL_OPTIONS]}
                          selected={localLabel}
                          onChange={setLocalLabel}
                          placeholder="Select labels"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sort by</label>
                        <Select
                          value={localSort}
                          onValueChange={(val) =>
                            setLocalSort(
                              val as 'created' | 'updated' | 'comments'
                            )
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <label className="text-sm font-medium">
                              No comments
                            </label>
                            <p className="text-muted-foreground text-xs">
                              Only show issues with 0 comments
                            </p>
                          </div>
                          <Switch
                            checked={pendingOnlyNoComments}
                            onCheckedChange={setPendingOnlyNoComments}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <label className="text-sm font-medium">
                              No linked PRs
                            </label>
                            <p className="text-muted-foreground text-xs">
                              Only show issues without linked pull requests
                            </p>
                          </div>
                          <Switch
                            checked={pendingOnlyNoLinkedPRs}
                            onCheckedChange={setPendingOnlyNoLinkedPRs}
                          />
                        </div>
                      </div>
                      {token && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Minimum Stars
                          </label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="e.g. 100"
                            value={pendingMinStars}
                            onChange={(e) =>
                              setPendingMinStars(
                                e.target.value === ''
                                  ? ''
                                  : Number(e.target.value)
                              )
                            }
                          />
                          <p className="text-muted-foreground text-xs">
                            Only show issues from repositories with at least
                            this many stars.
                          </p>
                        </div>
                      )}
                    </div>
                    <SheetFooter>
                      <SheetClose asChild>
                        <Button
                          onClick={() => {
                            handleAdvancedApply(); // Apply advanced filters
                            handleSearch(); // Apply main filters
                          }}
                          className="w-full"
                        >
                          Show results
                        </Button>
                      </SheetClose>
                    </SheetFooter>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop Filters */}
          <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
            {/* ... (existing tooltips) ... */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
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
                      className="w-full"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by programming language (OR logic)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
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
                      className="w-full"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by issue labels (OR logic)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Select
                      value={localSort}
                      onValueChange={(val) =>
                        setLocalSort(val as 'created' | 'updated' | 'comments')
                      }
                    >
                      <SelectTrigger className="w-full">
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

        {/* Desktop Buttons */}
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <Dialog open={advancedOpen} onOpenChange={handleAdvancedOpenChange}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant={
                  appliedOnlyNoComments ||
                  appliedOnlyNoLinkedPRs ||
                  appliedMinStars
                    ? 'secondary'
                    : 'outline'
                }
                size="sm"
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                More filters
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Advanced filters</DialogTitle>
                <DialogDescription>
                  Narrow results with extra criteria like comments and PRs.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Availability</p>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1 pr-4">
                        <p className="text-sm font-medium">
                          Only issues with zero comments
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Show issues that have not received any comments yet.
                        </p>
                      </div>
                      <Switch
                        id="advanced-no-comments"
                        checked={pendingOnlyNoComments}
                        onCheckedChange={setPendingOnlyNoComments}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1 pr-4">
                        <p className="text-sm font-medium">
                          Only issues without linked PRs
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Only issues that don&apos;t have any attached pull
                          requests.
                        </p>
                      </div>
                      <Switch
                        id="advanced-no-linked-prs"
                        checked={pendingOnlyNoLinkedPRs}
                        onCheckedChange={setPendingOnlyNoLinkedPRs}
                      />
                    </div>
                  </div>
                </div>
                {token && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Stars</p>
                    <div className="space-y-2 rounded-lg border p-3">
                      <label className="text-sm font-medium">
                        Minimum Stars
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="e.g. 100"
                        value={pendingMinStars}
                        onChange={(e) =>
                          setPendingMinStars(
                            e.target.value === '' ? '' : Number(e.target.value)
                          )
                        }
                      />
                      <p className="text-muted-foreground text-xs">
                        Only show issues from repositories with at least this
                        many stars.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAdvancedOpen(false)}
                >
                  Close
                </Button>
                <Button type="button" onClick={handleAdvancedApply}>
                  Apply filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button type="button" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button type="button" variant="ghost" onClick={handleReset}>
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>
      {hasAppliedFilters && (
        <div className="bg-muted/40 flex flex-wrap items-center gap-2 rounded-md border p-3">
          {appliedFilterChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="text-foreground flex items-center gap-2 rounded-full px-3 py-1 text-sm"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Remove ${chip.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
