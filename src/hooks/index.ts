/**
 * Hooks Index
 * Centralized exports for all custom hooks
 */

// Core hooks
export { useDebounce } from './use-debounce';
export { useMobile } from './use-mobile';
export { useToast } from './use-toast';

// Admin hooks
export { useAdminAuth } from './useAdminAuth';
export { useAdminActions } from './useAdminActions';
export { useAdminNavigation } from './useAdminNavigation';
export { useAdminActivityLogging } from './useAdminActivityLogging';

// Data hooks
export { useProjects } from './useProjects';
export { useSkills } from './useSkills';

// Utility hooks
export {
  useFocusManagement,
  useKeyboardNavigation,
  useScreenReader,
  useAriaAttributes,
  useSkipLinks,
  useReducedMotion,
  useHighContrast,
  useColorScheme,
  useRovingTabIndex,
} from './useAccessibility';
export { default as useAccessibility } from './useAccessibility';
export { useAutoSave } from './useAutoSave';
export { usePerformanceMonitoring } from './usePerformanceMonitoring';
export { useUserTracking } from './useUserTracking';

// Types
export type { ToastProps } from './use-toast';

// Default exports for lazy loading
export default {
  useAdminAuth: () => import('./useAdminAuth'),
  useProjects: () => import('./useProjects'),
  useSkills: () => import('./useSkills'),
  usePerformanceMonitoring: () => import('./usePerformanceMonitoring'),
};
