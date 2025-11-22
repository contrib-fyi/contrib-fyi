'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  // Internal state to track selections while popover is open
  const [internalSelected, setInternalSelected] =
    React.useState<string[]>(selected);

  // Sync internal state when external selected changes
  React.useEffect(() => {
    setInternalSelected(selected);
  }, [selected]);

  // Handle popover close - commit changes to parent
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (
      !isOpen &&
      JSON.stringify(internalSelected) !== JSON.stringify(selected)
    ) {
      // Only call onChange if selections actually changed
      onChange(internalSelected);
    }
  };

  const handleUnselect = (item: string) => {
    const newSelected = internalSelected.filter((s) => s !== item);
    setInternalSelected(newSelected);
    // Immediately update parent when removing a badge
    onChange(newSelected);
  };

  const handleSelect = (value: string) => {
    const newSelected = internalSelected.includes(value)
      ? internalSelected.filter((item) => item !== value)
      : [...internalSelected, value];
    setInternalSelected(newSelected);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-auto min-h-10 w-full justify-between',
            !internalSelected.length && 'text-muted-foreground',
            className
          )}
        >
          <div className="flex flex-wrap gap-1">
            {internalSelected.length > 0 ? (
              internalSelected.map((item) => {
                const option = options.find((opt) => opt.value === item);
                return (
                  <Badge variant="secondary" key={item} className="mr-1 mb-1">
                    {option?.label || item}
                    <span
                      role="button"
                      tabIndex={0}
                      className="ring-offset-background focus:ring-ring ml-1 cursor-pointer rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleUnselect(item);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnselect(item);
                      }}
                    >
                      <X className="text-muted-foreground hover:text-foreground h-3 w-3" />
                    </span>
                  </Badge>
                );
              })
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      internalSelected.includes(option.value)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
