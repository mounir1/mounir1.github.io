/**
 * Contexts Index
 * Centralized exports for all context providers
 */

// Core contexts
export {
  AccessibilityContext,
  AccessibilityProvider,
  useAccessibility,
} from './AccessibilityContext';
export { AdminStatsProvider, useAdminStats } from './AdminStatsContext';
export { GlobalStateProvider, useGlobalState } from './GlobalStateContext';

// Export default contexts
export { default as AdminStatsContext } from './AdminStatsContext';
export { default as GlobalStateContext } from './GlobalStateContext';

// Default exports for lazy loading
export default {
  AccessibilityProvider: () =>
    import('./AccessibilityContext').then(m => ({
      default: m.AccessibilityProvider,
    })),
  AdminStatsProvider: () =>
    import('./AdminStatsContext').then(m => ({
      default: m.AdminStatsProvider,
    })),
  GlobalStateProvider: () =>
    import('./GlobalStateContext').then(m => ({
      default: m.GlobalStateProvider,
    })),
};
