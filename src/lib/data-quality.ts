/**
 * Data Quality Library
 * – Zod schemas matching every Firestore collection
 * – Runtime validation helpers (validateProject, validateExperience, validateSkill …)
 * – Sanitisation (XSS-strip, URL normalisation, trim)
 * – Data-quality audit that returns per-collection issue reports
 * – Auto-fix helpers for common issues
 */

import { z } from "zod";
import type { ProjectSchema, ExperienceSchema, SkillSchema, TestimonialSchema } from "@/lib/database-schema";

// ─── String helpers ────────────────────────────────────────────────────────────

const sanitizeStr = (s: string) =>
  s
    .trim()
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");

const optUrl = z
  .string()
  .url("Must be a valid URL")
  .or(z.literal(""))
  .optional()
  .transform((v) => v ?? "");

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const ProjectCategoryValues = [
  "Enterprise Integration", "Web Application", "Mobile Application",
  "Machine Learning", "E-commerce", "Commerce Infrastructure",
  "API Development", "DevOps & Infrastructure", "UI/UX Design",
  "Consulting", "Other",
] as const;

export const ProjectStatusValues = [
  "completed", "in-progress", "active", "maintenance", "archived", "concept",
] as const;

export const ProjectMetricsSchema = z.object({
  usersReached: z.number().nonnegative().optional(),
  performanceImprovement: z.string().optional(),
  costSavings: z.string().optional(),
  revenueImpact: z.string().optional(),
  uptime: z.string().optional(),
  customMetrics: z.record(z.union([z.string(), z.number()])).optional(),
});

export const ClientInfoSchema = z.object({
  name: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional(),
  location: z.string().optional(),
  testimonial: z.string().optional(),
  logo: optUrl,
  website: optUrl,
  isPublic: z.boolean(),
});

export const ProjectZodSchema = z.object({
  id: z.string().min(1, "ID required"),
  title: z.string().min(3, "Title must be ≥ 3 chars").max(200),
  description: z.string().min(10, "Description must be ≥ 10 chars").max(1000),
  longDescription: z.string().max(5000).optional(),
  category: z.enum(ProjectCategoryValues),
  technologies: z.array(z.string()).min(1, "At least one technology required"),
  achievements: z.array(z.string()),
  challenges: z.array(z.string()).optional(),
  solutions: z.array(z.string()).optional(),
  image: optUrl,
  logo: optUrl,
  icon: z.string().optional(),
  gallery: z.array(z.string().url()).optional(),
  liveUrl: optUrl,
  githubUrl: optUrl,
  demoUrl: optUrl,
  caseStudyUrl: optUrl,
  featured: z.boolean(),
  disabled: z.boolean(),
  priority: z.number().int().min(0).max(100),
  status: z.enum(ProjectStatusValues),
  metrics: ProjectMetricsSchema.optional(),
  clientInfo: ClientInfoSchema.optional(),
  teamSize: z.number().int().positive().optional(),
  role: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  duration: z.string().optional(),
  tags: z.array(z.string()),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase, hyphens only").optional(),
  metaDescription: z.string().max(160, "Meta description must be ≤ 160 chars").optional(),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
  createdBy: z.string().optional(),
  version: z.number().int().positive(),
});

export const ExperienceZodSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2).max(200),
  company: z.string().min(2).max(200),
  companyUrl: optUrl,
  companyLogo: optUrl,
  location: z.string().min(2),
  type: z.enum(["full-time", "part-time", "contract", "freelance", "internship"]),
  startDate: z.string().min(4, "startDate required (YYYY-MM)"),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string().min(10),
  achievements: z.array(z.string()).min(1, "At least one achievement"),
  technologies: z.array(z.string()),
  projects: z.array(z.string()).optional(),
  skills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  icon: z.string().optional(),
  featured: z.boolean(),
  disabled: z.boolean(),
  priority: z.number().int().min(0).max(100),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
});

