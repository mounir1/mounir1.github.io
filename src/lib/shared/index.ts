/**
 * Shared utilities index
 * Centralized exports for all shared utilities to avoid import confusion
 */

// Constants
export * from './constants';

// Types
export type { ValidationResult, ValidationRule } from './types';

// Formatters
export * from './formatters';

// Validators
export * from './validators';

// Re-export commonly used utilities from other locations
export { cn } from '../utils';

// Performance utilities are now in performanceUtils below

// Analytics utilities
export * from '../../utils/analytics';

// Table export utilities
export * from '../../utils/tableExport';

/**
 * Commonly used utility functions grouped by category
 */
export const utils = {
  // Date utilities
  formatDate: (date: Date | string | number, locale = 'en-US') =>
    new Date(date).toLocaleDateString(locale),

  formatRelativeTime: (date: Date | string | number) => {
    const now = new Date();
    const dateObj = new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  },

  // String utilities
  truncate: (str: string, maxLength: number, suffix = '...') => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  },

  capitalize: (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),

  slugify: (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, ''),

  // Number utilities
  formatNumber: (num: number) => new Intl.NumberFormat('en-US').format(num),

  formatCurrency: (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
      amount
    ),

  formatPercentage: (value: number, decimals = 1) =>
    `${(value * 100).toFixed(decimals)}%`,

  // Array utilities
  unique: <T>(array: T[]) => [...new Set(array)],

  groupBy: <T>(array: T[], key: keyof T) =>
    array.reduce(
      (groups, item) => {
        const group = item[key] as unknown as string;
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
      },
      {} as Record<string, T[]>
    ),

  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc') =>
    [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    }),

  // Object utilities
  pick: <T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> =>
    keys.reduce(
      (result, key) => {
        if (key in obj) result[key] = obj[key];
        return result;
      },
      {} as Pick<T, K>
    ),

  omit: <T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  },

  // Validation utilities
  isEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isUrl: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  isEmpty: (value: any) =>
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0),

  // Async utilities
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  retry: async <T>(
    fn: () => Promise<T>,
    attempts = 3,
    delayMs = 1000
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (attempts <= 1) throw error;
      await utils.delay(delayMs);
      return utils.retry(fn, attempts - 1, delayMs);
    }
  },

  // Local storage utilities
  storage: {
    get: <T>(key: string, defaultValue?: T): T | null => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue || null;
      } catch {
        return defaultValue || null;
      }
    },

    set: (key: string, value: any): void => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    },

    remove: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
      }
    },
  },

  // Debug utilities
  debug: {
    log: (...args: any[]) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[DEBUG]', ...args);
      }
    },

    time: (label: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.time(label);
      }
    },

    timeEnd: (label: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.timeEnd(label);
      }
    },
  },
};

/**
 * Type-safe error handling utilities
 */
export const errorUtils = {
  isError: (value: unknown): value is Error => value instanceof Error,

  getErrorMessage: (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    return 'An unknown error occurred';
  },

  createError: (message: string, code?: string): Error => {
    const error = new Error(message);
    if (code) (error as any).code = code;
    return error;
  },
};

/**
 * Performance monitoring utilities
 */
export const performanceUtils = {
  measure: <T>(fn: () => T, label?: string): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    if (label && process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
    }

    return result;
  },

  measureAsync: async <T>(fn: () => Promise<T>, label?: string): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    if (label && process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
    }

    return result;
  },
};

export default {
  utils,
  errorUtils,
  performanceUtils,
};
