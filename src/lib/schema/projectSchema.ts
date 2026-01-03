/**
 * Comprehensive Project Schema with Zod validation
 */

import { z } from 'zod';
import { ProjectStatus, ProjectCategory, ProjectPriority } from './types';

// URL validation schema
const urlSchema = z.string()
  .url('Must be a valid URL')
  .or(z.literal(''))
  .optional()
  .transform(val => val === '' ? undefined : val);

// GitHub URL validation
const githubUrlSchema = z.string()
  .refine(
    (val) => !val || val === '' || /^https:\/\/(www\.)?github\.com\/.+/.test(val),
    { message: 'Must be a valid GitHub URL' }
  )
  .or(z.literal(''))
  .optional()
  .transform(val => val === '' ? undefined : val);

// Email validation
const emailSchema = z.string()
  .email('Must be a valid email address')
  .or(z.literal(''))
  .optional()
  .transform(val => val === '' ? undefined : val);

// Phone validation
const phoneSchema = z.string()
  .refine(
    (val) => !val || val === '' || /^[+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-()]/g, '')),
    { message: 'Must be a valid phone number' }
  )
  .or(z.literal(''))
  .optional()
  .transform(val => val === '' ? undefined : val);

// Date validation
const dateSchema = z.union([
  z.string().datetime(),
  z.string().refine(
    (val) => !val || val === '' || !isNaN(Date.parse(val)),
    { message: 'Must be a valid date' }
  ),
  z.date()
]).optional().transform(val => {
  if (!val || val === '') return undefined;
  return typeof val === 'string' ? new Date(val) : val;
});

// Non-empty string array
const nonEmptyStringArray = z.array(
  z.string().min(1, 'Item cannot be empty').trim()
).min(1, 'At least one item is required');

// Optional string array
const optionalStringArray = z.array(
  z.string().min(1, 'Item cannot be empty').trim()
).default([]);

// Client Information Schema
export const ClientInfoSchema = z.object({
  name: z.string()
    .min(1, 'Client name is required')
    .max(100, 'Client name must be less than 100 characters')
    .trim(),
  industry: z.string()
    .max(50, 'Industry must be less than 50 characters')
    .trim()
    .optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise'], {
    errorMap: () => ({ message: 'Please select a valid company size' })
  }).optional(),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .trim()
    .optional(),
  website: urlSchema,
  email: emailSchema,
  phone: phoneSchema,
  isPublic: z.boolean().default(false),
  contactPerson: z.string()
    .max(100, 'Contact person name must be less than 100 characters')
    .trim()
    .optional(),
  projectBudget: z.string()
    .max(50, 'Budget information must be less than 50 characters')
    .trim()
    .optional(),
  testimonial: z.string()
    .max(1000, 'Testimonial must be less than 1000 characters')
    .trim()
    .optional(),
});

// Project Metrics Schema
export const ProjectMetricsSchema = z.object({
  usersReached: z.number()
    .int('Must be a whole number')
    .min(0, 'Users reached cannot be negative')
    .max(1000000000, 'Number seems unrealistic')
    .optional(),
  performanceImprovement: z.string()
    .max(200, 'Performance improvement description must be less than 200 characters')
    .trim()
    .optional(),
  revenueImpact: z.string()
    .max(100, 'Revenue impact must be less than 100 characters')
    .trim()
    .optional(),
  uptime: z.string()
    .refine(
      (val) => !val || /^\d{1,3}(\.\d{1,2})?%?$/.test(val),
      { message: 'Uptime should be a percentage (e.g., 99.9% or 99.9)' }
    )
    .optional(),
  loadTime: z.string()
    .refine(
      (val) => !val || /^\d+(\.\d+)?(ms|s)$/.test(val),
      { message: 'Load time should include units (e.g., 500ms or 2.5s)' }
    )
    .optional(),
  codeReduction: z.string()
    .max(100, 'Code reduction description must be less than 100 characters')
    .trim()
    .optional(),
  securityImprovements: optionalStringArray,
  customMetrics: z.record(z.union([z.string(), z.number()])).default({}),
});

// Project Link Schema
export const ProjectLinkSchema = z.object({
  type: z.enum(['live', 'github', 'demo', 'case-study', 'documentation', 'other']),
  url: z.string().url('Must be a valid URL'),
  label: z.string().min(1, 'Link label is required').max(50, 'Label too long'),
  isPrimary: z.boolean().default(false),
});

