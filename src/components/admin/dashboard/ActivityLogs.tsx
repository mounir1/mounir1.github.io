import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  Settings,
  RefreshCw,
  User,
  Lock,
  Upload,
  Download,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  type:
    | 'create'
    | 'update'
    | 'delete'
    | 'auth'
    | 'settings'
    | 'export'
    | 'import';
  description: string;
  user: string;
  timestamp: string;
  details?: string;
}

const getActivityIcon = (type: ActivityLog['type']) => {
  switch (type) {
    case 'create':
      return Plus;
    case 'update':
      return Edit;
    case 'delete':
      return Trash2;
    case 'auth':
      return Lock;
    case 'settings':
      return Settings;
    case 'export':
      return Download;
    case 'import':
      return Upload;
    default:
      return Activity;
  }
};

const getActivityColor = (type: ActivityLog['type']) => {
  switch (type) {
    case 'create':
      return 'bg-green-500/10 text-green-500';
    case 'update':
      return 'bg-blue-500/10 text-blue-500';
    case 'delete':
      return 'bg-red-500/10 text-red-500';
    case 'auth':
      return 'bg-yellow-500/10 text-yellow-500';
    case 'settings':
      return 'bg-purple-500/10 text-purple-500';
    case 'export':
      return 'bg-teal-500/10 text-teal-500';
    case 'import':
      return 'bg-indigo-500/10 text-indigo-500';
    default:
      return 'bg-slate-500/10 text-slate-500';
  }
};

const recentActivities: ActivityLog[] = [
  {
    id: '1',
    type: 'create',
    description: 'Created new project',
    user: 'mounir@example.com',
    timestamp: '2 minutes ago',
    details: 'Portfolio Website v2',
  },
  {
    id: '2',
    type: 'update',
    description: 'Updated skills',
    user: 'mounir@example.com',
    timestamp: '15 minutes ago',
    details: 'Added React and TypeScript',
  },
  {
    id: '3',
    type: 'auth',
    description: 'New login detected',
    user: 'mounir@example.com',
    timestamp: '1 hour ago',
    details: 'From Chrome on Windows',
  },
  {
    id: '4',
    type: 'settings',
    description: 'Changed site settings',
    user: 'mounir@example.com',
    timestamp: '2 hours ago',
    details: 'Updated theme preferences',
  },
  {
    id: '5',
    type: 'export',
    description: 'Exported project data',
    user: 'mounir@example.com',
    timestamp: '3 hours ago',
  },
];

export const ActivityLogs: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <Card className={className} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map(activity => {
            const Icon = getActivityIcon(activity.type);

            return (
              <div
                key={activity.id}
                className="flex items-start space-x-4 rounded-lg border p-3"
              >
                <div
                  className={cn(
                    'rounded-full p-2',
                    getActivityColor(activity.type)
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.description}
                  </p>
                  {activity.details && (
                    <p className="text-sm text-muted-foreground">
                      {activity.details}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {activity.user}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {activity.type}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
