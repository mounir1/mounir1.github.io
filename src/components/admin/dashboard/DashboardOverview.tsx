import React from 'react';
import { StatsGrid } from './StatsGrid';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface DashboardOverviewProps {
  className?: string;
  onNavigateToTab?: (tab: string) => void;
  onStatClick?: (statType: string) => void;
  onQuickAction?: (actionId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  className,
  onNavigateToTab,
  onStatClick,
  onQuickAction,
}) => {
  const handleStatClick = (statType: string) => {
    onStatClick?.(statType);
    // Navigate to relevant tab based on stat type
    if (statType.includes('project')) {
      onNavigateToTab?.('projects');
    } else if (statType.includes('skill')) {
      onNavigateToTab?.('skills');
    }
  };

  const handleQuickActionClick = (actionId: string) => {
    onQuickAction?.(actionId);
    // Navigate to relevant tab based on action
    switch (actionId) {
      case 'add-project':
        onNavigateToTab?.('add-project');
        break;
      case 'manage-projects':
        onNavigateToTab?.('projects');
        break;
      case 'manage-skills':
        onNavigateToTab?.('skills');
        break;
      case 'analytics':
        onNavigateToTab?.('analytics');
        break;
      case 'settings':
        onNavigateToTab?.('settings');
        break;
    }
  };

  const quickActions = [
    {
      id: 'add-project',
      label: 'Add New Project',
      description: 'Create a new portfolio project',
      icon: () => <BarChart3 className="h-4 w-4" />,
      onClick: () => handleQuickActionClick('add-project'),
      variant: 'default' as const,
    },
    {
      id: 'manage-projects',
      label: 'Manage Projects',
      description: 'View and edit existing projects',
      icon: () => <BarChart3 className="h-4 w-4" />,
      onClick: () => handleQuickActionClick('manage-projects'),
      variant: 'outline' as const,
    },
    {
      id: 'manage-skills',
      label: 'Manage Skills',
      description: 'Update your skills and expertise',
      icon: () => <BarChart3 className="h-4 w-4" />,
      onClick: () => handleQuickActionClick('manage-skills'),
      variant: 'outline' as const,
    },
    {
      id: 'analytics',
      label: 'View Analytics',
      description: 'Portfolio performance metrics',
      icon: () => <BarChart3 className="h-4 w-4" />,
      onClick: () => handleQuickActionClick('analytics'),
      variant: 'outline' as const,
      badge: 'New',
    },
  ];

  return (
    <div className={className}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground">
              Monitor your portfolio performance and manage content
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <StatsGrid
          columns={4}
          showTrends={true}
          onStatClick={handleStatClick}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <RecentActivity
            maxItems={8}
            showActions={true}
            onViewAll={() => onNavigateToTab?.('activity')}
          />
        </div>

        {/* Quick Actions - Takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <QuickActions
            actions={quickActions}
            layout="list"
            maxItems={6}
            onActionClick={handleQuickActionClick}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
