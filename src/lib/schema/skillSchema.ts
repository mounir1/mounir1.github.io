/**
 * Comprehensive Skill Schema with Zod validation
 */

import { z } from 'zod';
import { SkillCategory, SkillLevel } from './types';

// URL validation schema
const urlSchema = z.string()
  .url('Must be a valid URL')
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

// Future date validation
const futureDateSchema = z.union([
  z.string().datetime(),
  z.string().refine(
    (val) => !val || val === '' || new Date(val) > new Date(),
    { message: 'Date must be in the future' }
  ),
  z.date()
]).optional().transform(val => {
  if (!val || val === '') return undefined;
  const date = typeof val === 'string' ? new Date(val) : val;
  return date > new Date() ? date : undefined;
});

// Optional string array
const optionalStringArray = z.array(
  z.string().min(1, 'Item cannot be empty').trim()
).default([]);

// Certification Schema
export const CertificationSchema = z.object({
  name: z.string()
    .min(1, 'Certificate name is required')
    .max(100, 'Certificate name too long')
    .trim(),
  issuer: z.string()
    .min(1, 'Certificate issuer is required')
    .max(100, 'Issuer name too long')
    .trim(),
  issueDate: dateSchema,
  expiryDate: futureDateSchema,
  credentialId: z.string()
    .max(100, 'Credential ID too long')
    .trim()
    .optional(),
  url: urlSchema,
  verified: z.boolean().default(false),
  score: z.number()
    .min(0, 'Score cannot be negative')
    .max(100, 'Score cannot exceed 100')
    .optional(),
});

// Learning Resource Schema
export const LearningResourceSchema = z.object({
  title: z.string()
    .min(1, 'Resource title is required')
    .max(200, 'Title too long')
    .trim(),
  url: urlSchema,
  type: z.enum(['course', 'book', 'article', 'video', 'documentation', 'tutorial', 'workshop', 'other']),
  provider: z.string()
    .max(100, 'Provider name too long')
    .trim()
    .optional(),
  duration: z.string()
    .max(50, 'Duration description too long')
    .trim()
    .optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  completed: z.boolean().default(false),
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  notes: z.string()
    .max(500, 'Notes too long')
    .trim()
    .optional(),
});

