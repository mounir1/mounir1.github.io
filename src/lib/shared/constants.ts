/**
 * Centralized constants
 * Consolidates duplicate constants and magic numbers across the codebase
 */

// Application constants
export const APP_CONFIG = {
  name: 'Portfolio Admin Dashboard',
  version: '2.0.0',
  author: 'Mounir Bahije',
  description: 'Modern portfolio management system',
  url: 'https://mounirbahije.com',
  email: 'contact@mounirbahije.com',
} as const;

// API configuration
export const API_CONFIG = {
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  baseUrl: process.env.VITE_API_BASE_URL || '/api',
  endpoints: {
    projects: '/projects',
    skills: '/skills',
    experiences: '/experiences',
    auth: '/auth',
    analytics: '/analytics',
  },
} as const;

// UI constants
export const UI_CONFIG = {
  // Breakpoints (matching Tailwind CSS)
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },

  // Animation durations
  animations: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 1000,
  },

  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },

  // Common sizes
  sizes: {
    sidebar: {
      collapsed: 64,
      expanded: 256,
    },
    header: 64,
    footer: 80,
    card: {
      minHeight: 200,
      maxWidth: 400,
    },
  },
} as const;

// Form validation constants
export const VALIDATION_CONFIG = {
  // Field length limits
  lengths: {
    title: { min: 1, max: 100 },
    description: { min: 10, max: 500 },
    longDescription: { min: 50, max: 2000 },
    name: { min: 1, max: 50 },
    email: { min: 5, max: 254 },
    url: { min: 10, max: 2048 },
    tag: { min: 1, max: 30 },
    company: { min: 1, max: 100 },
  },

  // Numeric limits
  numbers: {
    skill: {
      level: { min: 0, max: 100 },
      experience: { min: 0, max: 50 },
    },
    project: {
      priority: { min: 1, max: 5 },
      progress: { min: 0, max: 100 },
    },
  },

  // Array limits
  arrays: {
    technologies: { min: 1, max: 20 },
    tags: { min: 0, max: 10 },
    images: { min: 0, max: 10 },
    links: { min: 0, max: 5 },
  },
} as const;

// Data table constants
export const TABLE_CONFIG = {
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100],
    maxPageSize: 100,
  },

  sorting: {
    defaultDirection: 'asc' as const,
    multiSort: true,
  },

  filtering: {
    debounceDelay: 300,
    minSearchLength: 2,
  },

  virtualization: {
    itemHeight: 60,
    overscan: 5,
    threshold: 100,
  },
} as const;

// Theme constants
export const THEME_CONFIG = {
  default: 'light' as const,
  storageKey: 'portfolio-theme',

  colors: {
    primary: {
      light: '#3b82f6',
      dark: '#60a5fa',
    },
    secondary: {
      light: '#6b7280',
      dark: '#9ca3af',
    },
    success: {
      light: '#10b981',
      dark: '#34d399',
    },
    warning: {
      light: '#f59e0b',
      dark: '#fbbf24',
    },
    error: {
      light: '#ef4444',
      dark: '#f87171',
    },
  },
} as const;

// File upload constants
export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  allowedDocumentTypes: ['application/pdf', 'text/plain', 'application/msword'],

  image: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
  },
} as const;

// Analytics constants
export const ANALYTICS_CONFIG = {
  events: {
    pageView: 'page_view',
    buttonClick: 'button_click',
    formSubmit: 'form_submit',
    skillInteraction: 'skill_interaction',
    projectInteraction: 'project_interaction',
    adminAction: 'admin_action',
    error: 'error',
  },

  categories: {
    navigation: 'navigation',
    engagement: 'engagement',
    skills: 'skills',
    projects: 'projects',
    admin: 'admin',
    error: 'error',
  },
} as const;

// Status constants
export const STATUS_CONFIG = {
  project: {
    draft: 'draft',
    active: 'active',
    completed: 'completed',
    archived: 'archived',
    cancelled: 'cancelled',
  } as const,

  skill: {
    learning: 'learning',
    intermediate: 'intermediate',
    proficient: 'proficient',
    expert: 'expert',
  } as const,

  experience: {
    current: 'current',
    past: 'past',
  } as const,
} as const;

// Category constants
export const CATEGORY_CONFIG = {
  project: [
    'Web Development',
    'Mobile App',
    'Desktop App',
    'API/Backend',
    'DevOps',
    'Data Science',
    'Design',
    'Other',
  ] as const,

  skill: [
    'Frontend Development',
    'Backend Development',
    'Database',
    'Cloud & DevOps',
    'Mobile Development',
    'Machine Learning',
    'Design',
    'Project Management',
    'Languages',
    'Tools',
    'Other',
  ] as const,
} as const;

// Performance constants
export const PERFORMANCE_CONFIG = {
  // Debounce delays
  debounce: {
    search: 300,
    resize: 100,
    scroll: 16,
    input: 500,
  },

  // Cache durations (in milliseconds)
  cache: {
    short: 5 * 60 * 1000, // 5 minutes
    medium: 30 * 60 * 1000, // 30 minutes
    long: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Lazy loading
  lazyLoading: {
    rootMargin: '50px',
    threshold: 0.1,
  },

  // Virtual scrolling
  virtualScrolling: {
    itemHeight: 60,
    overscan: 5,
    threshold: 100,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  timeout: 'Request timed out. Please try again.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'Access denied.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  server: 'Server error. Please try again later.',
  unknown: 'An unexpected error occurred.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  created: 'Successfully created!',
  updated: 'Successfully updated!',
  deleted: 'Successfully deleted!',
  saved: 'Changes saved successfully!',
  uploaded: 'File uploaded successfully!',
  exported: 'Data exported successfully!',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  theme: 'portfolio-theme',
  sidebarCollapsed: 'sidebar-collapsed',
  tablePageSize: 'table-page-size',
  tableColumns: 'table-columns',
  userPreferences: 'user-preferences',
  authToken: 'auth-token',
  lastVisit: 'last-visit',
} as const;
