import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { AdminStats } from '@/hooks/useAdminStats';
import {
  FolderOpen,
  Award,
  Activity,
  Code2,
  Star,
  Layers,
  Target,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  iconClassName?: string;
  description?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  gradient,
  iconClassName,
  description,
  onClick,
}) => (
  <Card
    className={cn(
      gradient,
      'border-0 text-white transition-all duration-300',
      onClick && 'cursor-pointer hover:scale-[1.02]'
    )}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-white/60">{description}</p>
          )}
        </div>
        <div
          className={cn(
            'transition-transform duration-300',
            iconClassName || 'text-white/80'
          )}
        >
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface StatsGridProps {
  stats: AdminStats;
  className?: string;
  onStatClick?: (statType: string) => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  className,
  onStatClick,
}) => {
  const cards: (StatCardProps & { statType: string })[] = [
    {
      title: 'Total Projects',
      value: stats.projects.total,
      icon: <FolderOpen className="h-8 w-8" />,
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
      description: `${stats.projects.active} active`,
      statType: 'total-projects',
    },
    {
      title: 'Featured Projects',
      value: stats.projects.featured,
      icon: <Award className="h-8 w-8" />,
      gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      description: `${stats.projects.categories} categories`,
      statType: 'featured-projects',
    },
    {
      title: 'Skills Overview',
      value: stats.skills.total,
      icon: <Code2 className="h-8 w-8" />,
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
      description: `${stats.skills.featured} featured`,
      statType: 'skills',
    },
    {
      title: 'Recent Updates',
      value: stats.projects.recentlyUpdated,
      icon: <Activity className="h-8 w-8" />,
      gradient: 'bg-gradient-to-r from-orange-500 to-orange-600',
      description: 'Last 7 days',
      statType: 'recent-updates',
    },
    {
      title: 'Project Categories',
      value: stats.projects.categories,
      icon: <Layers className="h-8 w-8" />,
      gradient: 'bg-gradient-to-r from-pink-500 to-pink-600',
      description: 'Unique categories',
      statType: 'categories',
    },
  ];

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5',
        className
      )}
    >
      {cards.map((card, index) => (
        <StatCard
          key={index}
          {...card}
          onClick={onStatClick ? () => onStatClick(card.statType) : undefined}
        />
      ))}
    </div>
  );
};

export default StatsGrid;
