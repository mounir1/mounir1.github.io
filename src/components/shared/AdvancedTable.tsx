import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  EyeOff,
  RefreshCw,
  X,
} from 'lucide-react';
// import { VirtualScroll } from "@/components/shared/VirtualScroll"; // Commented out since VirtualScroll doesn't exist
import { LoadingState } from '@/components/shared/BaseComponents';
import { EmptyStates } from '@/components/shared/EmptyStates';

// Column definition types
export interface TableColumn<T = any> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessor?: (row: T) => any;
  cell?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number' | 'boolean';
  filterOptions?: Array<{ label: string; value: any }>;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sticky?: 'left' | 'right';
  hidden?: boolean;
  exportable?: boolean;
}

// Sort configuration
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Filter configuration
export interface FilterConfig {
  [key: string]: any;
}

// Pagination configuration
export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

// Export options
export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filename?: string;
  includeHeaders?: boolean;
  selectedOnly?: boolean;
  visibleColumnsOnly?: boolean;
}

// Table props
export interface AdvancedTableProps<T = any> {
  // Data
  data: T[];
  columns: TableColumn<T>[];

  // Loading and empty states
  loading?: boolean;
  error?: string;
  emptyMessage?: string;

  // Selection
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selectedRows: Set<string>) => void;
  getRowId?: (row: T, index: number) => string;

  // Sorting
  sortable?: boolean;
  defaultSort?: SortConfig;
  onSortChange?: (sort: SortConfig | null) => void;

  // Filtering
  filterable?: boolean;
  globalFilter?: string;
  columnFilters?: FilterConfig;
  onFilterChange?: (filters: FilterConfig) => void;
  onGlobalFilterChange?: (filter: string) => void;

  // Pagination
  pagination?: boolean;
  paginationConfig?: PaginationConfig;
  onPaginationChange?: (config: PaginationConfig) => void;
  pageSizeOptions?: number[];

  // Export
  exportable?: boolean;
  onExport?: (options: ExportOptions) => void;

  // Virtual scrolling
  virtualScrolling?: boolean;
  estimatedRowHeight?: number;
  containerHeight?: number;

  // Customization
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;

  // Actions
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T, index: number) => void;
    visible?: (row: T, index: number) => boolean;
    variant?: 'default' | 'destructive' | 'ghost';
  }>;

  // Bulk actions
  bulkActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: T[]) => void;
    variant?: 'default' | 'destructive' | 'ghost';
  }>;
}

