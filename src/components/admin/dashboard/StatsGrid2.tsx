import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Project } from '@/hooks/useProjects';
import type { Skill } from '@/hooks/useSkills';
import {
  FolderOpen,
  Award,
  Activity,
  Code2,
  Star,
  Layers,
  Target,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  description?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  gradient,
  trend,
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
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp
                className={cn(
                  'h-3 w-3',
                  trend.direction === 'up'
                    ? 'text-green-300'
                    : trend.direction === 'down'
                      ? 'text-red-300'
                      : 'text-blue-300'
                )}
              />
              <span
                className={cn(
                  'text-xs',
                  trend.direction === 'up'
                    ? 'text-green-300'
                    : trend.direction === 'down'
                      ? 'text-red-300'
                      : 'text-blue-300'
                )}
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className="text-white/80">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

interface StatsData {
  projects: {
    total: number;
    featured: number;
    active: number;
    categories: number;
    recentlyUpdated: number;
  };
  skills: {
    total: number;
    featured: number;
    categories: number;
  };
}

interface StatsGridProps {
  data: StatsData;
  className?: string;
  onStatClick?: (statType: string) => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  data,
  className,
  onStatClick,
}) => {
  const cards: (StatCardProps & { statType: string })[] = [
    {
      title: 'Total Projects',
      value: data.projects.total,
      icon: <FolderOpen className="h-8 w-8" />,
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
      description: `${data.projects.active} active`,
      trend: { value: 12, direction: 'up' },
      statType: 'total-projects',
    },
    {
      title: 'Featured Projects',
      value: data.projects.featured,
      icon: <Award className="h-8 w-8" />,
      gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      description: `${data.projects.categories} categories`,
      trend: { value: 8, direction: 'up' },
      statType: 'featured-projects',
    },
    {
      title: 'Skills Overview',
      value: data.skills.total,
      icon: <Code2 className="h-8 w-8" />,
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
      description: `${data.skills.featured} featured`,
      trend: { value: 15, direction: 'up' },
      statType: 'skills',
    },
    {
      title: 'Recent Updates',
      value: data.projects.recentlyUpdated,
      icon: <Activity className="h-8 w-8" />,
      gradient: 'bg-gradient-to-r from-orange-500 to-orange-600',
      description: 'Last 7 days',
      trend: { value: -3, direction: 'down' },
      statType: 'recent-updates',
    },
    {
      title: 'Categories',
      value: data.projects.categories,
      icon: <Layers className="h-8 w-8" />,
      gradient: 'bg-gradient-to-r from-pink-500 to-pink-600',
      description: `${data.skills.categories} skill categories`,
      trend: { value: 0, direction: 'neutral' },
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

export type { StatsData };
export default StatsGrid;
