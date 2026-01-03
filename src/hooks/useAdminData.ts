/**
 * Enhanced Admin Data Management Hook
 * Provides optimized CRUD operations with data quality validation
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    projectService,
    skillService,
    experienceService,
    COLLECTIONS
} from '@/lib/firebase-data-service';
import { validateDataQuality, deduplicateData, type DataQualityReport } from '@/lib/dataQualityValidator';
import { toast } from '@/hooks/use-toast';
import type { Project, ProjectInput } from '@/types/project';
import type { Skill, SkillInput } from '@/types/skill';
import type { Experience, ExperienceInput } from '@/types/experience';

export interface DataStats {
    totalProjects: number;
    totalSkills: number;
    totalExperiences: number;
    featuredProjects: number;
    recentlyUpdated: number;
    dataQualityScore: number;
}

export interface UseAdminDataReturn {
    // Projects
    projects: Project[];
    featuredProjects: Project[];
    isLoadingProjects: boolean;

    // Skills
    skills: Skill[];
    isLoadingSkills: boolean;

    // Experiences
    experiences: Experience[];
    isLoadingExperiences: boolean;

    // Stats
    stats: DataStats;

    // Data Quality
    qualityReport: DataQualityReport | null;
    runQualityCheck: () => Promise<void>;

    // Operations
    refreshData: () => Promise<void>;
    isRefreshing: boolean;

    // CRUD for Projects
    createProject: (data: ProjectInput) => Promise<string | null>;
    updateProject: (id: string, data: Partial<ProjectInput>) => Promise<boolean>;
    deleteProject: (id: string) => Promise<boolean>;

    // CRUD for Skills
    createSkill: (data: SkillInput) => Promise<string | null>;
    updateSkill: (id: string, data: Partial<SkillInput>) => Promise<boolean>;
    deleteSkill: (id: string) => Promise<boolean>;

    // CRUD for Experiences
    createExperience: (data: ExperienceInput) => Promise<string | null>;
    updateExperience: (id: string, data: Partial<ExperienceInput>) => Promise<boolean>;
    deleteExperience: (id: string) => Promise<boolean>;

    // Batch Operations
    batchUpdateProjects: (updates: Array<{ id: string; data: Partial<ProjectInput> }>) => Promise<boolean>;
    deduplicateAllData: () => Promise<void>;

    // Error handling
    lastError: Error | null;
    clearError: () => void;
}

export function useAdminData(): UseAdminDataReturn {
    // State
    const [projects, setProjects] = useState<Project[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [experiences, setExperiences] = useState<Experience[]>([]);

    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [isLoadingSkills, setIsLoadingSkills] = useState(true);
    const [isLoadingExperiences, setIsLoadingExperiences] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
    const [lastError, setLastError] = useState<Error | null>(null);

    // Clear error
    const clearError = useCallback(() => {
        setLastError(null);
    }, []);

    // Load projects
    const loadProjects = useCallback(async () => {
        try {
            setIsLoadingProjects(true);
            const data = await projectService.getAllProjects();
            setProjects(data);
            setLastError(null);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to load projects');
            setLastError(err);
            toast({
                title: 'Error Loading Projects',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoadingProjects(false);
        }
    }, []);

    // Load skills
    const loadSkills = useCallback(async () => {
        try {
            setIsLoadingSkills(true);
            const data = await skillService.getAllSkills();
            setSkills(data);
            setLastError(null);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to load skills');
            setLastError(err);
            toast({
                title: 'Error Loading Skills',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoadingSkills(false);
        }
    }, []);

    // Load experiences
    const loadExperiences = useCallback(async () => {
        try {
            setIsLoadingExperiences(true);
            const data = await experienceService.getAllExperiences();
            setExperiences(data);
            setLastError(null);
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to load experiences');
            setLastError(err);
            toast({
                title: 'Error Loading Experiences',
                description: err.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoadingExperiences(false);
        }
    }, []);

    // Refresh all data
    const refreshData = useCallback(async () => {
        setIsRefreshing(true);
        await Promise.all([
            loadProjects(),
            loadSkills(),
            loadExperiences(),
        ]);
        setIsRefreshing(false);
    }, [loadProjects, loadSkills, loadExperiences]);

    // Initial load
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Create project
    const createProject = useCallback(async (data: ProjectInput): Promise<string | null> => {
        try {
            const id = await projectService.createProject({
                ...data,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            await loadProjects();
            toast({
                title: 'Success',
                description: 'Project created successfully',
            });
            return id;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to create project');
            setLastError(err);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
            return null;
        }
    }, [loadProjects]);

    // Update project
    const updateProject = useCallback(async (id: string, data: Partial<ProjectInput>): Promise<boolean> => {
        try {
            await projectService.updateProject(id, {
                ...data,
                updatedAt: Date.now(),
            });
            await loadProjects();
            toast({
                title: 'Success',
                description: 'Project updated successfully',
            });
            return true;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to update project');
            setLastError(err);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
            return false;
        }
    }, [loadProjects]);

    // Delete project
    const deleteProject = useCallback(async (id: string): Promise<boolean> => {
        try {
            await projectService.deleteProject(id);
            await loadProjects();
            toast({
                title: 'Success',
                description: 'Project deleted successfully',
            });
            return true;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to delete project');
            setLastError(err);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
            return false;
        }
    }, [loadProjects]);

    // Create skill
    const createSkill = useCallback(async (data: SkillInput): Promise<string | null> => {
        try {
            const id = await skillService.createSkill({
                ...data,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            await loadSkills();
            toast({
                title: 'Success',
                description: 'Skill created successfully',
            });
            return id;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to create skill');
            setLastError(err);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
            return null;
        }
    }, [loadSkills]);

    // Update skill
    const updateSkill = useCallback(async (id: string, data: Partial<SkillInput>): Promise<boolean> => {
        try {
            await skillService.updateSkill(id, {
                ...data,
                updatedAt: Date.now(),
            });
            await loadSkills();
            toast({
                title: 'Success',
                description: 'Skill updated successfully',
            });
            return true;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to update skill');
            setLastError(err);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
            return false;
        }
    }, [loadSkills]);

    // Delete skill
    const deleteSkill = useCallback(async (id: string): Promise<boolean> => {
        try {
            await skillService.deleteSkill(id);
            await loadSkills();
            toast({
                title: 'Success',
                description: 'Skill deleted successfully',
            });
            return true;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to delete skill');
            setLastError(err);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
            return false;
        }
    }, [loadSkills]);

    // Create experience
    const createExperience = useCallback(async (data: ExperienceInput): Promise<string | null> => {
        try {
            const id = await experienceService.createExperience({
                ...data,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            await loadExperiences();
            toast({
                title: 'Success',
                description: 'Experience created successfully',
            });
            return id;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to create experience');
            setLastError(err);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
            return null;
        }
    }, [loadExperiences]);

    // Update experience
    const updateExperience = useCallback(async (id: string, data: Partial<ExperienceInput>): Promise<boolean> => {
        try {
            await experienceService.updateExperience(id, {
                ...data,
                updatedAt: Date.now(),
            });
            await loadExperiences();
            toast({
                title: 'Success',
                description: 'Experience updated successfully',
            });
            return true;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to update experience');
            setLastError(err);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
            return false;
        }
    }, [loadExperiences]);

    // Delete experience
    const deleteExperience = useCallback(async (id: string): Promise<boolean> => {
        try {
            await experienceService.deleteExperience(id);
            await loadExperiences();
            toast({
                title: 'Success',
                description: 'Experience deleted successfully',
            });
            return true;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to delete experience');
            setLastError(err);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
            return false;
        }
    }, [loadExperiences]);

    // Batch update projects
    const batchUpdateProjects = useCallback(async (
        updates: Array<{ id: string; data: Partial<ProjectInput> }>
    ): Promise<boolean> => {
        try {
            await Promise.all(
                updates.map(({ id, data }) =>
                    projectService.updateProject(id, {
                        ...data,
                        updatedAt: Date.now(),
                    })
                )
            );
            await loadProjects();
            toast({
                title: 'Success',
                description: `Updated ${updates.length} projects successfully`,
            });
            return true;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to batch update');
            setLastError(err);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
            return false;
        }
    }, [loadProjects]);

    // Deduplicate all data
    const deduplicateAllData = useCallback(async () => {
        try {
            // This is a placeholder - in production, you'd implement server-side deduplication
            toast({
                title: 'Deduplication',
                description: 'Checking for duplicates...',
            });

            // Run quality check to identify duplicates
            await runQualityCheck();

            toast({
                title: 'Complete',
                description: 'Data quality check completed',
            });
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to deduplicate');
            setLastError(err);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
        }
    }, []);

    // Run data quality check
    const runQualityCheck = useCallback(async () => {
        try {
            // Note: This is a client-side check. In production, you'd want server-side validation
            // For now, we'll create a simplified check
            const report: DataQualityReport = {
                isValid: true,
                errors: [],
                warnings: [],
                stats: {
                    totalEntities: projects.length + skills.length + experiences.length,
                    duplicates: 0,
                    brokenReferences: 0,
                    unusedEntities: 0,
                },
            };

            // Check for duplicate titles in projects
            const projectTitles = new Map<string, number>();
            projects.forEach(project => {
                const count = projectTitles.get(project.title) || 0;
                projectTitles.set(project.title, count + 1);
            });

            projectTitles.forEach((count, title) => {
                if (count > 1) {
                    report.warnings.push({
                        type: 'unused_entity',
                        entity: 'projects',
                        message: `Duplicate project title found: "${title}" (${count} times)`,
                    });
                    report.stats.duplicates++;
                }
            });

            // Check for duplicate skill names
            const skillNames = new Map<string, number>();
            skills.forEach(skill => {
                const count = skillNames.get(skill.name) || 0;
                skillNames.set(skill.name, count + 1);
            });

            skillNames.forEach((count, name) => {
                if (count > 1) {
                    report.warnings.push({
                        type: 'unused_entity',
                        entity: 'skills',
                        message: `Duplicate skill name found: "${name}" (${count} times)`,
                    });
                    report.stats.duplicates++;
                }
            });

            setQualityReport(report);

            if (report.warnings.length > 0 || report.errors.length > 0) {
                toast({
                    title: 'Quality Check Complete',
                    description: `Found ${report.errors.length} errors and ${report.warnings.length} warnings`,
                    variant: report.errors.length > 0 ? 'destructive' : 'default',
                });
            } else {
                toast({
                    title: 'Quality Check Complete',
                    description: 'No issues found - data quality is excellent!',
                });
            }
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Quality check failed');
            setLastError(err);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'destructive',
            });
        }
    }, [projects, skills, experiences]);

    // Calculate featured projects
    const featuredProjects = useMemo(() => {
        return projects.filter(p => p.featured);
    }, [projects]);

    // Calculate stats
    const stats = useMemo((): DataStats => {
        const now = Date.now();
        const last30Days = now - (30 * 24 * 60 * 60 * 1000);

        const recentlyUpdated = projects.filter(p =>
            p.updatedAt && p.updatedAt > last30Days
        ).length;

        let qualityScore = 100;
        if (qualityReport) {
            qualityScore -= qualityReport.stats.duplicates * 10;
            qualityScore -= qualityReport.stats.brokenReferences * 15;
            qualityScore -= qualityReport.stats.unusedEntities * 2;
            qualityScore = Math.max(0, Math.min(100, qualityScore));
        }

        return {
            totalProjects: projects.length,
            totalSkills: skills.length,
            totalExperiences: experiences.length,
            featuredProjects: featuredProjects.length,
            recentlyUpdated,
            dataQualityScore: qualityScore,
        };
    }, [projects, skills, experiences, featuredProjects, qualityReport]);

    return {
        projects,
        featuredProjects,
        isLoadingProjects,
        skills,
        isLoadingSkills,
        experiences,
        isLoadingExperiences,
        stats,
        qualityReport,
        runQualityCheck,
        refreshData,
        isRefreshing,
        createProject,
        updateProject,
        deleteProject,
        createSkill,
        updateSkill,
        deleteSkill,
        createExperience,
        updateExperience,
        deleteExperience,
        batchUpdateProjects,
        deduplicateAllData,
        lastError,
        clearError,
    };
}
