/**
 * Schema migration utilities for data structure updates
 */

import { z } from 'zod';
import { MigrationStep, MigrationResult } from './types';
import {
  legacyProjectTransformer,
  legacySkillTransformer,
} from './transformers';
import { ProjectSchema, Project } from './projectSchema';
import { SkillSchema, Skill } from './skillSchema';

/**
 * Migration registry to manage all available migrations
 */
export class MigrationRegistry {
  private migrations: Map<string, MigrationStep[]> = new Map();

  register(schemaName: string, migrations: MigrationStep[]): void {
    this.migrations.set(schemaName, migrations);
  }

  getMigrations(schemaName: string): MigrationStep[] {
    return this.migrations.get(schemaName) || [];
  }

  getAvailableVersions(schemaName: string): string[] {
    const migrations = this.getMigrations(schemaName);
    return migrations.map(m => m.version).sort();
  }

  findMigrationPath(
    schemaName: string,
    fromVersion: string,
    toVersion: string
  ): MigrationStep[] {
    const migrations = this.getMigrations(schemaName);
    const path: MigrationStep[] = [];

    // Simple linear migration path for now
    // In a more complex system, you might need graph traversal
    const sortedMigrations = migrations.sort((a, b) =>
      a.version.localeCompare(b.version)
    );

    let startIndex = sortedMigrations.findIndex(m => m.version > fromVersion);
    let endIndex = sortedMigrations.findIndex(m => m.version > toVersion);

    if (startIndex === -1) startIndex = 0;
    if (endIndex === -1) endIndex = sortedMigrations.length;

    return sortedMigrations.slice(startIndex, endIndex);
  }
}

/**
 * Migration executor
 */
export class MigrationExecutor {
  constructor(private registry: MigrationRegistry) {}

  async migrate(
    schemaName: string,
    data: unknown,
    fromVersion: string,
    toVersion: string
  ): Promise<MigrationResult> {
    const startTime = performance.now();
    const migrationPath = this.registry.findMigrationPath(
      schemaName,
      fromVersion,
      toVersion
    );

    if (migrationPath.length === 0) {
      return {
        success: true,
        fromVersion,
        toVersion,
        migratedData: data,
        errors: [],
        warnings: [],
      };
    }

    let currentData = data;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      for (const migration of migrationPath) {
        // Validate data before migration if validator is provided
        if (migration.validate && !migration.validate(currentData)) {
          errors.push(
            `Data validation failed for migration ${migration.version}`
          );
          continue;
        }

        try {
          currentData = migration.up(currentData);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown migration error';
          errors.push(`Migration ${migration.version} failed: ${errorMessage}`);
          break;
        }
      }

      const endTime = performance.now();

      return {
        success: errors.length === 0,
        fromVersion,
        toVersion,
        migratedData: currentData,
        errors,
        warnings,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        fromVersion,
        toVersion,
        errors: [...errors, `Migration execution failed: ${errorMessage}`],
        warnings,
      };
    }
  }

  async rollback(
    schemaName: string,
    data: unknown,
    fromVersion: string,
    toVersion: string
  ): Promise<MigrationResult> {
    const migrationPath = this.registry.findMigrationPath(
      schemaName,
      toVersion,
      fromVersion
    );

    // Reverse the path and use down migrations
    const reversePath = migrationPath.reverse();

    let currentData = data;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      for (const migration of reversePath) {
        if (!migration.down) {
          warnings.push(
            `No rollback available for migration ${migration.version}`
          );
          continue;
        }

        try {
          currentData = migration.down(currentData);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown rollback error';
          errors.push(`Rollback ${migration.version} failed: ${errorMessage}`);
          break;
        }
      }

      return {
        success: errors.length === 0,
        fromVersion,
        toVersion,
        migratedData: currentData,
        errors,
        warnings,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        fromVersion,
        toVersion,
        errors: [...errors, `Rollback execution failed: ${errorMessage}`],
        warnings,
      };
    }
  }
}

