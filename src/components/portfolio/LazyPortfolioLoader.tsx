import React, { Suspense, lazy } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Lazy load portfolio components for code splitting
const LazyHeroSection = lazy(() => import('./HeroSection'));
const LazySkillVisualization = lazy(() => import('./SkillVisualization'));
const LazyProjectShowcase = lazy(() => import('./ProjectShowcase'));
const LazyContactForm = lazy(() => import('./ContactForm'));
const LazyFilterableProjectGallery = lazy(
  () => import('./FilterableProjectGallery')
);
const LazyInteractiveCodeSnippets = lazy(
  () => import('./InteractiveCodeSnippets')
);
const LazyTestimonialsCarousel = lazy(() => import('./TestimonialsCarousel'));
const LazyInteractiveTimeline = lazy(() => import('./InteractiveTimeline'));
const LazyProfessionalAvatar = lazy(() => import('./ProfessionalAvatar'));
const LazyDynamicTypingEffect = lazy(() => import('./DynamicTypingEffect'));
const LazyAnimationLibrary = lazy(() =>
  import('./AnimationLibrary').then(module => ({ default: module.Animation }))
);

// Loading state component
const LoadingState = ({ componentName }: { componentName: string }) => (
  <Card className="w-full">
    <CardContent className="p-6">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading {componentName}...</span>
      </div>
    </CardContent>
  </Card>
);

// Main lazy portfolio loader component
export const LazyPortfolioLoader: React.FC = () => {
  return (
    <div className="space-y-8">
      <LoadingState componentName="Portfolio" />
    </div>
  );
};

// Export individual lazy components
export const LazyHero = (
  props: React.ComponentProps<typeof LazyHeroSection>
) => (
  <Suspense fallback={<LoadingState componentName="HeroSection" />}>
    <LazyHeroSection {...props} />
  </Suspense>
);

export const LazySkills = (
  props: React.ComponentProps<typeof LazySkillVisualization>
) => (
  <Suspense fallback={<LoadingState componentName="SkillVisualization" />}>
    <LazySkillVisualization {...props} />
  </Suspense>
);

export const LazyProjects = (
  props: React.ComponentProps<typeof LazyProjectShowcase>
) => (
  <Suspense fallback={<LoadingState componentName="ProjectShowcase" />}>
    <LazyProjectShowcase {...props} />
  </Suspense>
);

export const LazyContact = (
  props: React.ComponentProps<typeof LazyContactForm>
) => (
  <Suspense fallback={<LoadingState componentName="ContactForm" />}>
    <LazyContactForm {...props} />
  </Suspense>
);

export const LazyGallery = (
  props: React.ComponentProps<typeof LazyFilterableProjectGallery>
) => (
  <Suspense
    fallback={<LoadingState componentName="FilterableProjectGallery" />}
  >
    <LazyFilterableProjectGallery {...props} />
  </Suspense>
);

export const LazyCodeSnippets = (
  props: React.ComponentProps<typeof LazyInteractiveCodeSnippets>
) => (
  <Suspense fallback={<LoadingState componentName="InteractiveCodeSnippets" />}>
    <LazyInteractiveCodeSnippets {...props} />
  </Suspense>
);

export const LazyTestimonials = (
  props: React.ComponentProps<typeof LazyTestimonialsCarousel>
) => (
  <Suspense fallback={<LoadingState componentName="TestimonialsCarousel" />}>
    <LazyTestimonialsCarousel {...props} />
  </Suspense>
);

export const LazyTimeline = (
  props: React.ComponentProps<typeof LazyInteractiveTimeline>
) => (
  <Suspense fallback={<LoadingState componentName="InteractiveTimeline" />}>
    <LazyInteractiveTimeline {...props} />
  </Suspense>
);

export const LazyAvatar = (
  props: React.ComponentProps<typeof LazyProfessionalAvatar>
) => (
  <Suspense fallback={<LoadingState componentName="ProfessionalAvatar" />}>
    <LazyProfessionalAvatar {...props} />
  </Suspense>
);

export const LazyTypingEffect = (
  props: React.ComponentProps<typeof LazyDynamicTypingEffect>
) => (
  <Suspense fallback={<LoadingState componentName="DynamicTypingEffect" />}>
    <LazyDynamicTypingEffect {...props} />
  </Suspense>
);

export const LazyAnimationLibraryComponent = (
  props: React.ComponentProps<typeof LazyAnimationLibrary>
) => (
  <Suspense fallback={<LoadingState componentName="AnimationLibrary" />}>
    <LazyAnimationLibrary {...props} />
  </Suspense>
);
