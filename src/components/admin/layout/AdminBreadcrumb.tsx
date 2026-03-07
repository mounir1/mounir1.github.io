import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export const AdminBreadcrumb: React.FC<AdminBreadcrumbProps> = ({
  items,
  showHome = true,
  className,
}) => {
  const allItems = showHome
    ? [
        {
          label: 'Admin',
          icon: Home,
          onClick: () => {},
        },
        ...items,
      ]
    : items;

  return (
    <nav
      className={cn(
        'flex items-center space-x-1 text-sm text-muted-foreground',
        className
      )}
    >
      {allItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          )}

          <div className="flex items-center">
            {item.onClick ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={item.onClick}
                className={cn(
                  'h-auto p-1 font-normal hover:bg-transparent hover:text-foreground',
                  (item as BreadcrumbItem).active &&
                    'font-medium text-foreground'
                )}
              >
                {item.icon && <item.icon className="mr-1 h-4 w-4" />}
                {item.label}
              </Button>
            ) : (
              <span
                className={cn(
                  'flex items-center px-1',
                  (item as BreadcrumbItem).active &&
                    'font-medium text-foreground'
                )}
              >
                {item.icon && <item.icon className="mr-1 h-4 w-4" />}
                {item.label}
              </span>
            )}
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default AdminBreadcrumb;
