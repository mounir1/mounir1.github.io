import React, { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useAccessibility';

// Core animation types and configurations
export type AnimationType =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleUp'
  | 'scaleDown'
  | 'rotateIn'
  | 'rotateOut'
  | 'bounce'
  | 'pulse'
  | 'shake'
  | 'flip'
  | 'flipInX'
  | 'flipInY'
  | 'zoomIn'
  | 'zoomOut'
  | 'lightSpeedIn'
  | 'lightSpeedOut';

export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  iterations?: number;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface ScrollAnimationConfig {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  duration?: number;
  easing?: string;
}

export interface ParallaxConfig {
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  scale?: number;
  rotate?: number;
  opacity?: boolean;
}

// Animation keyframes
const ANIMATION_KEYFRAMES = {
  fadeIn: [{ opacity: 0 }, { opacity: 1 }],
  fadeOut: [{ opacity: 1 }, { opacity: 0 }],
  slideUp: [
    { opacity: 0, transform: 'translateY(20px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ],
  slideDown: [
    { opacity: 0, transform: 'translateY(-20px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ],
  slideLeft: [
    { opacity: 0, transform: 'translateX(20px)' },
    { opacity: 1, transform: 'translateX(0)' },
  ],
  slideRight: [
    { opacity: 0, transform: 'translateX(-20px)' },
    { opacity: 1, transform: 'translateX(0)' },
  ],
  scaleUp: [
    { opacity: 0, transform: 'scale(0.95)' },
    { opacity: 1, transform: 'scale(1)' },
  ],
  scaleDown: [
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0, transform: 'scale(0.95)' },
  ],
  rotateIn: [
    { opacity: 0, transform: 'rotate(12deg) scale(0.95)' },
    { opacity: 1, transform: 'rotate(0) scale(1)' },
  ],
  rotateOut: [
    { opacity: 1, transform: 'rotate(0) scale(1)' },
    { opacity: 0, transform: 'rotate(12deg) scale(0.95)' },
  ],
  bounce: [
    { transform: 'translateY(0)' },
    { transform: 'translateY(-10px)' },
    { transform: 'translateY(0)' },
    { transform: 'translateY(-5px)' },
    { transform: 'translateY(0)' },
  ],
  pulse: [
    { transform: 'scale(1)' },
    { transform: 'scale(1.05)' },
    { transform: 'scale(1)' },
  ],
  shake: [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(0)' },
  ],
  flip: [
    { transform: 'perspective(400px) rotateY(0)' },
    { transform: 'perspective(400px) rotateY(180deg)' },
  ],
  flipInX: [
    { transform: 'perspective(400px) rotateX(90deg)', opacity: 0 },
    { transform: 'perspective(400px) rotateX(0)', opacity: 1 },
  ],
  flipInY: [
    { transform: 'perspective(400px) rotateY(90deg)', opacity: 0 },
    { transform: 'perspective(400px) rotateY(0)', opacity: 1 },
  ],
  zoomIn: [
    { opacity: 0, transform: 'scale(0.8)' },
    { opacity: 1, transform: 'scale(1)' },
  ],
  zoomOut: [
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0, transform: 'scale(0.8)' },
  ],
  lightSpeedIn: [
    { opacity: 0, transform: 'translateX(100%) skewX(-30deg)' },
    { opacity: 1, transform: 'translateX(0) skewX(0)' },
  ],
  lightSpeedOut: [
    { opacity: 1, transform: 'translateX(0) skewX(0)' },
    { opacity: 0, transform: 'translateX(100%) skewX(-30deg)' },
  ],
};

// Easing functions
const EASING_FUNCTIONS = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeInOutQuint: 'cubic-bezier(0.86, 0, 0.07, 1)',
  easeInSine: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
  easeOutSine: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
  easeInOutSine: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
  easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
  easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
  easeInOutExpo: 'cubic-bezier(1, 0, 0, 1)',
  easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
  easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
  easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
  easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Animation hook
export const useAnimation = (
  type: AnimationType,
  config: AnimationConfig = {}
) => {
  const elementRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const {
    duration = 600,
    delay = 0,
    easing = 'ease-out',
    iterations = 1,
    fill = 'both',
  } = config;

  const playAnimation = useCallback(() => {
    if (!elementRef.current || prefersReducedMotion) return;

    const keyframes = ANIMATION_KEYFRAMES[type];
    const easingFunction =
      EASING_FUNCTIONS[easing as keyof typeof EASING_FUNCTIONS] || easing;

    const animation = elementRef.current.animate(keyframes, {
      duration,
      delay,
      easing: easingFunction,
      iterations,
      fill,
    });

    return animation;
  }, [type, duration, delay, easing, iterations, fill, prefersReducedMotion]);

  return { elementRef, playAnimation };
};

// Scroll animation hook
export const useScrollAnimation = (config: ScrollAnimationConfig = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    delay = 0,
    duration = 1000,
    easing = 'ease-out',
  } = config;

  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        if (isIntersecting && (!triggerOnce || !hasTriggered)) {
          setTimeout(() => {
            setIsVisible(true);
            setHasTriggered(true);
          }, delay);
        } else if (!isIntersecting && !triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    threshold,
    rootMargin,
    triggerOnce,
    delay,
    hasTriggered,
    prefersReducedMotion,
  ]);

  return { elementRef, isVisible };
};

// Parallax hook
export const useParallax = (config: ParallaxConfig = {}) => {
  const {
    speed = 0.5,
    direction = 'up',
    scale = 1,
    rotate = 0,
    opacity = false,
  } = config;

  const elementRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [transform, setTransform] = useState<string>('');

  const updateTransform = useCallback(() => {
    if (!elementRef.current || prefersReducedMotion) return;

    const scrolled = window.scrollY;
    const multiplier = speed;

    let x = 0;
    let y = 0;

    switch (direction) {
      case 'up':
        y = scrolled * multiplier;
        break;
      case 'down':
        y = -scrolled * multiplier;
        break;
      case 'left':
        x = scrolled * multiplier;
        break;
      case 'right':
        x = -scrolled * multiplier;
        break;
    }

    const transformValue = `translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`;
    setTransform(transformValue);
  }, [speed, direction, scale, rotate, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      requestAnimationFrame(updateTransform);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateTransform, prefersReducedMotion]);

  return {
    elementRef,
    style: prefersReducedMotion
      ? {}
      : {
          transform,
          willChange: 'transform',
        },
  };
};

// Animation component
export interface AnimationProps {
  children: React.ReactNode;
  type: AnimationType;
  className?: string;
  config?: AnimationConfig;
  as?: keyof JSX.IntrinsicElements;
}

export const Animation: React.FC<AnimationProps> = ({
  children,
  type,
  className,
  config = {},
  as: Component = 'div',
}) => {
  const { elementRef, playAnimation } = useAnimation(type, config);

  useEffect(() => {
    playAnimation();
  }, [playAnimation]);

  return React.createElement(
    Component,
    {
      ref: elementRef,
      className,
    },
    children
  );
};

// Scroll-triggered animation component
export interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?: AnimationType;
  className?: string;
  config?: ScrollAnimationConfig;
  as?: keyof JSX.IntrinsicElements;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
  children,
  animation = 'fadeIn',
  className,
  config = {},
  as: Component = 'div',
}) => {
  const { elementRef, isVisible } = useScrollAnimation(config);

  const animationClasses = {
    fadeIn: {
      initial: 'opacity-0',
      animate: 'opacity-100',
    },
    fadeOut: {
      initial: 'opacity-100',
      animate: 'opacity-0',
    },
    slideUp: {
      initial: 'opacity-0 translate-y-8',
      animate: 'opacity-100 translate-y-0',
    },
    slideDown: {
      initial: 'opacity-0 -translate-y-8',
      animate: 'opacity-100 translate-y-0',
    },
    slideLeft: {
      initial: 'opacity-0 translate-x-8',
      animate: 'opacity-100 translate-x-0',
    },
    slideRight: {
      initial: 'opacity-0 -translate-x-8',
      animate: 'opacity-100 translate-x-0',
    },
    scaleUp: {
      initial: 'opacity-0 scale-95',
      animate: 'opacity-100 scale-100',
    },
    scaleDown: {
      initial: 'opacity-100 scale-100',
      animate: 'opacity-0 scale-95',
    },
    rotateIn: {
      initial: 'opacity-0 rotate-12 scale-95',
      animate: 'opacity-100 rotate-0 scale-100',
    },
    rotateOut: {
      initial: 'opacity-100 rotate-0 scale-100',
      animate: 'opacity-0 rotate-12 scale-95',
    },
    bounce: {
      initial: 'translate-y-0',
      animate: 'animate-bounce',
    },
    pulse: {
      initial: 'scale-100',
      animate: 'animate-pulse',
    },
    shake: {
      initial: 'translate-x-0',
      animate: 'animate-shake',
    },
  };

  const { initial, animate } =
    animationClasses[animation] || animationClasses.fadeIn;
  const animationClass = isVisible ? animate : initial;
  const combinedClassName = cn(
    'transition-all duration-1000 ease-out',
    animationClass,
    className
  );

  return React.createElement(
    Component,
    {
      ref: elementRef as React.RefObject<HTMLDivElement>,
      className: combinedClassName,
    },
    children
  );
};

