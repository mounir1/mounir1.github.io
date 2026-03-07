/**
 * Page Transitions Component
 * Smooth page transitions with various animation effects
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  direction?: 'enter' | 'exit';
  variant?: 'fade' | 'slide' | 'scale' | 'flip' | 'curtain' | 'wave';
  duration?: number;
  delay?: number;
  className?: string;
}

interface TransitionConfig {
  enter: string;
  exit: string;
  duration: number;
}

const transitionVariants: Record<string, TransitionConfig> = {
  fade: {
    enter: 'opacity-100 translate-y-0',
    exit: 'opacity-0 translate-y-4',
    duration: 300,
  },
  slide: {
    enter: 'translate-x-0 opacity-100',
    exit: 'translate-x-full opacity-0',
    duration: 400,
  },
  scale: {
    enter: 'scale-100 opacity-100',
    exit: 'scale-95 opacity-0',
    duration: 250,
  },
  flip: {
    enter: 'rotateY-0 opacity-100',
    exit: 'rotateY-90 opacity-0',
    duration: 500,
  },
  curtain: {
    enter: 'clip-path-full opacity-100',
    exit: 'clip-path-none opacity-0',
    duration: 600,
  },
  wave: {
    enter: 'transform-none opacity-100',
    exit: 'transform-wave opacity-0',
    duration: 700,
  },
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  isActive,
  direction = 'enter',
  variant = 'fade',
  duration,
  delay = 0,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(isActive);
  const [animationClass, setAnimationClass] = useState('');
  const elementRef = useRef<HTMLDivElement>(null);

  const config = transitionVariants[variant];
  const animationDuration = duration || config.duration;

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setAnimationClass(config.enter);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setAnimationClass(config.exit);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, animationDuration + delay);
      return () => clearTimeout(timer);
    }
  }, [isActive, config, animationDuration, delay]);

  if (!isVisible) return null;

  return (
    <div
      ref={elementRef}
      className={cn('transition-all ease-out', animationClass, className)}
      style={{
        transitionDuration: `${animationDuration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Route transition wrapper
interface RouteTransitionProps {
  children: React.ReactNode;
  location: string;
  variant?: PageTransitionProps['variant'];
  className?: string;
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({
  children,
  location,
  variant = 'fade',
  className,
}) => {
  const [currentLocation, setCurrentLocation] = useState(location);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location !== currentLocation) {
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setCurrentLocation(location);
        setIsTransitioning(false);
      }, transitionVariants[variant].duration);

      return () => clearTimeout(timer);
    }
  }, [location, currentLocation, variant]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <PageTransition isActive={!isTransitioning} variant={variant}>
        {children}
      </PageTransition>
    </div>
  );
};

// Staggered children animation
interface StaggeredTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  staggerDelay?: number;
  variant?: PageTransitionProps['variant'];
  className?: string;
}

export const StaggeredTransition: React.FC<StaggeredTransitionProps> = ({
  children,
  isActive,
  staggerDelay = 100,
  variant = 'fade',
  className,
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <PageTransition
          isActive={isActive}
          variant={variant}
          delay={index * staggerDelay}
        >
          {child}
        </PageTransition>
      ))}
    </div>
  );
};

// Parallax transition effect
interface ParallaxTransitionProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const ParallaxTransition: React.FC<ParallaxTransitionProps> = ({
  children,
  speed = 0.5,
  direction = 'up',
  className,
}) => {
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const rate = scrolled * -speed;

        let transform = '';
        switch (direction) {
          case 'up':
            transform = `translateY(${rate}px)`;
            break;
          case 'down':
            transform = `translateY(${-rate}px)`;
            break;
          case 'left':
            transform = `translateX(${rate}px)`;
            break;
          case 'right':
            transform = `translateX(${-rate}px)`;
            break;
        }

        setOffset(rate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return `translateY(${offset}px)`;
      case 'down':
        return `translateY(${-offset}px)`;
      case 'left':
        return `translateX(${offset}px)`;
      case 'right':
        return `translateX(${-offset}px)`;
      default:
        return 'none';
    }
  };

  return (
    <div
      ref={elementRef}
      className={className}
      style={{ transform: getTransform() }}
    >
      {children}
    </div>
  );
};

// Morphing transition between elements
interface MorphTransitionProps {
  from: React.ReactNode;
  to: React.ReactNode;
  isActive: boolean;
  duration?: number;
  className?: string;
}

export const MorphTransition: React.FC<MorphTransitionProps> = ({
  from,
  to,
  isActive,
  duration = 500,
  className,
}) => {
  const [phase, setPhase] = useState<'from' | 'morphing' | 'to'>('from');

  useEffect(() => {
    if (isActive) {
      setPhase('morphing');
      const timer = setTimeout(() => {
        setPhase('to');
      }, duration / 2);
      return () => clearTimeout(timer);
    } else {
      setPhase('from');
    }
  }, [isActive, duration]);

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'transition-all ease-in-out',
          phase === 'from' ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        )}
        style={{ transitionDuration: `${duration / 2}ms` }}
      >
        {phase === 'from' && from}
      </div>

      <div
        className={cn(
          'absolute inset-0 transition-all ease-in-out',
          phase === 'to' ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        )}
        style={{ transitionDuration: `${duration / 2}ms` }}
      >
        {phase === 'to' && to}
      </div>
    </div>
  );
};

// Custom CSS for advanced transitions
const advancedTransitionStyles = `
  .transform-wave {
    transform: translateY(20px) rotateX(15deg) scale(0.95);
  }
  
  .clip-path-full {
    clip-path: inset(0 0 0 0);
  }
  
  .clip-path-none {
    clip-path: inset(0 100% 0 0);
  }
  
  .rotateY-0 {
    transform: rotateY(0deg);
  }
  
  .rotateY-90 {
    transform: rotateY(90deg);
  }
  
  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutToLeft {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(-100%);
      opacity: 0;
    }
  }
  
  @keyframes fadeInUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes scaleIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .animate-slide-in-right {
    animation: slideInFromRight 0.4s ease-out;
  }
  
  .animate-slide-out-left {
    animation: slideOutToLeft 0.4s ease-out;
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = advancedTransitionStyles;
  document.head.appendChild(styleElement);
}

// Hook for managing page transitions
export const usePageTransition = (initialState = false) => {
  const [isTransitioning, setIsTransitioning] = useState(initialState);
  const [direction, setDirection] = useState<'enter' | 'exit'>('enter');

  const startTransition = (dir: 'enter' | 'exit' = 'enter') => {
    setDirection(dir);
    setIsTransitioning(true);
  };

  const endTransition = () => {
    setIsTransitioning(false);
  };

  return {
    isTransitioning,
    direction,
    startTransition,
    endTransition,
  };
};
