import { useEffect, useRef, useState, useCallback } from 'react';

// Performance metrics interfaces
export interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte

  // Additional metrics
  domContentLoaded?: number;
  loadComplete?: number;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };

  // Custom metrics
  renderTime?: number;
  componentMountTime?: number;
  apiResponseTime?: number;
}

export interface PerformanceBudget {
  LCP: number; // Max 2.5s
  FID: number; // Max 100ms
  CLS: number; // Max 0.1
  FCP: number; // Max 1.8s
  TTFB: number; // Max 600ms
}

// Default performance budgets
const DEFAULT_BUDGETS: PerformanceBudget = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
  FCP: 1800,
  TTFB: 600,
};

// Performance monitoring hook
export const usePerformanceMonitoring = (
  options: {
    budgets?: Partial<PerformanceBudget>;
    reportingInterval?: number;
    onMetricUpdate?: (metric: string, value: number) => void;
    onBudgetExceeded?: (metric: string, value: number, budget: number) => void;
    enabled?: boolean;
  } = {}
) => {
  const {
    budgets = DEFAULT_BUDGETS,
    reportingInterval = 5000,
    onMetricUpdate,
    onBudgetExceeded,
    enabled = true,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [budgetViolations, setBudgetViolations] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(enabled);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const metricsRef = useRef<PerformanceMetrics>({});

  // Update metrics and check budgets
  const updateMetric = useCallback(
    (metric: keyof PerformanceMetrics, value: number) => {
      metricsRef.current = { ...metricsRef.current, [metric]: value };
      setMetrics({ ...metricsRef.current });

      onMetricUpdate?.(metric, value);

      // Check budget violations
      const budget = budgets[metric as keyof PerformanceBudget];
      if (budget && value > budget) {
        setBudgetViolations(prev => {
          if (!prev.includes(metric)) {
            onBudgetExceeded?.(metric, value, budget);
            return [...prev, metric];
          }
          return prev;
        });
      }
    },
    [budgets, onMetricUpdate, onBudgetExceeded]
  );

  // Observe Core Web Vitals
  useEffect(() => {
    if (!isMonitoring || typeof window === 'undefined') return;

    // LCP Observer
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      updateMetric('LCP', lastEntry.startTime);
    });

    // FID Observer
    const fidObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        updateMetric('FID', entry.processingStart - entry.startTime);
      });
    });

    // CLS Observer
    let clsValue = 0;
    const clsObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          updateMetric('CLS', clsValue);
        }
      });
    });

    // FCP Observer
    const fcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          updateMetric('FCP', entry.startTime);
        }
      });
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      fidObserver.observe({ entryTypes: ['first-input'] });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Navigation timing
    const updateNavigationTiming = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        updateMetric(
          'TTFB',
          navigation.responseStart - navigation.requestStart
        );
        updateMetric(
          'domContentLoaded',
          navigation.domContentLoadedEventEnd - navigation.navigationStart
        );
        updateMetric(
          'loadComplete',
          navigation.loadEventEnd - navigation.navigationStart
        );
      }
    };

    if (document.readyState === 'complete') {
      updateNavigationTiming();
    } else {
      window.addEventListener('load', updateNavigationTiming);
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
      fcpObserver.disconnect();
      window.removeEventListener('load', updateNavigationTiming);
    };
  }, [isMonitoring, updateMetric]);

  // Memory usage monitoring
  useEffect(() => {
    if (!isMonitoring || typeof window === 'undefined') return;

    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        updateMetric('memoryUsage', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        } as any);
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, reportingInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, reportingInterval, updateMetric]);

  // Control functions
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  return {
    metrics: metricsRef.current,
    budgetViolations,
    updateMetric,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  };
};

// Component performance monitoring hook
export const useComponentPerformance = (componentName: string) => {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [mountTime, setMountTime] = useState<number>(0);
  const startTimeRef = useRef<number>(0);
  const mountStartRef = useRef<number>(0);

  // Track component mount time
  useEffect(() => {
    mountStartRef.current = performance.now();

    return () => {
      const mountDuration = performance.now() - mountStartRef.current;
      setMountTime(mountDuration);
    };
  }, []);

  // Track render time
  useEffect(() => {
    startTimeRef.current = performance.now();
  });

  useEffect(() => {
    const renderDuration = performance.now() - startTimeRef.current;
    setRenderTime(renderDuration);
  });

  return {
    renderTime,
    mountTime,
    componentName,
  };
};

