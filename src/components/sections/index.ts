/**
 * Section Components Index
 * Centralized exports for all section components
 */

export { Hero as HeroSection } from './hero';
export { Skills as SkillsSection } from './skills';
export { Projects as ProjectsSection } from './projects';
export { Experience as ExperienceSection } from './experience';

// Note: Type exports removed as these props interfaces don't exist in the components

// Default exports for lazy loading, now compatible with React.lazy
export default {
  Hero: () => import('./hero').then(m => ({ default: m.Hero })),
  Skills: () => import('./skills').then(m => ({ default: m.Skills })),
  Projects: () => import('./projects').then(m => ({ default: m.Projects })),
  Experience: () =>
    import('./experience').then(m => ({ default: m.Experience })),
};
