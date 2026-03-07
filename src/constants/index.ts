/**
 * Application Constants
 * Centralized constants for the entire application
 */

// Re-export all constants from shared lib
export * from '@/lib/shared/constants';

// Additional app-specific constants
export const APP_ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
  NOT_FOUND: '/404',
} as const;

export const ADMIN_TABS = {
  DASHBOARD: 'dashboard',
  PROJECTS: 'projects',
  SKILLS: 'skills',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
} as const;

export const PORTFOLIO_SECTIONS = {
  HERO: 'hero',
  ABOUT: 'about',
  SKILLS: 'skills',
  PROJECTS: 'projects',
  EXPERIENCE: 'experience',
  CONTACT: 'contact',
} as const;

export const ANIMATION_VARIANTS = {
  FADE_IN: 'fadeIn',
  SLIDE_UP: 'slideUp',
  SLIDE_DOWN: 'slideDown',
  SLIDE_LEFT: 'slideLeft',
  SLIDE_RIGHT: 'slideRight',
  SCALE_IN: 'scaleIn',
  BOUNCE: 'bounce',
} as const;

export const BREAKPOINT_VALUES = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const GRID_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  wide: 4,
} as const;

export const SPACING_VALUES = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

// UI Component Constants
export const UI_COMPONENT_CONFIG = {
  // Input and form constants
  input: {
    minHeight: 40, // h-10 = 40px
    borderRadius: 6, // rounded-md
    padding: {
      x: 12, // px-3
      y: 8, // py-2
    },
  },

  // Textarea constants
  textarea: {
    minHeight: 80, // min-h-[80px]
    borderRadius: 6,
    padding: {
      x: 12,
      y: 8,
    },
  },

  // Touch target constants
  touch: {
    minTarget: 44, // Minimum touch target size for mobile
    swipeThreshold: 50, // Minimum distance for swipe gesture
  },

  // Animation constants
  animation: {
    duration: {
      fast: 150,
      normal: 200,
      slow: 300,
    },
    easing: 'ease-in-out',
  },

  // Virtual scroll constants
  virtualScroll: {
    itemHeight: 60,
    overscan: 5,
    threshold: 100,
  },

  // Performance monitoring
  performance: {
    updateInterval: 5000, // 5 seconds
    renderCountThreshold: 100,
  },

  // Easter eggs
  easterEgg: {
    clickTarget: 5, // Number of clicks to trigger
    resetAfter: 5000, // Reset after 5 seconds
    matrixCharacters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()',
    fontSize: 14,
  },

  // Loading and progress
  loading: {
    particleCount: 20,
    progressIncrement: {
      min: 5,
      max: 20,
    },
  },
} as const;

// Mobile breakpoint constants
export const MOBILE_BREAKPOINT = 768;

// Common CSS class patterns
export const CSS_CLASSES = {
  // Base input classes
  inputBase:
    'flex h-10 w-full rounded-md px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200',

  // Base textarea classes
  textareaBase:
    'flex min-h-[80px] w-full rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none',

  // Button base classes
  buttonBase: 'rounded-lg font-medium transition-colors touch-manipulation',

  // Card base classes
  cardBase: 'rounded-lg border bg-card text-card-foreground shadow-sm',
} as const;
