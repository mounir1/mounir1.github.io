import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Eye,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
  Monitor,
  Smartphone,
  Globe,
  Users,
  MousePointer,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Performance metrics interfaces
interface CoreWebVitals {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
  INP?: number; // Interaction to Next Paint
}

interface PerformanceMetrics {
  id: string;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  vitals: CoreWebVitals;
  customMetrics: Record<string, number>;
  errors: ErrorInfo[];
}

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  lineNumber?: number;
  columnNumber?: number;
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'hover' | 'focus' | 'form_submit' | 'page_view';
  element?: string;
  timestamp: number;
  duration?: number;
  path: string;
  metadata?: Record<string, any>;
}

interface AnalyticsEvent {
  name: string;
  category: 'engagement' | 'performance' | 'error' | 'conversion';
  value?: number;
  timestamp: number;
  properties: Record<string, any>;
}

// Performance thresholds based on Core Web Vitals
const PERFORMANCE_THRESHOLDS = {
  FCP: { good: 1800, needs_improvement: 3000 },
  LCP: { good: 2500, needs_improvement: 4000 },
  FID: { good: 100, needs_improvement: 300 },
  CLS: { good: 0.1, needs_improvement: 0.25 },
  TTFB: { good: 800, needs_improvement: 1800 },
};

// Device detection
const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Connection info detection
const getConnectionInfo = () => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return undefined;
  }

  const conn = (navigator as any).connection;
  return {
    effectiveType: conn?.effectiveType,
    downlink: conn?.downlink,
    rtt: conn?.rtt,
    saveData: conn?.saveData,
  };
};

// Core Web Vitals measurement hook
const useCoreWebVitals = () => {
  const [vitals, setVitals] = useState<Partial<CoreWebVitals>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // FCP - First Contentful Paint
    const measureFCP = () => {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(
          entry => entry.name === 'first-contentful-paint'
        );
        if (fcpEntry) {
          setVitals(prev => ({ ...prev, FCP: fcpEntry.startTime }));
          observer.disconnect();
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    };

    // LCP - Largest Contentful Paint
    const measureLCP = () => {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setVitals(prev => ({ ...prev, LCP: lastEntry.startTime }));
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    };

    // FID - First Input Delay
    const measureFID = () => {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          setVitals(prev => ({
            ...prev,
            FID: entry.processingStart - entry.startTime,
          }));
        });
        observer.disconnect();
      });
      observer.observe({ entryTypes: ['first-input'] });
    };

    // CLS - Cumulative Layout Shift
    const measureCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            setVitals(prev => ({ ...prev, CLS: clsValue }));
          }
        });
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    };

    // TTFB - Time to First Byte
    const measureTTFB = () => {
      const navEntry = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navEntry) {
        const ttfb = navEntry.responseStart - navEntry.requestStart;
        setVitals(prev => ({ ...prev, TTFB: ttfb }));
      }
    };

    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();
    measureTTFB();

    // Cleanup function
    return () => {
      // Observers are automatically cleaned up when component unmounts
    };
  }, []);

  return vitals;
};

// Error tracking hook
const useErrorTracking = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorInfo: ErrorInfo = {
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: event.filename || window.location.href,
        lineNumber: event.lineno,
        columnNumber: event.colno,
      };

      setErrors(prev => [...prev.slice(-9), errorInfo]); // Keep last 10 errors
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorInfo: ErrorInfo = {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: Date.now(),
        url: window.location.href,
      };

      setErrors(prev => [...prev.slice(-9), errorInfo]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, []);

  return errors;
};

// User interaction tracking hook
const useInteractionTracking = () => {
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);

  const trackInteraction = useCallback(
    (interaction: Omit<UserInteraction, 'timestamp'>) => {
      const fullInteraction: UserInteraction = {
        ...interaction,
        timestamp: Date.now(),
      };

      setInteractions(prev => [...prev.slice(-49), fullInteraction]); // Keep last 50 interactions
    },
    []
  );

  useEffect(() => {
    // Track page views
    trackInteraction({
      type: 'page_view',
      path: window.location.pathname,
    });

    // Track clicks
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      trackInteraction({
        type: 'click',
        element:
          target.tagName.toLowerCase() + (target.id ? `#${target.id}` : ''),
        path: window.location.pathname,
        metadata: {
          x: event.clientX,
          y: event.clientY,
        },
      });
    };

    // Track scroll
    let scrollTimer: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        trackInteraction({
          type: 'scroll',
          path: window.location.pathname,
          metadata: {
            scrollY: window.scrollY,
            scrollPercent: Math.round(
              (window.scrollY /
                (document.body.scrollHeight - window.innerHeight)) *
                100
            ),
          },
        });
      }, 100);
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [trackInteraction]);

  return { interactions, trackInteraction };
};

