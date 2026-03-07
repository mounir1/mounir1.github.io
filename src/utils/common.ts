/**
 * Common Utilities
 * Centralized utility functions used across the application
 */

import { BREAKPOINT_VALUES, UI_COMPONENT_CONFIG } from '@/constants';

const MOBILE_BREAKPOINT = BREAKPOINT_VALUES.md; // Using md breakpoint as mobile threshold

// Re-export shared utilities for convenience
export * from '@/lib/shared/utilities';
export * from '@/lib/shared/formatters';
export * from '@/lib/shared/validators';

// DOM and UI utilities
export const domUtils = {
  /**
   * Check if device is mobile based on screen width
   */
  isMobile: (): boolean => {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  },

  /**
   * Check if device supports touch
   */
  isTouchDevice: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Get viewport dimensions
   */
  getViewport: () => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }),

  /**
   * Scroll to element smoothly
   */
  scrollToElement: (element: HTMLElement | string, offset = 0) => {
    const target =
      typeof element === 'string'
        ? (document.querySelector(element) as HTMLElement)
        : element;

    if (target) {
      const targetPosition = target.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  },

  /**
   * Copy text to clipboard
   */
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  },

  /**
   * Download data as file
   */
  downloadFile: (data: string, filename: string, mimeType = 'text/plain') => {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

// Performance utilities
export const performanceUtils = {
  /**
   * Debounce function calls
   */
  debounce: <T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  /**
   * Throttle function calls
   */
  throttle: <T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Measure function execution time
   */
  measureTime: async <T>(
    func: () => Promise<T> | T,
    label?: string
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await func();
    const duration = performance.now() - start;

    if (label) {
      console.log(`${label}: ${duration.toFixed(2)}ms`);
    }

    return { result, duration };
  },

  /**
   * Create a batch processor for performance
   */
  createBatchProcessor: <T>(
    batchSize = UI_COMPONENT_CONFIG.virtualScroll.threshold,
    delay = UI_COMPONENT_CONFIG.performance.updateInterval
  ) => {
    const queue: T[] = [];
    let timeoutId: NodeJS.Timeout;

    return {
      add: (item: T) => {
        queue.push(item);

        if (queue.length >= batchSize) {
          return queue.splice(0, batchSize);
        }

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (queue.length > 0) {
            return queue.splice(0);
          }
        }, delay);

        return null;
      },
      flush: () => queue.splice(0),
      size: () => queue.length,
    };
  },
};

// Animation utilities
export const animationUtils = {
  /**
   * Create CSS transition string
   */
  createTransition: (
    property: string,
    duration = UI_COMPONENT_CONFIG.animation.duration.normal,
    easing = UI_COMPONENT_CONFIG.animation.easing
  ): string => {
    return `${property} ${duration}ms ${easing}`;
  },

  /**
   * Wait for animation to complete
   */
  waitForAnimation: (duration: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, duration));
  },

  /**
   * Easing functions
   */
  easing: {
    easeInOut: (t: number): number =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeIn: (t: number): number => t * t,
    easeOut: (t: number): number => t * (2 - t),
    bounce: (t: number): number => {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    },
  },
};

// Data manipulation utilities
export const dataUtils = {
  /**
   * Generate unique ID
   */
  generateId: (prefix = 'id'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Deep clone object
   */
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array)
      return obj.map(item => dataUtils.deepClone(item)) as unknown as T;
    if (typeof obj === 'object') {
      const cloned = {} as Record<string, unknown>;
      Object.keys(obj).forEach(key => {
        cloned[key] = dataUtils.deepClone(
          (obj as Record<string, unknown>)[key]
        );
      });
      return cloned as T;
    }
    return obj;
  },

  /**
   * Group array by key
   */
  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce(
      (groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
      },
      {} as Record<string, T[]>
    );
  },

  /**
   * Sort array by multiple criteria
   */
  sortBy: <T>(
    array: T[],
    ...criteria: Array<{
      key: keyof T;
      direction?: 'asc' | 'desc';
    }>
  ): T[] => {
    return [...array].sort((a, b) => {
      for (const { key, direction = 'asc' } of criteria) {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  },

  /**
   * Paginate array
   */
  paginate: <T>(array: T[], page: number, pageSize: number): T[] => {
    const startIndex = (page - 1) * pageSize;
    return array.slice(startIndex, startIndex + pageSize);
  },

  /**
   * Calculate pagination info
   */
  getPaginationInfo: (total: number, page: number, pageSize: number) => ({
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasNext: page * pageSize < total,
    hasPrev: page > 1,
    startIndex: (page - 1) * pageSize,
    endIndex: Math.min(page * pageSize, total),
  }),
};

// Form utilities
export const formUtils = {
  /**
   * Extract form data from FormData
   */
  extractFormData: (formData: FormData): Record<string, any> => {
    const data: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // Handle multiple values (arrays)
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    return data;
  },

  /**
   * Validate form field
   */
  validateField: (
    value: any,
    rules: Array<{
      type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
      value?: any;
      message: string;
    }>
  ): string | null => {
    for (const rule of rules) {
      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return rule.message;
          }
          break;
        case 'minLength':
          if (typeof value === 'string' && value.length < rule.value) {
            return rule.message;
          }
          break;
        case 'maxLength':
          if (typeof value === 'string' && value.length > rule.value) {
            return rule.message;
          }
          break;
        case 'pattern':
          if (typeof value === 'string' && !rule.value.test(value)) {
            return rule.message;
          }
          break;
        case 'custom':
          if (typeof rule.value === 'function' && !rule.value(value)) {
            return rule.message;
          }
          break;
      }
    }
    return null;
  },
};

// Error handling utilities
export const errorUtils = {
  /**
   * Create standardized error object
   */
  createError: (
    message: string,
    code?: string,
    details?: Record<string, any>
  ) => ({
    message,
    code,
    details,
    timestamp: new Date(),
  }),

  /**
   * Handle async errors with fallback
   */
  handleAsync: async <T>(
    asyncFn: () => Promise<T>,
    fallback?: T
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      console.error('Async operation failed:', error);
      return fallback ?? null;
    }
  },

  /**
   * Retry async operation
   */
  retry: async <T>(
    asyncFn: () => Promise<T>,
    maxAttempts = 3,
    delay = 1000
  ): Promise<T> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError!;
  },
};

// Storage utilities
export const storageUtils = {
  /**
   * Safe localStorage operations
   */
  local: {
    get: <T>(key: string, defaultValue?: T): T | null => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : (defaultValue ?? null);
      } catch {
        return defaultValue ?? null;
      }
    },

    set: (key: string, value: any): boolean => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    remove: (key: string): boolean => {
      try {
        localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },
  },

  /**
   * Safe sessionStorage operations
   */
  session: {
    get: <T>(key: string, defaultValue?: T): T | null => {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : (defaultValue ?? null);
      } catch {
        return defaultValue ?? null;
      }
    },

    set: (key: string, value: any): boolean => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },

    remove: (key: string): boolean => {
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },
  },
};
