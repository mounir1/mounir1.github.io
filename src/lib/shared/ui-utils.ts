/**
 * Shared UI Utilities
 * Consolidates duplicate functions and common UI patterns
 */

import { useTheme } from '@/components/theme/use-theme';

// Theme utilities
export const createThemeToggle = (setTheme: (theme: string) => void) => {
  return () => {
    setTheme('light');
  };
};

export const useThemeToggle = () => {
  const { setTheme } = useTheme();
  return createThemeToggle(setTheme);
};

// Image error handling
export const createImageErrorHandler = (
  setImageError: (error: boolean) => void
) => {
  return () => {
    setImageError(true);
  };
};

// Common CSS class mappings
export const ALIGN_CLASSES = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
} as const;

export const LAYOUT_CLASSES = {
  stacked: 'space-y-4',
  inline: 'flex flex-wrap gap-4',
  grid: (columns: number) => `grid gap-4 grid-cols-1 md:grid-cols-${columns}`,
} as const;

export const VARIANT_CLASSES = {
  default:
    'border border-input bg-background hover:border-primary/50 focus-visible:border-primary',
  glass:
    'border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/60 focus-visible:border-primary',
  outlined:
    'border-2 border-primary bg-transparent hover:bg-primary/5 focus-visible:bg-primary/10',
} as const;

// Scroll utilities
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export const scrollToElement = (elementId: string, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth',
    });
  }
};

// Project interaction handlers
export const createProjectHoverHandler = (
  setIsHovered: (hovered: boolean) => void,
  onProjectHover?: (project: any) => void,
  project?: any
) => {
  return () => {
    setIsHovered(true);
    onProjectHover?.(project);
  };
};

export const createProjectClickHandler = (
  onProjectClick?: (project: any) => void,
  project?: any
) => {
  return () => {
    onProjectClick?.(project);
  };
};

// Online/Offline status handlers
export const createOnlineStatusHandlers = (
  setIsOnline: (online: boolean) => void
) => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  const setupListeners = () => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  return { handleOnline, handleOffline, setupListeners };
};

// Animation utilities
export const EASING_FUNCTIONS = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
} as const;

// Form utilities
export const createFormValidator = (rules: Record<string, any>) => {
  return (values: Record<string, any>) => {
    const errors: Record<string, string> = {};

    Object.entries(rules).forEach(([field, rule]) => {
      const value = values[field];
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors[field] = rule.message || `${field} is required`;
      }
    });

    return errors;
  };
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
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
};

// Array utilities
export const uniqueBy = <T>(array: T[], keyFn: (item: T) => any): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Object utilities
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;

  if (a == null || b == null) return false;

  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
};
