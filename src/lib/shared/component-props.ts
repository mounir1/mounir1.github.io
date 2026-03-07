/**
 * Consolidated component prop interfaces
 * Eliminates duplicate prop definitions across components
 */

import React from 'react';
import { VariantProps } from 'class-variance-authority';

/**
 * Base component props that most components should extend
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

/**
 * Props for components that can be in loading state
 */
export interface LoadingProps {
  loading?: boolean;
  loadingText?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * Props for components that can display errors
 */
export interface ErrorProps {
  error?: Error | string | null;
  errorComponent?: React.ReactNode;
  onRetry?: () => void;
}

/**
 * Combined props for async components
 */
export interface AsyncComponentProps extends LoadingProps, ErrorProps {
  data?: any;
  refetch?: () => void;
}

/**
 * Props for components with size variants
 */
export interface SizeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Props for components with color variants
 */
export interface VariantProps {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'ghost';
}

/**
 * Props for form field components
 */
export interface BaseFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

/**
 * Props for input components
 */
export interface InputProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'number' | 'search';
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

/**
 * Props for textarea components
 */
export interface TextareaProps extends BaseFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

/**
 * Props for select components
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps extends BaseFieldProps {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
}

/**
 * Props for checkbox components
 */
export interface CheckboxProps extends BaseFieldProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
}

/**
 * Props for radio group components
 */
export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface RadioGroupProps extends BaseFieldProps {
  options: RadioOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Props for button components
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps,
    SizeProps {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

/**
 * Props for card components
 */
export interface CardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
}

/**
 * Props for modal/dialog components
 */
export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

/**
 * Props for table components
 */
export interface TableColumn<T = any> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessor?: (row: T) => any;
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
}

export interface TableAction<T = any> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedRows: T[]) => void;
  variant?: 'default' | 'destructive' | 'outline';
  disabled?: (selectedRows: T[]) => boolean;
}

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string;
  title?: string;
  description?: string;
  enableSearch?: boolean;
  enableSelection?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  actions?: TableAction<T>[];
  onRefresh?: () => void;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
}

/**
 * Props for navigation components
 */
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
}

export interface NavigationProps extends BaseComponentProps {
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Props for breadcrumb components
 */
export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  onItemClick?: (item: BreadcrumbItem) => void;
}

/**
 * Props for pagination components
 */
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  showFirstLast?: boolean;
  pageSizeOptions?: number[];
  disabled?: boolean;
}

/**
 * Props for search components
 */
export interface SearchProps extends BaseComponentProps {
  value?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  loading?: boolean;
  showClearButton?: boolean;
  showSearchButton?: boolean;
  debounceMs?: number;
  variant?: 'default' | 'modern' | 'minimal';
}

/**
 * Props for filter components
 */
export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

export interface FilterField {
  key: string;
  title: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'text';
  options?: FilterOption[];
  placeholder?: string;
}

export interface FilterProps extends BaseComponentProps {
  fields: FilterField[];
  values: Record<string, any>;
  onValuesChange: (values: Record<string, any>) => void;
  onReset?: () => void;
  showReset?: boolean;
  variant?: 'inline' | 'dropdown' | 'sidebar';
}

/**
 * Props for toast/notification components
 */
export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  closable?: boolean;
}

/**
 * Props for avatar components
 */
export interface AvatarProps extends BaseComponentProps, SizeProps {
  src?: string;
  alt?: string;
  fallback?: string;
  name?: string;
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
}

/**
 * Props for badge components
 */
export interface BadgeProps
  extends BaseComponentProps,
    VariantProps,
    SizeProps {
  count?: number;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  pulse?: boolean;
}

/**
 * Props for progress components
 */
export interface ProgressProps extends BaseComponentProps, SizeProps {
  value: number;
  max?: number;
  showValue?: boolean;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  animated?: boolean;
  striped?: boolean;
}

/**
 * Props for skeleton components
 */
export interface SkeletonProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
}

/**
 * Props for empty state components
 */
export interface EmptyStateProps extends BaseComponentProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  image?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: VariantProps['variant'];
  };
  variant?: 'default' | 'minimal' | 'illustration';
}

/**
 * Props for error boundary components
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

/**
 * Props for theme components
 */
export interface ThemeToggleProps extends BaseComponentProps {
  variant?: 'default' | 'compact' | 'icon-only';
  showLabel?: boolean;
  size?: SizeProps['size'];
}

/**
 * Props for responsive components
 */
export interface ResponsiveProps {
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  hideAbove?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showOnly?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Props for animation components
 */
export interface AnimationProps {
  animation?: 'fade' | 'slide' | 'scale' | 'bounce' | 'rotate' | 'none';
  duration?: number;
  delay?: number;
  easing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  direction?: 'up' | 'down' | 'left' | 'right';
  trigger?: 'hover' | 'focus' | 'click' | 'scroll' | 'mount';
}

/**
 * Export all prop types for easy importing
 */
export type {
  BaseComponentProps,
  LoadingProps,
  ErrorProps,
  AsyncComponentProps,
  SizeProps,
  VariantProps as ComponentVariantProps,
  BaseFieldProps,
  InputProps,
  TextareaProps,
  SelectProps,
  CheckboxProps,
  RadioGroupProps,
  ButtonProps,
  CardProps,
  DialogProps,
  TableProps,
  NavigationProps,
  BreadcrumbProps,
  PaginationProps,
  SearchProps,
  FilterProps,
  ToastProps,
  AvatarProps,
  BadgeProps,
  ProgressProps,
  SkeletonProps,
  EmptyStateProps,
  ErrorBoundaryProps,
  ThemeToggleProps,
  ResponsiveProps,
  AnimationProps,
};
