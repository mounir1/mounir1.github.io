/**
 * Centralized utility functions library
 * Consolidates duplicate utilities from across the codebase
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Date utilities - consolidated from multiple files
 */
export const dateUtils = {
  /**
   * Format date to locale string
   */
  format: (
    date: Date | string | number,
    locale = 'en-US',
    options?: Intl.DateTimeFormatOptions
  ) => {
    const dateObj =
      typeof date === 'string' || typeof date === 'number'
        ? new Date(date)
        : date;
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  },

  /**
   * Format date to relative time (e.g., "2 days ago")
   */
  formatRelative: (date: Date | string | number, locale = 'en-US') => {
    const dateObj =
      typeof date === 'string' || typeof date === 'number'
        ? new Date(date)
        : date;
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
    if (diffInSeconds < 3600)
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    if (diffInSeconds < 86400)
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    if (diffInSeconds < 2592000)
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    if (diffInSeconds < 31536000)
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  },

  /**
   * Check if date is valid
   */
  isValid: (date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  },

  /**
   * Parse date string safely
   */
  parse: (dateString: string): Date | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return dateUtils.isValid(date) ? date : null;
  },

  /**
   * Get date range between two dates
   */
  getRange: (start: Date, end: Date): Date[] => {
    const dates: Date[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  },
};

/**
 * String utilities - consolidated from multiple files
 */
export const stringUtils = {
  /**
   * Convert to title case
   */
  toTitleCase: (str: string): string => {
    return str.replace(
      /\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  /**
   * Convert to kebab case
   */
  toKebabCase: (str: string): string => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  },

  /**
   * Convert to camel case
   */
  toCamelCase: (str: string): string => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '');
  },

  /**
   * Truncate string with ellipsis
   */
  truncate: (str: string, length: number, suffix = '...'): string => {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  },

  /**
   * Generate slug from string
   */
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * Capitalize first letter
   */
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Remove HTML tags
   */
  stripHtml: (str: string): string => {
    return str.replace(/<[^>]*>/g, '');
  },

  /**
   * Extract initials from name
   */
  getInitials: (name: string, maxLength = 2): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, maxLength)
      .join('');
  },
};

/**
 * Number utilities - consolidated from multiple files
 */
export const numberUtils = {
  /**
   * Format number with commas
   */
  formatWithCommas: (num: number): string => {
    return new Intl.NumberFormat().format(num);
  },

  /**
   * Format as currency
   */
  formatCurrency: (
    amount: number,
    currency = 'USD',
    locale = 'en-US'
  ): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  },

  /**
   * Format as percentage
   */
  formatPercentage: (value: number, decimals = 0): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * Clamp number between min and max
   */
  clamp: (num: number, min: number, max: number): number => {
    return Math.min(Math.max(num, min), max);
  },

  /**
   * Round to specified decimal places
   */
  round: (num: number, decimals = 2): number => {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  /**
   * Generate random number between min and max
   */
  random: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Check if number is in range
   */
  inRange: (num: number, min: number, max: number): boolean => {
    return num >= min && num <= max;
  },
};

/**
 * Array utilities - consolidated from multiple files
 */
export const arrayUtils = {
  /**
   * Remove duplicates from array
   */
  unique: <T>(arr: T[]): T[] => {
    return [...new Set(arr)];
  },

  /**
   * Remove duplicates by key
   */
  uniqueBy: <T>(arr: T[], key: keyof T): T[] => {
    const seen = new Set();
    return arr.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },

  /**
   * Group array by key
   */
  groupBy: <T>(arr: T[], key: keyof T): Record<string, T[]> => {
    return arr.reduce(
      (groups, item) => {
        const value = String(item[key]);
        groups[value] = groups[value] || [];
        groups[value].push(item);
        return groups;
      },
      {} as Record<string, T[]>
    );
  },

  /**
   * Chunk array into smaller arrays
   */
  chunk: <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Shuffle array
   */
  shuffle: <T>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Sort array by multiple keys
   */
  sortBy: <T>(arr: T[], ...keys: (keyof T)[]): T[] => {
    return [...arr].sort((a, b) => {
      for (const key of keys) {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
      }
      return 0;
    });
  },

  /**
   * Join array with proper grammar
   */
  joinWithAnd: (
    arr: string[],
    separator = ', ',
    lastSeparator = ' and '
  ): string => {
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return arr.join(lastSeparator);
    return (
      arr.slice(0, -1).join(separator) + lastSeparator + arr[arr.length - 1]
    );
  },
};

/**
 * Object utilities - consolidated from multiple files
 */