/**
 * Project schema migrations
 */
export const projectMigrations: MigrationStep[] = [
  {
    version: '0.1.0',
    description: 'Initial legacy project format',
    up: (data: any) => data,
    down: (data: any) => data,
  },
  {
    version: '0.2.0',
    description: 'Add client info and metrics',
    up: (data: any) => ({
      ...data,
      clientInfo: data.clientInfo || null,
      metrics: data.metrics || null,
    }),
    down: (data: any) => {
      const { clientInfo, metrics, ...rest } = data;
      return rest;
    },
  },
  {
    version: '0.3.0',
    description: 'Convert single image/logo to images array',
    up: (data: any) => {
      const images = [];

      if (data.image) {
        images.push({
          url: data.image,
          alt: `${data.title} screenshot`,
          isPrimary: true,
        });
      }

      if (data.logo && data.logo !== data.image) {
        images.push({
          url: data.logo,
          alt: `${data.title} logo`,
          isPrimary: false,
        });
      }

      const { image, logo, ...rest } = data;
      return {
        ...rest,
        images: [...images, ...(data.images || [])],
      };
    },
    down: (data: any) => {
      const primaryImage = data.images?.find((img: any) => img.isPrimary);
      const logoImage = data.images?.find((img: any) => !img.isPrimary);

      return {
        ...data,
        image: primaryImage?.url || '',
        logo: logoImage?.url || '',
      };
    },
  },
  {
    version: '0.4.0',
    description: 'Convert individual URLs to links array',
    up: (data: any) => {
      const links = [];

      if (data.liveUrl) {
        links.push({
          type: 'live',
          url: data.liveUrl,
          label: 'Live Demo',
          isPrimary: true,
        });
      }

      if (data.githubUrl) {
        links.push({
          type: 'github',
          url: data.githubUrl,
          label: 'Source Code',
          isPrimary: false,
        });
      }

      if (data.demoUrl && data.demoUrl !== data.liveUrl) {
        links.push({
          type: 'demo',
          url: data.demoUrl,
          label: 'Demo',
          isPrimary: false,
        });
      }

      if (data.caseStudyUrl) {
        links.push({
          type: 'case-study',
          url: data.caseStudyUrl,
          label: 'Case Study',
          isPrimary: false,
        });
      }

      const { liveUrl, githubUrl, demoUrl, caseStudyUrl, ...rest } = data;
      return {
        ...rest,
        links: [...links, ...(data.links || [])],
      };
    },
    down: (data: any) => {
      const liveLink = data.links?.find((link: any) => link.type === 'live');
      const githubLink = data.links?.find(
        (link: any) => link.type === 'github'
      );
      const demoLink = data.links?.find((link: any) => link.type === 'demo');
      const caseStudyLink = data.links?.find(
        (link: any) => link.type === 'case-study'
      );

      return {
        ...data,
        liveUrl: liveLink?.url || '',
        githubUrl: githubLink?.url || '',
        demoUrl: demoLink?.url || '',
        caseStudyUrl: caseStudyLink?.url || '',
      };
    },
  },
  {
    version: '1.0.0',
    description: 'Full schema compliance with validation',
    up: (data: any) => {
      // Use the legacy transformer for full conversion
      return legacyProjectTransformer.transform(data);
    },
    down: (data: any) => {
      // Convert back to legacy format
      return {
        title: data.title,
        description: data.description,
        longDescription: data.longDescription,
        category: data.category,
        status: data.status,
        technologies: data.technologies,
        achievements: data.achievements,
        tags: data.tags,
        image: data.images?.[0]?.url || '',
        logo: data.images?.find((img: any) => !img.isPrimary)?.url || '',
        liveUrl:
          data.links?.find((link: any) => link.type === 'live')?.url || '',
        githubUrl:
          data.links?.find((link: any) => link.type === 'github')?.url || '',
        demoUrl:
          data.links?.find((link: any) => link.type === 'demo')?.url || '',
        caseStudyUrl:
          data.links?.find((link: any) => link.type === 'case-study')?.url ||
          '',
        featured: data.featured,
        disabled: data.disabled,
        priority: data.priority,
        startDate: data.startDate,
        endDate: data.endDate,
        duration: data.duration,
        clientInfo: data.clientInfo,
        metrics: data.metrics,
        challenges: data.challenges,
        solutions: data.solutions,
        teamSize: data.teamSize,
        role: data.role,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        version: data.version,
      };
    },
    validate: (data: any) => {
      try {
        ProjectSchema.parse(data);
        return true;
      } catch {
        return false;
      }
    },
  },
];

