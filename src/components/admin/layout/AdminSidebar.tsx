import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BarChart3,
  Database,
  Plus,
  Award,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  active?: boolean;
  badge?: string;
}

interface AdminSidebarProps {
  items?: SidebarItem[];
  collapsed?: boolean;
  onToggle?: () => void;
  activeItem?: string;
  className?: string;
}

const defaultItems: SidebarItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    onClick: () => {},
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Database,
    onClick: () => {},
  },
  {
    id: 'add-project',
    label: 'Add Project',
    icon: Plus,
    onClick: () => {},
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: Award,
    onClick: () => {},
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  items = defaultItems,
  collapsed = false,
  onToggle,
  activeItem,
  className,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const SidebarContent = () => (
    <Card
      className={cn(
        'border-0 shadow-medium transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="space-y-2 p-4">
        {/* Toggle Button */}
        <div className="mb-4 flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-muted-foreground">
              Navigation
            </h2>
          )}
          {onToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="p-2"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {items.map(item => (
            <Button
              key={item.id}
              variant={activeItem === item.id ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start transition-all duration-200',
                collapsed ? 'px-2' : 'px-3',
                activeItem === item.id && 'shadow-glow'
              )}
              onClick={item.onClick}
            >
              <item.icon className={cn('h-4 w-4', collapsed ? '' : 'mr-2')} />
              {!collapsed && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="ml-auto rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">
                  {item.badge}
                </span>
              )}
            </Button>
          ))}
        </nav>
      </div>
    </Card>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed left-4 top-20 z-50 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobile}
          className="glass border-border/30 shadow-lg"
        >
          {isMobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'fixed bottom-4 left-4 top-28 z-40 hidden transition-all duration-300 lg:block',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={toggleMobile}
          />
          <div className="absolute bottom-0 left-0 top-0 w-64 transform transition-transform duration-300">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
