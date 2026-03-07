/**
 * Tests for schema validators
 */

import { describe, it, expect } from 'vitest';
import {
  validateProject,
  validateProjectCreate,
  validateProjectUpdate,
  validateSkill,
  validateSkillCreate,
  validateSkillUpdate,
  validateProjectsBulk,
  validateSkillsBulk,
} from '../validators';
import {
  ProjectStatus,
  ProjectCategory,
  SkillCategory,
  SkillLevel,
} from '../types';

describe('Project Validation', () => {
  const validProject = {
    title: 'Test Project',
    description: 'This is a test project with sufficient description length',
    category: ProjectCategory.WEB_APPLICATION,
    status: ProjectStatus.COMPLETED,
    technologies: ['React', 'TypeScript'],
    role: 'Full-Stack Developer',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it('should validate a valid project', () => {
    const result = validateProject(validProject);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toHaveLength(0);
  });

  it('should reject project with missing required fields', () => {
    const invalidProject = {
      title: 'Test',
      // missing description, category, technologies, role
    };

    const result = validateProject(invalidProject);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('should reject project with short description', () => {
    const invalidProject = {
      ...validProject,
      description: 'Too short',
    };

    const result = validateProject(invalidProject);
    expect(result.success).toBe(false);
    expect(result.errors?.some(e => e.field === 'description')).toBe(true);
  });

  it('should validate project with end date after start date', () => {
    const projectWithDates = {
      ...validProject,
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
    };

    const result = validateProject(projectWithDates);
    expect(result.success).toBe(true);
  });

  it('should reject project with end date before start date', () => {
    const projectWithInvalidDates = {
      ...validProject,
      startDate: new Date('2023-12-31'),
      endDate: new Date('2023-01-01'),
    };

    const result = validateProject(projectWithInvalidDates);
    expect(result.success).toBe(false);
    expect(result.errors?.some(e => e.field === 'endDate')).toBe(true);
  });

  it('should validate featured project with detailed description', () => {
    const featuredProject = {
      ...validProject,
      featured: true,
      description:
        'This is a very detailed description for a featured project that meets the minimum length requirement',
    };

    const result = validateProject(featuredProject);
    expect(result.success).toBe(true);
  });

  it('should reject featured project with short description', () => {
    const featuredProject = {
      ...validProject,
      featured: true,
      description: 'Short description',
    };

    const result = validateProject(featuredProject);
    expect(result.success).toBe(false);
  });
});

describe('Skill Validation', () => {
  const validSkill = {
    name: 'React',
    category: SkillCategory.FRONTEND_DEVELOPMENT,
    level: SkillLevel.ADVANCED,
    proficiency: 80,
    experience: {
      years: 3,
      months: 6,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  it('should validate a valid skill', () => {
    const result = validateSkill(validSkill);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.errors).toHaveLength(0);
  });

  it('should reject skill with missing required fields', () => {
    const invalidSkill = {
      name: 'Test',
      // missing category, level, proficiency, experience
    };

    const result = validateSkill(invalidSkill);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('should reject skill with invalid proficiency', () => {
    const invalidSkill = {
      ...validSkill,
      proficiency: 150, // Invalid: > 100
    };

    const result = validateSkill(invalidSkill);
    expect(result.success).toBe(false);
    expect(result.errors?.some(e => e.field === 'proficiency')).toBe(true);
  });

  it('should validate skill with aligned level and proficiency', () => {
    const skillWithAlignedValues = {
      ...validSkill,
      level: SkillLevel.EXPERT,
      proficiency: 90,
    };

    const result = validateSkill(skillWithAlignedValues);
    expect(result.success).toBe(true);
  });

  it('should reject skill with misaligned level and proficiency', () => {
    const skillWithMisalignedValues = {
      ...validSkill,
      level: SkillLevel.BEGINNER,
      proficiency: 90, // Too high for beginner
    };

    const result = validateSkill(skillWithMisalignedValues);
    expect(result.success).toBe(false);
  });

  it('should validate featured skill with high proficiency', () => {
    const featuredSkill = {
      ...validSkill,
      featured: true,
      proficiency: 85,
    };

    const result = validateSkill(featuredSkill);
    expect(result.success).toBe(true);
  });

  it('should reject featured skill with low proficiency', () => {
    const featuredSkill = {
      ...validSkill,
      featured: true,
      proficiency: 50, // Too low for featured
    };

    const result = validateSkill(featuredSkill);
    expect(result.success).toBe(false);
  });
});

describe('Bulk Validation', () => {
  const validProjects = [
    {
      title: 'Project 1',
      description: 'This is the first test project with sufficient description',
      category: ProjectCategory.WEB_APPLICATION,
      status: ProjectStatus.COMPLETED,
      technologies: ['React'],
      role: 'Developer',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      title: 'Project 2',
      description:
        'This is the second test project with sufficient description',
      category: ProjectCategory.MOBILE_APPLICATION,
      status: ProjectStatus.IN_PROGRESS,
      technologies: ['React Native'],
      role: 'Developer',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  const mixedProjects = [
    ...validProjects,
    {
      title: 'Invalid Project',
      // Missing required fields
    },
  ];

  it('should validate all valid projects', () => {
    const result = validateProjectsBulk(validProjects);
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(0);
    expect(result.summary.validCount).toBe(2);
    expect(result.summary.invalidCount).toBe(0);
  });

  it('should separate valid and invalid projects', () => {
    const result = validateProjectsBulk(mixedProjects);
    expect(result.valid).toHaveLength(2);
    expect(result.invalid).toHaveLength(1);
    expect(result.summary.validCount).toBe(2);
    expect(result.summary.invalidCount).toBe(1);
  });

  it('should provide processing time metrics', () => {
    const result = validateProjectsBulk(validProjects);
    expect(result.summary.processingTime).toBeGreaterThan(0);
    expect(result.summary.total).toBe(2);
  });
});

describe('Create and Update Validation', () => {
  it('should validate project creation with defaults', () => {
    const createData = {
      title: 'New Project',
      description: 'This is a new project with sufficient description length',
      category: ProjectCategory.WEB_APPLICATION,
      technologies: ['React'],
      role: 'Developer',
    };

    const result = validateProjectCreate(createData);
    expect(result.success).toBe(true);
    expect(result.data?.createdAt).toBeDefined();
    expect(result.data?.updatedAt).toBeDefined();
    expect(result.data?.version).toBe(1);
  });

  it('should validate project update', () => {
    const updateData = {
      title: 'Updated Project',
      updatedAt: Date.now(),
    };

    const result = validateProjectUpdate(updateData);
    expect(result.success).toBe(true);
  });

  it('should validate skill creation with defaults', () => {
    const createData = {
      name: 'New Skill',
      category: SkillCategory.FRONTEND_DEVELOPMENT,
      level: SkillLevel.INTERMEDIATE,
      proficiency: 50,
      experience: {
        years: 1,
        months: 0,
      },
    };

    const result = validateSkillCreate(createData);
    expect(result.success).toBe(true);
    expect(result.data?.createdAt).toBeDefined();
    expect(result.data?.updatedAt).toBeDefined();
    expect(result.data?.version).toBe(1);
  });
});
