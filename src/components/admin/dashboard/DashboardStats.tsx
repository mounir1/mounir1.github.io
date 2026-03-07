import React from 'react';
import { Card } from '@/components/ui/card';
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  Users,
  Eye,
  Activity,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  change?: number;
  changeTimeframe?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  change,
  changeTimeframe = 'from last month',
  className,
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-muted p-2">{icon}</div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
        </div>
        {change && (
          <div className="flex items-center space-x-1">
            {isPositive ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500" />
            ) : isNegative ? (
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowRightIcon className="h-4 w-4 text-yellow-500" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                isPositive && 'text-green-500',
                isNegative && 'text-red-500'
              )}
            >
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {description} {change && changeTimeframe}
      </p>
    </Card>
  );
};

export const DashboardStats: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Users"
        value="2,543"
        description="Active users"
        icon={<Users className="h-4 w-4" />}
        change={12}
      />
      <StatCard
        title="Page Views"
        value="1.2M"
        description="Total views"
        icon={<Eye className="h-4 w-4" />}
        change={-2.5}
      />
      <StatCard
        title="Session Duration"
        value="2.5m"
        description="Average time"
        icon={<Clock className="h-4 w-4" />}
        change={0}
      />
      <StatCard
        title="Bounce Rate"
        value="42%"
        description="Page exits"
        icon={<Activity className="h-4 w-4" />}
        change={-8}
      />
    </div>
  );
};

export const EnhancedStats: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, Mounir!
        </h2>
        <p className="text-muted-foreground">
          Here's an overview of your portfolio stats
        </p>
      </div>
      <DashboardStats />
    </div>
  );
};