/**
 * Skill schema migrations
 */
export const skillMigrations: MigrationStep[] = [
  {
    version: '0.1.0',
    description: 'Initial legacy skill format',
    up: (data: any) => data,
    down: (data: any) => data,
  },
  {
    version: '0.2.0',
    description: 'Add proficiency separate from level',
    up: (data: any) => ({
      ...data,
      proficiency: data.proficiency || data.level || 50,
    }),
    down: (data: any) => {
      const { proficiency, ...rest } = data;
      return rest;
    },
  },
  {
    version: '0.3.0',
    description: 'Convert yearsOfExperience to experience object',
    up: (data: any) => {
      const yearsOfExperience = data.yearsOfExperience || 0;
      const years = Math.floor(yearsOfExperience);
      const months = Math.round((yearsOfExperience - years) * 12);

      const { yearsOfExperience: _, ...rest } = data;
      return {
        ...rest,
        experience: {
          years,
          months,
          totalMonths: years * 12 + months,
          firstUsed: data.firstUsed,
          lastUsed: data.lastUsed,
          frequency: data.frequency,
        },
      };
    },
    down: (data: any) => {
      const yearsOfExperience = data.experience
        ? data.experience.years + data.experience.months / 12
        : 0;

      return {
        ...data,
        yearsOfExperience,
        firstUsed: data.experience?.firstUsed,
        lastUsed: data.experience?.lastUsed,
        frequency: data.experience?.frequency,
      };
    },
  },
  {
    version: '0.4.0',
    description: 'Convert certifications array to structured format',
    up: (data: any) => {
      const certifications = (data.certifications || []).map((cert: any) => {
        if (typeof cert === 'string') {
          return {
            name: cert,
            issuer: 'Unknown',
            verified: false,
          };
        }
        return {
          name: cert.name || cert,
          issuer: cert.issuer || 'Unknown',
          issueDate: cert.date || cert.issueDate,
          expiryDate: cert.expiryDate,
          credentialId: cert.credentialId,
          url: cert.url,
          verified: Boolean(cert.verified),
          score: cert.score,
        };
      });

      return {
        ...data,
        certifications,
      };
    },
    down: (data: any) => {
      const certifications = (data.certifications || []).map(
        (cert: any) => cert.name || cert
      );
      return {
        ...data,
        certifications,
      };
    },
  },
  {
    version: '1.0.0',
    description: 'Full schema compliance with validation',
    up: (data: any) => {
      // Use the legacy transformer for full conversion
      return legacySkillTransformer.transform(data);
    },
    down: (data: any) => {
      // Convert back to legacy format
      const yearsOfExperience = data.experience
        ? data.experience.years + data.experience.months / 12
        : 0;

      return {
        name: data.name,
        category: data.category,
        level: data.level,
        yearsOfExperience,
        description: data.description,
        certifications:
          data.certifications?.map((cert: any) => cert.name) || [],
        projects: data.projects,
        icon: data.icon,
        color: data.color,
        featured: data.featured,
        disabled: data.disabled,
        priority: data.priority,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    },
    validate: (data: any) => {
      try {
        SkillSchema.parse(data);
        return true;
      } catch {
        return false;
      }
    },
  },
];

/**
 * Create and configure the migration registry
 */
export const migrationRegistry = new MigrationRegistry();
migrationRegistry.register('project', projectMigrations);
migrationRegistry.register('skill', skillMigrations);

/**
 * Create migration executor instance
 */
export const migrationExecutor = new MigrationExecutor(migrationRegistry);

/**
 * Utility functions for common migration tasks
 */
export class MigrationUtils {
  /**
   * Detect the version of data based on its structure
   */
  static detectDataVersion(data: any, schemaType: 'project' | 'skill'): string {
    if (!data || typeof data !== 'object') {
      return '0.1.0';
    }

    // Check for schema version field
    if (data.schemaVersion) {
      return data.schemaVersion;
    }

    if (schemaType === 'project') {
      return this.detectProjectVersion(data);
    } else if (schemaType === 'skill') {
      return this.detectSkillVersion(data);
    }

    return '0.1.0';
  }

  private static detectProjectVersion(data: any): string {
    // Check for v1.0.0 features
    if (
      data.images &&
      Array.isArray(data.images) &&
      data.links &&
      Array.isArray(data.links) &&
      data.schemaVersion
    ) {
      return '1.0.0';
    }

    // Check for v0.4.0 features (links array)
    if (data.links && Array.isArray(data.links)) {
      return '0.4.0';
    }

    // Check for v0.3.0 features (images array)
    if (data.images && Array.isArray(data.images)) {
      return '0.3.0';
    }

    // Check for v0.2.0 features (clientInfo, metrics)
    if (data.clientInfo || data.metrics) {
      return '0.2.0';
    }

    return '0.1.0';
  }

  private static detectSkillVersion(data: any): string {
    // Check for v1.0.0 features
    if (
      data.experience &&
      typeof data.experience === 'object' &&
      data.certifications &&
      Array.isArray(data.certifications) &&
      data.certifications.length > 0 &&
      typeof data.certifications[0] === 'object' &&
      data.schemaVersion
    ) {
      return '1.0.0';
    }

    // Check for v0.4.0 features (structured certifications)
    if (
      data.certifications &&
      Array.isArray(data.certifications) &&
      data.certifications.length > 0 &&
      typeof data.certifications[0] === 'object'
    ) {
      return '0.4.0';
    }

    // Check for v0.3.0 features (experience object)
    if (data.experience && typeof data.experience === 'object') {
      return '0.3.0';
    }

    // Check for v0.2.0 features (proficiency field)
    if (data.proficiency !== undefined) {
      return '0.2.0';
    }

    return '0.1.0';
  }

  /**
   * Auto-migrate data to the latest version
   */
  static async autoMigrate(
    data: any,
    schemaType: 'project' | 'skill',
    targetVersion = '1.0.0'
  ): Promise<MigrationResult> {
    const currentVersion = this.detectDataVersion(data, schemaType);

    if (currentVersion === targetVersion) {
      return {
        success: true,
        fromVersion: currentVersion,
        toVersion: targetVersion,
        migratedData: data,
        errors: [],
        warnings: [],
      };
    }

    return migrationExecutor.migrate(
      schemaType,
      data,
      currentVersion,
      targetVersion
    );
  }

  /**
   * Batch migrate multiple items
   */
  static async batchMigrate(
    items: any[],
    schemaType: 'project' | 'skill',
    targetVersion = '1.0.0'
  ): Promise<{
    successful: any[];
    failed: Array<{ index: number; data: any; error: string }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    const successful: any[] = [];
    const failed: Array<{ index: number; data: any; error: string }> = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const result = await this.autoMigrate(
          items[i],
          schemaType,
          targetVersion
        );

        if (result.success) {
          successful.push(result.migratedData);
        } else {
          failed.push({
            index: i,
            data: items[i],
            error: result.errors?.join('; ') || 'Unknown error',
          });
        }
      } catch (error) {
        failed.push({
          index: i,
          data: items[i],
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      successful,
      failed,
      summary: {
        total: items.length,
        successful: successful.length,
        failed: failed.length,
      },
    };
  }
}
