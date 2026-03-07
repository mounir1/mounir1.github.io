/**
 * Components Index
 * Centralized exports for all components
 */

// Admin components
export * from './admin';

// Portfolio components
export * from './portfolio';

// Base components
export {
  BaseCard,
  FormSection,
  BaseFormLayout,
  FormFieldWrapper,
  FormGrid,
  FormActions,
  BaseDataTable,
} from './base';

// Shared components
export { ErrorBoundary, LoadingState } from './shared';

// UI components
export * from './ui/button';
export * from './ui/card';
export * from './ui/input';
export * from './ui/textarea';
export * from './ui/select';
export * from './ui/switch';
export * from './ui/slider';
export * from './ui/badge';
export * from './ui/label';
export * from './ui/form';
export * from './ui/collapsible';
export * from './ui/toast';
export * from './ui/toaster';
export * from './ui/dialog';
export * from './ui/dropdown-menu';
export * from './ui/tabs';
export * from './ui/separator';
export * from './ui/progress';
export * from './ui/alert';
export * from './ui/scroll-area';
export * from './ui/tooltip';
export * from './ui/popover';
export * from './ui/calendar';
export * from './ui/avatar';
export * from './ui/data-table';

// Theme components
export { ThemeProvider, useTheme } from './theme';

// Section components
export {
  HeroSection,
  ProjectsSection,
  SkillsSection,
  ExperienceSection,
} from './sections';

// Utility components
export { FirebaseConfigChecker } from './FirebaseConfigChecker';
export { RUMProvider } from './RUMProvider';

// Default exports for lazy loading
export default {
  // Admin
  AdminDashboard: () => import('./admin/AdminDashboard'),
  ProjectsManager: () => import('./admin/ProjectsManager'),
  SkillsManager: () => import('./admin/SkillsManager'),

  // Portfolio
  HeroSection: () => import('./portfolio/HeroSection'),
  ProjectShowcase: () => import('./portfolio/ProjectShowcase'),
  SkillVisualization: () => import('./portfolio/SkillVisualization'),

  // Shared
  ErrorBoundary: () => import('./shared/ErrorBoundary'),
  LoadingState: () =>
    import('./shared/BaseComponents').then(m => ({ default: m.LoadingState })),

  // UI
  DataTable: () => import('./ui/data-table'),
  Button: () => import('./ui/button'),
  Card: () => import('./ui/card'),
};
