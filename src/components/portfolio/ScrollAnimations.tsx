import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAccessibility';

// Animation configuration types
export interface ScrollAnimationConfig {
  rootMargin?: string;
  threshold?: number;
  delay?: number;
  disableOnMobile?: boolean;
}

// Component props
export interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?:
    | 'fadeIn'
    | 'slideUp'
    | 'slideDown'
    | 'slideLeft'
    | 'slideRight'
    | 'scaleUp'
    | 'rotateIn'
    | 'slideInUp'
    | 'slideInLeft'
    | 'slideInRight';
  className?: string;
  config?: ScrollAnimationConfig;
  as?: keyof JSX.IntrinsicElements;
}

// Hook for scroll animation
export const useScrollAnimation = (config: ScrollAnimationConfig = {}) => {
  const {
    rootMargin = '0px 0px -100px 0px',
    threshold = 0.1,
    delay = 0,
    disableOnMobile = false,
  } = config;

  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    // Check if we should disable on mobile
    if (disableOnMobile && window.innerWidth < 768) {
      setIsVisible(true);
      return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, threshold, delay, disableOnMobile]);

  return { elementRef, isVisible, style };
};

// Main component
export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animation = 'fadeIn',
  className,
  config = {},
  as: Component = 'div',
}) => {
  const { elementRef, isVisible, style } = useScrollAnimation(config);

  const animationClasses = {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    slideUp: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
    slideDown: {
      initial: { opacity: 0, y: -30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
    slideLeft: {
      initial: { opacity: 0, x: 30 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
    slideRight: {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
    scaleUp: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    rotateIn: {
      initial: { opacity: 0, rotate: -5 },
      animate: { opacity: 1, rotate: 0 },
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    slideInUp: {
      initial: { opacity: 0, y: 60 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
    },
    slideInLeft: {
      initial: { opacity: 0, x: 60 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
    },
    slideInRight: {
      initial: { opacity: 0, x: -60 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  // Add a fallback for undefined animations
  const animationConfig =
    animationClasses[animation] || animationClasses.fadeIn;

  const { initial, animate, transition } = animationConfig;

  // Apply delay if specified
  const transitionWithDelay = {
    ...transition,
    delay: config?.delay || 0,
  };

  // Create inline styles for animation properties
  const animationStyle = {
    ...(isVisible ? animate : initial),
    transition: Object.entries({ ...transitionWithDelay })
      .map(
        ([key, value]) =>
          `${key === 'ease' ? 'timingFunction' : key}: ${typeof value === 'number' ? value : `'${value}'`}`
      )
      .join(', '),
  };

  // Combine styles from both the hook and our animation styles
  const combinedStyle = {
    ...style,
    ...animationStyle,
  };

  return (
    <Component
      ref={elementRef}
      className={cn(
        'transition-all duration-700 ease-out',
        !isVisible && 'opacity-0',
        isVisible && 'opacity-100',
        className
      )}
      style={combinedStyle}
    >
      {children}
    </Component>
  );
};