// Parallax container component
export interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  config?: ParallaxConfig;
  as?: keyof JSX.IntrinsicElements;
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  className,
  config = {},
  as: Component = 'div',
}) => {
  const { elementRef, style } = useParallax(config);

  return React.createElement(
    Component,
    {
      ref: elementRef as React.RefObject<HTMLDivElement>,
      className,
      style,
    },
    children
  );
};

// Staggered animations for lists
export interface StaggeredAnimationProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  animation?: AnimationType;
  config?: ScrollAnimationConfig;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  className,
  staggerDelay = 100,
  animation = 'slideUp',
  config = {},
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <ScrollAnimation
          key={index}
          animation={animation}
          config={{
            ...config,
            delay: (config.delay || 0) + index * staggerDelay,
          }}
        >
          {child}
        </ScrollAnimation>
      ))}
    </div>
  );
};

// Sequence animations
export interface SequenceAnimationProps {
  children: React.ReactNode[];
  className?: string;
  sequenceDelay?: number;
  animations?: AnimationType[];
  config?: AnimationConfig;
}

export const SequenceAnimation: React.FC<SequenceAnimationProps> = ({
  children,
  className,
  sequenceDelay = 300,
  animations = [],
  config = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const elementRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const playSequence = async () => {
      for (let i = 0; i < children.length; i++) {
        setCurrentIndex(i);
        await new Promise(resolve => setTimeout(resolve, sequenceDelay));
      }
    };

    playSequence();
  }, [children.length, sequenceDelay]);

  return (
    <div className={className}>
      {children.map((child, index) => {
        const isVisible = index <= currentIndex;
        return (
          <div
            key={index}
            ref={el => (elementRefs.current[index] = el)}
            className={cn(
              'transition-all duration-500 ease-out',
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            )}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

// Morph animation for shape transitions
export interface MorphAnimationProps {
  children: React.ReactNode;
  fromShape: string;
  toShape: string;
  className?: string;
  config?: AnimationConfig;
}

export const MorphAnimation: React.FC<MorphAnimationProps> = ({
  children,
  fromShape,
  toShape,
  className,
  config = {},
}) => {
  const { elementRef, playAnimation } = useAnimation('fadeIn', config);

  useEffect(() => {
    playAnimation();
  }, [playAnimation]);

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={cn('transition-all duration-1000 ease-in-out', className)}
      style={{
        clipPath: fromShape,
        transition: 'clip-path 1s ease-in-out',
      }}
      onMouseEnter={e => {
        (e.target as HTMLElement).style.clipPath = toShape;
      }}
      onMouseLeave={e => {
        (e.target as HTMLElement).style.clipPath = fromShape;
      }}
    >
      {children}
    </div>
  );
};

export default {
  Animation,
  ScrollAnimation,
  Parallax,
  StaggeredAnimation,
  SequenceAnimation,
  MorphAnimation,
  useAnimation,
  useScrollAnimation,
};
