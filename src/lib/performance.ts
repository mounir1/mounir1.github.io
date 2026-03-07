// Performance Optimization Utilities
// Provides caching, debouncing, throttling, and other performance enhancements

// Memory cache for expensive operations
class MemoryCache<T> {
  private cache = new Map<
    string,
    { data: T; timestamp: number; ttl: number }
  >();

  set(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instances
export const projectCache = new MemoryCache<any>();
export const skillCache = new MemoryCache<any>();
export const imageCache = new MemoryCache<HTMLImageElement>();

// Debounce function for user input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization for expensive computations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);

    return result;
  }) as T;
}

// Image preloader with caching
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const cached = imageCache.get(src);
    if (cached && cached instanceof HTMLImageElement) {
      resolve(cached);
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img, 30 * 60 * 1000); // 30 minutes cache
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Batch processing for multiple operations
export class BatchProcessor<T> {
  private queue: T[] = [];
  private processing = false;
  private batchSize: number;
  private delay: number;

  constructor(batchSize: number = 10, delay: number = 100) {
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(item: T): void {
    this.queue.push(item);
    if (!this.processing) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);
      await this.processBatch(batch);

      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.delay));
      }
    }

    this.processing = false;
  }

  protected async processBatch(batch: T[]): Promise<void> {
    // Override this method in subclasses
    console.log('Processing batch:', batch);
  }
}

// Connection quality monitoring
export class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private quality: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
  private listeners: ((quality: string) => void)[] = [];

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  private constructor() {
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Monitor network information if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      const updateQuality = () => {
        const effectiveType = connection.effectiveType;

        switch (effectiveType) {
          case '4g':
            this.quality = 'excellent';
            break;
          case '3g':
            this.quality = 'good';
            break;
          case '2g':
            this.quality = 'fair';
            break;
          default:
            this.quality = 'poor';
        }

        this.notifyListeners();
      };

      connection.addEventListener('change', updateQuality);
      updateQuality();
    }

    // Monitor online/offline status
    window.addEventListener('online', () => {
      if (this.quality === 'poor') {
        this.quality = 'good';
        this.notifyListeners();
      }
    });

    window.addEventListener('offline', () => {
      this.quality = 'poor';
      this.notifyListeners();
    });
  }

  getQuality(): string {
    return this.quality;
  }

  isHighQuality(): boolean {
    return this.quality === 'excellent' || this.quality === 'good';
  }

  onQualityChange(callback: (quality: string) => void): () => void {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.quality));
  }
}

// Lazy loading utility
export function createLazyLoader<T>(
  loader: () => Promise<T>,
  fallback?: T
): {
  load: () => Promise<T>;
  isLoaded: () => boolean;
  get: () => T | undefined;
} {
  let loaded = false;
  let loading = false;
  let data: T | undefined = fallback;
  let promise: Promise<T> | null = null;

  return {
    load: () => {
      if (loaded && data) {
        return Promise.resolve(data);
      }

      if (loading && promise) {
        return promise;
      }

      loading = true;
      promise = loader()
        .then(result => {
          data = result;
          loaded = true;
          loading = false;
          return result;
        })
        .catch(error => {
          loading = false;
          throw error;
        });

      return promise;
    },

    isLoaded: () => loaded,
    get: () => data,
  };
}

// Request queue for Firebase operations
export class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private maxConcurrent = 3;
  private activeRequests = 0;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.process();
      }
    });
  }

  private async process(): Promise<void> {
    this.processing = true;

    while (this.queue.length > 0 || this.activeRequests > 0) {
      while (
        this.activeRequests < this.maxConcurrent &&
        this.queue.length > 0
      ) {
        const request = this.queue.shift();
        if (request) {
          this.activeRequests++;
          request().finally(() => {
            this.activeRequests--;
          });
        }
      }

      if (this.activeRequests >= this.maxConcurrent) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    this.processing = false;
  }
}

// Global instances
export const requestQueue = new RequestQueue();
export const connectionMonitor = ConnectionMonitor.getInstance();

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Record<string, number[]> = {};

  startTiming(label: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      if (!this.metrics[label]) {
        this.metrics[label] = [];
      }
      this.metrics[label].push(duration);

      // Keep only last 100 measurements
      if (this.metrics[label].length > 100) {
        this.metrics[label] = this.metrics[label].slice(-100);
      }
    };
  }

  getStats(
    label: string
  ): { avg: number; min: number; max: number; count: number } | null {
    const measurements = this.metrics[label];
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const avg =
      measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return { avg, min, max, count: measurements.length };
  }

  getAllStats(): Record<
    string,
    { avg: number; min: number; max: number; count: number }
  > {
    const stats: Record<
      string,
      { avg: number; min: number; max: number; count: number }
    > = {};

    Object.keys(this.metrics).forEach(label => {
      const labelStats = this.getStats(label);
      if (labelStats) {
        stats[label] = labelStats;
      }
    });

    return stats;
  }

  clear(): void {
    this.metrics = {};
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Clean up caches periodically
setInterval(
  () => {
    projectCache.cleanup();
    skillCache.cleanup();
    imageCache.cleanup();
  },
  5 * 60 * 1000
); // Every 5 minutes
