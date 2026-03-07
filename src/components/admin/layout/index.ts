/**
 * Admin Layout Components
 */

export { AdminLayout } from './AdminLayout';
export { AdminHeader } from './AdminHeader';
export { AdminSidebar } from './AdminSidebar';
export { AdminBreadcrumb } from './AdminBreadcrumb';

// Type exports will be added when types file exists

export default {
  AdminLayout: () => import('./AdminLayout'),
  AdminHeader: () => import('./AdminHeader'),
  AdminSidebar: () => import('./AdminSidebar'),
  AdminBreadcrumb: () => import('./AdminBreadcrumb'),
};