export const SkillCategoryValues = [
  "Frontend Development", "Backend Development", "Database",
  "Cloud & DevOps", "Mobile Development", "Machine Learning",
  "E-commerce", "Design", "Project Management", "Languages", "Tools", "Other",
] as const;

export const SkillZodSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  category: z.enum(SkillCategoryValues),
  level: z.number().int().min(1).max(100),
  yearsOfExperience: z.number().min(0).max(50),
  description: z.string().max(500).optional(),
  certifications: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex colour").optional(),
  featured: z.boolean(),
  disabled: z.boolean(),
  priority: z.number().int().min(0).max(100),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
});

export const TestimonialZodSchema = z.object({
  id: z.string().min(1),
  clientName: z.string().min(2),
  clientTitle: z.string().min(2),
  clientCompany: z.string().min(2),
  clientPhoto: optUrl,
  content: z.string().min(20).max(2000),
  rating: z.number().int().min(1).max(5),
  projectId: z.string().optional(),
  experienceId: z.string().optional(),
  featured: z.boolean(),
  disabled: z.boolean(),
  priority: z.number().int().min(0).max(100),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
});

// ─── Validation result types ──────────────────────────────────────────────────

export interface FieldIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  issues: FieldIssue[];
}

// ─── Generic validator ────────────────────────────────────────────────────────

function validate<T>(schema: z.ZodSchema<T>, raw: unknown): ValidationResult<T> {
  const result = schema.safeParse(raw);
  if (result.success) return { valid: true, data: result.data, issues: [] };

  const issues: FieldIssue[] = result.error.errors.map((e) => ({
    field: e.path.join("."),
    message: e.message,
    severity: "error",
  }));
  return { valid: false, issues };
}

// ─── Public validators ────────────────────────────────────────────────────────

export function validateProject(raw: unknown): ValidationResult<ProjectSchema> {
  return validate(ProjectZodSchema as z.ZodSchema<ProjectSchema>, raw);
}

export function validateExperience(raw: unknown): ValidationResult<ExperienceSchema> {
  return validate(ExperienceZodSchema as z.ZodSchema<ExperienceSchema>, raw);
}

export function validateSkill(raw: unknown): ValidationResult<SkillSchema> {
  return validate(SkillZodSchema as z.ZodSchema<SkillSchema>, raw);
}

export function validateTestimonial(raw: unknown): ValidationResult<TestimonialSchema> {
  return validate(TestimonialZodSchema as z.ZodSchema<TestimonialSchema>, raw);
}

// ─── Sanitisation helpers ─────────────────────────────────────────────────────

export function sanitizeProject(raw: Partial<ProjectSchema>): Partial<ProjectSchema> {
  return {
    ...raw,
    title: raw.title ? sanitizeStr(raw.title) : raw.title,
    description: raw.description ? sanitizeStr(raw.description) : raw.description,
    longDescription: raw.longDescription ? sanitizeStr(raw.longDescription) : raw.longDescription,
    technologies: raw.technologies?.map(sanitizeStr),
    achievements: raw.achievements?.map(sanitizeStr),
    tags: raw.tags?.map(sanitizeStr),
    slug: raw.slug
      ? raw.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")
      : raw.slug,
    updatedAt: Date.now(),
  };
}

export function sanitizeExperience(raw: Partial<ExperienceSchema>): Partial<ExperienceSchema> {
  return {
    ...raw,
    title: raw.title ? sanitizeStr(raw.title) : raw.title,
    company: raw.company ? sanitizeStr(raw.company) : raw.company,
    description: raw.description ? sanitizeStr(raw.description) : raw.description,
    achievements: raw.achievements?.map(sanitizeStr),
    updatedAt: Date.now(),
  };
}

export function sanitizeSkill(raw: Partial<SkillSchema>): Partial<SkillSchema> {
  return {
    ...raw,
    name: raw.name ? sanitizeStr(raw.name) : raw.name,
    description: raw.description ? sanitizeStr(raw.description) : raw.description,
    level: raw.level ? Math.max(1, Math.min(100, raw.level)) : raw.level,
    updatedAt: Date.now(),
  };
}

