/**
 * Optimized Portfolio Database Models
 * Centralized data models for portfolio management with validation
 */

import { z } from "zod";
import { Timestamp } from "firebase/firestore";

// ============================================
// PROJECT MODEL
// ============================================

export const ProjectModelSchema = z.object({
  // Core Fields
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  longDescription: z.string().max(5000).optional(),
  
  // Classification
  category: z.enum([
    "Web Application",
    "Mobile Application",
    "Enterprise Integration",
    "E-commerce",
    "Machine Learning",
    "API Development",
    "DevOps & Infrastructure",
    "Other"
  ]),
  status: z.enum(["completed", "in-progress", "maintenance", "archived"]).default("completed"),
  priority: z.number().min(0).max(100).default(50),
  
  // Technical Details
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  role: z.string().default("Full-Stack Developer"),
  achievements: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  solutions: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  
  // Media & Links
  image: z.string().url().optional().or(z.literal("")),
  logo: z.string().url().optional().or(z.literal("")),
  icon: z.string().optional(),
  images: z.array(z.string()).default([]),
  liveUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  demoUrl: z.string().url().optional().or(z.literal("")),
  caseStudyUrl: z.string().url().optional().or(z.literal("")),
  
  // Timeline
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  duration: z.string().max(50).optional(),
  teamSize: z.number().min(1).default(1),
  
  // Display Settings
  featured: z.boolean().default(false),
  disabled: z.boolean().default(false),
  visibility: z.enum(["public", "private", "draft"]).default("public"),
  
  // Client Information
  clientInfo: z.object({
    name: z.string().optional(),
    industry: z.string().optional(),
    size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional(),
    location: z.string().optional(),
    website: z.string().url().optional().or(z.literal("")),
    isPublic: z.boolean().default(false),
  }).optional(),
  
  // Metrics
  metrics: z.object({
    usersReached: z.number().optional(),
    performanceImprovement: z.string().optional(),
    revenueImpact: z.string().optional(),
    uptime: z.string().optional(),
    customMetrics: z.record(z.union([z.string(), z.number()])).optional(),
  }).optional(),
  
  // Metadata
  createdAt: z.union([z.number(), z.instanceof(Timestamp)]).optional(),
  updatedAt: z.union([z.number(), z.instanceof(Timestamp)]).optional(),
  version: z.number().default(1),
});

export type ProjectModel = z.infer<typeof ProjectModelSchema>;

// ============================================
// SKILL MODEL
// ============================================

export const SkillModelSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Skill name is required").max(100),
  category: z.string().min(1, "Category is required"),
  level: z.number().min(0).max(100).default(0),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  featured: z.boolean().default(false),
  yearsOfExperience: z.number().min(0).default(0),
  createdAt: z.union([z.number(), z.instanceof(Timestamp)]).optional(),
  updatedAt: z.union([z.number(), z.instanceof(Timestamp)]).optional(),
});

export type SkillModel = z.infer<typeof SkillModelSchema>;

// ============================================
// EXPERIENCE MODEL
// ============================================

export const ExperienceModelSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  description: z.string().min(10, "Description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  location: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  industry: z.string().optional(),
  featured: z.boolean().default(false),
  createdAt: z.union([z.number(), z.instanceof(Timestamp)]).optional(),
  updatedAt: z.union([z.number(), z.instanceof(Timestamp)]).optional(),
});

export type ExperienceModel = z.infer<typeof ExperienceModelSchema>;

// ============================================
// PORTFOLIO SETTINGS MODEL
// ============================================

export const PortfolioSettingsModelSchema = z.object({
  id: z.string().optional(),
  title: z.string().default("Portfolio"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  contactEmail: z.string().email().optional(),
  socialLinks: z.object({
    github: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
  }).optional(),
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
  updatedAt: z.union([z.number(), z.instanceof(Timestamp)]).optional(),
});

export type PortfolioSettingsModel = z.infer<typeof PortfolioSettingsModelSchema>;

// ============================================
// VALIDATION HELPERS
// ============================================

export const validateProject = (data: unknown): ProjectModel => {
  return ProjectModelSchema.parse(data);
};

export const validateSkill = (data: unknown): SkillModel => {
  return SkillModelSchema.parse(data);
};

export const validateExperience = (data: unknown): ExperienceModel => {
  return ExperienceModelSchema.parse(data);
};

export const validatePortfolioSettings = (data: unknown): PortfolioSettingsModel => {
  return PortfolioSettingsModelSchema.parse(data);
};

// ============================================
// TRANSFORM HELPERS
// ============================================

export const transformProjectForFirestore = (project: ProjectModel): Record<string, unknown> => {
  return {
    ...project,
    createdAt: project.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
};

export const transformSkillForFirestore = (skill: SkillModel): Record<string, unknown> => {
  return {
    ...skill,
    createdAt: skill.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
};

export const transformExperienceForFirestore = (experience: ExperienceModel): Record<string, unknown> => {
  return {
    ...experience,
    createdAt: experience.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
};

