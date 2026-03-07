/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals and provides performance insights
 */

import React from 'react';

// Web Vitals metrics interface
export interface WebVitalsMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
  INP?: number; // Interaction to Next Paint (new metric)
}

export interface PerformanceEntry {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  id?: string;
}

// Performance thresholds based on Google's recommendations
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

// Rate performance based on thresholds
const ratePerformance = (
  metric: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[metric];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// Web Vitals tracker class
export class WebVitalsTracker {
  private metrics: Partial<WebVitalsMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private callbacks: Array<(entry: PerformanceEntry) => void> = [];

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking() {
    // Track First Contentful Paint (FCP)
    this.trackFCP();

    // Track Largest Contentful Paint (LCP)
    this.trackLCP();

    // Track First Input Delay (FID)
    this.trackFID();

    // Track Cumulative Layout Shift (CLS)
    this.trackCLS();

    // Track Time to First Byte (TTFB)
    this.trackTTFB();

    // Track Interaction to Next Paint (INP) - experimental
    this.trackINP();
  }

  private trackFCP() {
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const value = entry.startTime;
            this.metrics.FCP = value;
            this.reportMetric('FCP', value);
          }
        }
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FCP tracking not supported:', error);
    }
  }

  private trackLCP() {
    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const value = lastEntry.startTime;

        this.metrics.LCP = value;
        this.reportMetric('LCP', value, (lastEntry as any).id);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP tracking not supported:', error);
    }
  }

  private trackFID() {
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const value = (entry as any).processingStart - entry.startTime;
          this.metrics.FID = value;
          this.reportMetric('FID', value);
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID tracking not supported:', error);
    }
  }

  private trackCLS() {
    try {
      let clsValue = 0;

      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.metrics.CLS = clsValue;
            this.reportMetric('CLS', clsValue);
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS tracking not supported:', error);
    }
  }

  private trackTTFB() {
    try {
      const navigationEntry = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const value =
          navigationEntry.responseStart - navigationEntry.requestStart;
        this.metrics.TTFB = value;
        this.reportMetric('TTFB', value);
      }
    } catch (error) {
      console.warn('TTFB tracking not supported:', error);
    }
  }

  private trackINP() {
    try {
      // INP is still experimental, so we'll track it if available
      if ('PerformanceEventTiming' in window) {
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            const value = (entry as any).processingEnd - entry.startTime;
            this.metrics.INP = Math.max(this.metrics.INP || 0, value);
            this.reportMetric('INP', value);
          }
        });

        observer.observe({ entryTypes: ['event'] });
        this.observers.push(observer);
      }
    } catch (error) {
      console.warn('INP tracking not supported:', error);
    }
  }

  private reportMetric(name: string, value: number, id?: string) {
    const entry: PerformanceEntry = {
      name,
      value,
      rating: ratePerformance(name as keyof typeof THRESHOLDS, value),
      timestamp: Date.now(),
      id,
    };

    // Call all registered callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(entry);
      } catch (error) {
        console.error('Error in Web Vitals callback:', error);
      }
    });
  }

  // Public methods
  public onMetric(callback: (entry: PerformanceEntry) => void) {
    this.callbacks.push(callback);
  }

  public getMetrics(): Partial<WebVitalsMetrics> {
    return { ...this.metrics };
  }

  public getPerformanceScore(): number {
    const scores = Object.entries(this.metrics).map(([metric, value]) => {
      const rating = ratePerformance(metric as keyof typeof THRESHOLDS, value);
      switch (rating) {
        case 'good':
          return 100;
        case 'needs-improvement':
          return 50;
        case 'poor':
          return 0;
        default:
          return 0;
      }
    });

    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
  }

  public generateReport(): string {
    const metrics = this.getMetrics();
    const score = this.getPerformanceScore();

    let report = `Performance Report (Score: ${score.toFixed(1)}/100)\n`;
    report += '='.repeat(50) + '\n\n';

    Object.entries(metrics).forEach(([metric, value]) => {
      const rating = ratePerformance(metric as keyof typeof THRESHOLDS, value);
      const emoji =
        rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
      report += `${emoji} ${metric}: ${value.toFixed(2)}ms (${rating})\n`;
    });

    report += '\nRecommendations:\n';
    Object.entries(metrics).forEach(([metric, value]) => {
      const rating = ratePerformance(metric as keyof typeof THRESHOLDS, value);
      if (rating !== 'good') {
        report += `- Improve ${metric}: ${this.getRecommendation(metric as keyof typeof THRESHOLDS)}\n`;
      }
    });

    return report;
  }

  private getRecommendation(metric: keyof typeof THRESHOLDS): string {
    const recommendations = {
      FCP: 'Optimize critical rendering path, reduce server response time, eliminate render-blocking resources',
      LCP: 'Optimize images, improve server response time, remove unused JavaScript',
      FID: 'Reduce JavaScript execution time, break up long tasks, use web workers',
      CLS: 'Include size attributes on images and videos, avoid inserting content above existing content',
      TTFB: 'Optimize server response time, use CDN, enable compression',
      INP: 'Optimize event handlers, reduce JavaScript execution time, use requestIdleCallback',
    };

    return recommendations[metric] || 'Optimize performance';
  }

  public dispose() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.callbacks = [];
  }
}

