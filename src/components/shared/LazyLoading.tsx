import React, { Suspense, lazy } from 'react';
import { LoadingState } from '@/components/shared/BaseComponents';

// Create lazy-loaded components for heavy admin sections
export const LazyDashboardOverview = lazy(() =>
  import('@/components/admin/dashboard').then(module => ({
    default: module.DashboardOverview,
  }))
);

export const LazyProjectsManager = lazy(() =>
  import('@/components/admin/ProjectsManager').then(module => ({
    default: module.ProjectsManager,
  }))
);

export const LazySkillsTab = lazy(() =>
  import('@/components/admin/skills').then(module => ({
    default: module.SkillsTab,
  }))
);

// Generic lazy component wrapper with custom loading states
export interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingMessage?: string;
  errorBoundary?: boolean;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  loadingMessage = 'Loading component...',
  errorBoundary = true,
}) => {
  const defaultFallback = (
    <LoadingState variant="spinner" size="lg" loadingText={loadingMessage} />
  );

  const content = (
    <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>
  );

  if (errorBoundary) {
    return <React.Fragment>{content}</React.Fragment>;
  }

  return content;
};

// Preload function for critical components
export const preloadAdminComponents = () => {
  // Preload critical components when user hovers over admin navigation
  const preloadPromises = [
    import('@/components/admin/dashboard'),
    import('@/components/admin/ProjectsManager'),
    import('@/components/admin/skills'),
  ];

  return Promise.all(preloadPromises);
};

// Hook for preloading on user interaction
export const usePreloadAdminComponents = () => {
  const [preloaded, setPreloaded] = React.useState(false);

  const preload = React.useCallback(async () => {
    if (!preloaded) {
      try {
        await preloadAdminComponents();
        setPreloaded(true);
      } catch (error) {
        console.warn('Failed to preload admin components:', error);
      }
    }
  }, [preloaded]);

  return { preload, preloaded };
};

// Component-specific lazy wrappers with optimized loading states
export const LazyDashboard: React.FC<
  React.ComponentProps<typeof LazyDashboardOverview>
> = props => (
  <LazyWrapper loadingMessage="Loading dashboard overview...">
    <LazyDashboardOverview {...props} />
  </LazyWrapper>
);

export const LazyProjects: React.FC = () => (
  <LazyWrapper loadingMessage="Loading projects manager...">
    <LazyProjectsManager />
  </LazyWrapper>
);

export const LazySkills: React.FC = () => (
  <LazyWrapper loadingMessage="Loading skills manager...">
    <LazySkillsTab />
  </LazyWrapper>
);

// Intersection Observer hook for lazy loading on scroll
export const useIntersectionObserver = (
  targetRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [targetRef, options]);

  return isIntersecting;
};

// Component for lazy loading based on intersection
export interface LazyOnScrollProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export const LazyOnScroll: React.FC<LazyOnScrollProps> = ({
  children,
  fallback,
  className,
  threshold = 0.1,
  rootMargin = '50px',
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(ref, {
    threshold,
    rootMargin,
  });
  const [shouldRender, setShouldRender] = React.useState(false);

  React.useEffect(() => {
    if (isIntersecting && !shouldRender) {
      setShouldRender(true);
    }
  }, [isIntersecting, shouldRender]);

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : fallback}
    </div>
  );
};
