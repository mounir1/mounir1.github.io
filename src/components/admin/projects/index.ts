/**
 * Admin Projects Components
 */

export { ProjectsTab } from './ProjectsTab';
export { ProjectForm } from './ProjectForm';
export { ProjectCard } from './ProjectCard';
export { ProjectBulkActions } from './ProjectBulkActions';

export type {
  ProjectsTabProps,
  ProjectFormProps,
  ProjectCardProps,
  ProjectBulkActionsProps,
} from './types';

export default {
  ProjectsTab: () => import('./ProjectsTab'),
  ProjectForm: () => import('./ProjectForm'),
  ProjectCard: () => import('./ProjectCard'),
  ProjectBulkActions: () => import('./ProjectBulkActions'),
};
