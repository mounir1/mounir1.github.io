import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/theme-provider';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const mockProject = (overrides = {}) => ({
  id: '1',
  title: 'Test Project',
  description: 'Test Description',
  longDescription: 'Detailed test description',
  category: 'Web Application',
  status: 'completed',
  priority: 'medium',
  featured: true,
  disabled: false,
  technologies: ['React', 'TypeScript'],
  images: [],
  links: [],
  tags: ['frontend', 'web'],
  visibility: 'public',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

export const mockSkill = (overrides = {}) => ({
  id: '1',
  name: 'React',
  description: 'Frontend framework',
  category: 'Frontend',
  level: 5,
  proficiency: 90,
  experience: { years: 3, months: 6 },
  featured: true,
  icon: 'react-icon',
  color: '#61DAFB',
  tags: ['frontend', 'javascript'],
  certifications: [],
  projects: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

export const mockUser = (overrides = {}) => ({
  uid: '123',
  email: 'test@example.com',
  displayName: 'Test User',
  ...overrides,
});

export const mockStats = (overrides = {}) => ({
  projects: {
    total: 10,
    featured: 5,
    active: 3,
    categories: 4,
    byStatus: {
      completed: 7,
      'in-progress': 2,
      planning: 1,
    },
    byCategory: {
      'Web Application': 5,
      'Mobile App': 3,
      'Desktop App': 2,
    },
    recentActivity: [],
  },
  skills: {
    total: 15,
    featured: 8,
    byCategory: {
      Frontend: 6,
      Backend: 4,
      Database: 3,
      Tools: 2,
    },
    averageLevel: 4.2,
    topSkills: [],
  },
  ...overrides,
});

// Test helpers
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export const createMockFunction = () => vi.fn();

// Custom matchers
export const expectToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
};

export const expectToHaveClass = (
  element: HTMLElement | null,
  className: string
) => {
  expect(element).toHaveClass(className);
};

export const expectToBeVisible = (element: HTMLElement | null) => {
  expect(element).toBeVisible();
};

// Mock hooks
export const mockUseProjects = (
  projects = [mockProject()],
  loading = false
) => {
  vi.mock('@/hooks/useProjects', () => ({
    useProjects: () => ({
      projects,
      loading,
      error: null,
      addProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
      toggleProjectStatus: vi.fn(),
    }),
  }));
};

export const mockUseSkills = (skills = [mockSkill()], loading = false) => {
  vi.mock('@/hooks/useSkills', () => ({
    useSkills: () => ({
      skills,
      loading,
      error: null,
      addSkill: vi.fn(),
      updateSkill: vi.fn(),
      deleteSkill: vi.fn(),
    }),
  }));
};

export const mockUseAdminAuth = (user = mockUser(), loading = false) => {
  vi.mock('@/hooks/useAdminAuth', () => ({
    useAdminAuth: () => ({
      user,
      loading,
      error: null,
      isAuthenticated: !!user,
      canUseAdmin: true,
      login: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
    }),
  }));
};
