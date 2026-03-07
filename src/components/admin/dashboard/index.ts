/**
 * Admin Dashboard Components
 */

export { DashboardOverview } from './DashboardOverview';
export { StatsGrid } from './StatsGrid';
export { QuickActions } from './QuickActions';
export { RecentActivity } from './RecentActivity';

export type {
  DashboardOverviewProps,
  StatsGridProps,
  QuickActionsProps,
  RecentActivityProps,
  StatCard,
  QuickAction,
  ActivityItem,
} from './types';

export default {
  DashboardOverview: () => import('./DashboardOverview'),
  StatsGrid: () => import('./StatsGrid'),
  QuickActions: () => import('./QuickActions'),
  RecentActivity: () => import('./RecentActivity'),
};
