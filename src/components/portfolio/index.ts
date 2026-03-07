/**
 * Portfolio Components Index
 * Centralized exports for all portfolio components
 */

// Hero and main sections
export { HeroSection } from './HeroSection';
export type { HeroSectionProps } from './HeroSection';

// Skills components
export { SkillVisualization } from './SkillVisualization';
export { CompactSkillsSection } from './CompactSkillsSection';

// Projects components
export { ProjectShowcase } from './ProjectShowcase';
export { FilterableProjectGallery } from './FilterableProjectGallery';

// Experience components
export { ExperienceTimeline } from './ExperienceTimeline';
export { InteractiveTimeline } from './InteractiveTimeline';

// Contact components
export { ContactSection } from './ContactSection';
export { ContactForm } from './ContactForm';

// Interactive components
export { InteractiveCodeSnippets } from './InteractiveCodeSnippets';
export { TestimonialsCarousel } from './TestimonialsCarousel';
export { ProfessionalAvatar } from './ProfessionalAvatar';
export { DynamicTypingEffect } from './DynamicTypingEffect';

// Animation components
export {
  Animation,
  ScrollAnimation as LibraryScrollAnimation,
  Parallax as LibraryParallax,
  StaggeredAnimation as LibraryStaggeredAnimation,
  SequenceAnimation,
  MorphAnimation,
  useAnimation,
  useScrollAnimation as useLibraryScrollAnimation,
} from './AnimationLibrary';
export { ScrollAnimation, useScrollAnimation } from './ScrollAnimations';

// Utility components
export { OptimizedImage } from './OptimizedImage';
export { LazyPortfolioLoader } from './LazyPortfolioLoader';
export { PerformanceMonitor } from './PerformanceMonitor';
export { ThemeToggle, ThemeCustomization } from './ThemeToggle';

// Types
export type { Skill, SkillVisualizationProps } from './SkillVisualization';

export type { Project, ProjectShowcaseProps } from './ProjectShowcase';

export type {
  TestimonialsCarouselProps,
  Testimonial,
} from './TestimonialsCarousel';

export type {
  InteractiveTimelineProps,
  TimelineItem,
} from './InteractiveTimeline';

export type {
  FilterableProjectGalleryProps,
  GalleryProject,
  LayoutType,
} from './FilterableProjectGallery';

export type { ContactFormData, ContactFormProps } from './ContactForm';

export type { ThemeToggleProps, ThemeCustomizationProps } from './ThemeToggle';

export type {
  InteractiveCodeSnippetsProps,
  CodeSnippetProps,
} from './InteractiveCodeSnippets';

export type { ProfessionalAvatarProps } from './ProfessionalAvatar';
export type { DynamicTypingEffectProps } from './DynamicTypingEffect';

export type {
  AnimationType,
  AnimationConfig,
  ScrollAnimationConfig as OriginalScrollAnimationConfig,
  ParallaxConfig,
  AnimationProps,
  ScrollAnimationProps as OriginalScrollAnimationProps,
  ParallaxProps,
  StaggeredAnimationProps,
  SequenceAnimationProps,
  MorphAnimationProps,
} from './AnimationLibrary';

export type {
  ScrollAnimationConfig,
  ScrollAnimationProps,
} from './ScrollAnimations';
