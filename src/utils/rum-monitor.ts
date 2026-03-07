import { onCLS, onFCP, onFID, onLCP, onTTFB, type Metric } from 'web-vitals';

interface RUMConfig {
  apiEndpoint?: string;
  apiKey?: string;
  sampleRate?: number;
  enableConsoleLogging?: boolean;
  enableLocalStorage?: boolean;
  sessionId?: string;
}

interface PerformanceData {
  sessionId: string;
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType?: string;
  deviceMemory?: number;
  metrics: {
    [key: string]: number;
  };
  customMetrics?: {
    [key: string]: any;
  };
  errors?: Array<{
    message: string;
    stack?: string;
    timestamp: number;
  }>;
}

class RealUserMonitoring {
  private config: RUMConfig;
  private sessionId: string;
  private performanceData: PerformanceData;
  private metricsCollected: Set<string> = new Set();
  private customMetrics: { [key: string]: any } = {};
  private errors: Array<{
    message: string;
    stack?: string;
    timestamp: number;
  }> = [];

  constructor(config: RUMConfig = {}) {
    this.config = {
      sampleRate: 1.0,
      enableConsoleLogging: false,
      enableLocalStorage: true,
      ...config,
    };

    this.sessionId = this.config.sessionId || this.generateSessionId();
    this.performanceData = this.initializePerformanceData();

    // Only initialize if we should sample this session
    if (this.shouldSample()) {
      this.initialize();
    }
  }

  private shouldSample(): boolean {
    return Math.random() < (this.config.sampleRate || 1.0);
  }