export const AdvancedTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error,
  emptyMessage = 'No data available',
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  getRowId = (row, index) => `row-${index}`,
  sortable = true,
  defaultSort,
  onSortChange,
  filterable = true,
  globalFilter = '',
  columnFilters = {},
  onFilterChange,
  onGlobalFilterChange,
  pagination = true,
  paginationConfig = { page: 1, pageSize: 10, total: 0 },
  onPaginationChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
  exportable = true,
  onExport,
  virtualScrolling = false,
  estimatedRowHeight = 50,
  containerHeight = 400,
  className = '',
  rowClassName,
  onRowClick,
  onRowDoubleClick,
  actions = [],
  bulkActions = [],
}: AdvancedTableProps<T>) => {
  // Internal state
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    defaultSort || null
  );
  const [internalFilters, setInternalFilters] =
    useState<FilterConfig>(columnFilters);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter(col => !col.hidden).map(col => col.id))
  );
  const [showFilters, setShowFilters] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  // Get visible columns
  const displayColumns = useMemo(() => {
    return columns.filter(col => visibleColumns.has(col.id));
  }, [columns, visibleColumns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const column = columns.find(col => col.id === sortConfig.key);
      if (!column) return 0;

      let aValue: any;
      let bValue: any;

      if (column.accessor) {
        aValue = column.accessor(a);
        bValue = column.accessor(b);
      } else if (column.accessorKey) {
        aValue = a[column.accessorKey];
        bValue = b[column.accessorKey];
      } else {
        return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig, columns]);

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = sortedData;

    // Apply global filter
    if (globalFilter.trim()) {
      filtered = filtered.filter(row => {
        return displayColumns.some(column => {
          let value: any;
          if (column.accessor) {
            value = column.accessor(row);
          } else if (column.accessorKey) {
            value = row[column.accessorKey];
          }

          return String(value || '')
            .toLowerCase()
            .includes(globalFilter.toLowerCase());
        });
      });
    }

    // Apply column filters
    Object.entries(internalFilters).forEach(([columnId, filterValue]) => {
      if (
        filterValue !== undefined &&
        filterValue !== '' &&
        filterValue !== null
      ) {
        const column = columns.find(col => col.id === columnId);
        if (!column) return;

        filtered = filtered.filter(row => {
          let value: any;
          if (column.accessor) {
            value = column.accessor(row);
          } else if (column.accessorKey) {
            value = row[column.accessorKey];
          }

          if (column.filterType === 'select') {
            return value === filterValue;
          } else if (column.filterType === 'boolean') {
            return Boolean(value) === Boolean(filterValue);
          } else if (column.filterType === 'number') {
            return Number(value) === Number(filterValue);
          } else {
            return String(value || '')
              .toLowerCase()
              .includes(String(filterValue).toLowerCase());
          }
        });
      }
    });

    return filtered;
  }, [sortedData, globalFilter, internalFilters, displayColumns, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;

    const startIndex = (paginationConfig.page - 1) * paginationConfig.pageSize;
    const endIndex = startIndex + paginationConfig.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination, paginationConfig]);

  // Update total count when filtered data changes
  React.useEffect(() => {
    if (pagination && onPaginationChange) {
      onPaginationChange({
        ...paginationConfig,
        total: filteredData.length,
      });
    }
  }, [filteredData.length, pagination, paginationConfig, onPaginationChange]);

  // Handle sorting
  const handleSort = useCallback(
    (columnId: string) => {
      const column = columns.find(col => col.id === columnId);
      if (!column?.sortable) return;

      const newSortConfig: SortConfig = {
        key: columnId,
        direction:
          sortConfig?.key === columnId && sortConfig.direction === 'asc'
            ? 'desc'
            : 'asc',
      };

      setSortConfig(newSortConfig);
      onSortChange?.(newSortConfig);
    },
    [columns, sortConfig, onSortChange]
  );

  // Handle filtering
  const handleFilterChange = useCallback(
    (columnId: string, value: any) => {
      const newFilters = { ...internalFilters, [columnId]: value };
      setInternalFilters(newFilters);
      onFilterChange?.(newFilters);
    },
    [internalFilters, onFilterChange]
  );

  // Handle selection
  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;

    const allIds = paginatedData.map((row, index) => getRowId(row, index));
    const isAllSelected = allIds.every(id => selectedRows.has(id));

    if (isAllSelected) {
      const newSelection = new Set(selectedRows);
      allIds.forEach(id => newSelection.delete(id));
      onSelectionChange(newSelection);
    } else {
      const newSelection = new Set([...selectedRows, ...allIds]);
      onSelectionChange(newSelection);
    }
  }, [paginatedData, selectedRows, onSelectionChange, getRowId]);

  const handleSelectRow = useCallback(
    (rowId: string) => {
      if (!onSelectionChange) return;

      const newSelection = new Set(selectedRows);
      if (newSelection.has(rowId)) {
        newSelection.delete(rowId);
      } else {
        newSelection.add(rowId);
      }
      onSelectionChange(newSelection);
    },
    [selectedRows, onSelectionChange]
  );

  // Handle export
  const handleExport = useCallback(
    (format: ExportOptions['format']) => {
      if (!onExport) return;

      onExport({
        format,
        filename: `table-export-${new Date().toISOString().split('T')[0]}`,
        includeHeaders: true,
        selectedOnly: selectedRows.size > 0,
        visibleColumnsOnly: true,
      });
    },
    [onExport, selectedRows.size]
  );

  // Render cell content
  const renderCellContent = useCallback(
    (column: TableColumn<T>, row: T, index: number) => {
      let value: any;

      if (column.accessor) {
        value = column.accessor(row);
      } else if (column.accessorKey) {
        value = row[column.accessorKey];
      }

      if (column.cell) {
        return column.cell(value, row, index);
      }

      // Default rendering based on value type
      if (typeof value === 'boolean') {
        return (
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        );
      }

      if (Array.isArray(value)) {
        return value.map((item, i) => (
          <Badge key={i} variant="outline" className="mr-1">
            {String(item)}
          </Badge>
        ));
      }

      return String(value || '');
    },
    []
  );

  // Render filter input
  const renderFilterInput = useCallback(
    (column: TableColumn<T>) => {
      if (!column.filterable) return null;

      const value = internalFilters[column.id] || '';

      if (column.filterType === 'select' && column.filterOptions) {
        return (
          <Select
            value={value}
            onValueChange={val => handleFilterChange(column.id, val)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {column.filterOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      return (
        <Input
          placeholder={`Filter ${column.header}`}
          value={value}
          onChange={e => handleFilterChange(column.id, e.target.value)}
          className="h-8"
        />
      );
    },
    [internalFilters, handleFilterChange]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingState variant="skeleton" loadingText="Loading table data..." />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyStates
        variant="error"
        title="Failed to load data"
        description={error}
        actions={[
          {
            label: 'Retry',
            onClick: () => window.location.reload(),
            icon: <RefreshCw className="h-4 w-4" />,
          },
        ]}
      />
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          {/* Global search */}
          {filterable && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search all columns..."
                value={globalFilter}
                onChange={e => onGlobalFilterChange?.(e.target.value)}
                className="w-64 pl-8"
              />
            </div>
          )}

          {/* Filter toggle */}
          {filterable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {Object.values(internalFilters).some(
                v => v !== '' && v !== null && v !== undefined
              ) && (
                <Badge variant="secondary" className="ml-1">
                  {
                    Object.values(internalFilters).filter(
                      v => v !== '' && v !== null && v !== undefined
                    ).length
                  }
                </Badge>
              )}
            </Button>
          )}

          {/* Clear filters */}
          {filterable &&
            Object.values(internalFilters).some(
              v => v !== '' && v !== null && v !== undefined
            ) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInternalFilters({});
                  onFilterChange?.({});
                  onGlobalFilterChange?.('');
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk actions */}
          {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {selectedRows.size} selected
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {bulkActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => {
                      const selectedData = data.filter((row, i) =>
                        selectedRows.has(getRowId(row, i))
                      );
                      action.onClick(selectedData);
                    }}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {columns.map(column => (
                <DropdownMenuItem
                  key={column.id}
                  onClick={() => {
                    const newVisible = new Set(visibleColumns);
                    if (newVisible.has(column.id)) {
                      newVisible.delete(column.id);
                    } else {
                      newVisible.add(column.id);
                    }
                    setVisibleColumns(newVisible);
                  }}
                >
                  <Checkbox
                    checked={visibleColumns.has(column.id)}
                    className="mr-2"
                  />
                  {column.header}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export */}
          {exportable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Column filters */}
      {showFilters && filterable && (
        <div className="grid grid-cols-1 gap-2 rounded-lg bg-muted/20 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayColumns
            .filter(col => col.filterable)
            .map(column => (
              <div key={column.id} className="space-y-1">
                <label className="text-sm font-medium">{column.header}</label>
                {renderFilterInput(column)}
              </div>
            ))}
        </div>
      )}

      {/* Table */}
      <div ref={tableRef} className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((row, index) =>
                        selectedRows.has(getRowId(row, index))
                      )
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {displayColumns.map(column => (
                <TableHead
                  key={column.id}
                  style={{ width: column.width, minWidth: column.minWidth }}
                  className={
                    column.sortable ? 'cursor-pointer hover:bg-muted/50' : ''
                  }
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortConfig?.key === column.id ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="w-12">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    displayColumns.length +
                    (selectable ? 1 : 0) +
                    (actions.length > 0 ? 1 : 0)
                  }
                  className="py-8 text-center"
                >
                  <EmptyStates
                    variant="no-data"
                    title="No data"
                    description={emptyMessage}
                    size="sm"
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={getRowId(row, index)}
                  className={`${
                    rowClassName ? rowClassName(row, index) : ''
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row, index)}
                  onDoubleClick={() => onRowDoubleClick?.(row, index)}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(getRowId(row, index))}
                        onCheckedChange={() =>
                          handleSelectRow(getRowId(row, index))
                        }
                      />
                    </TableCell>
                  )}
                  {displayColumns.map(column => (
                    <TableCell key={column.id}>
                      {renderCellContent(column, row, index)}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {actions
                            .filter(
                              action =>
                                !action.visible || action.visible(row, index)
                            )
                            .map((action, actionIndex) => (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={e => {
                                  e.stopPropagation();
                                  action.onClick(row, index);
                                }}
                              >
                                {action.icon}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing{' '}
              {(paginationConfig.page - 1) * paginationConfig.pageSize + 1} to{' '}
              {Math.min(
                paginationConfig.page * paginationConfig.pageSize,
                filteredData.length
              )}{' '}
              of {filteredData.length} results
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={String(paginationConfig.pageSize)}
              onValueChange={value =>
                onPaginationChange?.({
                  ...paginationConfig,
                  pageSize: Number(value),
                  page: 1,
                })
              }
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
                disabled={paginationConfig.page <= 1}
                onClick={() =>
                  onPaginationChange?.({
                    ...paginationConfig,
                    page: paginationConfig.page - 1,
                  })
                }
              >
                Previous
              </Button>

              <span className="px-4 py-2 text-sm">
                Page {paginationConfig.page} of{' '}
                {Math.ceil(filteredData.length / paginationConfig.pageSize)}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={
                  paginationConfig.page >=
                  Math.ceil(filteredData.length / paginationConfig.pageSize)
                }
                onClick={() =>
                  onPaginationChange?.({
                    ...paginationConfig,
                    page: paginationConfig.page + 1,
                  })
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTable;