// Analytics provider hook
const useAnalytics = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  const trackEvent = useCallback((event: Omit<AnalyticsEvent, 'timestamp'>) => {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };

    setEvents(prev => [...prev.slice(-99), fullEvent]); // Keep last 100 events

    // Send to external analytics (Google Analytics, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, {
        event_category: event.category,
        value: event.value,
        ...event.properties,
      });
    }
  }, []);

  return { events, trackEvent };
};

// Performance score calculation
const calculatePerformanceScore = (vitals: CoreWebVitals): number => {
  const scores = {
    FCP:
      vitals.FCP <= PERFORMANCE_THRESHOLDS.FCP.good
        ? 100
        : vitals.FCP <= PERFORMANCE_THRESHOLDS.FCP.needs_improvement
          ? 75
          : 50,
    LCP:
      vitals.LCP <= PERFORMANCE_THRESHOLDS.LCP.good
        ? 100
        : vitals.LCP <= PERFORMANCE_THRESHOLDS.LCP.needs_improvement
          ? 75
          : 50,
    FID:
      vitals.FID <= PERFORMANCE_THRESHOLDS.FID.good
        ? 100
        : vitals.FID <= PERFORMANCE_THRESHOLDS.FID.needs_improvement
          ? 75
          : 50,
    CLS:
      vitals.CLS <= PERFORMANCE_THRESHOLDS.CLS.good
        ? 100
        : vitals.CLS <= PERFORMANCE_THRESHOLDS.CLS.needs_improvement
          ? 75
          : 50,
    TTFB:
      vitals.TTFB <= PERFORMANCE_THRESHOLDS.TTFB.good
        ? 100
        : vitals.TTFB <= PERFORMANCE_THRESHOLDS.TTFB.needs_improvement
          ? 75
          : 50,
  };

  return Math.round(
    Object.values(scores).reduce((sum, score) => sum + score, 0) /
      Object.values(scores).length
  );
};

// Performance status component
interface PerformanceStatusProps {
  metric: keyof CoreWebVitals;
  value: number;
  unit?: string;
}

