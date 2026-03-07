import React from 'react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  className?: string;
}

interface LayoutConfig {
  showSidebar: boolean;
  showBreadcrumb: boolean;
  maxWidth: 'full' | '7xl' | '6xl';
  padding: 'sm' | 'md' | 'lg';
}

const defaultConfig: LayoutConfig = {
  showSidebar: true,
  showBreadcrumb: true,
  maxWidth: '7xl',
  padding: 'md',
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  sidebarCollapsed = false,
  onSidebarToggle,
  className,
}) => {
  const config = defaultConfig;

  const maxWidthClasses = {
    full: 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
  };

  const paddingClasses = {
    sm: 'p-4 sm:p-6',
    md: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-12',
  };

  return (
    <div className={cn('min-h-screen bg-gradient-subtle', className)}>
      {/* Responsive grid container */}
      <div
        className={cn(
          'mx-auto w-full',
          maxWidthClasses[config.maxWidth],
          paddingClasses[config.padding],
          'space-y-6 lg:space-y-8'
        )}
      >
        {/* Responsive content area */}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
