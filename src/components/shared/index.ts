/**
 * Shared components index
 * Centralized exports for all shared components
 */

// Base components
export * from './BaseComponents';

// Enhanced components (consolidated)
// export { LoadingState } from './BaseComponents'; // Already exported via * from './BaseComponents'
export { ErrorBoundary } from './ErrorBoundary';
export { EmptyStates } from './EmptyStates';

// Higher-order components
export {
  withErrorBoundary,
  SimpleErrorBoundary,
  withSimpleErrorBoundary,
} from './ErrorBoundary.hoc';

// Specialized components
export * from './ConfirmDialog';
// export * from './FormBuilder'; // Commented out since FormBuilder doesn't exist
// export * from './FormFields'; // Commented out since FormFields doesn't exist
// export * from './VirtualScroll'; // Commented out since VirtualScroll doesn't exist
export * from './LazyLoading';
export * from './ResponsiveDesign';
export * from './MobileOptimized';
export * from './AccessibleComponents';
// export * from './AnalyticsCharts'; // Commented out since AnalyticsCharts doesn't exist

// Performance components
export * from './PerformanceMonitor';
// export * from './PerformanceOptimizations'; // Commented out since PerformanceOptimizations doesn't exist

// Default export with commonly used components
import { ErrorBoundary } from './ErrorBoundary';
import { EmptyStates } from './EmptyStates';
import * as BaseComponents from './BaseComponents';

export default {
  ErrorBoundary,
  EmptyStates,
  ...BaseComponents,
};
