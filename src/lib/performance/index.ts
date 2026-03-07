/**
 * Performance Optimization Index
 * Centralized exports for all performance optimization utilities
 */

// Image optimization
export * from './image-optimization';

// Bundle optimization
export * from './bundle-optimization';

// Web Vitals monitoring
export * from './web-vitals';

// CSS optimization
export * from './css-optimization';

// Performance initialization
export const initializePerformanceOptimizations = async () => {
  const { initializeCSSOptimization } = await import('./css-optimization');
  const { initializeWebVitals } = await import('./web-vitals');

  // Initialize CSS optimizations
  const cssOptimizations = initializeCSSOptimization();

  // Initialize Web Vitals tracking
  const webVitalsTracker = initializeWebVitals({
    FCP: 1800,
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    TTFB: 800,
  });

  return {
    cssOptimizations,
    webVitalsTracker,
  };
};
