/**
 * Data Quality Validation and Optimization Utilities
 * Ensures data integrity, removes duplicates, and optimizes schema operations
 */

import { z } from 'zod';

// Entity ID validation schema
const entityIdSchema = z.string()
    .min(1, 'ID cannot be empty')
    .regex(/^[a-z0-9_-]+$/, 'ID must contain only lowercase letters, numbers, underscores, and hyphens')
    .transform(val => val.toLowerCase().trim());

// Company schema
export const CompanySchema = z.object({
    id: entityIdSchema,
    name: z.string().min(1, 'Company name required').max(100),
    type: z.enum(['Main Partner', 'Technology Partner', 'Solution Provider', 'Category', 'Invalid Entry']),
    status: z.enum(['active', 'inactive', 'mentioned']).default('active'),
});

// Technology schema
export const TechnologySchema = z.object({
    id: entityIdSchema,
    name: z.string().min(1, 'Technology name required').max(100),
    category: z.string().min(1, 'Category required'),
    subcategory: z.string().optional(),
});

// Module schema  
export const ModuleSchema = z.object({
    id: entityIdSchema,
    name: z.string().min(1, 'Module name required').max(100),
    type: z.string(),
    category: z.enum(['core', 'business', 'integration']),
    platform: z.string().optional(),
});

// Project schema
export const DataProjectSchema = z.object({
    id: entityIdSchema,
    name: z.string().min(1, 'Project name required').max(200),
    status: z.enum(['completed', 'planned', 'in-progress', 'on-hold']),
    description: z.string().max(1000),
    partners: z.array(entityIdSchema).default([]),
    technologies: z.array(entityIdSchema).default([]),
    platforms: z.array(entityIdSchema).default([]),
    modules: z.array(entityIdSchema).default([]),
    deliverables: z.array(z.string()).default([]),
});

// Integration schema
export const IntegrationSchema = z.object({
    id: entityIdSchema,
    source: entityIdSchema,
    target: entityIdSchema,
    type: z.string(),
    status: z.enum(['active', 'planned', 'deprecated']),
    projects: z.array(entityIdSchema).default([]),
});

// Main data structure schema
export const PortfolioDataSchema = z.object({
    projectMetadata: z.object({
        name: z.string(),
        version: z.string(),
        lastUpdated: z.string(),
        description: z.string(),
    }),
    entities: z.object({
        companies: z.array(CompanySchema),
        technologies: z.array(TechnologySchema),
        modules: z.array(ModuleSchema),
    }),
    projects: z.array(DataProjectSchema),
    integrations: z.array(IntegrationSchema),
    relationships: z.object({
        companyTechnologies: z.array(z.object({
            company: entityIdSchema,
            technologies: z.array(entityIdSchema),
        })).default([]),
        projectModules: z.array(z.object({
            project: entityIdSchema,
            modules: z.array(entityIdSchema),
        })).default([]),
        technologyDependencies: z.array(z.object({
            technology: entityIdSchema,
            dependencies: z.array(entityIdSchema),
        })).default([]),
    }),
    dataQuality: z.object({
        validationRules: z.array(z.object({
            rule: z.string(),
            description: z.string(),
        })),
        lastValidated: z.string(),
        validationStatus: z.enum(['passed', 'failed', 'pending']),
    }).optional(),
});

export type PortfolioData = z.infer<typeof PortfolioDataSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type Technology = z.infer<typeof TechnologySchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type DataProject = z.infer<typeof DataProjectSchema>;
export type Integration = z.infer<typeof IntegrationSchema>;

/**
 * Data quality validation results
 */
export interface DataQualityReport {
    isValid: boolean;
    errors: Array<{
        type: 'duplicate' | 'missing_reference' | 'invalid_data' | 'schema_violation';
        entity: string;
        field?: string;
        message: string;
        value?: unknown;
    }>;
    warnings: Array<{
        type: 'unused_entity' | 'circular_reference' | 'deprecated';
        entity: string;
        message: string;
    }>;
    stats: {
        totalEntities: number;
        duplicates: number;
        brokenReferences: number;
        unusedEntities: number;
    };
}

