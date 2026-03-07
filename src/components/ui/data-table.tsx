import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  RowSelectionState,
  getPaginationRowModel,
} from '@tanstack/react-table';

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
import { SearchField } from '@/components/ui/search-field';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  ExternalLink,
  Star,
  EyeOff,
  Settings,
  Columns,
} from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterField {
  key: string;
  title: string;
  options: FilterOption[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  searchPlaceholder?: string;
  onAdd?: () => void;
  onDelete?: (rows: TData[]) => void;
  onExport?: (rows: TData[]) => void;
  onRefresh?: () => void;
  filterFields?: FilterField[];
  rowClassName?: (row: { original: TData }) => string;
  // New props for enhanced functionality
  showColumnVisibility?: boolean;
  showDensitySelector?: boolean;
  density?: 'comfortable' | 'compact' | 'spacious';
  onDensityChange?: (density: 'comfortable' | 'compact' | 'spacious') => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  searchPlaceholder = 'Search...',
  onAdd,
  onDelete,
  onExport,
  onRefresh,
  filterFields = [],
  rowClassName,
  showColumnVisibility = true,
  showDensitySelector = true,
  density = 'comfortable',
  onDensityChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnVisibility, setColumnVisibility] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Get selected rows using the correct API
  const selectedRows = table
    .getSelectedRowModel()
    .rows.map(row => row.original);

  // Density classes for table rows
  const densityClasses = {
    compact: 'py-1',
    comfortable: 'py-2',
    spacious: 'py-3',
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Toolbar */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <SearchField
            placeholder={searchPlaceholder}
            value={globalFilter}
            onValueChange={setGlobalFilter}
            variant="modern"
            size="md"
            className="max-w-sm"
            showClearButton={true}
            showFilterButton={filterFields.length > 0}
            filterOptions={
              filterFields.length > 0
                ? [
                    ...filterFields.map(field => ({
                      label: field.title,
                      value: field.key,
                    })),
                  ]
                : []
            }
          />

          {/* Filter dropdowns */}
          {filterFields.map(field => (
            <Select
              key={field.key}
              value={
                (table.getColumn(field.key)?.getFilterValue() as string) ?? ''
              }
              onValueChange={value =>
                table
                  .getColumn(field.key)
                  ?.setFilterValue(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={field.title} />
              </SelectTrigger>
              <SelectContent className="dropdown-modern">
                <SelectItem value="all" className="dropdown-item">
                  All {field.title}
                </SelectItem>
                {field.options.map(option => (
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
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedRows.length > 0 && (
            <>
              <Badge variant="secondary" className="mr-2">
                {selectedRows.length} selected
              </Badge>
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(selectedRows)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedRows.length})
                </Button>
              )}
            </>
          )}

          <div className="flex items-center gap-2">
            {showColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Columns className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="dropdown-modern w-[150px]"
                >
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter(column => column.getCanHide())
                    .map(column => {
                      return (
                        <DropdownMenuItem
                          key={column.id}
                          className="dropdown-item"
                          onSelect={event => {
                            event.preventDefault();
                            column.toggleVisibility(!column.getIsVisible());
                          }}
                        >
                          <div className="flex items-center">
                            <div
                              className={cn(
                                'mr-2 h-4 w-4',
                                column.getIsVisible()
                                  ? 'opacity-100'
                                  : 'opacity-30'
                              )}
                            >
                              {column.getIsVisible() ? '✓' : '○'}
                            </div>
                            {column.id}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {showDensitySelector && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="dropdown-modern w-[150px]"
                >
                  <DropdownMenuLabel>Table density</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={cn(
                      'dropdown-item',
                      density === 'compact' && 'bg-accent'
                    )}
                    onClick={() => onDensityChange?.('compact')}
                  >
                    Compact
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(
                      'dropdown-item',
                      density === 'comfortable' && 'bg-accent'
                    )}
                    onClick={() => onDensityChange?.('comfortable')}
                  >
                    Comfortable
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={cn(
                      'dropdown-item',
                      density === 'spacious' && 'bg-accent'
                    )}
                    onClick={() => onDensityChange?.('spacious')}
                  >
                    Spacious
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onExport(selectedRows.length > 0 ? selectedRows : data)
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}

            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}

            {onAdd && (
              <Button size="sm" onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="rounded-md border border-border/50 bg-background/50 shadow-lg backdrop-blur-sm">
        <Table>
          <TableHeader className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead
                      key={header.id}
                      className="relative font-semibold text-foreground"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            'flex items-center space-x-2',
                            header.column.getCanSort() &&
                              '-m-1 cursor-pointer select-none rounded p-1 transition-colors hover:bg-accent/50'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <div className="ml-2">
                              {{
                                asc: <ArrowUp className="h-4 w-4" />,
                                desc: <ArrowDown className="h-4 w-4" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'border-b border-border/20 transition-colors last:border-b-0 hover:bg-accent/30',
                    rowClassName ? rowClassName(row) : '',
                    densityClasses[density]
                  )}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="align-middle">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                    <div className="text-lg">No results found</div>
                    <div className="text-sm">
                      Try adjusting your search or filter criteria
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Enhanced Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 px-2 sm:flex-row">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <span>{table.getFilteredSelectedRowModel().rows.length} of</span>
            <span>
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex items-center space-x-2">
            <p className="whitespace-nowrap text-sm font-medium">
              Rows per page
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={value => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top" className="dropdown-modern">
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <SelectItem
                    key={pageSize}
                    value={`${pageSize}`}
                    className="dropdown-item"
                  >
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Action column component for common actions

export interface ActionColumnProps {
  row: any;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onDuplicate?: (item: any) => void;
  onToggleFeatured?: (item: any) => void;
  onToggleVisibility?: (item: any) => void;
  customActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (item: any) => void;
    variant?: 'default' | 'destructive';
  }>;
}

export const ActionColumn: React.FC<ActionColumnProps> = ({
  row,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFeatured,
  onToggleVisibility,
  customActions = [],
}) => {
  const item = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dropdown-modern w-[180px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {onView && (
          <DropdownMenuItem
            onClick={() => onView(item)}
            className="dropdown-item"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}

        {onEdit && (
          <DropdownMenuItem
            onClick={() => onEdit(item)}
            className="dropdown-item"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}

        {onDuplicate && (
          <DropdownMenuItem
            onClick={() => onDuplicate(item)}
            className="dropdown-item"
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
        )}

        {onToggleFeatured && (
          <DropdownMenuItem
            onClick={() => onToggleFeatured(item)}
            className="dropdown-item"
          >
            <Star
              className={`mr-2 h-4 w-4 ${item.featured ? 'fill-current' : ''}`}
            />
            {item.featured ? 'Unfeature' : 'Feature'}
          </DropdownMenuItem>
        )}

        {onToggleVisibility && (
          <DropdownMenuItem
            onClick={() => onToggleVisibility(item)}
            className="dropdown-item"
          >
            {item.disabled ? (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show
              </>
            ) : (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide
              </>
            )}
          </DropdownMenuItem>
        )}

        {item.liveUrl && (
          <DropdownMenuItem
            onClick={() => window.open(item.liveUrl, '_blank')}
            className="dropdown-item"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Live Site
          </DropdownMenuItem>
        )}

        {customActions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => action.onClick(item)}
            className={cn(
              'dropdown-item',
              action.variant === 'destructive' ? 'text-destructive' : ''
            )}
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
          </DropdownMenuItem>
        ))}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(item)}
              className="dropdown-item text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Status badge component for displaying status
export interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
}) => {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'cancelled':
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={variant === 'default' ? getVariant(status) : variant}>
      {status}
    </Badge>
  );
};
