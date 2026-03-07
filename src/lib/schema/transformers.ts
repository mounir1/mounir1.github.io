/**
 * Type-safe data transformers and converters
 */

import { z } from 'zod';
import {
  ProjectSchema,
  ProjectInput,
  Project,
  DEFAULT_PROJECT_VALUES,
} from './projectSchema';
import {
  SkillSchema,
  SkillInput,
  Skill,
  DEFAULT_SKILL_VALUES,
} from './skillSchema';
import {
  ProjectStatus,
  ProjectCategory,
  SkillCategory,
  SkillLevel,
} from './types';

/**
 * Generic transformer interface
 */
export interface DataTransformer<TInput, TOutput> {
  transform(input: TInput): TOutput;
  reverse?(output: TOutput): TInput;
  validate?(data: unknown): boolean;
}

/**
 * Legacy project data transformer
 * Converts old project format to new schema-compliant format
 */
export class LegacyProjectTransformer
  implements DataTransformer<any, ProjectInput>
{
  transform(legacyProject: any): ProjectInput {
    const transformed: ProjectInput = {
      ...DEFAULT_PROJECT_VALUES,
      title: legacyProject.title || '',
      description: legacyProject.description || '',
      longDescription: legacyProject.longDescription,

      // Map legacy categories to new enum values
      category: this.mapLegacyCategory(legacyProject.category),

      // Map legacy status to new enum values
      status: this.mapLegacyStatus(legacyProject.status),

      // Handle arrays with fallbacks
      technologies: Array.isArray(legacyProject.technologies)
        ? legacyProject.technologies
        : [],
      achievements: Array.isArray(legacyProject.achievements)
        ? legacyProject.achievements
        : [],
      tags: Array.isArray(legacyProject.tags) ? legacyProject.tags : [],
      challenges: Array.isArray(legacyProject.challenges)
        ? legacyProject.challenges
        : [],
      solutions: Array.isArray(legacyProject.solutions)
        ? legacyProject.solutions
        : [],

      // Handle media
      images: this.transformImages(legacyProject),
      links: this.transformLinks(legacyProject),
      icon: legacyProject.icon,

      // Boolean fields with defaults
      featured: Boolean(legacyProject.featured),
      disabled: Boolean(legacyProject.disabled),
      visibility: legacyProject.visibility || 'public',

      // Numeric fields with validation
      priority: this.validateNumber(legacyProject.priority, 1, 100, 50),
      teamSize: this.validateNumber(legacyProject.teamSize, 1, 100, 1),

      // Dates
      startDate: this.transformDate(legacyProject.startDate),
      endDate: this.transformDate(legacyProject.endDate),
      duration: legacyProject.duration,

      // Role and client info
      role: legacyProject.role || 'Developer',
      clientInfo: this.transformClientInfo(legacyProject.clientInfo),
      metrics: this.transformMetrics(legacyProject.metrics),

      // System fields
      createdAt: legacyProject.createdAt || Date.now(),
      updatedAt: legacyProject.updatedAt || Date.now(),
      version: legacyProject.version || 1,
      schemaVersion: '1.0.0',
    };

    return transformed;
  }

  private mapLegacyCategory(category: string): ProjectCategory {
    const categoryMap: Record<string, ProjectCategory> = {
      'Web Application': ProjectCategory.WEB_APPLICATION,
      'Mobile Application': ProjectCategory.MOBILE_APPLICATION,
      'Enterprise Integration': ProjectCategory.ENTERPRISE_INTEGRATION,
      'E-commerce': ProjectCategory.E_COMMERCE,
      'Machine Learning': ProjectCategory.MACHINE_LEARNING,
      'API Development': ProjectCategory.API_DEVELOPMENT,
      'DevOps & Infrastructure': ProjectCategory.DEVOPS_INFRASTRUCTURE,
      'Desktop Application': ProjectCategory.DESKTOP_APPLICATION,
      'Game Development': ProjectCategory.GAME_DEVELOPMENT,
      Blockchain: ProjectCategory.BLOCKCHAIN,
      IoT: ProjectCategory.IOT,
    };

    return categoryMap[category] || ProjectCategory.OTHER;
  }

  private mapLegacyStatus(status: string): ProjectStatus {
    const statusMap: Record<string, ProjectStatus> = {
      completed: ProjectStatus.COMPLETED,
      'in-progress': ProjectStatus.IN_PROGRESS,
      maintenance: ProjectStatus.MAINTENANCE,
      archived: ProjectStatus.ARCHIVED,
      planning: ProjectStatus.PLANNING,
      'on-hold': ProjectStatus.ON_HOLD,
      cancelled: ProjectStatus.CANCELLED,
    };

    return statusMap[status] || ProjectStatus.COMPLETED;
  }

  private transformImages(legacyProject: any): any[] {
    const images = [];

    // Handle legacy single image field
    if (legacyProject.image) {
      images.push({
        url: legacyProject.image,
        alt: `${legacyProject.title} screenshot`,
        isPrimary: true,
      });
    }

    // Handle legacy logo field
    if (legacyProject.logo && legacyProject.logo !== legacyProject.image) {
      images.push({
        url: legacyProject.logo,
        alt: `${legacyProject.title} logo`,
        isPrimary: false,
      });
    }

    // Handle existing images array
    if (Array.isArray(legacyProject.images)) {
      images.push(...legacyProject.images);
    }

    return images;
  }

  private transformLinks(legacyProject: any): any[] {
    const links = [];

    if (legacyProject.liveUrl) {
      links.push({
        type: 'live',
        url: legacyProject.liveUrl,
        label: 'Live Demo',
        isPrimary: true,
      });
    }

    if (legacyProject.githubUrl) {
      links.push({
        type: 'github',
        url: legacyProject.githubUrl,
        label: 'Source Code',
        isPrimary: false,
      });
    }

    if (
      legacyProject.demoUrl &&
      legacyProject.demoUrl !== legacyProject.liveUrl
    ) {
      links.push({
        type: 'demo',
        url: legacyProject.demoUrl,
        label: 'Demo',
        isPrimary: false,
      });
    }

    if (legacyProject.caseStudyUrl) {
      links.push({
        type: 'case-study',
        url: legacyProject.caseStudyUrl,
        label: 'Case Study',
        isPrimary: false,
      });
    }

    // Handle existing links array
    if (Array.isArray(legacyProject.links)) {
      links.push(...legacyProject.links);
    }

    return links;
  }

  private transformClientInfo(clientInfo: any): any {
    if (!clientInfo || typeof clientInfo !== 'object') {
      return undefined;
    }

    return {
      name: clientInfo.name || '',
      industry: clientInfo.industry,
      size: clientInfo.size || 'medium',
      location: clientInfo.location,
      website: clientInfo.website,
      email: clientInfo.email,
      phone: clientInfo.phone,
      isPublic: Boolean(clientInfo.isPublic),
      contactPerson: clientInfo.contactPerson,
      projectBudget: clientInfo.projectBudget,
      testimonial: clientInfo.testimonial,
    };
  }

  private transformMetrics(metrics: any): any {
    if (!metrics || typeof metrics !== 'object') {
      return undefined;
    }

    return {
      usersReached: this.validateNumber(metrics.usersReached, 0, 1000000000),
      performanceImprovement: metrics.performanceImprovement,
      revenueImpact: metrics.revenueImpact,
      uptime: metrics.uptime,
      loadTime: metrics.loadTime,
      codeReduction: metrics.codeReduction,
      securityImprovements: Array.isArray(metrics.securityImprovements)
        ? metrics.securityImprovements
        : [],
      customMetrics: metrics.customMetrics || {},
    };
  }

  private transformDate(dateValue: any): Date | undefined {
    if (!dateValue) return undefined;

    if (dateValue instanceof Date) return dateValue;

    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? undefined : date;
    }

    return undefined;
  }

  private validateNumber(
    value: any,
    min: number,
    max: number,
    defaultValue?: number
  ): number | undefined {
    const num = Number(value);

    if (isNaN(num)) {
      return defaultValue;
    }

    if (num < min || num > max) {
      return defaultValue;
    }

    return num;
  }

  validate(data: unknown): boolean {
    try {
      const transformed = this.transform(data);
      ProjectSchema.parse(transformed);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Legacy skill data transformer
 */
export class LegacySkillTransformer
  implements DataTransformer<any, SkillInput>
{
  transform(legacySkill: any): SkillInput {
    const transformed: SkillInput = {
      ...DEFAULT_SKILL_VALUES,
      name: legacySkill.name || '',

      // Map legacy categories to new enum values
      category: this.mapLegacyCategory(legacySkill.category),

      // Handle level mapping
      level: this.mapLegacyLevel(legacySkill.level),
      proficiency: this.mapLegacyProficiency(
        legacySkill.level,
        legacySkill.proficiency
      ),

      // Transform experience
      experience: this.transformExperience(legacySkill),

      description: legacySkill.description,

      // Transform certifications
      certifications: this.transformCertifications(legacySkill.certifications),

      // Transform learning resources
      learningResources: this.transformLearningResources(
        legacySkill.learningResources
      ),

      // Handle arrays
      projects: Array.isArray(legacySkill.projects) ? legacySkill.projects : [],
      relatedSkills: Array.isArray(legacySkill.relatedSkills)
        ? legacySkill.relatedSkills
        : [],
      tags: Array.isArray(legacySkill.tags) ? legacySkill.tags : [],

      // Visual properties
      icon: legacySkill.icon,
      color: legacySkill.color,

      // Status fields
      featured: Boolean(legacySkill.featured),
      disabled: Boolean(legacySkill.disabled),
      visibility: legacySkill.visibility || 'public',
      priority: this.validateNumber(legacySkill.priority, 1, 100, 50),

      // System fields
      createdAt: legacySkill.createdAt || Date.now(),
      updatedAt: legacySkill.updatedAt || Date.now(),
      version: legacySkill.version || 1,
      schemaVersion: '1.0.0',
    };

    return transformed;
  }

  private mapLegacyCategory(category: string): SkillCategory {
    const categoryMap: Record<string, SkillCategory> = {
      'Frontend Development': SkillCategory.FRONTEND_DEVELOPMENT,
      'Backend Development': SkillCategory.BACKEND_DEVELOPMENT,
      Database: SkillCategory.DATABASE,
      'Cloud & DevOps': SkillCategory.CLOUD_DEVOPS,
      'Mobile Development': SkillCategory.MOBILE_DEVELOPMENT,
      'Machine Learning': SkillCategory.MACHINE_LEARNING,
      'AI & Data Science': SkillCategory.AI_DATA_SCIENCE,
      Cybersecurity: SkillCategory.CYBERSECURITY,
      Blockchain: SkillCategory.BLOCKCHAIN,
      'Game Development': SkillCategory.GAME_DEVELOPMENT,
      Design: SkillCategory.DESIGN,
      'Project Management': SkillCategory.PROJECT_MANAGEMENT,
      Languages: SkillCategory.LANGUAGES,
      Tools: SkillCategory.TOOLS,
    };

    return categoryMap[category] || SkillCategory.OTHER;
  }

  private mapLegacyLevel(level: any): SkillLevel {
    if (typeof level === 'string') {
      const levelMap: Record<string, SkillLevel> = {
        beginner: SkillLevel.BEGINNER,
        intermediate: SkillLevel.INTERMEDIATE,
        advanced: SkillLevel.ADVANCED,
        expert: SkillLevel.EXPERT,
      };
      return levelMap[level.toLowerCase()] || SkillLevel.INTERMEDIATE;
    }

    // Map numeric levels to skill levels
    if (typeof level === 'number') {
      if (level <= 25) return SkillLevel.BEGINNER;
      if (level <= 60) return SkillLevel.INTERMEDIATE;
      if (level <= 85) return SkillLevel.ADVANCED;
      return SkillLevel.EXPERT;
    }

    return SkillLevel.INTERMEDIATE;
  }

  private mapLegacyProficiency(level: any, proficiency: any): number {
    // If proficiency is already a number, validate and return it
    if (
      typeof proficiency === 'number' &&
      proficiency >= 0 &&
      proficiency <= 100
    ) {
      return Math.round(proficiency / 5) * 5; // Round to nearest 5
    }

    // Map from level if proficiency is not available
    if (typeof level === 'number' && level >= 0 && level <= 100) {
      return Math.round(level / 5) * 5;
    }

    // Default based on skill level
    const levelProficiencyMap = {
      [SkillLevel.BEGINNER]: 20,
      [SkillLevel.INTERMEDIATE]: 50,
      [SkillLevel.ADVANCED]: 75,
      [SkillLevel.EXPERT]: 90,
    };

    const skillLevel = this.mapLegacyLevel(level);
    return levelProficiencyMap[skillLevel];
  }

  private transformExperience(legacySkill: any): any {
    const yearsOfExperience = legacySkill.yearsOfExperience || 0;
    const years = Math.floor(yearsOfExperience);
    const months = Math.round((yearsOfExperience - years) * 12);

    return {
      years,
      months,
      totalMonths: years * 12 + months,
      firstUsed: this.transformDate(legacySkill.firstUsed),
      lastUsed: this.transformDate(legacySkill.lastUsed),
      frequency: legacySkill.frequency,
    };
  }

  private transformCertifications(certifications: any): any[] {
    if (!Array.isArray(certifications)) {
      return [];
    }

    return certifications.map(cert => ({
      name: cert.name || cert,
      issuer: cert.issuer || 'Unknown',
      issueDate: this.transformDate(cert.date || cert.issueDate),
      expiryDate: this.transformDate(cert.expiryDate),
      credentialId: cert.credentialId,
      url: cert.url,
      verified: Boolean(cert.verified),
      score: cert.score,
    }));
  }

  private transformLearningResources(resources: any): any[] {
    if (!Array.isArray(resources)) {
      return [];
    }

    return resources.map(resource => ({
      title: resource.title || resource.name || 'Unknown Resource',
      url: resource.url,
      type: resource.type || 'other',
      provider: resource.provider,
      duration: resource.duration,
      difficulty: resource.difficulty,
      completed: Boolean(resource.completed),
      rating: resource.rating,
      notes: resource.notes,
    }));
  }

  private transformDate(dateValue: any): Date | undefined {
    if (!dateValue) return undefined;

    if (dateValue instanceof Date) return dateValue;

    if (typeof dateValue === 'string' || typeof dateValue === 'number') {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? undefined : date;
    }

    return undefined;
  }

  private validateNumber(
    value: any,
    min: number,
    max: number,
    defaultValue?: number
  ): number | undefined {
    const num = Number(value);

    if (isNaN(num)) {
      return defaultValue;
    }

    if (num < min || num > max) {
      return defaultValue;
    }

    return num;
  }

  validate(data: unknown): boolean {
    try {
      const transformed = this.transform(data);
      SkillSchema.parse(transformed);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Export data transformer
 * Converts internal data to various export formats
 */
export class ExportDataTransformer {
  static toCSV<T extends Record<string, any>>(data: T[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return String(value);
          })
          .join(',')
      ),
    ];

    return csvRows.join('\n');
  }

  static toJSON<T>(data: T[], pretty = false): string {
    return JSON.stringify(data, null, pretty ? 2 : 0);
  }

  static toXML<T extends Record<string, any>>(
    data: T[],
    rootElement = 'data'
  ): string {
    const escapeXml = (str: string) =>
      str.replace(/[<>&'"]/g, c => {
        switch (c) {
          case '<':
            return '&lt;';
          case '>':
            return '&gt;';
          case '&':
            return '&amp;';
          case "'":
            return '&apos;';
          case '"':
            return '&quot;';
          default:
            return c;
        }
      });

    const itemsXml = data
      .map(item => {
        const itemXml = Object.entries(item)
          .map(([key, value]) => {
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') {
              return `<${key}>${escapeXml(JSON.stringify(value))}</${key}>`;
            }
            return `<${key}>${escapeXml(String(value))}</${key}>`;
          })
          .filter(Boolean)
          .join('\n    ');

        return `  <item>\n    ${itemXml}\n  </item>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n${itemsXml}\n</${rootElement}>`;
  }
}

/**
 * Import data transformer
 * Converts external data formats to internal schema
 */
export class ImportDataTransformer {
  static fromCSV(csvData: string): Record<string, any>[] {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const item: Record<string, any> = {};
        headers.forEach((header, index) => {
          item[header] = this.parseCSVValue(values[index]);
        });
        data.push(item);
      }
    }

    return data;
  }

  private static parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private static parseCSVValue(value: string): any {
    if (value === '') return null;

    // Try to parse as JSON for objects/arrays
    if (
      (value.startsWith('{') && value.endsWith('}')) ||
      (value.startsWith('[') && value.endsWith(']'))
    ) {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }

    // Try to parse as number
    if (!isNaN(Number(value)) && value !== '') {
      return Number(value);
    }

    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    return value;
  }

  static fromJSON(jsonData: string): Record<string, any>[] {
    try {
      const parsed = JSON.parse(jsonData);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }
}

// Export transformer instances
export const legacyProjectTransformer = new LegacyProjectTransformer();
export const legacySkillTransformer = new LegacySkillTransformer();
