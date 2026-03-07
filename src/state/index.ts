/**
 * State Index
 * Centralized exports for all state management modules
 */

// Re-export contexts as state providers
export * from '@/contexts';

// State types
export type { AppState, AuthState, UIState, DataState } from '@/types';

// State utilities
export const createInitialState = () => ({
  auth: {
    user: null,
    loading: false,
    error: null,
  },
  ui: {
    theme: 'light' as const,
    sidebarCollapsed: false,
    activeTab: 'dashboard',
    loading: false,
    notifications: [],
  },
  data: {
    projects: { data: null, loading: false, error: null },
    skills: { data: null, loading: false, error: null },
    experiences: { data: null, loading: false, error: null },
  },
});

// State actions
export const stateActions = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
} as const;

// Default exports for lazy loading
export default {
  GlobalStateProvider: () =>
    import('@/contexts/GlobalStateContext').then(m => ({
      default: m.GlobalStateProvider,
    })),
  AdminStatsProvider: () =>
    import('@/contexts/AdminStatsContext').then(m => ({
      default: m.AdminStatsProvider,
    })),
  AccessibilityProvider: () =>
    import('@/contexts/AccessibilityContext').then(m => ({
      default: m.AccessibilityProvider,
    })),
};
