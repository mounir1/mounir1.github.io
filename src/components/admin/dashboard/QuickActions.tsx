import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Database,
  Award,
  Settings,
  Upload,
  Download,
  RefreshCw,
  Zap,
  FileText,
  BarChart3,
  Users,
  Globe,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

interface QuickActionsProps {
  actions?: QuickAction[];
  layout?: 'grid' | 'list';
  maxItems?: number;
  onActionClick?: (actionId: string) => void;
}

const defaultActions: QuickAction[] = [
  {
    id: 'add-project',
    label: 'Add New Project',
    description: 'Create a new portfolio project',
    icon: Plus,
    onClick: () => {},
    variant: 'default',
  },
  {
    id: 'manage-projects',
    label: 'Manage Projects',
    description: 'View and edit existing projects',
    icon: Database,
    onClick: () => {},
    variant: 'outline',
  },
  {
    id: 'manage-skills',
    label: 'Manage Skills',
    description: 'Update your skills and expertise',
    icon: Award,
    onClick: () => {},
    variant: 'outline',
  },
  {
    id: 'export-data',
    label: 'Export Data',
    description: 'Download portfolio data',
    icon: Download,
    onClick: () => {},
    variant: 'outline',
    badge: 'New',
  },
  {
    id: 'import-data',
    label: 'Import Data',
    description: 'Upload portfolio data',
    icon: Upload,
    onClick: () => {},
    variant: 'outline',
  },
  {
    id: 'analytics',
    label: 'View Analytics',
    description: 'Portfolio performance metrics',
    icon: BarChart3,
    onClick: () => {},
    variant: 'outline',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Configure admin preferences',
    icon: Settings,
    onClick: () => {},
    variant: 'ghost',
  },
  {
    id: 'refresh',
    label: 'Refresh Data',
    description: 'Sync latest changes',
    icon: RefreshCw,
    onClick: () => {},
    variant: 'ghost',
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions = defaultActions,
  layout = 'list',
  maxItems = 8,
  onActionClick,
}) => {
  const displayedActions = actions.slice(0, maxItems);

  const handleActionClick = (action: QuickAction) => {
    action.onClick();
    onActionClick?.(action.id);
  };

  if (layout === 'grid') {
    return (
      <Card className="border-0 shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {displayedActions.map(action => (
              <Button
                key={action.id}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
                variant={action.variant || 'outline'}
                className="relative flex h-auto flex-col items-center gap-2 p-4 text-center"
              >
                {action.badge && (
                  <Badge
                    variant="secondary"
                    className="absolute -right-2 -top-2 px-1.5 py-0.5 text-xs"
                  >
                    {action.badge}
                  </Badge>
                )}
                <action.icon className="h-5 w-5" />
                <div className="text-sm font-medium">{action.label}</div>
                {action.description && (
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedActions.map(action => (
          <Button
            key={action.id}
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            variant={action.variant || 'outline'}
            className="group relative w-full justify-start transition-all duration-200 hover:shadow-md"
          >
            {action.badge && (
              <Badge
                variant="secondary"
                className="absolute -right-1 -top-1 px-1.5 py-0.5 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              >
                {action.badge}
              </Badge>
            )}
            <action.icon className="mr-3 h-4 w-4" />
            <div className="flex-1 text-left">
              <div className="font-medium">{action.label}</div>
              {action.description && (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {action.description}
                </div>
              )}
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
