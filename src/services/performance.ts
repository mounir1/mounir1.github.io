import { useEffect, useCallback } from 'react';
import type { WebVitals, AnalyticsEvent } from '@/types';

/**
 * Performance Monitoring Service
 * Track Web Vitals and user interactions for senior-level performance optimization
 */

let webVitalsData: WebVitals = {};
let vitalCallbacks: Array<(vitals: WebVitals) => void> = [];

export const performanceService = {
  /**
   * Initialize performance monitoring
   */
  init() {
    if (typeof window === 'undefined') return;

    // Load web-vitals dynamically if available
    this.loadWebVitals();
    
    // Track initial metrics
    this.trackTimeToFirstByte();
    this.trackFirstContentfulPaint();
    
    console.log('[Performance] Monitoring initialized');
  },

  /**
   * Load web-vitals library dynamically
   */
  async loadWebVitals() {
    try {
      // Dynamic import when disk space allows
      // const { onCLS, onFID, onFCP, onLCP, onTTFB } = await import('web-vitals');
      
      // For now, use native Performance API
      this.setupNativeObservers();
    } catch (error) {
      console.warn('[Performance] Web Vitals library not available, using native API');
      this.setupNativeObservers();
    }
  },

  /**
   * Setup native Performance observers
   */
  setupNativeObservers() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    // Observe Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry && 'startTime' in lastEntry) {
          webVitalsData.lcp = lastEntry.startTime as number;
          this.notifyVitalsChange();
          this.sendToAnalytics({
            event: 'web_vital',
            category: 'performance',
            action: 'LCP',
            value: Math.round(lastEntry.startTime as number),
            label: 'LCP',
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('[Performance] LCP observer not supported');
    }

    // Observe Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value || 0;
          }
        }
        webVitalsData.cls = clsValue;
        this.notifyVitalsChange();
        this.sendToAnalytics({
          event: 'web_vital',
          category: 'performance',
          action: 'CLS',
          value: clsValue,
          label: 'CLS',
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('[Performance] CLS observer not supported');
    }

    // Observe First Input Delay (FID) via Interaction
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'first-input') {
            webVitalsData.fid = (entry as PerformanceEventTiming).duration;
            this.notifyVitalsChange();
            this.sendToAnalytics({
              event: 'web_vital',
              category: 'performance',
              action: 'FID',
              value: Math.round((entry as PerformanceEventTiming).duration),
              label: 'FID',
            });
          }
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.warn('[Performance] FID observer not supported');
    }
  },

  /**
   * Track Time to First Byte (TTFB)
   */
  trackTimeToFirstByte() {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      webVitalsData.ttfb = ttfb;
      this.notifyVitalsChange();
      this.sendToAnalytics({
        event: 'web_vital',
        category: 'performance',
        action: 'TTFB',
        value: Math.round(ttfb),
        label: 'TTFB',
      });
    }
  },

  /**
   * Track First Contentful Paint (FCP)
   */
  trackFirstContentfulPaint() {
    if (typeof window === 'undefined' || !window.performance) return;

    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    
    if (fcpEntry) {
      webVitalsData.fcp = fcpEntry.startTime;
      this.notifyVitalsChange();
      this.sendToAnalytics({
        event: 'web_vital',
        category: 'performance',
        action: 'FCP',
        value: Math.round(fcpEntry.startTime),
        label: 'FCP',
      });
    }
  },

  /**
   * Get current Web Vitals
   */
  getWebVitals(): WebVitals {
    return { ...webVitalsData };
  },

  /**
   * Subscribe to Web Vitals changes
   */
  subscribe(callback: (vitals: WebVitals) => void) {
    vitalCallbacks.push(callback);
    return () => {
      vitalCallbacks = vitalCallbacks.filter(cb => cb !== callback);
    };
  },

  /**
   * Notify subscribers of vitals change
   */
  notifyVitalsChange() {
    vitalCallbacks.forEach(callback => callback({ ...webVitalsData }));
  },

  /**
   * Send analytics event
   */
  sendToAnalytics(event: Omit<AnalyticsEvent, 'timestamp'>) {
    // Placeholder - integrate with actual analytics service
    console.log('[Analytics Event]', {
      ...event,
      timestamp: new Date(),
    });

    // Google Analytics example (when enabled):
    // if (window.gtag && analyticsConfig.googleAnalytics) {
    //   window.gtag('event', event.action, {
    //     event_category: event.category,
    //     event_label: event.label,
    //     value: event.value,
    //   });
    // }
  },

  /**
   * Track custom performance mark
   */
  mark(name: string) {
    if (typeof window === 'undefined' || !window.performance) return;
    performance.mark(name);
    console.log(`[Performance Mark] ${name}`);
  },

  /**
   * Measure duration between two marks
   */
  measure(measureName: string, startMark: string, endMark: string) {
    if (typeof window === 'undefined' || !window.performance) return;
    
    try {
      performance.measure(measureName, startMark, endMark);
      const measures = performance.getEntriesByName(measureName);
      if (measures.length > 0) {
        const duration = (measures[0] as PerformanceMeasure).duration;
        console.log(`[Performance Measure] ${measureName}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    } catch (e) {
      console.warn('[Performance] Measure failed:', e);
    }
    return null;
  },

  /**
   * Calculate performance score (0-100)
   */
  calculateScore(): number {
    const scores: number[] = [];

    // LCP scoring (<2.5s = 100, <4s = 75, else 50)
    if (webVitalsData.lcp) {
      scores.push(webVitalsData.lcp < 2500 ? 100 : webVitalsData.lcp < 4000 ? 75 : 50);
    }

    // FID scoring (<100ms = 100, <300ms = 75, else 50)
    if (webVitalsData.fid) {
      scores.push(webVitalsData.fid < 100 ? 100 : webVitalsData.fid < 300 ? 75 : 50);
    }

    // CLS scoring (<0.1 = 100, <0.25 = 75, else 50)
    if (webVitalsData.cls !== undefined) {
      scores.push(webVitalsData.cls < 0.1 ? 100 : webVitalsData.cls < 0.25 ? 75 : 50);
    }

    // FCP scoring (<1.8s = 100, <3s = 75, else 50)
    if (webVitalsData.fcp) {
      scores.push(webVitalsData.fcp < 1800 ? 100 : webVitalsData.fcp < 3000 ? 75 : 50);
    }

    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  },

  /**
   * Log performance report
   */
  report() {
    const vitals = this.getWebVitals();
    const score = this.calculateScore();
    
    console.group('📊 Performance Report');
    console.log(`Overall Score: ${score}/100`);
    console.log(`TTFB: ${vitals.ttfb?.toFixed(0) || 'N/A'}ms`);
    console.log(`FCP: ${vitals.fcp?.toFixed(0) || 'N/A'}ms`);
    console.log(`LCP: ${vitals.lcp?.toFixed(0) || 'N/A'}ms`);
    console.log(`FID: ${vitals.fid?.toFixed(0) || 'N/A'}ms`);
    console.log(`CLS: ${vitals.cls?.toFixed(3) || 'N/A'}`);
    console.groupEnd();

    return { score, vitals };
  },
};

/**
 * React Hook for Web Vitals
 */
export function useWebVitals() {
  const [vitals, setVitals] = useState<WebVitals>({});
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = performanceService.subscribe((newVitals) => {
      setVitals({ ...newVitals });
      setScore(performanceService.calculateScore());
    });

    // Initial values
    setVitals(performanceService.getWebVitals());
    setScore(performanceService.calculateScore());

    return unsubscribe;
  }, []);

  return { vitals, score };
}

// Helper for useState in hook
function useState<T>(initialValue: T): [T, (value: T) => void] {
  let state = initialValue;
  const setters: Array<(value: T) => void> = [];
  
  const setState = (value: T) => {
    state = value;
    setters.forEach(setter => setter(value));
  };
  
  return [state, setState];
}

export default performanceService;
