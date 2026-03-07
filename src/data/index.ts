/**
 * Data Index
 * Centralized exports for all data modules
 */

// Initial data
export { initialProjects } from './initial-projects';
export { initialSkills } from './initial-skills';

// Note: Type exports removed as these interfaces don't exist

// Default exports for lazy loading
export default {
  initialProjects: () =>
    import('./initial-projects').then(m => ({ default: m.initialProjects })),
  initialSkills: () =>
    import('./initial-skills').then(m => ({ default: m.initialSkills })),
};
