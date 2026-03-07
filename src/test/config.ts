// Test configuration and constants
export const TEST_CONFIG = {
  // Timeouts
  DEFAULT_TIMEOUT: 5000,
  LONG_TIMEOUT: 10000,
  ANIMATION_TIMEOUT: 500,

  // Test data
  MOCK_USER: {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  },

  MOCK_PROJECT: {
    id: 'test-project-1',
    title: 'Test Project',
    description: 'A test project for automated testing',
    category: 'Web Application',
    status: 'completed',
    priority: 'medium',
    featured: true,
    technologies: ['React', 'TypeScript', 'Vitest'],
    tags: ['frontend', 'testing'],
    visibility: 'public',
  },

  MOCK_SKILL: {
    id: 'test-skill-1',
    name: 'React',
    description: 'Frontend framework for building user interfaces',
    category: 'Frontend',
    level: 5,
    proficiency: 90,
    experience: { years: 3, months: 6 },
    featured: true,
    tags: ['frontend', 'javascript'],
  },

  // Test selectors
  SELECTORS: {
    // Auth
    LOGIN_FORM: '[data-testid="login-form"]',
    EMAIL_INPUT: 'input[type="email"]',
    PASSWORD_INPUT: 'input[type="password"]',
    LOGIN_BUTTON: 'button[type="submit"]',

    // Dashboard
    DASHBOARD_OVERVIEW: '[data-testid="dashboard-overview"]',
    STATS_GRID: '[data-testid="stats-grid"]',
    STAT_CARD: '[data-testid="stat-card"]',
    QUICK_ACTIONS: '[data-testid="quick-actions"]',
    RECENT_ACTIVITY: '[data-testid="recent-activity"]',

    // Navigation
    SIDEBAR: '[data-testid="admin-sidebar"]',
    BREADCRUMB: '[data-testid="breadcrumb"]',
    TAB_BUTTON: '[data-testid="tab-button"]',

    // Projects
    PROJECTS_LIST: '[data-testid="projects-list"]',
    PROJECT_CARD: '[data-testid="project-card"]',
    PROJECT_FORM: '[data-testid="project-form"]',
    ADD_PROJECT_BUTTON: '[data-testid="add-project-button"]',

    // Skills
    SKILLS_LIST: '[data-testid="skills-list"]',
    SKILL_CARD: '[data-testid="skill-card"]',
    SKILL_FORM: '[data-testid="skill-form"]',
    ADD_SKILL_BUTTON: '[data-testid="add-skill-button"]',

    // Common
    LOADING_SPINNER: '[data-testid="loading-spinner"]',
    ERROR_MESSAGE: '[data-testid="error-message"]',
    EMPTY_STATE: '[data-testid="empty-state"]',
    CONFIRM_DIALOG: '[data-testid="confirm-dialog"]',
    VALIDATION_ERROR: '[data-testid="validation-error"]',
  },

  // Test URLs
  URLS: {
    HOME: '/',
    ADMIN: '/admin',
    ADMIN_DEMO: '/admin?demo=true',
    PROJECTS: '/admin/projects',
    SKILLS: '/admin/skills',
  },

  // Viewport sizes for responsive testing
  VIEWPORTS: {
    MOBILE: { width: 375, height: 667 },
    TABLET: { width: 768, height: 1024 },
    DESKTOP: { width: 1280, height: 720 },
    WIDE: { width: 1920, height: 1080 },
  },

  // Performance thresholds
  PERFORMANCE: {
    LOAD_TIME: 2000,
    INTERACTION_TIME: 500,
    ANIMATION_TIME: 300,
  },

  // Coverage thresholds
  COVERAGE: {
    STATEMENTS: 80,
    BRANCHES: 80,
    FUNCTIONS: 80,
    LINES: 80,
  },
};

// Test utilities
export const TEST_UTILS = {
  // Wait for element to be visible
  waitForElement: (
    selector: string,
    timeout = TEST_CONFIG.DEFAULT_TIMEOUT
  ) => ({
    selector,
    timeout,
  }),

  // Generate random test data
  generateRandomString: (length = 10) => {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  },

  generateRandomEmail: () => {
    return `test-${TEST_UTILS.generateRandomString()}@example.com`;
  },

  generateRandomProject: () => ({
    ...TEST_CONFIG.MOCK_PROJECT,
    id: `project-${TEST_UTILS.generateRandomString()}`,
    title: `Test Project ${TEST_UTILS.generateRandomString(5)}`,
  }),

  generateRandomSkill: () => ({
    ...TEST_CONFIG.MOCK_SKILL,
    id: `skill-${TEST_UTILS.generateRandomString()}`,
    name: `Test Skill ${TEST_UTILS.generateRandomString(5)}`,
  }),
};

// Test environment detection
export const TEST_ENV = {
  isCI: !!process.env.CI,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Browser detection for cross-browser testing
export const BROWSERS = {
  CHROMIUM: 'chromium',
  FIREFOX: 'firefox',
  WEBKIT: 'webkit',
};

// Test categories for organizing tests
export const TEST_CATEGORIES = {
  UNIT: 'unit',
  INTEGRATION: 'integration',
  E2E: 'e2e',
  VISUAL: 'visual',
  PERFORMANCE: 'performance',
  ACCESSIBILITY: 'accessibility',
};

// Common test patterns
export const TEST_PATTERNS = {
  // File patterns
  UNIT_TESTS: '**/*.{test,spec}.{ts,tsx}',
  INTEGRATION_TESTS: '**/integration/**/*.test.{ts,tsx}',
  E2E_TESTS: '**/e2e/**/*.spec.{ts,tsx}',
  VISUAL_TESTS: '**/visual/**/*.spec.{ts,tsx}',

  // Component patterns
  COMPONENT_TESTS: '**/components/**/*.test.{ts,tsx}',
  HOOK_TESTS: '**/hooks/**/*.test.{ts,tsx}',
  UTIL_TESTS: '**/utils/**/*.test.{ts,tsx}',
  PAGE_TESTS: '**/pages/**/*.test.{ts,tsx}',
};

// Mock data generators
export const MOCK_GENERATORS = {
  user: (overrides = {}) => ({
    ...TEST_CONFIG.MOCK_USER,
    ...overrides,
  }),

  project: (overrides = {}) => ({
    ...TEST_CONFIG.MOCK_PROJECT,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }),

  skill: (overrides = {}) => ({
    ...TEST_CONFIG.MOCK_SKILL,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }),

  stats: (overrides = {}) => ({
    projects: {
      total: 10,
      featured: 5,
      active: 3,
      categories: 4,
      byStatus: { completed: 7, 'in-progress': 2, planning: 1 },
      byCategory: { 'Web Application': 5, 'Mobile App': 3, 'Desktop App': 2 },
      recentActivity: [],
    },
    skills: {
      total: 15,
      featured: 8,
      byCategory: { Frontend: 6, Backend: 4, Database: 3, Tools: 2 },
      averageLevel: 4.2,
      topSkills: [],
    },
    ...overrides,
  }),
};