// API performance monitoring hook
export const useAPIPerformance = () => {
  const [apiMetrics, setApiMetrics] = useState<Map<string, number[]>>(
    new Map()
  );

  const trackAPICall = useCallback(
    async <T>(url: string, apiCall: () => Promise<T>): Promise<T> => {
      const startTime = performance.now();

      try {
        const result = await apiCall();
        const duration = performance.now() - startTime;

        setApiMetrics(prev => {
          const newMap = new Map(prev);
          const existing = newMap.get(url) || [];
          newMap.set(url, [...existing.slice(-9), duration]); // Keep last 10 calls
          return newMap;
        });

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        setApiMetrics(prev => {
          const newMap = new Map(prev);
          const existing = newMap.get(url) || [];
          newMap.set(url, [...existing.slice(-9), duration]);
          return newMap;
        });
        throw error;
      }
    },
    []
  );

  const getAPIStats = useCallback(
    (url: string) => {
      const times = apiMetrics.get(url) || [];
      if (times.length === 0) return null;

      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);

      return { avg, min, max, count: times.length };
    },
    [apiMetrics]
  );

  return {
    trackAPICall,
    getAPIStats,
    apiMetrics: Array.from(apiMetrics.entries()).map(([url, times]) => ({
      url,
      ...getAPIStats(url),
    })),
  };
};

// Resource loading performance hook
export const useResourcePerformance = () => {
  const [resourceMetrics, setResourceMetrics] = useState<
    Array<{
      name: string;
      type: string;
      size: number;
      duration: number;
      startTime: number;
    }>
  >([]);

  useEffect(() => {
    const updateResourceMetrics = () => {
      const resources = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];

      const metrics = resources.map(resource => ({
        name: resource.name,
        type: resource.initiatorType,
        size: resource.transferSize || 0,
        duration: resource.responseEnd - resource.startTime,
        startTime: resource.startTime,
      }));

      setResourceMetrics(metrics);
    };

    updateResourceMetrics();

    // Listen for new resources
    const observer = new PerformanceObserver(list => {
      updateResourceMetrics();
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Resource performance observer not supported:', error);
    }

    return () => observer.disconnect();
  }, []);

  const getResourceStats = useCallback(() => {
    const byType = resourceMetrics.reduce(
      (acc, resource) => {
        if (!acc[resource.type]) {
          acc[resource.type] = {
            count: 0,
            totalSize: 0,
            totalDuration: 0,
          };
        }

        acc[resource.type].count++;
        acc[resource.type].totalSize += resource.size;
        acc[resource.type].totalDuration += resource.duration;

        return acc;
      },
      {} as Record<
        string,
        { count: number; totalSize: number; totalDuration: number }
      >
    );

    return Object.entries(byType).map(([type, stats]) => ({
      type,
      ...stats,
      avgSize: stats.totalSize / stats.count,
      avgDuration: stats.totalDuration / stats.count,
    }));
  }, [resourceMetrics]);

  return {
    resourceMetrics,
    resourceStats: getResourceStats(),
  };
};

// Performance monitoring context/provider would go here
export const usePerformanceReport = () => {
  const performanceData = usePerformanceMonitoring();
  const resourceData = useResourcePerformance();

  const generateReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: performanceData.metrics,
      budgetViolations: performanceData.budgetViolations,
      resources: resourceData.resourceStats,
      score: calculatePerformanceScore(performanceData.metrics),
    };

    return report;
  }, [performanceData, resourceData]);

  return {
    ...performanceData,
    ...resourceData,
    generateReport,
  };
};

// Calculate performance score (0-100)
function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100;

  // LCP scoring (0-40 points)
  if (metrics.LCP) {
    if (metrics.LCP > 4000) score -= 40;
    else if (metrics.LCP > 2500) score -= 20;
    else if (metrics.LCP > 1200) score -= 10;
  }

  // FID scoring (0-30 points)
  if (metrics.FID) {
    if (metrics.FID > 300) score -= 30;
    else if (metrics.FID > 100) score -= 15;
    else if (metrics.FID > 50) score -= 5;
  }

  // CLS scoring (0-30 points)
  if (metrics.CLS) {
    if (metrics.CLS > 0.25) score -= 30;
    else if (metrics.CLS > 0.1) score -= 15;
    else if (metrics.CLS > 0.05) score -= 5;
  }

  return Math.max(0, Math.round(score));
}

export default usePerformanceMonitoring;
