/**
 * Centralized TypeScript Type Definitions
 * Strong typing for senior-level code quality
 */

// Base Interfaces
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Person & Profile
export interface Person {
  name: string;
  role: string;
  level: string;
  location: string;
  availability: string;
  email: string;
  phone: string;
  bio?: string;
  avatar?: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  stackoverflow?: string;
  gitlab?: string;
  bitbucket?: string;
  website?: string;
}

// Experience
export interface Experience extends BaseEntity {
  title: string;
  company: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  highlights: string[];
  technologies: string[];
  logo?: string;
}

// Skills
export interface SkillCategory {
  name: string;
  icon: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years?: number;
  icon?: string;
}

// Projects
export interface Project extends BaseEntity {
  title: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  images?: string[];
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  category: 'web' | 'mobile' | 'api' | 'opensource' | 'other';
  impact?: string;
  challenges?: string[];
  solutions?: string[];
  metrics?: ProjectMetric[];
}

export interface ProjectMetric {
  label: string;
  value: string;
  description?: string;
}

// Case Studies (Senior-level content)
export interface CaseStudy extends BaseEntity {
  title: string;
  slug: string;
  project?: Project;
  overview: string;
  challenge: string;
  approach: string;
  solution: string;
  results: string[];
  technologies: string[];
  role: string;
  duration: string;
  teamSize?: number;
  architecture?: {
    diagram?: string;
    description: string;
    components: ArchitectureComponent[];
  };
  lessonsLearned?: string[];
  screenshots?: string[];
  published: boolean;
  featured: boolean;
}

export interface ArchitectureComponent {
  name: string;
  type: string;
  technology: string;
  responsibility: string;
}

// Testimonials
export interface Testimonial extends BaseEntity {
  name: string;
  role: string;
  company: string;
  image?: string;
  content: string;
  rating?: number;
  relationship: 'manager' | 'colleague' | 'client' | 'mentor';
}

// Contact
export interface ContactMessage extends BaseEntity {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied' | 'archived';
  ip?: string;
  userAgent?: string;
}

// Blog (for thought leadership)
export interface BlogPost extends BaseEntity {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  category: string;
  published: boolean;
  featured: boolean;
  readTime: number; // in minutes
  views?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

// Settings
export interface SiteSettings extends BaseEntity {
  siteTitle: string;
  siteDescription: string;
  ogImage?: string;
  favicon?: string;
  theme: 'light' | 'dark' | 'system';
  analytics: {
    googleAnalytics?: string;
    plausible?: string;
    sentry?: string;
  };
  social?: SocialLinks;
}

// Navigation
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  external?: boolean;
}

export interface NavigationConfig {
  mainNav: NavItem[];
  socialNav: NavItem[];
  footerNav?: NavItem[];
}

// Service (for structured data)
export interface Service {
  name: string;
  description: string;
  offerings?: string[];
}

// SEO & Metadata
export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  canonical?: string;
  alternateLanguages?: Array<{ code: string; href: string }>;
  robots?: string;
  author?: string;
}

// Analytics Events
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: Date;
}

// Performance Metrics
export interface WebVitals {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

// Utility Types
export type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
