/**
 * Admin Skills Components
 */

export { SkillsTab } from './SkillsTab';
export { SkillForm } from './SkillForm';
export { SkillCard } from './SkillCard';
export { SkillBulkActions } from './SkillBulkActions';

export type {
  SkillsTabProps,
  SkillFormProps,
  SkillCardProps,
  SkillBulkActionsProps,
} from './types';

export default {
  SkillsTab: () => import('./SkillsTab'),
  SkillForm: () => import('./SkillForm'),
  SkillCard: () => import('./SkillCard'),
  SkillBulkActions: () => import('./SkillBulkActions'),
};