// Milestone Schema
export const MilestoneSchema = z.object({
  title: z.string()
    .min(1, 'Milestone title is required')
    .max(100, 'Title too long')
    .trim(),
  description: z.string()
    .max(300, 'Description too long')
    .trim()
    .optional(),
  targetDate: dateSchema,
  completedDate: dateSchema,
  isCompleted: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

// Skill Experience Schema
export const SkillExperienceSchema = z.object({
  years: z.number()
    .min(0, 'Years cannot be negative')
    .max(50, 'Years must be realistic (max 50)')
    .default(0),
  months: z.number()
    .int('Months must be a whole number')
    .min(0, 'Months cannot be negative')
    .max(11, 'Months cannot exceed 11')
    .default(0),
  totalMonths: z.number()
    .min(0, 'Total months cannot be negative')
    .optional(),
  firstUsed: dateSchema,
  lastUsed: dateSchema,
  frequency: z.enum(['daily', 'weekly', 'monthly', 'occasionally', 'rarely']).optional(),
});

// Main Skill Schema Base (without refinements)
const SkillSchemaBase = z.object({
  // Basic Information
  name: z.string()
    .min(1, 'Skill name is required')
    .max(50, 'Skill name must be less than 50 characters')
    .trim()
    .refine(
      (val) => val.trim().length > 0,
      { message: 'Skill name cannot be just whitespace' }
    )
    .refine(
      (val) => !/^\d+$/.test(val),
      { message: 'Skill name cannot be just numbers' }
    ),

  // Classification
  category: z.nativeEnum(SkillCategory, {
    errorMap: () => ({ message: 'Please select a valid skill category' })
  }),

  level: z.union([
    z.nativeEnum(SkillLevel),
    z.number().min(0).max(100)
  ]),

  // Proficiency (0-100 scale)
  proficiency: z.number()
    .int('Proficiency must be a whole number')
    .min(0, 'Proficiency cannot be negative')
    .max(100, 'Proficiency cannot exceed 100')
    .refine(
      (val) => val % 5 === 0 || val >= 90,
      { message: 'Proficiency should be in increments of 5 (except for expert levels 90+)' }
    )
    .optional()
    .default(50),

  // Experience
  experience: SkillExperienceSchema.optional(),
  yearsOfExperience: z.number().min(0).optional(),

  // Description and Details
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional(),

  // Certifications and Learning
  certifications: z.array(CertificationSchema).default([]),
  learningResources: z.array(LearningResourceSchema).default([]),
  learningPath: z.object({
    resources: z.array(LearningResourceSchema).default([]),
    milestones: z.array(MilestoneSchema).default([]),
    currentGoal: z.string().max(200, 'Goal too long').trim().optional(),
    targetLevel: z.nativeEnum(SkillLevel).optional(),
  }).default({
    resources: [],
    milestones: [],
  }),

  // Related Data
  projects: z.array(z.string().min(1, 'Project ID cannot be empty')).default([]),
  relatedSkills: z.array(z.string().min(1, 'Related skill ID cannot be empty')).default([]),

  // Visual and Metadata
  icon: z.string()
    .max(200, 'Icon path too long')
    .trim()
    .optional(),
  color: z.string()
    .refine(
      (val) => !val || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val),
      { message: 'Color must be a valid hex color (e.g., #FF0000)' }
    )
    .optional(),

  // Status and Organization
  featured: z.boolean().default(false),
  disabled: z.boolean().default(false),
  visibility: z.enum(['public', 'private']).default('public'),

  priority: z.number()
    .int('Priority must be a whole number')
    .min(1, 'Priority must be at least 1')
    .max(100, 'Priority cannot exceed 100')
    .default(50),

  tags: optionalStringArray,

  // System Fields
  createdAt: z.number().positive('Created date must be valid'),
  updatedAt: z.number().positive('Updated date must be valid'),
  version: z.number().int().min(1).default(1),
  schemaVersion: z.string().default('1.0.0'),
});

// Main Skill Schema with refinements
export const SkillSchema = SkillSchemaBase.refine(
  (data) => {
    // Calculate total months from years and months
    if (data.experience) {
      const totalMonths = (data.experience.years * 12) + data.experience.months;
      return totalMonths >= 0;
    }
    return true;
  },
  {
    message: 'Experience calculation error',
    path: ['experience']
  }
).refine(
  (data) => {
    // Validate proficiency vs experience relationship
    if (data.experience && data.proficiency) {
      const totalMonths = (data.experience.years * 12) + data.experience.months;
      const expectedMinProficiency = Math.min(totalMonths * 2, 90); // Rough estimate

      if (totalMonths > 24 && data.proficiency < expectedMinProficiency) {
        return false;
      }
    }
    return true;
  },
  {
    message: 'Proficiency seems low for the experience level. Consider adjusting either value.',
    path: ['proficiency']
  }
).refine(
  (data) => {
    // Featured skills should have higher proficiency
    if (data.featured && data.proficiency && data.proficiency < 70) {
      return false;
    }
    return true;
  },
  {
    message: 'Featured skills should have high proficiency levels (70+)',
    path: ['proficiency']
  }
).refine(
  (data) => {
    // High proficiency skills should have some experience or certifications
    if (data.proficiency && data.proficiency >= 80) {
      if (data.experience) {
        const totalMonths = (data.experience.years * 12) + data.experience.months;
        if (totalMonths === 0 && data.certifications.length === 0) {
          return false;
        }
      }
    }
    return true;
  },
  {
    message: 'High-proficiency skills should be backed by experience or certifications',
    path: ['experience']
  }
).refine(
  (data) => {
    // Validate level vs proficiency alignment
    if (typeof data.level === 'string' && data.proficiency) {
      const levelProficiencyMap = {
        [SkillLevel.BEGINNER]: { min: 0, max: 30 },
        [SkillLevel.INTERMEDIATE]: { min: 25, max: 60 },
        [SkillLevel.ADVANCED]: { min: 55, max: 85 },
        [SkillLevel.EXPERT]: { min: 80, max: 100 },
      };

      const range = levelProficiencyMap[data.level];
      return data.proficiency >= range.min && data.proficiency <= range.max;
    }
    return true;
  },
  {
    message: 'Proficiency level should align with skill level',
    path: ['proficiency']
  }
).refine(
  (data) => {
    // Validate experience dates
    if (data.experience && data.experience.firstUsed && data.experience.lastUsed) {
      return data.experience.lastUsed >= data.experience.firstUsed;
    }
    return true;
  },
  {
    message: 'Last used date must be after first used date',
    path: ['experience', 'lastUsed']
  }
);

// Input and output types
export type SkillInput = z.input<typeof SkillSchema>;
export type Skill = z.output<typeof SkillSchema>;

// Partial schemas for updates
export const SkillUpdateSchema = SkillSchemaBase.partial().omit({
  createdAt: true,
  schemaVersion: true
}).extend({
  updatedAt: z.number().positive('Updated date must be valid'),
  version: z.number().int().min(1).optional(),
});

export type SkillUpdate = z.infer<typeof SkillUpdateSchema>;

// Create schema for new skills
export const SkillCreateSchema = SkillSchemaBase.omit({
  createdAt: true,
  updatedAt: true,
  version: true,
  schemaVersion: true
}).extend({
  createdAt: z.number().positive('Created date must be valid').default(() => Date.now()),
  updatedAt: z.number().positive('Updated date must be valid').default(() => Date.now()),
  version: z.number().int().min(1).default(1),
  schemaVersion: z.string().default('1.0.0'),
});

export type SkillCreate = z.infer<typeof SkillCreateSchema>;

// Default skill values
export const DEFAULT_SKILL_VALUES: Partial<SkillInput> = {
  level: SkillLevel.INTERMEDIATE,
  proficiency: 50,
  experience: {
    years: 0,
    months: 0,
  },
  featured: false,
  disabled: false,
  visibility: 'public',
  priority: 50,
  certifications: [],
  learningResources: [],
  learningPath: {
    resources: [],
    milestones: [],
  },
  projects: [],
  relatedSkills: [],
  tags: [],
  version: 1,
  schemaVersion: '1.0.0',
};