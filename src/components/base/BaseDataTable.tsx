/**
 * Base Data Table Component
 * Reusable data table component to reduce duplication across different table implementations
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  TableColumn,
  TableState,
  TableSorting,
  TableFiltering,
} from '@/lib/shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  Plus,
} from 'lucide-react';
import { TABLE_CONFIG } from '@/constants';

export interface BaseDataTableProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends React.HTMLAttributes<HTMLDivElement> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string;

  // Table configuration
  title?: string;
  description?: string;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  selectable?: boolean;

  // Actions
  createButton?: {
    label: string;
    onClick: () => void;
  };
  bulkActions?: Array<{
    label: string;
    icon?: React.ComponentType;
    onClick: (selectedIds: string[]) => void;
    variant?: 'default' | 'destructive';
  }>;
  exportOptions?: Array<{
    label: string;
    format: string;
    onClick: (data: T[]) => void;
  }>;

  // State management
  state?: Partial<TableState>;
  onStateChange?: (state: Partial<TableState>) => void;

  // Pagination
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];

  // Styling
  stickyHeader?: boolean;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
}

// Define a type for the table row data
type TableRowData = Record<string, unknown> & { id: string };

export const BaseDataTable = <T extends TableRowData>({
  data,
  columns,
  loading = false,
  error,
  title,
  description,
  searchable = true,
  filterable = false,
  sortable = true,
  selectable = false,
  createButton,
  bulkActions = [],
  exportOptions = [],
  state = {},
  onStateChange,
  pagination = true,
  pageSize = TABLE_CONFIG.pagination.defaultPageSize,
  pageSizeOptions = [...TABLE_CONFIG.pagination.pageSizeOptions] as number[],
  stickyHeader = false,
  striped = false,
  bordered = false,
  compact = false,
  className = '',
  ...restProps
}: BaseDataTableProps<T>) => {
  // Internal state
  const [internalState, setInternalState] = React.useState<TableState>(() => ({
    pagination: {
      page: 0,
      pageSize,
      total: data.length,
      ...(state.pagination || {}),
    },
    sorting: (state.sorting || []) as TableSorting[],
    filtering: (state.filtering || []) as TableFiltering[],
    selection: (state.selection || []) as string[],
  }));

  const [searchQuery, setSearchQuery] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);

  // Update internal state when external state changes
  React.useEffect(() => {
    setInternalState((prev: TableState) => ({ ...prev, ...state }));
  }, [state]);

  // Notify parent of state changes
  const updateState = React.useCallback(
    (newState: Partial<TableState>) => {
      const updatedState = { ...internalState, ...newState };
      setInternalState(updatedState);
      onStateChange?.(updatedState);
    },
    [internalState, onStateChange]
  );

  // Filter and sort data
  const processedData = React.useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(item =>
        columns.some(column => {
          if (column.accessorKey) {
            const value = item[column.accessorKey as keyof T];
            return String(value).toLowerCase().includes(searchLower);
          }
          return false;
        })
      );
    }

    // Apply filters
    internalState.filtering.forEach((filter: TableFiltering) => {
      result = result.filter(item => {
        const value = item[filter.column];
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value)
              .toLowerCase()
              .includes(String(filter.value).toLowerCase());
          case 'startsWith':
            return String(value)
              .toLowerCase()
              .startsWith(String(filter.value).toLowerCase());
          case 'endsWith':
            return String(value)
              .toLowerCase()
              .endsWith(String(filter.value).toLowerCase());
          case 'gt':
            return Number(value) > Number(filter.value);
          case 'lt':
            return Number(value) < Number(filter.value);
          default:
            return true;
        }
      });
    });

    // Apply sorting
    if (internalState.sorting.length > 0) {
      result.sort((a, b) => {
        for (const sort of internalState.sorting) {
          const columnKey = sort.column as keyof T;
          const aValue = a[columnKey];
          const bValue = b[columnKey];

          if (
            aValue === undefined ||
            bValue === undefined ||
            aValue === null ||
            bValue === null
          )
            return 0;
          if (aValue! < bValue!) return sort.direction === 'asc' ? -1 : 1;
          if (aValue! > bValue!) return sort.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [
    data,
    columns,
    searchQuery,
    internalState.filtering,
    internalState.sorting,
  ]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return processedData;

    const { page, pageSize } = internalState.pagination;
    const start = page * pageSize;
    const end = start + pageSize;

    return processedData.slice(start, end);
  }, [processedData, pagination, internalState.pagination]);

  // Update total count
  React.useEffect(() => {
    updateState({
      pagination: {
        ...internalState.pagination,
        total: processedData.length,
      },
    });
  }, [processedData.length]);

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (!sortable) return;

    const currentSorting = internalState.sorting || [];
    const newSorting: TableSorting[] = [];
    let sortFound = false;

    // First, remove any existing sort for this column
    for (const sort of currentSorting) {
      if (sort.column !== columnId) {
        newSorting.push(sort);
      } else {
        sortFound = true;
        // Toggle direction if this column was already sorted
        if (sort.direction === 'asc') {
          newSorting.push({ column: columnId, direction: 'desc' });
        }
        // If it was 'desc', we don't add it back (removes the sort)
      }
    }

    // If the column wasn't found, add it with 'asc' direction
    if (!sortFound) {
      newSorting.push({ column: columnId, direction: 'asc' });
    }

    updateState({ sorting: newSorting });
  };

  // Handle selection
  const handleSelectAll = () => {
    if (!selectable) return;

    const allIds = paginatedData.map(item => item.id);
    const isAllSelected = allIds.every(id =>
      internalState.selection.includes(id)
    );

    updateState({
      selection: isAllSelected ? [] : [...internalState.selection, ...allIds],
    });
  };

  const handleSelectItem = (id: string) => {
    if (!selectable) return;

    const newSelection = internalState.selection.includes(id)
      ? internalState.selection.filter(
          (selectedId: string) => selectedId !== id
        )
      : [...internalState.selection, id];

    updateState({ selection: newSelection });
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    updateState({
      pagination: { ...internalState.pagination, page: newPage },
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    updateState({
      pagination: {
        ...internalState.pagination,
        pageSize: newPageSize,
        page: 0,
      },
    });
  };

  const totalPages = Math.ceil(
    internalState.pagination.total / internalState.pagination.pageSize
  );
  const currentPage = internalState.pagination.page;

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  const tableClassName = className;

  // Extract table props to avoid passing them to the DOM element
  const tableProps = {
    ...restProps,
    className: cn('space-y-4', tableClassName),
    'data-component': 'base-data-table',
  };

  return (
    <div {...tableProps}>
      {/* Header */}
      {(title ||
        description ||
        createButton ||
        searchable ||
        filterable ||
        exportOptions.length > 0) && (
        <div className="flex flex-col gap-4">
          {(title || description) && (
            <div>
              {title && <h2 className="text-xl font-semibold">{title}</h2>}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}

          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div className="flex flex-1 gap-2">
              {searchable && (
                <div className="relative max-w-sm flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}

              {filterable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {exportOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => option.onClick(processedData)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {option.label}
                </Button>
              ))}

              {createButton && (
                <Button onClick={createButton.onClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  {createButton.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectable &&
        internalState.selection.length > 0 &&
        bulkActions.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
            <span className="text-sm text-muted-foreground">
              {internalState.selection.length} selected
            </span>
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                size="sm"
                onClick={() => action.onClick(internalState.selection)}
              >
                {action.icon &&
                  React.createElement(action.icon as any, {
                    className: 'h-4 w-4 mr-2',
                  })}
                {action.label}
              </Button>
            ))}
          </div>
        )}

      {/* Table */}
      <div className={cn('rounded-md border', bordered && 'border-2')}>
        <Table>
          <TableHeader
            className={cn(stickyHeader && 'sticky top-0 z-10 bg-background')}
          >
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every(item =>
                        internalState.selection.includes(item.id)
                      )
                    }
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </TableHead>
              )}
              {columns.map(column => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.sortable &&
                      sortable &&
                      'cursor-pointer hover:bg-muted/50',
                    compact && 'py-2'
                  )}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortable && (
                      <div className="flex flex-col">
                        <div className="h-2 w-2 rotate-45 transform border-b border-l border-muted-foreground" />
                        <div className="h-2 w-2 rotate-45 transform border-r border-t border-muted-foreground" />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-8 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-8 text-center"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={row.id || rowIndex}
                  className={cn(
                    striped && rowIndex % 2 === 1 && 'bg-muted/50',
                    selectable &&
                      internalState.selection.includes(row.id) &&
                      'bg-primary/10'
                  )}
                >
                  {selectable && (
                    <TableCell className={cn(compact && 'py-2')}>
                      <input
                        type="checkbox"
                        checked={internalState.selection.includes(row.id)}
                        onChange={() => handleSelectItem(row.id)}
                        className="rounded"
                      />
                    </TableCell>
                  )}
                  {columns.map(column => (
                    <TableCell
                      key={column.id}
                      className={cn(compact && 'py-2')}
                    >
                      {column.cell
                        ? String(
                            column.cell(
                              column.accessorKey
                                ? row[column.accessorKey]
                                : row,
                              row
                            ) || ''
                          )
                        : column.accessorKey
                          ? String(row[column.accessorKey] || '')
                          : ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && !loading && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {currentPage * internalState.pagination.pageSize + 1} to{' '}
              {Math.min(
                (currentPage + 1) * internalState.pagination.pageSize,
                internalState.pagination.total
              )}{' '}
              of {internalState.pagination.total} results
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={String(internalState.pagination.pageSize)}
              onValueChange={value => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="px-3 text-sm">
                Page {currentPage + 1} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