  private generateSessionId(): string {
    return `rum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializePerformanceData(): PerformanceData {
    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType(),
      deviceMemory: this.getDeviceMemory(),
      metrics: {},
      customMetrics: {},
      errors: [],
    };
  }

  private getConnectionType(): string | undefined {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    return connection?.effectiveType;
  }

  private getDeviceMemory(): number | undefined {
    return (navigator as any).deviceMemory;
  }

  private initialize(): void {
    this.log('RUM monitoring initialized');

    // Collect Core Web Vitals
    this.collectCoreWebVitals();

    // Collect custom performance metrics
    this.collectCustomMetrics();

    // Set up error tracking
    this.setupErrorTracking();

    // Set up page visibility tracking
    this.setupVisibilityTracking();

    // Set up navigation tracking
    this.setupNavigationTracking();

    // Send data on page unload
    this.setupDataTransmission();
  }

  private collectCoreWebVitals(): void {
    // Cumulative Layout Shift
    onCLS((metric: Metric) => {
      this.recordMetric('CLS', metric.value);
    });

    // First Contentful Paint
    onFCP((metric: Metric) => {
      this.recordMetric('FCP', metric.value);
    });

    // First Input Delay
    onFID((metric: Metric) => {
      this.recordMetric('FID', metric.value);
    });

    // Largest Contentful Paint
    onLCP((metric: Metric) => {
      this.recordMetric('LCP', metric.value);
    });

    // Time to First Byte
    onTTFB((metric: Metric) => {
      this.recordMetric('TTFB', metric.value);
    });
  }

  private collectCustomMetrics(): void {
    // Time to Interactive (approximation)
    if (document.readyState === 'complete') {
      this.measureTimeToInteractive();
    } else {
      window.addEventListener('load', () => {
        this.measureTimeToInteractive();
      });
    }

    // Resource loading metrics
    this.collectResourceMetrics();

    // DOM metrics
    this.collectDOMMetrics();
  }

  private measureTimeToInteractive(): void {
    const navigationStart = performance.timeOrigin;
    const loadEventEnd = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    if (loadEventEnd?.loadEventEnd) {
      const tti = loadEventEnd.loadEventEnd - navigationStart;
      this.recordMetric('TTI', tti);
    }
  }

  private collectResourceMetrics(): void {
    const resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    let totalSize = 0;
    let totalDuration = 0;
    const resourceTypes: { [key: string]: number } = {};

    resources.forEach(resource => {
      totalDuration += resource.duration;

      // Estimate transfer size (not always available)
      const size = (resource as any).transferSize || 0;
      totalSize += size;

      // Count by resource type
      const type = this.getResourceType(resource.name);
      resourceTypes[type] = (resourceTypes[type] || 0) + 1;
    });

    this.recordMetric('ResourceCount', resources.length);
    this.recordMetric('ResourceTotalSize', totalSize);
    this.recordMetric('ResourceTotalDuration', totalDuration);

    Object.entries(resourceTypes).forEach(([type, count]) => {
      this.recordMetric(`Resource${type}Count`, count);
    });
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js|mjs)$/)) return 'Script';
    if (url.match(/\.css$/)) return 'Stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) return 'Image';
    if (url.match(/\.(woff|woff2|ttf|otf|eot)$/)) return 'Font';
    return 'Other';
  }

  private collectDOMMetrics(): void {
    // DOM content loaded
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (navigation?.domContentLoadedEventEnd) {
      this.recordMetric(
        'DOMContentLoaded',
        navigation.domContentLoadedEventEnd - navigation.navigationStart
      );
    }

    // DOM size metrics
    this.recordMetric('DOMElements', document.querySelectorAll('*').length);
    this.recordMetric('DOMDepth', this.calculateDOMDepth());
  }

  private calculateDOMDepth(): number {
    let maxDepth = 0;

    function traverse(element: Element, depth: number) {
      maxDepth = Math.max(maxDepth, depth);
      for (const child of element.children) {
        traverse(child, depth + 1);
      }
    }

    if (document.body) {
      traverse(document.body, 1);
    }

    return maxDepth;
  }

  private setupErrorTracking(): void {
    // JavaScript errors
    window.addEventListener('error', event => {
      this.recordError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.recordError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: Date.now(),
      });
    });
  }

  private setupVisibilityTracking(): void {
    let visibilityStart = Date.now();
    let totalVisibleTime = 0;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        totalVisibleTime += Date.now() - visibilityStart;
      } else {
        visibilityStart = Date.now();
      }
      this.recordMetric('TotalVisibleTime', totalVisibleTime);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  private setupNavigationTracking(): void {
    // Track single-page app navigation
    let lastUrl = window.location.href;

    const trackNavigation = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        this.recordCustomMetric(
          'NavigationCount',
          (this.customMetrics.NavigationCount || 0) + 1
        );
        this.recordCustomMetric('LastNavigationTime', Date.now());
        lastUrl = currentUrl;
      }
    };

    // Listen for history changes
    window.addEventListener('popstate', trackNavigation);

    // Override pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      trackNavigation();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      trackNavigation();
    };
  }

  private setupDataTransmission(): void {
    // Send data on page unload
    window.addEventListener('beforeunload', () => {
      this.sendData(true);
    });

    // Send data periodically
    setInterval(() => {
      this.sendData(false);
    }, 30000); // Every 30 seconds

    // Send data when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.sendData(true);
      }
    });
  }

  public recordMetric(name: string, value: number): void {
    this.performanceData.metrics[name] = value;
    this.metricsCollected.add(name);
    this.log(`Metric recorded: ${name} = ${value}`);
  }

  public recordCustomMetric(name: string, value: any): void {
    this.customMetrics[name] = value;
    this.performanceData.customMetrics = { ...this.customMetrics };
    this.log(`Custom metric recorded: ${name} = ${value}`);
  }

  public recordError(error: {
    message: string;
    stack?: string;
    timestamp: number;
  }): void {
    this.errors.push(error);
    this.performanceData.errors = [...this.errors];
    this.log(`Error recorded: ${error.message}`);
  }

  public async sendData(isBeacon: boolean = false): Promise<void> {
    if (this.metricsCollected.size === 0) return;

    const data = {
      ...this.performanceData,
      timestamp: Date.now(),
    };

    try {
      if (this.config.enableLocalStorage) {
        this.saveToLocalStorage(data);
      }

      if (this.config.apiEndpoint) {
        await this.sendToAPI(data, isBeacon);
      }

      this.log('Performance data sent successfully');
    } catch (error) {
      this.log(`Failed to send performance data: ${error}`);
    }
  }

  private saveToLocalStorage(data: PerformanceData): void {
    try {
      const key = `rum_data_${this.sessionId}`;
      localStorage.setItem(key, JSON.stringify(data));

      // Clean up old entries (keep last 10)
      const keys = Object.keys(localStorage).filter(k =>
        k.startsWith('rum_data_')
      );
      if (keys.length > 10) {
        keys
          .sort()
          .slice(0, keys.length - 10)
          .forEach(k => {
            localStorage.removeItem(k);
          });
      }
    } catch (error) {
      this.log(`Failed to save to localStorage: ${error}`);
    }
  }

  private async sendToAPI(
    data: PerformanceData,
    isBeacon: boolean
  ): Promise<void> {
    const payload = {
      ...data,
      apiKey: this.config.apiKey,
    };

    if (isBeacon && navigator.sendBeacon) {
      // Use sendBeacon for reliable delivery during page unload
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json',
      });
      navigator.sendBeacon(this.config.apiEndpoint!, blob);
    } else {
      // Use fetch for regular transmission
      await fetch(this.config.apiEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: isBeacon,
      });
    }
  }

  public getPerformanceData(): PerformanceData {
    return { ...this.performanceData };
  }

  public getMetricsSummary(): { [key: string]: number } {
    return { ...this.performanceData.metrics };
  }

  private log(message: string): void {
    if (this.config.enableConsoleLogging) {
      console.log(`[RUM] ${message}`);
    }
  }

  // Static method to initialize RUM monitoring
  static initialize(config: RUMConfig = {}): RealUserMonitoring {
    return new RealUserMonitoring(config);
  }
}

export default RealUserMonitoring;
export type { RUMConfig, PerformanceData };