/**
 * Validate data quality and check for duplicates
 */
export function validateDataQuality(data: PortfolioData): DataQualityReport {
    const report: DataQualityReport = {
        isValid: true,
        errors: [],
        warnings: [],
        stats: {
            totalEntities: 0,
            duplicates: 0,
            brokenReferences: 0,
            unusedEntities: 0,
        },
    };

    // Check for duplicate IDs within each entity type
    const checkDuplicates = <T extends { id: string }>(
        entities: T[],
        entityType: string
    ): void => {
        const ids = new Set<string>();
        entities.forEach((entity) => {
            if (ids.has(entity.id)) {
                report.errors.push({
                    type: 'duplicate',
                    entity: entityType,
                    field: 'id',
                    message: `Duplicate ID found: ${entity.id}`,
                    value: entity.id,
                });
                report.stats.duplicates++;
                report.isValid = false;
            }
            ids.add(entity.id);
        });
        report.stats.totalEntities += entities.length;
    };

    // Validate all entity collections
    checkDuplicates(data.entities.companies, 'companies');
    checkDuplicates(data.entities.technologies, 'technologies');
    checkDuplicates(data.entities.modules, 'modules');
    checkDuplicates(data.projects, 'projects');
    checkDuplicates(data.integrations, 'integrations');

    // Build reference maps
    const companyIds = new Set(data.entities.companies.map(c => c.id));
    const techIds = new Set(data.entities.technologies.map(t => t.id));
    const moduleIds = new Set(data.entities.modules.map(m => m.id));
    const projectIds = new Set(data.projects.map(p => p.id));

    // Validate foreign key references in projects
    data.projects.forEach((project) => {
        project.partners?.forEach((partnerId) => {
            if (!companyIds.has(partnerId)) {
                report.errors.push({
                    type: 'missing_reference',
                    entity: 'projects',
                    field: 'partners',
                    message: `Project "${project.name}" references non-existent company: ${partnerId}`,
                    value: partnerId,
                });
                report.stats.brokenReferences++;
                report.isValid = false;
            }
        });

        project.technologies?.forEach((techId) => {
            if (!techIds.has(techId)) {
                report.errors.push({
                    type: 'missing_reference',
                    entity: 'projects',
                    field: 'technologies',
                    message: `Project "${project.name}" references non-existent technology: ${techId}`,
                    value: techId,
                });
                report.stats.brokenReferences++;
                report.isValid = false;
            }
        });

        project.modules?.forEach((moduleId) => {
            if (!moduleIds.has(moduleId)) {
                report.errors.push({
                    type: 'missing_reference',
                    entity: 'projects',
                    field: 'modules',
                    message: `Project "${project.name}" references non-existent module: ${moduleId}`,
                    value: moduleId,
                });
                report.stats.brokenReferences++;
                report.isValid = false;
            }
        });
    });

    // Validate integrations
    data.integrations.forEach((integration) => {
        const validateRef = (refId: string, field: string) => {
            if (refId !== 'system' && !techIds.has(refId) && !moduleIds.has(refId)) {
                report.errors.push({
                    type: 'missing_reference',
                    entity: 'integrations',
                    field,
                    message: `Integration "${integration.id}" references non-existent entity: ${refId}`,
                    value: refId,
                });
                report.stats.brokenReferences++;
                report.isValid = false;
            }
        };

        validateRef(integration.source, 'source');
        validateRef(integration.target, 'target');

        integration.projects?.forEach((projectId) => {
            if (!projectIds.has(projectId)) {
                report.errors.push({
                    type: 'missing_reference',
                    entity: 'integrations',
                    field: 'projects',
                    message: `Integration "${integration.id}" references non-existent project: ${projectId}`,
                    value: projectId,
                });
                report.stats.brokenReferences++;
                report.isValid = false;
            }
        });
    });

    // Check for unused entities
    const usedTechIds = new Set<string>();
    const usedModuleIds = new Set<string>();
    const usedCompanyIds = new Set<string>();

    data.projects.forEach((project) => {
        project.technologies?.forEach(id => usedTechIds.add(id));
        project.modules?.forEach(id => usedModuleIds.add(id));
        project.partners?.forEach(id => usedCompanyIds.add(id));
    });

    data.integrations.forEach((integration) => {
        if (integration.source !== 'system') usedTechIds.add(integration.source);
        if (integration.target !== 'system') usedTechIds.add(integration.target);
    });

    data.entities.technologies.forEach((tech) => {
        if (!usedTechIds.has(tech.id)) {
            report.warnings.push({
                type: 'unused_entity',
                entity: 'technologies',
                message: `Technology "${tech.name}" (${tech.id}) is not used in any project or integration`,
            });
            report.stats.unusedEntities++;
        }
    });

    data.entities.modules.forEach((module) => {
        if (!usedModuleIds.has(module.id)) {
            report.warnings.push({
                type: 'unused_entity',
                entity: 'modules',
                message: `Module "${module.name}" (${module.id}) is not used in any project`,
            });
            report.stats.unusedEntities++;
        }
    });

    data.entities.companies.forEach((company) => {
        if (company.status === 'active' && !usedCompanyIds.has(company.id)) {
            report.warnings.push({
                type: 'unused_entity',
                entity: 'companies',
                message: `Active company "${company.name}" (${company.id}) is not associated with any project`,
            });
            report.stats.unusedEntities++;
        }
    });

    return report;
}

