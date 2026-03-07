/**
 * Admin Dashboard Types
 */

import { BaseProps } from '@/types';

export interface DashboardOverviewProps extends BaseProps {
  stats?: AdminStats;
  loading?: boolean;
  error?: string;
}

export interface StatsGridProps extends BaseProps {
  stats: AdminStats;
  loading?: boolean;
  columns?: 2 | 3 | 4;
  showTrends?: boolean;
}

export interface QuickActionsProps extends BaseProps {
  actions: QuickAction[];
  layout?: 'grid' | 'list';
  maxItems?: number;
}

export interface RecentActivityProps extends BaseProps {
  activities: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
  showTimestamp?: boolean;
}

export interface AdminStats {
  projects: ProjectStats;
  skills: SkillStats;
  totalViews: number;
  totalInteractions: number;
  lastUpdated: Date;
}

export interface ProjectStats {
  total: number;
  featured: number;
  active: number;
  categories: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  recentActivity: ActivityItem[];
}

export interface SkillStats {
  total: number;
  featured: number;
  byCategory: Record<string, number>;
  averageLevel: number;
  topSkills: Array<{ name: string; level: number }>;
}

export interface StatCard {
  title: string;
  value: number | string;
  icon: React.ComponentType;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  onClick?: () => void;
}

export interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export interface ActivityItem {
  id: string;
  type: 'created' | 'updated' | 'deleted';
  entity: 'project' | 'skill' | 'experience';
  entityId: string;
  entityName: string;
  timestamp: Date;
  user?: string;
  description?: string;
}