export const objectUtils = {
  /**
   * Deep clone object
   */
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (obj instanceof Array)
      return obj.map(item => objectUtils.deepClone(item)) as unknown as T;
    if (typeof obj === 'object') {
      const cloned = {} as T;
      Object.keys(obj).forEach(key => {
        (cloned as any)[key] = objectUtils.deepClone((obj as any)[key]);
      });
      return cloned;
    }
    return obj;
  },

  /**
   * Deep merge objects
   */
  deepMerge: <T extends Record<string, any>>(
    target: T,
    ...sources: Partial<T>[]
  ): T => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (objectUtils.isObject(target) && objectUtils.isObject(source)) {
      for (const key in source) {
        if (objectUtils.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          objectUtils.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return objectUtils.deepMerge(target, ...sources);
  },

  /**
   * Check if value is object
   */
  isObject: (item: any): boolean => {
    return item && typeof item === 'object' && !Array.isArray(item);
  },

  /**
   * Get nested property safely
   */
  get: (obj: any, path: string, defaultValue?: any): any => {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }

    return result !== undefined ? result : defaultValue;
  },

  /**
   * Set nested property
   */
  set: (obj: any, path: string, value: any): void => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current = obj;

    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
  },

  /**
   * Pick properties from object
   */
  pick: <T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  /**
   * Omit properties from object
   */
  omit: <T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },
};

/**
 * Validation utilities - consolidated from multiple files
 */
export const validationUtils = {
  /**
   * Email validation
   */
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * URL validation
   */
  isUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Phone number validation
   */
  isPhone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  /**
   * Required field validation
   */
  isRequired: (value: any): boolean => {
    if (value == null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  /**
   * Minimum length validation
   */
  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  /**
   * Maximum length validation
   */
  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  /**
   * Number range validation
   */
  inRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  /**
   * Pattern validation
   */
  matchesPattern: (value: string, pattern: RegExp): boolean => {
    return pattern.test(value);
  },
};

/**
 * Performance utilities - consolidated from multiple files
 */
export const performanceUtils = {
  /**
   * Debounce function
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate = false
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };

      const callNow = immediate && !timeout;

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) func(...args);
    };
  },

  /**
   * Throttle function
   */
  throttle: <T extends (...args: any[]) => any>(
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
  measure: <T>(fn: () => T, label?: string): T => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    if (label) {
      console.log(`${label}: ${end - start}ms`);
    }

    return result;
  },

  /**
   * Async measure function execution time
   */
  measureAsync: async <T>(fn: () => Promise<T>, label?: string): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    if (label) {
      console.log(`${label}: ${end - start}ms`);
    }

    return result;
  },

  /**
   * Create memoized function
   */
  memoize: <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();

    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);

      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },
};

/**
 * Error handling utilities - consolidated from multiple files
 */
export const errorUtils = {
  /**
   * Check if value is an error
   */
  isError: (value: unknown): value is Error => {
    return value instanceof Error;
  },

  /**
   * Create error with additional context
   */
  createError: (message: string, context?: Record<string, any>): Error => {
    const error = new Error(message);
    if (context) {
      Object.assign(error, { context });
    }
    return error;
  },

  /**
   * Safe error message extraction
   */
  getErrorMessage: (error: unknown): string => {
    if (errorUtils.isError(error)) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
  },

  /**
   * Async error wrapper
   */
  asyncTryCatch: async <T>(
    fn: () => Promise<T>
  ): Promise<[T | null, Error | null]> => {
    try {
      const result = await fn();
      return [result, null];
    } catch (error) {
      return [
        null,
        errorUtils.isError(error) ? error : new Error(String(error)),
      ];
    }
  },

  /**
   * Sync error wrapper
   */
  tryCatch: <T>(fn: () => T): [T | null, Error | null] => {
    try {
      const result = fn();
      return [result, null];
    } catch (error) {
      return [
        null,
        errorUtils.isError(error) ? error : new Error(String(error)),
      ];
    }
  },
};

/**
 * Local storage utilities - consolidated from multiple files
 */
export const storageUtils = {
  /**
   * Set item in localStorage with JSON serialization
   */
  setItem: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  /**
   * Get item from localStorage with JSON parsing
   */
  getItem: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : (defaultValue ?? null);
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return defaultValue ?? null;
    }
  },

  /**
   * Remove item from localStorage
   */
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },

  /**
   * Clear all localStorage
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  },

  /**
   * Check if localStorage is available
   */
  isAvailable: (): boolean => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Combined utilities object for easy import
 */
export const utils = {
  date: dateUtils,
  string: stringUtils,
  number: numberUtils,
  array: arrayUtils,
  object: objectUtils,
  validation: validationUtils,
  performance: performanceUtils,
  error: errorUtils,
  storage: storageUtils,
  cn,
};

export default utils;
