// ─── Database Schema for Portfolio ──────────────────────────────────────────

export interface ProjectSchema {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: ProjectCategory;
  technologies: string[];
  achievements: string[];
  challenges?: string[];
  solutions?: string[];
  image?: string;
  logo?: string;
  icon?: string;
  gallery?: string[];
  liveUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  caseStudyUrl?: string;
  featured: boolean;
  disabled: boolean;
  priority: number;
  status: ProjectStatus;
  metrics?: ProjectMetrics;
  clientInfo?: ClientInfo;
  teamSize?: number;
  role?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  tags: string[];
  slug?: string;
  metaDescription?: string;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  version: number;
}

export type ProjectCategory =
  | "Enterprise Integration"
  | "Web Application"
  | "Mobile Application"
  | "Machine Learning"
  | "E-commerce"
  | "Commerce Infrastructure"
  | "API Development"
  | "DevOps & Infrastructure"
  | "UI/UX Design"
  | "Consulting"
  | "Other";

export type ProjectStatus =
  | "completed"
  | "in-progress"
  | "active"
  | "maintenance"
  | "archived"
  | "concept";

export interface ProjectMetrics {
  usersReached?: number;
  performanceImprovement?: string;
  costSavings?: string;
  revenueImpact?: string;
  uptime?: string;
  customMetrics?: Record<string, string | number>;
}

export interface ClientInfo {
  name?: string;
  industry?: string;
  size?: "startup" | "small" | "medium" | "large" | "enterprise";
  location?: string;
  testimonial?: string;
  logo?: string;
  website?: string;
  isPublic: boolean;
}

export interface ExperienceSchema {
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  companyLogo?: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "freelance" | "internship";
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
  projects?: string[];
  skills: string[];
  responsibilities: string[];
  icon?: string;
  featured: boolean;
  disabled: boolean;
  priority: number;
  createdAt: number;
  updatedAt: number;
}

export interface SkillSchema {
  id: string;
  name: string;
  category: SkillCategory;
  level: number;
  yearsOfExperience: number;
  description?: string;
  certifications?: string[];
  projects?: string[];
  icon?: string;
  color?: string;
  featured: boolean;
  disabled: boolean;
  priority: number;
  createdAt: number;
  updatedAt: number;
}

export type SkillCategory =
  | "Frontend Development"
  | "Backend Development"
  | "Database"
  | "Cloud & DevOps"
  | "Mobile Development"
  | "Machine Learning"
  | "E-commerce"
  | "Design"
  | "Project Management"
  | "Languages"
  | "Tools"
  | "Other";

export interface TestimonialSchema {
  id: string;
  clientName: string;
  clientTitle: string;
  clientCompany: string;
  clientPhoto?: string;
  content: string;
  rating: number;
  projectId?: string;
  experienceId?: string;
  featured: boolean;
  disabled: boolean;
  priority: number;
  createdAt: number;
  updatedAt: number;
}

export interface AnalyticsSchema {
  id: string;
  type: "page_view" | "project_view" | "contact_form" | "cv_download" | "link_click";
  metadata: {
    page?: string;
    projectId?: string;
    referrer?: string;
    userAgent?: string;
    country?: string;
    device?: string;
    [key: string]: unknown;
  };
  timestamp: number;
  sessionId?: string;
  userId?: string;
}

export const COLLECTIONS = {
  PROJECTS: "projects",
  EXPERIENCES: "experiences",
  SKILLS: "skills",
  TESTIMONIALS: "testimonials",
  ANALYTICS: "analytics",
  USERS: "users",
} as const;

export const DEFAULT_PROJECT: Partial<ProjectSchema> = {
  featured: false,
  disabled: false,
  priority: 50,
  status: "completed",
  technologies: [],
  achievements: [],
  tags: [],
  version: 1,
};

export const DEFAULT_EXPERIENCE: Partial<ExperienceSchema> = {
  featured: false,
  disabled: false,
  priority: 50,
  current: false,
  type: "full-time",
  achievements: [],
  technologies: [],
  skills: [],
  responsibilities: [],
};

export const DEFAULT_SKILL: Partial<SkillSchema> = {
  featured: false,
  disabled: false,
  priority: 50,
  level: 80,
  yearsOfExperience: 1,
  category: "Other",
};
