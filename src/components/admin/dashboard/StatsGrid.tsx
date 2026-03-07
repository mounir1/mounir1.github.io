import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { AdminStats } from '@/hooks/useAdminStats';
import {
  FolderOpen,
  Award,
  Activity,
  BarChart3,
  Code2,
  Star,
  Layers,
  Target,
  Clock,
  TrendingUp,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useSkills } from '@/hooks/useSkills';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  onClick,
}) => {
  return (
    <Card
      className={`border-0 shadow-medium transition-all duration-300 hover:shadow-lg ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 ${color} rounded-xl`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">{title}</div>
            {trend && (
              <div className="mt-1 flex items-center gap-1">
                <TrendingUp
                  className={`h-3 w-3 ${
                    trend.direction === 'up'
                      ? 'text-green-500'
                      : trend.direction === 'down'
                        ? 'text-red-500'
                        : 'text-gray-500'
                  }`}
                />
                <span
                  className={`text-xs ${
                    trend.direction === 'up'
                      ? 'text-green-500'
                      : trend.direction === 'down'
                        ? 'text-red-500'
                        : 'text-gray-500'
                  }`}
                >
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface StatsGridProps {
  columns?: 2 | 3 | 4;
  showTrends?: boolean;
  onStatClick?: (statType: string) => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  columns = 4,
  showTrends = true,
  onStatClick,
}) => {
  const { projects, loading: projectsLoading } = useProjects();
  const { skills, loading: skillsLoading } = useSkills();

  const stats = useMemo(() => {
    const projectStats = {
      total: projects.length,
      featured: projects.filter(p => p.featured).length,
      active: projects.filter(p => !p.disabled).length,
      completed: projects.filter(p => p.status === 'completed').length,
      inProgress: projects.filter(p => p.status === 'in-progress').length,
      categories: [...new Set(projects.map(p => p.category))].length,
      featuredRate:
        projects.length > 0
          ? Math.round(
              (projects.filter(p => p.featured).length / projects.length) * 100
            )
          : 0,
    };

    const skillStats = {
      total: skills.length,
      featured: skills.filter(s => s.featured).length,
      categories: [...new Set(skills.map(s => s.category))].length,
      averageLevel:
        skills.length > 0
          ? Math.round(
              skills.reduce((acc: number, s: any) => acc + s.level, 0) /
                skills.length
            )
          : 0,
    };

    return {
      projects: projectStats,
      skills: skillStats,
    };
  }, [projects, skills]);

  if (projectsLoading || skillsLoading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-${columns} gap-6`}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Card key={i} className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="animate-pulse rounded-xl bg-muted p-3">
                  <div className="h-6 w-6 rounded bg-muted-foreground/20" />
                </div>
                <div className="flex-1">
                  <div className="mb-2 h-8 animate-pulse rounded bg-muted-foreground/20" />
                  <div className="h-4 animate-pulse rounded bg-muted-foreground/20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.projects.total,
      icon: Database,
      color: 'bg-primary/10 text-primary',
      trend: showTrends ? { value: 12, direction: 'up' as const } : undefined,
      onClick: () => onStatClick?.('projects'),
    },
    {
      title: 'Featured Projects',
      value: stats.projects.featured,
      icon: Star,
      color: 'bg-yellow-500/10 text-yellow-500',
      trend: showTrends ? { value: 8, direction: 'up' as const } : undefined,
      onClick: () => onStatClick?.('featured-projects'),
    },
    {
      title: 'Active Projects',
      value: stats.projects.active,
      icon: CheckCircle2,
      color: 'bg-green-500/10 text-green-500',
      trend: showTrends ? { value: 5, direction: 'up' as const } : undefined,
      onClick: () => onStatClick?.('active-projects'),
    },
    {
      title: 'Project Categories',
      value: stats.projects.categories,
      icon: Layers,
      color: 'bg-blue-500/10 text-blue-500',
      trend: showTrends
        ? { value: 0, direction: 'neutral' as const }
        : undefined,
      onClick: () => onStatClick?.('categories'),
    },
    {
      title: 'Completed Projects',
      value: stats.projects.completed,
      icon: Target,
      color: 'bg-purple-500/10 text-purple-500',
      trend: showTrends ? { value: 15, direction: 'up' as const } : undefined,
      onClick: () => onStatClick?.('completed-projects'),
    },
    {
      title: 'In Progress',
      value: stats.projects.inProgress,
      icon: Clock,
      color: 'bg-orange-500/10 text-orange-500',
      trend: showTrends ? { value: -3, direction: 'down' as const } : undefined,
      onClick: () => onStatClick?.('in-progress-projects'),
    },
    {
      title: 'Total Skills',
      value: stats.skills.total,
      icon: Award,
      color: 'bg-indigo-500/10 text-indigo-500',
      trend: showTrends ? { value: 7, direction: 'up' as const } : undefined,
      onClick: () => onStatClick?.('skills'),
    },
    {
      title: 'Featured Rate',
      value: `${stats.projects.featuredRate}%`,
      icon: Activity,
      color: 'bg-pink-500/10 text-pink-500',
      trend: showTrends ? { value: 2, direction: 'up' as const } : undefined,
      onClick: () => onStatClick?.('featured-rate'),
    },
  ];

  // Show only the number of cards based on columns prop
  const displayedCards = statCards.slice(0, columns);

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-${columns} gap-6`}
    >
      {displayedCards.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
          onClick={stat.onClick}
        />
      ))}
    </div>
  );
};

export default StatsGrid;
