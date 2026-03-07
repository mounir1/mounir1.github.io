import * as React from 'react';
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
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
  ColumnResizeMode,
} from '@tanstack/react-table';
import { FixedSizeList as List } from 'react-window';

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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
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
  FileText,
  FileSpreadsheet,
  FileJson,
  GripVertical,
} from 'lucide-react';
import {
  ConfirmDialog,
  ConfirmDialogProps,
} from '@/components/shared/ConfirmDialog';
import { useDebounce } from '@/hooks/use-debounce';

// Enhanced interfaces for admin data table
interface BulkAction<T> {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: (items: T[]) => void;
  variant?: 'default' | 'destructive';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

interface ExportOption<T> {
  label: string;
  format: 'csv' | 'json' | 'xlsx';
  icon: React.ComponentType<{ className?: string }>;
  fileName?: string;
  transform?: (data: T[]) => any[];
}

interface FilterField {
  key: string;
  title: string;
  options: Array<{ label: string; value: string }>;
}

interface AdminDataTableProps<TData, TValue> {
  title: string;
  description?: string;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  searchPlaceholder?: string;
  createButton?: {
    label: string;
    onClick: () => void;
  };
  bulkActions?: BulkAction<TData>[];
  exportOptions?: ExportOption<TData>[];
  filterFields?: FilterField[];
  virtualScrolling?: boolean;
  stickyHeader?: boolean;
  enableColumnResizing?: boolean;
  rowHeight?: number;
  containerHeight?: number;
  onRefresh?: () => void;
  onDelete?: (items: TData[]) => void;
  onAdd?: () => void;
  rowClassName?: (row: { original: TData }) => string;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
}

// Virtual row component for react-window
interface VirtualRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    rows: any[];
    columns: ColumnDef<any, any>[];
    rowClassName?: (row: { original: any }) => string;
  };
}

