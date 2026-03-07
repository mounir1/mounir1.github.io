import React from 'react';
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar';
import { AddItemDialog } from '@/components/admin/forms/AddItemDialog';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Layout,
  Settings,
  Users,
  FileText,
  Code2,
  LineChart,
  Rocket,
  Shield,
} from 'lucide-react';

export interface DashboardLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  className,
}) => {
  const [currentPage, setCurrentPage] = React.useState<string>('dashboard');

  const handleNavigation = (path: string) => {
    const pageId = path.split('/').pop() || 'dashboard';
    setCurrentPage(pageId);
    window.location.href = path;
  };

  const renderAddButton = () => {
    switch (currentPage) {
      case 'projects':
        return <AddItemDialog type="project" />;
      case 'skills':
        return <AddItemDialog type="skill" />;
      case 'experience':
        return <AddItemDialog type="experience" />;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <AdminSidebar
        items={[
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: BarChart3,
            onClick: () => handleNavigation('/admin/dashboard'),
          },
          {
            id: 'analytics',
            label: 'Analytics',
            icon: LineChart,
            onClick: () => handleNavigation('/admin/analytics'),
          },
          {
            id: 'projects',
            label: 'Projects',
            icon: Layout,
            onClick: () => handleNavigation('/admin/projects'),
          },
          {
            id: 'skills',
            label: 'Skills',
            icon: Code2,
            onClick: () => handleNavigation('/admin/skills'),
          },
          {
            id: 'pages',
            label: 'Pages',
            icon: FileText,
            onClick: () => handleNavigation('/admin/pages'),
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            onClick: () => handleNavigation('/admin/settings'),
          },
          {
            id: 'users',
            label: 'Users',
            icon: Users,
            onClick: () => handleNavigation('/admin/users'),
          },
          {
            id: 'security',
            label: 'Security',
            icon: Shield,
            onClick: () => handleNavigation('/admin/security'),
          },
        ]}
      />

      <main className={cn('flex-1 overflow-auto px-4 py-6', className)}>
        <div className="mb-6">{renderAddButton()}</div>
        {children}
      </main>
    </div>
  );
};
