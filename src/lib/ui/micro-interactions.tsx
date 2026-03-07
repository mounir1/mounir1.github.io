/**
 * Micro-interactions and Smooth Animations
 * Advanced animation components and utilities for professional UI
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Animation variants for different interaction types
export const animationVariants = {
  // Entrance animations
  entrance: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    slideInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    slideInDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    slideInLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    slideInRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.3, ease: 'easeOut' },
    },
    bounceIn: {
      initial: { opacity: 0, scale: 0.3 },
      animate: { opacity: 1, scale: 1 },
      transition: {
        duration: 0.6,
        ease: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },

  // Hover animations
  hover: {
    lift: {
      whileHover: { y: -4, scale: 1.02 },
      transition: { duration: 0.2, ease: 'easeOut' },
    },
    glow: {
      whileHover: {
        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
        scale: 1.02,
      },
      transition: { duration: 0.2 },
    },
    tilt: {
      whileHover: { rotate: 2, scale: 1.05 },
      transition: { duration: 0.2 },
    },
    bounce: {
      whileHover: { y: -2 },
      whileTap: { y: 0 },
      transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
  },

  // Click animations
  tap: {
    scale: {
      whileTap: { scale: 0.95 },
      transition: { duration: 0.1 },
    },
    press: {
      whileTap: { scale: 0.98, y: 1 },
      transition: { duration: 0.1 },
    },
    ripple: {
      whileTap: { scale: 0.95 },
      transition: { duration: 0.2, ease: 'easeInOut' },
    },
  },

  // Loading animations
  loading: {
    spin: {
      animate: { rotate: 360 },
      transition: { duration: 1, repeat: Infinity, ease: 'linear' },
    },
    pulse: {
      animate: { scale: [1, 1.1, 1] },
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
    bounce: {
      animate: { y: [0, -10, 0] },
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
    },
  },
};

// Animated Button Component
interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  animation?: 'lift' | 'glow' | 'tilt' | 'bounce' | 'ripple';
  loading?: boolean;
  children: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'default',
  size = 'md',
  animation = 'lift',
  loading = false,
  className,
  children,
  disabled,
  onClick,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (animation === 'ripple' && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRipple = { id: Date.now(), x, y };
      setRipples(prev => [...prev, newRipple]);

      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }

    onClick?.(e);
  };

  const baseClasses = cn(
    'relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden',
    {
      // Variants
      'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary':
        variant === 'primary',
      'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary':
        variant === 'secondary',
      'border border-input hover:bg-accent hover:text-accent-foreground focus:ring-primary':
        variant === 'outline',
      'hover:bg-accent hover:text-accent-foreground focus:ring-primary':
        variant === 'ghost',
      'bg-background text-foreground border border-border hover:bg-muted focus:ring-primary':
        variant === 'default',

      // Sizes
      'h-8 px-3 text-xs': size === 'sm',
      'h-10 px-4 text-sm': size === 'md',
      'h-12 px-6 text-base': size === 'lg',

      // States
      'opacity-50 cursor-not-allowed': disabled || loading,
      'cursor-pointer': !disabled && !loading,

      // Animations
      'transform transition-transform hover:scale-105 hover:shadow-lg':
        animation === 'lift',
      'transition-shadow hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]':
        animation === 'glow',
      'transition-transform hover:rotate-1 hover:scale-105':
        animation === 'tilt',
      'transition-transform hover:animate-bounce': animation === 'bounce',
    },
    className
  );

  return (
    <button
      ref={buttonRef}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        transform:
          isPressed && animation !== 'ripple' ? 'scale(0.98)' : undefined,
      }}
      {...props}
    >
      {/* Ripple effect */}
      {animation === 'ripple' &&
        ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute animate-ping rounded-full bg-white/30"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
              animationDuration: '0.6s',
            }}
          />
        ))}

      {/* Loading spinner */}
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}

      {children}
    </button>
  );
};

// Animated Card Component
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'lift' | 'glow' | 'tilt' | 'none';
  delay?: number;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  animation = 'lift',
  delay = 0,
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const cardClasses = cn(
    'bg-card text-card-foreground rounded-lg border shadow-sm transition-all duration-300',
    {
      'opacity-0 translate-y-4': !isVisible,
      'opacity-100 translate-y-0': isVisible,
      'hover:shadow-lg hover:scale-105 cursor-pointer':
        animation === 'lift' && onClick,
      'hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:scale-102':
        animation === 'glow' && onClick,
      'hover:rotate-1 hover:scale-105 cursor-pointer':
        animation === 'tilt' && onClick,
      'cursor-pointer': onClick && animation !== 'none',
    },
    className
  );

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      onClick={onClick}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// Stagger Animation Container
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className,
  staggerDelay = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className={cn(
            'transition-all duration-500',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
          style={{
            transitionDelay: `${index * staggerDelay}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// Floating Action Button with micro-interactions
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  size = 'md',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };

  return (
    <div className={cn('fixed z-50', positionClasses[position])}>
      <button
        className={cn(
          'flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          sizeClasses[size],
          {
            'scale-110': isHovered,
            'scale-95': isPressed,
          }
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        aria-label={label}
      >
        <div
          className={cn(
            'transition-transform duration-200',
            isHovered && 'scale-110'
          )}
        >
          {icon}
        </div>
      </button>

      {label && isHovered && (
        <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white animate-in fade-in slide-in-from-bottom-1">
          {label}
        </div>
      )}
    </div>
  );
};

// Progress indicator with smooth animations
interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  max = 100,
  className,
  showValue = false,
  color = 'primary',
  size = 'md',
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);

    return () => clearTimeout(timer);
  }, [value]);

  const percentage = Math.min((animatedValue / max) * 100, 100);

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-muted',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

// Tooltip with smooth animations
interface AnimatedTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 500,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}

      {isVisible && (
        <div
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-xs text-white animate-in fade-in zoom-in-95',
            positionClasses[position]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// Custom hooks for animations
export const useIntersectionAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  return { isHovered, hoverProps };
};

export const useClickAnimation = () => {
  const [isPressed, setIsPressed] = useState(false);

  const clickProps = {
    onMouseDown: () => setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    onMouseLeave: () => setIsPressed(false),
  };

  return { isPressed, clickProps };
};
