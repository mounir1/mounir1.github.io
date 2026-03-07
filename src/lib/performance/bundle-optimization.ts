/**
 * Modern Bundle Optimization Utilities
 * Implements code splitting, tree shaking, and dynamic imports
 */

import { lazy, ComponentType } from 'react';

// Dynamic import with retry logic
export const dynamicImport = async <T = any>(
  importFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Dynamic import failed after retries');
};

// Lazy component with loading and error boundaries
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  return lazy(async () => {
    try {
      return await dynamicImport(importFn);
    } catch (error) {
      console.error('Failed to load component:', error);
      // Return fallback component or empty component
      return {
        default: fallback || (() => null),
      };
    }
  });
};

// Preload components for better performance
export const preloadComponent = (importFn: () => Promise<any>) => {
  const componentImport = importFn();
  return componentImport;
};

// Bundle analyzer utilities
export const bundleAnalyzer = {
  // Measure bundle size impact
  measureBundleSize: async (
    moduleName: string,
    importFn: () => Promise<any>
  ) => {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    try {
      await importFn();
      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;

      return {
        module: moduleName,
        loadTime: endTime - startTime,
        memoryImpact: endMemory - startMemory,
        success: true,
      };
    } catch (error) {
      return {
        module: moduleName,
        loadTime: 0,
        memoryImpact: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Track chunk loading performance
  trackChunkLoading: () => {
    const chunks: Array<{
      name: string;
      size: number;
      loadTime: number;
      timestamp: number;
    }> = [];

    // Monitor script loading
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('chunk') || entry.name.includes('js')) {
          chunks.push({
            name: entry.name,
            size: (entry as any).transferSize || 0,
            loadTime: entry.duration,
            timestamp: entry.startTime,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    return {
      getChunks: () => chunks,
      stop: () => observer.disconnect(),
    };
  },
};

// Modern ES features detection and polyfill loading
export const modernFeatures = {
  // Check if modern ES features are supported
  checkSupport: () => {
    const features = {
      esModules: 'noModule' in HTMLScriptElement.prototype,
      dynamicImport: (() => {
        try {
          // This will throw if dynamic imports are not supported
          new Function('import("")');
          return true;
        } catch {
          return false;
        }
      })(),
      asyncAwait:
        (async () => {})().constructor === async function () {}.constructor,
      optionalChaining: (() => {
        try {
          return eval('({})?.test') === undefined;
        } catch {
          return false;
        }
      })(),
      nullishCoalescing: (() => {
        try {
          return eval('null ?? "test"') === 'test';
        } catch {
          return false;
        }
      })(),
      bigInt: typeof BigInt !== 'undefined',
      webAssembly: typeof WebAssembly !== 'undefined',
    };

    return features;
  },

  // Load polyfills only when needed
  loadPolyfills: async () => {
    const support = modernFeatures.checkSupport();
    const polyfills: Promise<any>[] = [];

    if (!support.optionalChaining || !support.nullishCoalescing) {
      polyfills.push(
        dynamicImport(() => import('core-js/features/object/from-entries'))
      );
    }

    if (!support.bigInt) {
      polyfills.push(dynamicImport(() => import('big-integer')));
    }

    await Promise.all(polyfills);
  },
};

// Tree shaking utilities
export const treeShaking = {
  // Mark functions for tree shaking
  markForTreeShaking: (fn: Function, used = false) => {
    if (!used && process.env.NODE_ENV === 'production') {
      // In production, unused functions will be tree-shaken
      return undefined;
    }
    return fn;
  },

  // Conditional imports based on usage
  conditionalImport: async <T>(
    condition: boolean,
    importFn: () => Promise<T>
  ): Promise<T | null> => {
    if (!condition) return null;
    return await importFn();
  },

  // Dead code elimination helper
  eliminateDeadCode: (code: Record<string, any>, usedKeys: string[]) => {
    const result: Record<string, any> = {};
    usedKeys.forEach(key => {
      if (key in code) {
        result[key] = code[key];
      }
    });
    return result;
  },
};

// Code splitting strategies
export const codeSplitting = {
  // Route-based splitting
  createRouteComponent: (
    importFn: () => Promise<{ default: ComponentType<any> }>
  ) => {
    return createLazyComponent(importFn);
  },

  // Feature-based splitting
  createFeatureComponent: (
    featureName: string,
    importFn: () => Promise<{ default: ComponentType<any> }>
  ) => {
    return createLazyComponent(importFn);
  },

  // Vendor splitting configuration
  getVendorSplitConfig: () => ({
    react: ['react', 'react-dom'],
    ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
    utils: ['date-fns', 'lodash-es'],
    charts: ['recharts', 'd3'],
    forms: ['react-hook-form', 'zod'],
  }),

  // Dynamic chunk loading with priorities
  loadChunkWithPriority: async (
    importFn: () => Promise<any>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const delay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 500;

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return await dynamicImport(importFn);
  },
};

// Performance monitoring
export const performanceMonitoring = {
  // Monitor bundle loading performance
  monitorBundlePerformance: () => {
    const metrics = {
      totalBundleSize: 0,
      loadTime: 0,
      chunks: [] as Array<{ name: string; size: number; loadTime: number }>,
    };

    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          const size = (entry as any).transferSize || 0;
          metrics.totalBundleSize += size;
          metrics.loadTime = Math.max(
            metrics.loadTime,
            entry.startTime + entry.duration
          );

          metrics.chunks.push({
            name: entry.name.split('/').pop() || entry.name,
            size,
            loadTime: entry.duration,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    return {
      getMetrics: () => metrics,
      stop: () => observer.disconnect(),
    };
  },

  // Web Vitals tracking
  trackWebVitals: () => {
    const vitals = {
      FCP: 0, // First Contentful Paint
      LCP: 0, // Largest Contentful Paint
      FID: 0, // First Input Delay
      CLS: 0, // Cumulative Layout Shift
      TTFB: 0, // Time to First Byte
    };

    // Track FCP
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          vitals.FCP = entry.startTime;
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // Track LCP
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      vitals.LCP = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Track FID
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        vitals.FID = (entry as any).processingStart - entry.startTime;
      }
    }).observe({ entryTypes: ['first-input'] });

    // Track CLS
    let clsValue = 0;
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          vitals.CLS = clsValue;
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });

    // Track TTFB
    const navigationEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      vitals.TTFB =
        navigationEntry.responseStart - navigationEntry.requestStart;
    }

    return vitals;
  },
};

// Export lazy-loaded admin components
export const AdminComponents = {
  Dashboard: createLazyComponent(
    () => import('@/components/admin/AdminDashboard')
  ),
  Projects: createLazyComponent(
    () => import('@/components/admin/projects/ProjectsTab')
  ),
  Skills: createLazyComponent(
    () => import('@/components/admin/skills/SkillsTab')
  ),
  Analytics: createLazyComponent(
    () => import('@/components/admin/analytics/AnalyticsTab')
  ),
};

// Export lazy-loaded portfolio components
export const PortfolioComponents = {
  Hero: createLazyComponent(() => import('@/components/portfolio/Hero')),
  Projects: createLazyComponent(
    () => import('@/components/portfolio/Projects')
  ),
  Skills: createLazyComponent(() => import('@/components/portfolio/Skills')),
  Contact: createLazyComponent(() => import('@/components/portfolio/Contact')),
};
