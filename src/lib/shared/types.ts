/**
* Centralized type definitions
 * Consolidates duplicate types and interfaces across the codebase
 */

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface BaseFormProps extends BaseComponentProps {
  onSubmit?: (data: any) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface BaseCardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export interface BaseButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

// Data table types
export interface TableColumn<T = any> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface TableSorting {
  column: string;
  direction: 'asc' | 'desc';
}

export interface TableFiltering {
  column: string;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt';
}

export interface TableState {
  pagination: TablePagination;
  sorting: TableSorting[];
  filtering: TableFiltering[];
  selection: string[];
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  validation?: (value: any) => boolean;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  category: string;
  data?: Record<string, any>;
  timestamp: Date;
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackPageViews: boolean;
  trackUserInteractions: boolean;
  trackErrors: boolean;
}

// Search types
export interface SearchResult<T = any> {
  item: T;
  score: number;
  matches: Array<{
    field: string;
    value: string;
    indices: [number, number][];
  }>;
}

export interface SearchOptions {
  keys: string[];
  threshold?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
  minMatchCharLength?: number;
}

// Filter types
export interface FilterOption {
  label: string;
  value: any;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'boolean';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export interface ActiveFilter {
  label: string;
}

export interface ProjectMetrics {
  views?: number;
  likes?: number;
  shares?: number;
  downloads?: number;
}

export interface ProjectSEO {
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
}

// Skill types (consolidated)
export interface Skill extends BaseEntity {
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  proficiency: number; // 0-100
  experience: SkillExperience;
  featured: boolean;
  description?: string;
  icon?: string;
  color?: string;
  tags: string[];
  visibility: 'public' | 'private';
}

export interface SkillExperience {
  years: number;
  months: number;
  firstUsed?: Date;
  lastUsed?: Date;
}

// Experience types
export interface Experience extends BaseEntity {
  company: string;
  position: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  location?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  skills: string[];
  achievements: string[];
}

// Statistics types
export interface ProjectStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  featured: number;
  recentActivity: ActivityItem[];
}

export interface SkillStats {
  total: number;
  byCategory: Record<string, number>;
  byLevel: Record<string, number>;
  featured: number;
  averageProficiency: number;
}

export interface ActivityItem {
  id: string;
  type: 'created' | 'updated' | 'deleted';
  entity: 'project' | 'skill' | 'experience';
  entityId: string;
  entityName: string;
  timestamp: Date;
  user?: string;
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type NonEmptyArray<T> = [T, ...T[]];

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];