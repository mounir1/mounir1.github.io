import React from 'react';
import { cn } from '@/lib/utils';

// Breakpoint definitions
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Responsive grid utilities
export interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = { xs: 4, sm: 4, md: 6, lg: 6 },
}) => {
  const gridClasses = [];

  // Generate grid column classes
  Object.entries(cols).forEach(([bp, colCount]) => {
    if (bp === 'xs') {
      gridClasses.push(`grid-cols-${colCount}`);
    } else {
      gridClasses.push(`${bp}:grid-cols-${colCount}`);
    }
  });

  // Generate gap classes
  Object.entries(gap).forEach(([bp, gapSize]) => {
    if (bp === 'xs') {
      gridClasses.push(`gap-${gapSize}`);
    } else {
      gridClasses.push(`${bp}:gap-${gapSize}`);
    }
  });

  return (
    <div className={cn('grid', ...gridClasses, className)}>{children}</div>
  );
};

// Hook for detecting current breakpoint
export const useBreakpoint = () => {
  const [currentBreakpoint, setCurrentBreakpoint] =
    React.useState<Breakpoint>('xs');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;

      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm');
      } else {
        setCurrentBreakpoint('xs');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return currentBreakpoint;
};

// Hook for media queries
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addListener(handler);

    return () => mediaQuery.removeListener(handler);
  }, [query]);

  return matches;
};

// Touch-friendly component wrapper
export interface TouchFriendlyProps {
  children: React.ReactNode;
  className?: string;
  minTouchTarget?: number;
}

export const TouchFriendly: React.FC<TouchFriendlyProps> = ({
  children,
  className,
  minTouchTarget = 44,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (!isMobile) {
    return <>{children}</>;
  }

  const style = {
    minHeight: `${minTouchTarget}px`,
    minWidth: `${minTouchTarget}px`,
  };

  return (
    <div className={cn('touch-manipulation p-2', className)} style={style}>
      {children}
    </div>
  );
};

// Adaptive layout component
export interface AdaptiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  mobileLayout: React.ReactNode;
  desktopLayout: React.ReactNode;
  breakpoint?: Breakpoint;
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  className,
  mobileLayout,
  desktopLayout,
  breakpoint = 'md',
}) => {
  const currentBreakpoint = useBreakpoint();
  const isMobile = breakpoints[currentBreakpoint] < breakpoints[breakpoint];

  return (
    <div className={className}>
      {isMobile ? mobileLayout : desktopLayout}
      {children}
    </div>
  );
};
