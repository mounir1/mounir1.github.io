import * as React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SearchFieldProps extends React.ComponentProps<'div'> {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  variant?: 'default' | 'glass' | 'modern';
  size?: 'sm' | 'md' | 'lg';
  showClearButton?: boolean;
  showFilterButton?: boolean;
  filterOptions?: Array<{ label: string; value: string }>;
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  loading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  debounceMs?: number;
}

export const SearchField = React.forwardRef<HTMLDivElement, SearchFieldProps>(
  (
    {
      className,
      value = '',
      onValueChange,
      placeholder = 'Search...',
      variant = 'modern',
      size = 'md',
      showClearButton = true,
      showFilterButton = false,
      filterOptions = [],
      selectedFilter,
      onFilterChange,
      loading = false,
      disabled = false,
      autoFocus = false,
      debounceMs = 300,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value);
    const [debouncedValue, setDebouncedValue] = React.useState(value);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const debounceTimerRef = React.useRef<NodeJS.Timeout>();

    // Sync external value with internal state
    React.useEffect(() => {
      setInternalValue(value);
      setDebouncedValue(value);
    }, [value]);

    // Debounce the search value
    React.useEffect(() => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        setDebouncedValue(internalValue);
        onValueChange?.(internalValue);
      }, debounceMs);

      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, [internalValue, onValueChange, debounceMs]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
    };

    const handleClear = () => {
      setInternalValue('');
      onValueChange?.('');
      inputRef.current?.focus();
    };

    const sizeClasses = {
      sm: 'h-8 text-xs',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };

    const iconSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    const variantClasses = {
      default:
        'border border-input bg-background hover:border-primary/50 focus-within:border-primary',
      glass:
        'border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/70 hover:border-primary/50 focus-within:bg-background/80 focus-within:border-primary shadow-sm',
      modern:
        'border-2 border-border bg-background/80 hover:border-primary/60 focus-within:border-primary focus-within:shadow-lg hover:shadow-md backdrop-blur-sm dark:bg-background/30 dark:border-border/30 dark:hover:bg-background/40 dark:focus-within:bg-background/50',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        {/* Main search input container */}
        <div
          className={cn(
            'relative flex items-center rounded-md transition-all duration-200',
            sizeClasses[size],
            variantClasses[variant],
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {/* Search icon */}
          <Search
            className={cn(
              'absolute left-3 z-10 text-muted-foreground',
              iconSizeClasses[size],
              loading && 'animate-pulse'
            )}
          />

          {/* Input field */}
          <Input
            ref={inputRef}
            value={internalValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            variant={variant}
            className={cn(
              'border-0 bg-transparent pl-10 pr-10 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
              sizeClasses[size]
            )}
          />

          {/* Clear button */}
          {showClearButton && internalValue && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className={cn(
                'absolute right-2 h-auto rounded-sm p-1 transition-colors hover:bg-accent/50',
                size === 'sm' && 'right-1'
              )}
              tabIndex={-1}
            >
              <X
                className={cn(
                  'text-muted-foreground hover:text-foreground',
                  iconSizeClasses[size]
                )}
              />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Filter dropdown */}
        {showFilterButton && filterOptions.length > 0 && (
          <Select
            value={selectedFilter}
            onValueChange={onFilterChange}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                'w-auto min-w-[120px] gap-2',
                sizeClasses[size],
                variantClasses[variant]
              )}
            >
              <Filter className={iconSizeClasses[size]} />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="dropdown-modern dark:bg-background/90">
              <SelectItem value="" className="dropdown-item">
                All
              </SelectItem>
              {filterOptions.map(option => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="dropdown-item"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }
);

SearchField.displayName = 'SearchField';

export default SearchField;