// ─── Data Quality Audit ───────────────────────────────────────────────────────

export interface DataQualityIssue {
  id: string;
  collection: string;
  itemId: string;
  itemTitle: string;
  field: string;
  message: string;
  severity: "error" | "warning";
  autoFixable: boolean;
  suggestedFix?: string;
}

export interface DataQualityReport {
  collection: string;
  total: number;
  withIssues: number;
  errorCount: number;
  warningCount: number;
  issues: DataQualityIssue[];
  score: number; // 0–100
  generatedAt: number;
}

let _issueCounter = 0;

function makeIssue(
  collection: string,
  itemId: string,
  itemTitle: string,
  field: string,
  message: string,
  severity: "error" | "warning",
  autoFixable: boolean,
  suggestedFix?: string
): DataQualityIssue {
  return {
    id: `dq-${++_issueCounter}`,
    collection,
    itemId,
    itemTitle,
    field,
    message,
    severity,
    autoFixable,
    suggestedFix,
  };
}

export function auditProjects(projects: ProjectSchema[]): DataQualityReport {
  const issues: DataQualityIssue[] = [];

  for (const p of projects) {
    const title = p.title ?? "(no title)";

    if (!p.title || p.title.trim().length < 3)
      issues.push(makeIssue("projects", p.id, title, "title", "Title too short (< 3 chars)", "error", false));

    if (!p.description || p.description.trim().length < 10)
      issues.push(makeIssue("projects", p.id, title, "description", "Description too short", "error", false));

    if (!p.technologies?.length)
      issues.push(makeIssue("projects", p.id, title, "technologies", "No technologies listed", "warning", false));

    if (!p.liveUrl && !p.githubUrl && !p.demoUrl)
      issues.push(makeIssue("projects", p.id, title, "liveUrl", "No demo or source link", "warning", false));

    if (!p.image && !p.logo)
      issues.push(makeIssue("projects", p.id, title, "image", "No image or logo", "warning", false));

    if (!p.metaDescription)
      issues.push(makeIssue("projects", p.id, title, "metaDescription", "Missing SEO meta description", "warning", true, `${p.description?.slice(0, 155)}…`));

    if (p.metaDescription && p.metaDescription.length > 160)
      issues.push(makeIssue("projects", p.id, title, "metaDescription", `Meta description too long (${p.metaDescription.length}/160)`, "warning", true, p.metaDescription.slice(0, 157) + "…"));

    if (!p.slug)
      issues.push(makeIssue("projects", p.id, title, "slug", "Missing SEO slug", "warning", true, p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")));

    if (p.priority < 1 || p.priority > 100)
      issues.push(makeIssue("projects", p.id, title, "priority", "Priority out of range (1–100)", "error", true, "50"));

    if (!p.createdAt || p.createdAt > Date.now())
      issues.push(makeIssue("projects", p.id, title, "createdAt", "Invalid createdAt timestamp", "error", true, String(Date.now())));
  }

  return buildReport("projects", projects.length, issues);
}

export function auditExperiences(experiences: ExperienceSchema[]): DataQualityReport {
  const issues: DataQualityIssue[] = [];

  for (const e of experiences) {
    const title = `${e.title} @ ${e.company}`;

    if (!e.title || e.title.trim().length < 2)
      issues.push(makeIssue("experiences", e.id, title, "title", "Title too short", "error", false));

    if (!e.company)
      issues.push(makeIssue("experiences", e.id, title, "company", "Company name missing", "error", false));

    if (!e.description || e.description.trim().length < 10)
      issues.push(makeIssue("experiences", e.id, title, "description", "Description too short", "warning", false));

    if (!e.achievements?.length)
      issues.push(makeIssue("experiences", e.id, title, "achievements", "No achievements listed", "warning", false));

    if (!e.startDate)
      issues.push(makeIssue("experiences", e.id, title, "startDate", "Start date missing", "error", false));

    if (!e.current && !e.endDate)
      issues.push(makeIssue("experiences", e.id, title, "endDate", "End date missing (not current)", "warning", false));

    if (!e.technologies?.length)
      issues.push(makeIssue("experiences", e.id, title, "technologies", "No technologies listed", "warning", false));
  }

  return buildReport("experiences", experiences.length, issues);
}

export function auditSkills(skills: SkillSchema[]): DataQualityReport {
  const issues: DataQualityIssue[] = [];

  for (const s of skills) {
    if (!s.name)
      issues.push(makeIssue("skills", s.id, s.name ?? "(no name)", "name", "Skill name missing", "error", false));

    if (s.level < 1 || s.level > 100)
      issues.push(makeIssue("skills", s.id, s.name, "level", `Level ${s.level} out of range (1–100)`, "error", true, "80"));

    if (s.color && !/^#[0-9a-fA-F]{6}$/.test(s.color))
      issues.push(makeIssue("skills", s.id, s.name, "color", `Invalid hex color: ${s.color}`, "warning", false));

    if (!s.icon)
      issues.push(makeIssue("skills", s.id, s.name, "icon", "No icon set", "warning", false));

    if (s.yearsOfExperience <= 0)
      issues.push(makeIssue("skills", s.id, s.name, "yearsOfExperience", "Years of experience must be > 0", "warning", true, "1"));
  }

  return buildReport("skills", skills.length, issues);
}

function buildReport(
  collectionName: string,
  total: number,
  issues: DataQualityIssue[]
): DataQualityReport {
  const affectedIds = new Set(issues.map((i) => i.itemId));
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  // Score: start at 100, deduct 5 per error, 2 per warning, floor 0
  const rawScore = 100 - errorCount * 5 - warningCount * 2;
  const score = Math.max(0, Math.min(100, rawScore));

  return {
    collection: collectionName,
    total,
    withIssues: affectedIds.size,
    errorCount,
    warningCount,
    issues,
    score,
    generatedAt: Date.now(),
  };
}

// ─── Auto-fix helpers ─────────────────────────────────────────────────────────

/**
 * Apply all auto-fixable suggestions to a project object.
 * Returns a new, patched copy.
 */
export function autoFixProject(
  project: ProjectSchema,
  issues: DataQualityIssue[]
): ProjectSchema {
  const patched = { ...project };
  for (const issue of issues) {
    if (!issue.autoFixable || issue.itemId !== project.id) continue;
    if (issue.field === "slug" && issue.suggestedFix) patched.slug = issue.suggestedFix;
    if (issue.field === "metaDescription" && issue.suggestedFix) patched.metaDescription = issue.suggestedFix;
    if (issue.field === "priority" && issue.suggestedFix) patched.priority = Number(issue.suggestedFix);
    if (issue.field === "createdAt" && issue.suggestedFix) patched.createdAt = Number(issue.suggestedFix);
  }
  patched.updatedAt = Date.now();
  return patched;
}

export function autoFixSkill(
  skill: SkillSchema,
  issues: DataQualityIssue[]
): SkillSchema {
  const patched = { ...skill };
  for (const issue of issues) {
    if (!issue.autoFixable || issue.itemId !== skill.id) continue;
    if (issue.field === "level" && issue.suggestedFix) patched.level = Number(issue.suggestedFix);
    if (issue.field === "yearsOfExperience" && issue.suggestedFix) patched.yearsOfExperience = Number(issue.suggestedFix);
  }
  patched.updatedAt = Date.now();
  return patched;
}

// ─── Overall health score ─────────────────────────────────────────────────────

export function computeOverallHealth(reports: DataQualityReport[]): number {
  if (!reports.length) return 100;
  const avg = reports.reduce((s, r) => s + r.score, 0) / reports.length;
  return Math.round(avg);
}
