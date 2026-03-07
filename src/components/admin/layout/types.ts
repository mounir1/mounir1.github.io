/**
 * Admin Layout Types
 */

import { BaseProps, NavigationItem, BreadcrumbItem } from '@/types';

export interface AdminLayoutProps extends BaseProps {
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  showBreadcrumb?: boolean;
  maxWidth?: 'full' | '7xl' | '6xl';
  padding?: 'sm' | 'md' | 'lg';
}

export interface AdminHeaderProps extends BaseProps {
  title?: string;
  user?: User | null;
  onLogout?: () => void;
  showUserMenu?: boolean;
  actions?: HeaderAction[];
  breadcrumb?: BreadcrumbItem[];
}

export interface AdminSidebarProps extends BaseProps {
  collapsed?: boolean;
  onToggle?: () => void;
  items?: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
}

export interface AdminBreadcrumbProps extends BaseProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
}

export interface HeaderAction {
  label: string;
  icon?: React.ComponentType;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  disabled?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface LayoutConfig {
  showSidebar: boolean;
  showBreadcrumb: boolean;
  maxWidth: 'full' | '7xl' | '6xl';
  padding: 'sm' | 'md' | 'lg';
  sidebarWidth: {
    collapsed: number;
    expanded: number;
  };
}
