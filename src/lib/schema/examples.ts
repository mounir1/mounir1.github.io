/**
 * Examples demonstrating how to use the schema validation system
 */

import {
  validateProject,
  validateProjectCreate,
  validateSkill,
  validateSkillCreate,
  validateProjectsBulk,
} from './validators';
import { legacyProjectTransformer } from './transformers';
import { MigrationUtils } from './migrations';
import {
  ProjectCategory,
  ProjectStatus,
  SkillCategory,
  SkillLevel,
} from './types';

/**
 * Example 1: Basic project validation
 */
export function exampleBasicProjectValidation() {
  const projectData = {
    title: 'E-commerce Platform',
    description:
      'A comprehensive e-commerce platform built with React and Node.js, featuring user authentication, product catalog, shopping cart, and payment processing.',
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

  return validateProject(projectData);
}

/**
 * Example 2: Creating a new project with validation
 */
export function exampleCreateProject() {
  const newProjectData = {
    title: 'Portfolio Website',
    description:
      'A modern, responsive portfolio website showcasing my projects and skills with smooth animations and dark mode support.',
    category: ProjectCategory.WEB_APPLICATION,
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    role: 'Frontend Developer',
    featured: false,
    images: [
      {
        url: 'https://example.com/portfolio-screenshot.jpg',
        alt: 'Portfolio website homepage',
        isPrimary: true,
      },
    ],
    links: [
      {
        type: 'live' as const,
        url: 'https://myportfolio.com',
        label: 'Live Site',
        isPrimary: true,
      },
      {
        type: 'github' as const,
        url: 'https://github.com/user/portfolio',
        label: 'Source Code',
        isPrimary: false,
      },
    ],
  };

  return validateProjectCreate(newProjectData);
}

/**
 * Example 3: Skill validation with certifications
 */
export function exampleSkillValidation() {
  const skillData = {
    name: 'React',
    category: SkillCategory.FRONTEND_DEVELOPMENT,
    level: SkillLevel.ADVANCED,
    proficiency: 85,
    experience: {
      years: 4,
      months: 6,
      firstUsed: new Date('2019-03-01'),
      lastUsed: new Date(),
      frequency: 'daily' as const,
    },
    description:
      'Extensive experience building complex React applications with hooks, context, and modern patterns.',
    certifications: [
      {
        name: 'React Developer Certification',
        issuer: 'Meta',
        issueDate: new Date('2022-08-15'),
        url: 'https://certificates.meta.com/react-cert-123',
        verified: true,
        score: 92,
      },
    ],
    learningResources: [
      {
        title: 'React Documentation',
        url: 'https://react.dev',
        type: 'documentation' as const,
        completed: true,
        rating: 5,
      },
      {
        title: 'Advanced React Patterns',
        url: 'https://course-platform.com/advanced-react',
        type: 'course' as const,
        provider: 'Course Platform',
        duration: '40 hours',
        difficulty: 'advanced' as const,
        completed: true,
        rating: 4,
      },
    ],
    projects: ['project-1', 'project-2', 'project-3'],
    featured: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return validateSkill(skillData);
}

/**
 * Example 4: Bulk validation of multiple projects
 */
export function exampleBulkValidation() {
  const projects = [
    {
      title: 'Project A',
      description:
        'A valid project with all required fields and proper structure.',
      category: ProjectCategory.WEB_APPLICATION,
      status: ProjectStatus.COMPLETED,
      technologies: ['React', 'Node.js'],
      role: 'Developer',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      title: 'Project B',
      description:
        'Another valid project with different technologies and status.',
      category: ProjectCategory.MOBILE_APPLICATION,
      status: ProjectStatus.IN_PROGRESS,
      technologies: ['React Native', 'Firebase'],
      role: 'Mobile Developer',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      title: 'Invalid Project',
      description: 'Short',
    },
  ];

  return validateProjectsBulk(projects);
}

/**
 * Example 5: Legacy data transformation
 */
export function exampleLegacyTransformation() {
  const legacyProject = {
    title: 'Old Project Format',
    description:
      'This project uses the old data structure that needs to be migrated.',
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

  try {
    const transformedProject =
      legacyProjectTransformer.transform(legacyProject);
    const validationResult = validateProject(transformedProject);
    return { transformedProject, validationResult };
  } catch (error) {
    return { error };
  }
}

/**
 * Example 6: Auto-migration with version detection
 */
export async function exampleAutoMigration() {
  const oldProjectData = {
    title: 'Legacy Project',
    description:
      'This project needs to be migrated to the latest schema version.',
    category: 'Web Application',
    technologies: ['jQuery', 'PHP'],
    image: 'https://example.com/legacy.jpg',
    liveUrl: 'https://example.com/legacy-live',
    featured: false,
    createdAt: 1577836800000,
  };

  const detectedVersion = MigrationUtils.detectDataVersion(
    oldProjectData,
    'project'
  );
  const migrationResult = await MigrationUtils.autoMigrate(
    oldProjectData,
    'project',
    '1.0.0'
  );

  if (migrationResult.success) {
    const validationResult = validateProject(migrationResult.migratedData);
    return { ...migrationResult, validationResult, detectedVersion };
  }

  return { ...migrationResult, detectedVersion };
}

/**
 * Example 7: Field-level validation test cases
 */
export function exampleFieldValidation() {
  return [
    { field: 'title', value: 'Valid Project Title', shouldPass: true },
    { field: 'title', value: '', shouldPass: false },
    {
      field: 'description',
      value: 'This is a sufficiently long description for the project',
      shouldPass: true,
    },
    { field: 'description', value: 'Too short', shouldPass: false },
    { field: 'technologies', value: ['React', 'TypeScript'], shouldPass: true },
    { field: 'technologies', value: [], shouldPass: false },
    { field: 'teamSize', value: 5, shouldPass: true },
    { field: 'teamSize', value: 0, shouldPass: false },
  ];
}

/**
 * Example 8: Error handling and user feedback
 */
export function exampleErrorHandling() {
  const invalidProject = {
    title: '',
    description: 'Short',
    category: 'InvalidCategory',
    technologies: [],
    teamSize: -1,
    startDate: new Date('2023-12-31'),
    endDate: new Date('2023-01-01'),
  };

  const result = validateProject(invalidProject);

  if (!result.success && result.errors) {
    const errorsByField = result.errors.reduce(
      (acc, error) => {
        if (!acc[error.field]) {
          acc[error.field] = [];
        }
        acc[error.field].push(error.message);
        return acc;
      },
      {} as Record<string, string[]>
    );

    const errorCount = result.errors.length;
    const fieldCount = Object.keys(errorsByField).length;

    return {
      ...result,
      errorsByField,
      summary: { errorCount, fieldCount },
    };
  }

  return result;
}

/**
 * Run all examples and return results
 */
export function runAllExamples() {
  return {
    basicValidation: exampleBasicProjectValidation(),
    createProject: exampleCreateProject(),
    skillValidation: exampleSkillValidation(),
    bulkValidation: exampleBulkValidation(),
    legacyTransformation: exampleLegacyTransformation(),
    autoMigration: exampleAutoMigration(),
    fieldValidation: exampleFieldValidation(),
    errorHandling: exampleErrorHandling(),
  };
}
