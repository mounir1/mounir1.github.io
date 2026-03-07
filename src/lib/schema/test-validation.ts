/**
 * Test data and validation examples for the schema system
 * Used for testing and development purposes
 */

import { validateProject, validateSkill } from './validators';
import {
  ProjectCategory,
  ProjectStatus,
  SkillCategory,
  SkillLevel,
} from './types';
import { legacyProjectTransformer } from './transformers';
import { MigrationUtils } from './migrations';

const testProject = {
  title: 'Test E-commerce Platform',
  description:
    'A comprehensive e-commerce platform built with modern technologies, featuring user authentication, product catalog, shopping cart, and secure payment processing.',
  category: ProjectCategory.E_COMMERCE,
  status: ProjectStatus.COMPLETED,
  technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
  role: 'Full-Stack Developer',
  featured: true,
  teamSize: 3,
  startDate: new Date('2023-01-15'),
  endDate: new Date('2023-06-30'),
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const testSkill = {
  name: 'React',
  category: SkillCategory.FRONTEND_DEVELOPMENT,
  level: SkillLevel.ADVANCED,
  proficiency: 85,
  experience: {
    years: 4,
    months: 6,
  },
  description:
    'Extensive experience building complex React applications with hooks, context, and modern patterns.',
  featured: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const legacyProject = {
  title: 'Legacy Project',
  description:
    'This project uses the old data structure that needs to be migrated to the new schema format.',
  category: 'Web Application',
  status: 'completed',
  technologies: ['React', 'Express'],
  image: 'https://example.com/old-image.jpg',
  liveUrl: 'https://example.com/live',
  githubUrl: 'https://github.com/user/old-project',
  featured: true,
  priority: 75,
  startDate: '2022-01-01',
  endDate: '2022-06-01',
  role: 'Full-Stack Developer',
  createdAt: 1640995200000,
  updatedAt: 1656633600000,
};

/**
 * Validates the test project data
 */
export function validateTestProject() {
  return validateProject(testProject);
}

/**
 * Validates the test skill data
 */
export function validateTestSkill() {
  return validateSkill(testSkill);
}

/**
 * Tests legacy project transformation
 */
export function testLegacyTransformation() {
  try {
    const transformedProject =
      legacyProjectTransformer.transform(legacyProject);
    return validateProject(transformedProject);
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Tests auto migration functionality
 */
export async function testAutoMigration() {
  const oldData = {
    title: 'Migration Test Project',
    description:
      'This project will be auto-migrated to the latest schema version.',
    category: 'Web Application',
    technologies: ['jQuery', 'PHP'],
    image: 'https://example.com/legacy.jpg',
    liveUrl: 'https://example.com/legacy-live',
    featured: false,
    createdAt: 1577836800000,
  };

  try {
    const migrationResult = await MigrationUtils.autoMigrate(
      oldData,
      'project',
      '1.0.0'
    );
    if (migrationResult.success) {
      const validationResult = validateProject(migrationResult.migratedData);
      return { ...migrationResult, validationResult };
    }
    return migrationResult;
  } catch (error) {
    return { success: false, error };
  }
}

export { testProject, testSkill, legacyProject };