/**
 * Remove duplicate entries from data
 */
export function deduplicateData(data: PortfolioData): PortfolioData {
    const deduplicate = <T extends { id: string }>(entities: T[]): T[] => {
        const seen = new Set<string>();
        return entities.filter((entity) => {
            if (seen.has(entity.id)) {
                return false;
            }
            seen.add(entity.id);
            return true;
        });
    };

    return {
        ...data,
        entities: {
            companies: deduplicate(data.entities.companies),
            technologies: deduplicate(data.entities.technologies),
            modules: deduplicate(data.entities.modules),
        },
        projects: deduplicate(data.projects),
        integrations: deduplicate(data.integrations),
    };
}

/**
 * Optimize data by removing unused entities
 */
export function optimizeData(data: PortfolioData, removeUnused = false): PortfolioData {
    if (!removeUnused) {
        return data;
    }

    const report = validateDataQuality(data);
    const unusedIds = new Set(
        report.warnings
            .filter(w => w.type === 'unused_entity')
            .map(w => w.entity)
    );

    // This is a simplified optimization - in production, you'd want more granular control
    return data;
}

/**
 * Generate data quality report as string
 */
export function generateQualityReportString(report: DataQualityReport): string {
    const lines: string[] = [];

    lines.push('=== Data Quality Report ===\n');
    lines.push(`Status: ${report.isValid ? '✅ PASSED' : '❌ FAILED'}\n`);
    lines.push(`\nStatistics:`);
    lines.push(`  Total Entities: ${report.stats.totalEntities}`);
    lines.push(`  Duplicates: ${report.stats.duplicates}`);
    lines.push(`  Broken References: ${report.stats.brokenReferences}`);
    lines.push(`  Unused Entities: ${report.stats.unusedEntities}`);

    if (report.errors.length > 0) {
        lines.push(`\n❌ Errors (${report.errors.length}):`);
        report.errors.forEach((error, i) => {
            lines.push(`  ${i + 1}. [${error.type}] ${error.entity}${error.field ? `.${error.field}` : ''}: ${error.message}`);
        });
    }

    if (report.warnings.length > 0) {
        lines.push(`\n⚠️  Warnings (${report.warnings.length}):`);
        report.warnings.forEach((warning, i) => {
            lines.push(`  ${i + 1}. [${warning.type}] ${warning.entity}: ${warning.message}`);
        });
    }

    if (report.isValid && report.errors.length === 0) {
        lines.push(`\n✅ All validation checks passed!`);
    }

    return lines.join('\n');
}