const VirtualRow: React.FC<VirtualRowProps> = ({ index, style, data }) => {
  const { rows, columns, rowClassName } = data;
  const row = rows[index];

  return (
    <div style={style}>
      <TableRow
        data-state={row.getIsSelected() && 'selected'}
        className={cn(
          'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
          rowClassName ? rowClassName(row) : ''
        )}
      >
        {row.getVisibleCells().map((cell: any) => (
          <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    </div>
  );
};

export function AdminDataTable<TData, TValue>({
  title,
  description,
  columns,
  data,
  loading = false,
  searchPlaceholder = 'Search…',
  createButton,
  bulkActions = [],
  exportOptions = [],
  filterFields = [],
  virtualScrolling = false,
  stickyHeader = true,
  enableColumnResizing = true,
  rowHeight = 60,
  containerHeight = 600,
  onRefresh,
  onDelete,
  onAdd,
  rowClassName,
  emptyStateMessage = 'No data found',
  emptyStateDescription = 'Try adjusting your search or filter criteria',
}: AdminDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnResizeMode] = useState<ColumnResizeMode>('onChange');
  const [confirmDialog, setConfirmDialog] = useState<
    Omit<ConfirmDialogProps, 'onOpenChange'>
  >({ open: false, title: '', description: '', onConfirm: () => {} });

  const debouncedGlobalFilter = useDebounce(globalFilter, 300);

  const tableRef = useRef<HTMLDivElement>(null);

  // Focus management for accessibility
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Enhanced columns with selection checkbox
  const enhancedColumns = useMemo(() => {
    const selectColumn: ColumnDef<TData, TValue> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label={`Select row ${row.index + 1}`}
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    };

    return [selectColumn, ...columns];
  }, [columns]);

  const table = useReactTable({
    data,
    columns: enhancedColumns,
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
    columnResizeMode,
    enableColumnResizing,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter: debouncedGlobalFilter,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: virtualScrolling ? data.length : 10,
      },
    },
  });

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map(row => row.original);

  // Export functionality
  const handleExport = useCallback(
    async (option: ExportOption<TData>, exportData: TData[]) => {
      const dataToExport = option.transform
        ? option.transform(exportData)
        : exportData;
      const fileName =
        option.fileName || `${title.toLowerCase().replace(/\s+/g, '-')}-export`;

      try {
        switch (option.format) {
          case 'csv':
            await exportToCSV(dataToExport, fileName);
            break;
          case 'json':
            await exportToJSON(dataToExport, fileName);
            break;
          case 'xlsx':
            // To implement XLSX export, you would need a library like 'xlsx'.
            // Example:
            // const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            // const workbook = XLSX.utils.book_new();
            // XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
            // XLSX.writeFile(workbook, `${fileName}.xlsx`);
            console.log(
              'XLSX export requires an additional library like `xlsx`.'
            );
            break;
        }
      } catch (error) {
        console.error(`Failed to export data as ${option.format}:`, error);
        // Here you could show a toast notification to the user
      }
    },
    [title]
  );

  const exportToCSV = (data: any[], fileName: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => `"${row[header] || ''}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data: any[], fileName: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk action handler with confirmation
  const handleBulkAction = useCallback(
    (action: BulkAction<TData>) => {
      if (action.requiresConfirmation) {
        setConfirmDialog({
          open: true,
          title: action.label,
          description:
            action.confirmationMessage ||
            `Are you sure you want to ${action.label.toLowerCase()} ${selectedRows.length} item(s)?`,
          onConfirm: () => {
            action.onClick(selectedRows);
            setConfirmDialog({ ...confirmDialog, open: false });
          },
          variant: action.variant === 'destructive' ? 'destructive' : 'default',
        });
      } else {
        action.onClick(selectedRows);
      }
    },
    [selectedRows, confirmDialog]
  );

  // Virtual scrolling setup
  const rows = table.getRowModel().rows;
  const virtualData = useMemo(
    () => ({
      rows,
      columns: enhancedColumns,
      rowClassName,
    }),
    [rows, enhancedColumns, rowClassName]
  );

  return (
    <>
      <ConfirmDialog
        {...confirmDialog}
        onOpenChange={open => setConfirmDialog({ ...confirmDialog, open })}
      />
      <Card
        className="border-0 bg-card text-card-foreground shadow-medium"
        role="region"
        aria-labelledby="admin-table-title"
      >
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle
                id="admin-table-title"
                className="font-heading text-xl font-semibold"
              >
                {title}
              </CardTitle>
              {description && (
                <p className="mt-1 font-sans text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {createButton && (
              <Button
                onClick={createButton.onClick}
                className="shadow-glow"
                aria-label={`Create new ${title.toLowerCase()}`}
              >
                <Plus className="mr-2 h-4 w-4" />
                {createButton.label}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-0">
          {/* Enhanced Toolbar */}
          <div className="flex flex-col items-start justify-between gap-4 border-b p-6 pb-4 lg:flex-row lg:items-center">
            <div className="flex flex-1 flex-wrap items-center gap-2 space-x-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder={searchPlaceholder}
                  value={globalFilter}
                  onChange={event => setGlobalFilter(event.target.value)}
                  className="w-64 bg-background pl-8 text-foreground"
                  aria-label={`Search ${title.toLowerCase()}`}
                />
              </div>

              {/* Filter dropdowns */}
              {filterFields.map(field => (
                <Select
                  key={field.key}
                  value={
                    (table.getColumn(field.key)?.getFilterValue() as string) ??
                    ''
                  }
                  onValueChange={value =>
                    table
                      .getColumn(field.key)
                      ?.setFilterValue(value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger
                    className="w-[150px] border-input bg-background text-foreground"
                    aria-label={`Filter by ${field.title}`}
                  >
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={field.title} />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover text-popover-foreground">
                    <SelectItem
                      value="all"
                      className="focus:bg-accent focus:text-accent-foreground"
                    >
                      All {field.title}
                    </SelectItem>
                    {field.options.map(option => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="focus:bg-accent focus:text-accent-foreground"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}

              {/* Column visibility */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-input bg-background text-foreground"
                    aria-label="Toggle column visibility"
                  >
                    <Columns className="mr-2 h-4 w-4 text-muted-foreground" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[200px] border-border bg-popover text-popover-foreground"
                >
                  <DropdownMenuLabel className="text-foreground">
                    Toggle columns
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  {table
                    .getAllColumns()
                    .filter(column => column.getCanHide())
                    .map(column => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize text-foreground focus:bg-accent focus:text-accent-foreground"
                          checked={column.getIsVisible()}
                          onCheckedChange={value =>
                            column.toggleVisibility(!!value)
                          }
                          aria-label={`Toggle ${column.id} column visibility`}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center gap-2 space-x-2">
              {/* Selection info and bulk actions */}
              {selectedRows.length > 0 && (
                <>
                  <Badge
                    variant="secondary"
                    className="mr-2 bg-secondary text-secondary-foreground"
                    aria-label={`${selectedRows.length} rows selected`}
                  >
                    {selectedRows.length} selected
                  </Badge>

                  {bulkActions.map((action, index) => (
                    <Button
                      key={index}
                      variant={
                        action.variant === 'destructive'
                          ? 'destructive'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => handleBulkAction(action)}
                      className={
                        action.variant === 'destructive'
                          ? ''
                          : 'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                      }
                      aria-label={`${action.label} for ${selectedRows.length} selected items`}
                    >
                      <action.icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Button>
                  ))}
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

              {/* Export options */}
              {exportOptions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                      aria-label="Export data options"
                    >
                      <Download className="mr-2 h-4 w-4 text-muted-foreground" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="border-border bg-popover text-popover-foreground"
                  >
                    <DropdownMenuLabel className="text-foreground">
                      Export format
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    {exportOptions.map((option, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() =>
                          handleExport(
                            option,
                            selectedRows.length > 0 ? selectedRows : data
                          )
                        }
                        className="focus:bg-accent focus:text-accent-foreground"
                        aria-label={`Export ${selectedRows.length > 0 ? selectedRows.length + ' selected rows' : 'all data'} as ${option.label}`}
                      >
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        {option.label}
                        {selectedRows.length > 0 &&
                          ` (${selectedRows.length} selected)`}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label="Refresh data"
                >
                  <RefreshCw
                    className={cn(
                      'mr-2 h-4 w-4 text-muted-foreground',
                      loading && 'animate-spin'
                    )}
                  />
                  Refresh
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Table with Virtual Scrolling */}
          <div className="rounded-md border border-border" ref={tableRef}>
            {virtualScrolling && data.length > 50 ? (
              <div>
                {/* Sticky Header */}
                <div
                  className={cn(
                    'bg-muted/50',
                    stickyHeader && 'sticky top-0 z-10'
                  )}
                >
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map(headerGroup => (
                        <TableRow
                          key={headerGroup.id}
                          className="bg-muted/50 hover:bg-muted/70"
                        >
                          {headerGroup.headers.map(header => (
                            <TableHead
                              key={header.id}
                              className="relative text-foreground"
                              style={{ width: header.getSize() }}
                            >
                              {header.isPlaceholder ? null : (
                                <div className="flex items-center justify-between">
                                  <div
                                    className={cn(
                                      'flex items-center space-x-2',
                                      header.column.getCanSort() &&
                                        '-m-1 cursor-pointer select-none rounded p-1 hover:bg-muted/50'
                                    )}
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                                    {header.column.getCanSort() && (
                                      <div className="ml-2 text-muted-foreground">
                                        {{
                                          asc: <ArrowUp className="h-4 w-4" />,
                                          desc: (
                                            <ArrowDown className="h-4 w-4" />
                                          ),
                                        }[
                                          header.column.getIsSorted() as string
                                        ] ?? (
                                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Column resizer */}
                                  {enableColumnResizing &&
                                    header.column.getCanResize() && (
                                      <div
                                        onMouseDown={header.getResizeHandler()}
                                        onTouchStart={header.getResizeHandler()}
                                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-border opacity-0 transition-opacity hover:bg-primary hover:opacity-100"
                                      >
                                        <GripVertical className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform text-muted-foreground" />
                                      </div>
                                    )}
                                </div>
                              )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                  </Table>
                </div>

                {/* Virtual Scrolling Body */}
                <div style={{ height: containerHeight }}>
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    </div>
                  ) : rows.length > 0 ? (
                    <List
                      height={containerHeight}
                      itemCount={rows.length}
                      itemSize={rowHeight}
                      itemData={virtualData}
                      width="100%"
                      overscanCount={5}
                    >
                      {VirtualRow}
                    </List>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                      <div className="text-lg font-medium">
                        {emptyStateMessage}
                      </div>
                      <div className="text-sm">{emptyStateDescription}</div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between border-t px-6 py-4">
                  <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                  </div>
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">Rows per page</p>
                      <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={value => {
                          table.setPageSize(Number(value));
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px] border-input bg-background text-foreground">
                          <SelectValue
                            placeholder={table.getState().pagination.pageSize}
                          />
                        </SelectTrigger>
                        <SelectContent
                          side="top"
                          className="border-border bg-popover text-popover-foreground"
                        >
                          {[10, 20, 30, 40, 50, 100].map(pageSize => (
                            <SelectItem
                              key={pageSize}
                              value={`${pageSize}`}
                              className="focus:bg-accent focus:text-accent-foreground"
                            >
                              {pageSize}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                      Page {table.getState().pagination.pageIndex + 1} of{' '}
                      {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 border-input bg-background p-0 text-foreground hover:bg-accent hover:text-accent-foreground lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="Go to first page"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 border-input bg-background p-0 text-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="Go to previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 border-input bg-background p-0 text-foreground hover:bg-accent hover:text-accent-foreground"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        aria-label="Go to next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 border-input bg-background p-0 text-foreground hover:bg-accent hover:text-accent-foreground lg:flex"
                        onClick={() =>
                          table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                        aria-label="Go to last page"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Standard table for smaller datasets
              <Table>
                <TableHeader
                  className={cn(
                    stickyHeader && 'sticky top-0 z-10 bg-background'
                  )}
                >
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow
                      key={headerGroup.id}
                      className="bg-muted/50 hover:bg-muted/70 dark:bg-muted/30 dark:hover:bg-muted/50"
                    >
                      {headerGroup.headers.map(header => (
                        <TableHead
                          key={header.id}
                          className="relative text-foreground"
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder ? null : (
                            <div className="flex items-center justify-between">
                              <div
                                className={cn(
                                  'flex items-center space-x-2',
                                  header.column.getCanSort() &&
                                    '-m-1 cursor-pointer select-none rounded p-1 hover:bg-muted/50 dark:hover:bg-muted/30'
                                )}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {header.column.getCanSort() && (
                                  <div className="ml-2 text-muted-foreground">
                                    {{
                                      asc: <ArrowUp className="h-4 w-4" />,
                                      desc: <ArrowDown className="h-4 w-4" />,
                                    }[
                                      header.column.getIsSorted() as string
                                    ] ?? (
                                      <ArrowUpDown className="h-4 w-4 opacity-50" />
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Column resizer */}
                              {enableColumnResizing &&
                                header.column.getCanResize() && (
                                  <div
                                    onMouseDown={header.getResizeHandler()}
                                    onTouchStart={header.getResizeHandler()}
                                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-border opacity-0 transition-opacity hover:bg-primary hover:opacity-100"
                                  >
                                    <GripVertical className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform text-muted-foreground" />
                                  </div>
                                )}
                            </div>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={enhancedColumns.length}
                        className="h-24 text-center"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : rows.length ? (
                    rows.map(row => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className={cn(
                          'hover:bg-muted/50 dark:hover:bg-muted/30',
                          rowClassName ? rowClassName(row) : '',
                          row.getIsSelected() && 'bg-muted dark:bg-muted/50'
                        )}
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell
                            key={cell.id}
                            style={{ width: cell.column.getSize() }}
                            className="text-foreground"
                          >
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
                        colSpan={enhancedColumns.length}
                        className="h-24 text-center"
                      >
                        <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                          <div className="text-lg font-medium">
                            {emptyStateMessage}
                          </div>
                          <div className="text-sm">{emptyStateDescription}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Enhanced Pagination */}
          {!virtualScrolling && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select
                    value={`${table.getState().pagination.pageSize}`}
                    onValueChange={value => {
                      table.setPageSize(Number(value));
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px] border-input bg-background text-foreground">
                      <SelectValue
                        placeholder={table.getState().pagination.pageSize}
                      />
                    </SelectTrigger>
                    <SelectContent
                      side="top"
                      className="border-border bg-popover text-popover-foreground"
                    >
                      {[10, 20, 30, 40, 50, 100].map(pageSize => (
                        <SelectItem
                          key={pageSize}
                          value={`${pageSize}`}
                          className="focus:bg-accent focus:text-accent-foreground"
                        >
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 border-input bg-background p-0 text-foreground hover:bg-accent hover:text-accent-foreground lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to first page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 border-input bg-background p-0 text-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 border-input bg-background p-0 text-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 border-input bg-background p-0 text-foreground hover:bg-accent hover:text-accent-foreground lg:flex"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to last page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