const PerformanceStatus: React.FC<PerformanceStatusProps> = ({
  metric,
  value,
  unit = 'ms',
}) => {
  const threshold = PERFORMANCE_THRESHOLDS[metric];
  if (!threshold) return null;

  const status =
    value <= threshold.good
      ? 'good'
      : value <= threshold.needs_improvement
        ? 'needs_improvement'
        : 'poor';

  const statusConfig = {
    good: { color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
    needs_improvement: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      icon: AlertTriangle,
    },
    poor: { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-lg p-3', config.bg)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium">{metric}</span>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>
      <div className={cn('text-2xl font-bold', config.color)}>
        {value.toFixed(metric === 'CLS' ? 3 : 0)}
        {metric !== 'CLS' && unit}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        Good: ≤{threshold.good}
        {metric !== 'CLS' && unit}
      </div>
    </div>
  );
};

// Main performance monitor component
export interface PerformanceMonitorProps {
  className?: string;
  enableRealTime?: boolean;
  enableAnalytics?: boolean;
  enableErrorTracking?: boolean;
  enableInteractionTracking?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  onError?: (error: ErrorInfo) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  className,
  enableRealTime = true,
  enableAnalytics = true,
  enableErrorTracking = true,
  enableInteractionTracking = true,
  onMetricsUpdate,
  onError,
}) => {
  const vitals = useCoreWebVitals();
  const errors = useErrorTracking();
  const { interactions, trackInteraction } = useInteractionTracking();
  const { events, trackEvent } = useAnalytics();

  const [isVisible, setIsVisible] = useState(false);
  const [performanceScore, setPerformanceScore] = useState<number>(0);

  // Calculate performance score when vitals change
  useEffect(() => {
    if (Object.keys(vitals).length > 0) {
      const score = calculatePerformanceScore(vitals as CoreWebVitals);
      setPerformanceScore(score);
    }
  }, [vitals]);

  // Report errors
  useEffect(() => {
    if (errors.length > 0 && onError) {
      onError(errors[errors.length - 1]);
    }
  }, [errors, onError]);

  // Generate performance metrics report
  const generateMetrics = useCallback((): PerformanceMetrics => {
    return {
      id: `perf_${Date.now()}`,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: getConnectionInfo()?.effectiveType,
      deviceType: detectDeviceType(),
      vitals: vitals as CoreWebVitals,
      customMetrics: {
        performanceScore,
        interactionCount: interactions.length,
        errorCount: errors.length,
        eventCount: events.length,
      },
      errors,
    };
  }, [vitals, performanceScore, interactions, errors, events]);

  // Export performance data
  const exportMetrics = () => {
    const metrics = generateMetrics();
    const blob = new Blob([JSON.stringify(metrics, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className={cn('fixed bottom-4 right-4 z-50 gap-2', className)}
      >
        <Activity className="h-4 w-4" />
        Performance
      </Button>
    );
  }

  return (
    <Card className={cn('fixed bottom-4 right-4 z-50 w-80', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                performanceScore >= 90
                  ? 'default'
                  : performanceScore >= 75
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {performanceScore}/100
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="max-h-96 space-y-4 overflow-auto">
        {/* Core Web Vitals */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Core Web Vitals</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(vitals).map(([metric, value]) => (
              <PerformanceStatus
                key={metric}
                metric={metric as keyof CoreWebVitals}
                value={value}
                unit={metric === 'CLS' ? '' : 'ms'}
              />
            ))}
          </div>
        </div>

        {/* Device & Connection Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            {detectDeviceType() === 'mobile' ? (
              <Smartphone className="h-4 w-4" />
            ) : detectDeviceType() === 'tablet' ? (
              <Monitor className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
            <span className="capitalize">{detectDeviceType()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{getConnectionInfo()?.effectiveType || 'Unknown'}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">
              {interactions.length}
            </div>
            <div className="text-xs text-muted-foreground">Interactions</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {events.length}
            </div>
            <div className="text-xs text-muted-foreground">Events</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {errors.length}
            </div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
        </div>

        {/* Recent Errors */}
        {errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-600">Recent Errors</h4>
            <div className="max-h-20 space-y-1 overflow-auto">
              {errors.slice(-3).map((error, index) => (
                <div
                  key={index}
                  className="rounded bg-red-50 p-2 text-xs text-red-800"
                >
                  {error.message.substring(0, 50)}...
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportMetrics}
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex-1 gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Analytics dashboard component
export interface AnalyticsDashboardProps {
  events: AnalyticsEvent[];
  interactions: UserInteraction[];
  className?: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  events,
  interactions,
  className,
}) => {
  const eventsByCategory = events.reduce(
    (acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const interactionsByType = interactions.reduce(
    (acc, interaction) => {
      acc[interaction.type] = (acc[interaction.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Categories */}
        <div>
          <h4 className="mb-3 font-medium">Events by Category</h4>
          <div className="space-y-2">
            {Object.entries(eventsByCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm capitalize">
                  {category.replace('_', ' ')}
                </span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Interaction Types */}
        <div>
          <h4 className="mb-3 font-medium">Interactions by Type</h4>
          <div className="space-y-2">
            {Object.entries(interactionsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm capitalize">
                  {type.replace('_', ' ')}
                </span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="mb-3 font-medium">Recent Activity</h4>
          <div className="max-h-32 space-y-1 overflow-auto">
            {[...events, ...interactions]
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 5)
              .map((item, index) => (
                <div key={index} className="rounded bg-muted p-2 text-xs">
                  {'name' in item
                    ? `Event: ${item.name}`
                    : `${item.type} interaction`}
                  <span className="ml-2 text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Export component interfaces
export interface PerformanceMonitorInterface {
  className?: string;
  enableRealTime?: boolean;
  enableAnalytics?: boolean;
  enableErrorTracking?: boolean;
  enableInteractionTracking?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  onError?: (error: ErrorInfo) => void;
}

export default PerformanceMonitor;