// Project Image Schema
export const ProjectImageSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  alt: z.string().min(1, 'Alt text is required').max(200, 'Alt text too long'),
  caption: z.string().max(300, 'Caption too long').optional(),
  isPrimary: z.boolean().default(false),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

// SEO Schema
export const ProjectSEOSchema = z.object({
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  metaTitle: z.string()
    .max(60, 'Meta title should be under 60 characters')
    .optional(),
  metaDescription: z.string()
    .max(160, 'Meta description should be under 160 characters')
    .optional(),
  keywords: optionalStringArray,
  ogImage: urlSchema,
});

// Main Project Schema
export const ProjectSchema = z.object({
  // Basic Information
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim()
    .refine(
      (val) => val.trim().length > 0,
      { message: 'Title cannot be just whitespace' }
    ),

  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim()
    .refine(
      (val) => val.trim().length >= 10,
      { message: 'Description must contain meaningful content' }
    ),

  longDescription: z.string()
    .max(5000, 'Long description must be less than 5000 characters')
    .trim()
    .optional(),

  // Classification
  category: z.nativeEnum(ProjectCategory, {
    errorMap: () => ({ message: 'Please select a valid project category' })
  }),

  status: z.nativeEnum(ProjectStatus, {
    errorMap: () => ({ message: 'Please select a valid project status' })
  }).default(ProjectStatus.COMPLETED),

  priority: z.nativeEnum(ProjectPriority).default(ProjectPriority.MEDIUM),

  // Technical Details
  technologies: nonEmptyStringArray,
  achievements: optionalStringArray,
  challenges: optionalStringArray,
  solutions: optionalStringArray,
  tags: optionalStringArray,

  // Media and Links
  images: z.array(ProjectImageSchema).default([]),
  links: z.array(ProjectLinkSchema).default([]),
  icon: z.string().optional(),

  // Legacy/Flat fields for form compatibility
  image: urlSchema,
  logo: urlSchema,
  liveUrl: urlSchema,
  githubUrl: githubUrlSchema,
  demoUrl: urlSchema,
  caseStudyUrl: urlSchema,

  // Project Details
  featured: z.boolean().default(false),
  disabled: z.boolean().default(false),
  visibility: z.enum(['public', 'private', 'draft']).default('public'),

  // Timeline
  startDate: dateSchema,
  endDate: dateSchema,
  duration: z.string()
    .max(50, 'Duration must be less than 50 characters')
    .trim()
    .optional(),

  // Team and Role
  teamSize: z.number()
    .int('Team size must be a whole number')
    .min(1, 'Team size must be at least 1')
    .max(100, 'Team size cannot exceed 100')
    .default(1),

  role: z.string()
    .min(1, 'Role is required')
    .max(100, 'Role must be less than 100 characters')
    .trim(),

  // Client and Business
  clientInfo: ClientInfoSchema.optional(),
  metrics: ProjectMetricsSchema.optional(),

  // SEO and Metadata
  seo: ProjectSEOSchema.optional(),

  // System Fields
  createdAt: z.number().positive('Created date must be valid'),
  updatedAt: z.number().positive('Updated date must be valid'),
  version: z.number().int().min(1).default(1),
  schemaVersion: z.string().default('1.0.0'),

}).refine(
  (data) => {
    // Validate date logic: end date should be after start date
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
).refine(
  (data) => {
    // Completed projects should have an end date
    if (data.status === ProjectStatus.COMPLETED && data.startDate && !data.endDate) {
      return false;
    }
    return true;
  },
  {
    message: 'Completed projects should have an end date',
    path: ['endDate']
  }
).refine(
  (data) => {
    // Featured projects should have better descriptions
    if (data.featured && data.description.length < 50) {
      return false;
    }
    return true;
  },
  {
    message: 'Featured projects should have detailed descriptions (at least 50 characters)',
    path: ['description']
  }
).refine(
  (data) => {
    // Projects should have at least one primary image if they have images
    if (data.images.length > 0) {
      const primaryImages = data.images.filter(img => img.isPrimary);
      return primaryImages.length <= 1; // At most one primary image
    }
    return true;
  },
  {
    message: 'Only one image can be marked as primary',
    path: ['images']
  }
).refine(
  (data) => {
    // Projects should have at least one primary link if they have links
    if (data.links.length > 0) {
      const primaryLinks = data.links.filter(link => link.isPrimary);
      return primaryLinks.length <= 1; // At most one primary link
    }
    return true;
  },
  {
    message: 'Only one link can be marked as primary',
    path: ['links']
  }
).refine(
  (data) => {
    // SEO slug should be unique (this would need to be checked against existing projects)
    if (data.seo?.slug) {
      return /^[a-z0-9-]+$/.test(data.seo.slug);
    }
    return true;
  },
  {
    message: 'SEO slug must contain only lowercase letters, numbers, and hyphens',
    path: ['seo', 'slug']
  }
);

// Input and output types
export type ProjectInput = z.input<typeof ProjectSchema>;
export type Project = z.output<typeof ProjectSchema>;

// Create a base schema without refinements for partial operations
const ProjectSchemaBase = z.object({
  // Basic Information
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),

  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters')
    .trim(),

  longDescription: z.string()
    .max(5000, 'Long description must be less than 5000 characters')
    .trim()
    .optional(),

  // Classification
  category: z.nativeEnum(ProjectCategory, {
    errorMap: () => ({ message: 'Please select a valid project category' })
  }),

  status: z.nativeEnum(ProjectStatus, {
    errorMap: () => ({ message: 'Please select a valid project status' })
  }).default(ProjectStatus.COMPLETED),

  priority: z.nativeEnum(ProjectPriority).default(ProjectPriority.MEDIUM),

  // Technical Details
  technologies: nonEmptyStringArray,
  achievements: optionalStringArray,
  challenges: optionalStringArray,
  solutions: optionalStringArray,
  tags: optionalStringArray,

  // Media and Links
  images: z.array(ProjectImageSchema).default([]),
  links: z.array(ProjectLinkSchema).default([]),
  icon: z.string().optional(),

  // Project Details
  featured: z.boolean().default(false),
  disabled: z.boolean().default(false),
  visibility: z.enum(['public', 'private', 'draft']).default('public'),

  // Timeline
  startDate: dateSchema,
  endDate: dateSchema,
  duration: z.string()
    .max(50, 'Duration must be less than 50 characters')
    .trim()
    .optional(),

  // Team and Role
  teamSize: z.number()
    .int('Team size must be a whole number')
    .min(1, 'Team size must be at least 1')
    .max(100, 'Team size cannot exceed 100')
    .default(1),

  role: z.string()
    .min(1, 'Role is required')
    .max(100, 'Role must be less than 100 characters')
    .trim(),

  // Client and Business
  clientInfo: ClientInfoSchema.optional(),
  metrics: ProjectMetricsSchema.optional(),

  // SEO and Metadata
  seo: ProjectSEOSchema.optional(),

  // System Fields
  createdAt: z.number().positive('Created date must be valid'),
  updatedAt: z.number().positive('Updated date must be valid'),
  version: z.number().int().min(1).default(1),
  schemaVersion: z.string().default('1.0.0'),
});

// Partial schemas for updates
export const ProjectUpdateSchema = ProjectSchemaBase.partial().omit({
  createdAt: true,
  schemaVersion: true
}).extend({
  updatedAt: z.number().positive('Updated date must be valid'),
  version: z.number().int().min(1).optional(),
});

export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;

// Create schema for new projects
export const ProjectCreateSchema = ProjectSchemaBase.omit({
  createdAt: true,
  updatedAt: true,
  version: true,
  schemaVersion: true
}).extend({
  // Allow setting initial values for these fields
  createdAt: z.number().positive('Created date must be valid').optional(),
  updatedAt: z.number().positive('Updated date must be valid').optional(),
});

export type ProjectCreate = z.infer<typeof ProjectCreateSchema>;

// Default project values
export const DEFAULT_PROJECT_VALUES: Partial<ProjectInput> = {
  status: ProjectStatus.COMPLETED,
  priority: ProjectPriority.MEDIUM,
  featured: false,
  disabled: false,
  visibility: 'public',
  teamSize: 1,
  technologies: [],
  achievements: [],
  challenges: [],
  solutions: [],
  tags: [],
  images: [],
  links: [],
  version: 1,
  schemaVersion: '1.0.0',
};