// Performance budget monitoring
export class PerformanceBudget {
  private budgets: Record<string, number>;
  private violations: Array<{
    metric: string;
    actual: number;
    budget: number;
    timestamp: number;
  }> = [];

  constructor(budgets: Record<string, number>) {
    this.budgets = budgets;
  }

  public checkBudget(metric: string, value: number): boolean {
    const budget = this.budgets[metric];
    if (budget && value > budget) {
      this.violations.push({
        metric,
        actual: value,
        budget,
        timestamp: Date.now(),
      });
      return false;
    }
    return true;
  }

  public getViolations() {
    return [...this.violations];
  }

  public clearViolations() {
    this.violations = [];
  }
}

// Real User Monitoring (RUM)
export class RealUserMonitoring {
  private tracker: WebVitalsTracker;
  private budget: PerformanceBudget;
  private sessionId: string;

  constructor(budgets?: Record<string, number>) {
    this.tracker = new WebVitalsTracker();
    this.budget = new PerformanceBudget(
      budgets || {
        FCP: 2000,
        LCP: 3000,
        FID: 150,
        CLS: 0.15,
        TTFB: 1000,
      }
    );
    this.sessionId = this.generateSessionId();

    this.setupTracking();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupTracking() {
    this.tracker.onMetric(entry => {
      // Check performance budget
      const withinBudget = this.budget.checkBudget(entry.name, entry.value);

      // Send to analytics (replace with your analytics service)
      this.sendToAnalytics({
        ...entry,
        sessionId: this.sessionId,
        withinBudget,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    });
  }

  private sendToAnalytics(data: any) {
    // Example: Send to Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'performance',
        event_label: data.name,
        value: Math.round(data.value),
        custom_map: {
          metric_rating: data.rating,
          session_id: data.sessionId,
          within_budget: data.withinBudget,
        },
      });
    }

    // Example: Send to custom analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(error => console.warn('Failed to send analytics:', error));
    }
  }

  public getSessionMetrics() {
    return {
      sessionId: this.sessionId,
      metrics: this.tracker.getMetrics(),
      score: this.tracker.getPerformanceScore(),
      violations: this.budget.getViolations(),
    };
  }

  public dispose() {
    this.tracker.dispose();
  }
}

// Initialize global Web Vitals tracking
let globalTracker: RealUserMonitoring | null = null;

export const initializeWebVitals = (budgets?: Record<string, number>) => {
  if (typeof window !== 'undefined' && !globalTracker) {
    globalTracker = new RealUserMonitoring(budgets);
  }
  return globalTracker;
};

export const getWebVitalsTracker = () => globalTracker;

// React hook for Web Vitals
export const useWebVitals = () => {
  const [metrics, setMetrics] = React.useState<Partial<WebVitalsMetrics>>({});
  const [score, setScore] = React.useState<number>(0);

  React.useEffect(() => {
    const tracker = new WebVitalsTracker();

    tracker.onMetric(() => {
      setMetrics(tracker.getMetrics());
      setScore(tracker.getPerformanceScore());
    });

    return () => tracker.dispose();
  }, []);

  return { metrics, score };
};

// Performance monitoring component
export const PerformanceMonitor: React.FC<{
  onMetric?: (entry: PerformanceEntry) => void;
  showDebugInfo?: boolean;
}> = ({ onMetric, showDebugInfo = false }) => {
  const { metrics, score } = useWebVitals();

  React.useEffect(() => {
    if (onMetric) {
      const tracker = new WebVitalsTracker();
      tracker.onMetric(onMetric);
      return () => tracker.dispose();
    }
  }, [onMetric]);

  if (!showDebugInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-black/80 p-4 font-mono text-xs text-white">
      <div className="mb-2">Performance Score: {score.toFixed(1)}/100</div>
      {Object.entries(metrics).map(([metric, value]) => (
        <div key={metric} className="flex justify-between gap-4">
          <span>{metric}:</span>
          <span>{value.toFixed(2)}ms</span>
        </div>
      ))}
    </div>
  );
};
