/**
 * Application Types
 * Centralized type definitions for the entire application
 */

// Re-export all types from shared lib
export * from '@/lib/shared/types';

// Additional app-specific types
export interface AppConfig {
  name: string;
  version: string;
  author: string;
  description: string;
  url: string;
  email: string;
}

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  title?: string;
  description?: string;
  requiresAuth?: boolean;
}

export interface AdminTabConfig {
  id: string;
  label: string;
  icon: React.ComponentType;
  component: React.ComponentType;
  badge?: string | number;
  disabled?: boolean;
}

export interface PortfolioSectionConfig {
  id: string;
  title: string;
  component: React.ComponentType;
  order: number;
  visible: boolean;
}

export interface AnimationConfig {
  variant: string;
  duration?: number;
  delay?: number;
  easing?: string;
  repeat?: boolean;
}

export interface ResponsiveConfig {
  mobile?: any;
  tablet?: any;
  desktop?: any;
  wide?: any;
}

export interface GridConfig {
  columns: ResponsiveConfig;
  gap: ResponsiveConfig;
  padding: ResponsiveConfig;
}

// Component prop types
export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children?: React.ReactNode;
}

export interface WithTestId {
  'data-testid'?: string;
}

export interface BaseProps extends WithClassName, WithChildren, WithTestId {}

// Layout types
export interface LayoutProps extends BaseProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export interface SidebarProps extends BaseProps {
  collapsed?: boolean;
  onToggle?: () => void;
  items: NavigationItem[];
}

export interface HeaderProps extends BaseProps {
  title?: string;
  actions?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
}

// Form types
export interface FormProps<T = any> extends BaseProps {
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  validationSchema?: any;
}

export interface FieldProps extends BaseProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

// Data display types
export interface TableProps<T = any> extends BaseProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string;
  pagination?: TablePagination;
  sorting?: TableSorting[];
  filtering?: TableFiltering[];
  selection?: string[];
  onPaginationChange?: (pagination: TablePagination) => void;
  onSortingChange?: (sorting: TableSorting[]) => void;
  onFilteringChange?: (filtering: TableFiltering[]) => void;
  onSelectionChange?: (selection: string[]) => void;
}

export interface CardProps extends BaseProps {
  title?: string;
  description?: string;
  image?: string;
  actions?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
  onClick?: () => void;
}

// State management types
export interface AppState {
  auth: AuthState;
  ui: UIState;
  data: DataState;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  activeTab: string;
  loading: boolean;
  notifications: Notification[];
}

export interface DataState {
  projects: AsyncState<Project[]>;
  skills: AsyncState<Skill[]>;
  experiences: AsyncState<Experience[]>;
}

// Event types
export interface AppEvent {
  type: string;
  payload?: any;
  timestamp: Date;
}

export interface UserInteractionEvent extends AppEvent {
  element: string;
  action: 'click' | 'hover' | 'focus' | 'scroll';
  position?: { x: number; y: number };
}

export interface NavigationEvent extends AppEvent {
  from: string;
  to: string;
  method: 'push' | 'replace' | 'back' | 'forward';
}

// Utility types for better type safety
export type ComponentWithProps<T = {}> = React.ComponentType<T>;

export type EventHandler<T = any> = (event: T) => void;

export type AsyncFunction<T = any, R = any> = (args: T) => Promise<R>;

export type Validator<T = any> = (value: T) => boolean | string;

export type Transformer<T = any, R = any> = (input: T) => R;

export type Predicate<T = any> = (value: T) => boolean;

export type Comparator<T = any> = (a: T, b: T) => number;

export type Selector<T = any, R = any> = (state: T) => R;

export type Reducer<T = any, A = any> = (state: T, action: A) => T;

export type Middleware<T = any> = (next: T) => T;

// Generic utility types
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type NullableFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null;
};

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P];
};

export type ReadonlyFields<T, K extends keyof T> = Omit<T, K> & {
  readonly [P in K]: T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type DeepNullable<T> = {
  [P in keyof T]: T[P] extends object ? DeepNullable<T[P]> : T[P] | null;
};

export type StringKeys<T> = Extract<keyof T, string>;

export type NumberKeys<T> = Extract<keyof T, number>;

export type SymbolKeys<T> = Extract<keyof T, symbol>;

export type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

export type PickByType<T, U> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends U ? K : never;
  }[keyof T]
>;

export type OmitByType<T, U> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends U ? never : K;
  }[keyof T]
>;
