/**
 * Custom Cursor Component
 * Interactive cursor with hover effects and animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface CursorPosition {
  x: number;
  y: number;
}

interface CustomCursorProps {
  enabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dot' | 'ring' | 'crosshair';
  hideOnLeave?: boolean;
  blendMode?: 'normal' | 'difference' | 'multiply' | 'screen';
}

export const CustomCursor: React.FC<CustomCursorProps> = ({
  enabled = true,
  size = 'md',
  variant = 'default',
  hideOnLeave = true,
  blendMode = 'normal',
}) => {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);

  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => hideOnLeave && setIsVisible(false);

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveElements = [
        'A',
        'BUTTON',
        'INPUT',
        'TEXTAREA',
        'SELECT',
      ];
      const isInteractive =
        interactiveElements.includes(target.tagName) ||
        target.hasAttribute('data-cursor-hover') ||
        target.closest('[data-cursor-hover]');

      setIsHovering(isInteractive);

      if (isInteractive) {
        const hoverType =
          target.getAttribute('data-cursor-hover') ||
          target
            .closest('[data-cursor-hover]')
            ?.getAttribute('data-cursor-hover') ||
          'default';
        setHoverTarget(hoverType);
      } else {
        setHoverTarget(null);
      }
    };

    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [enabled, hideOnLeave]);

  if (!enabled || !isVisible) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const variantClasses = {
    default: 'bg-primary rounded-full',
    dot: 'bg-primary rounded-full',
    ring: 'border-2 border-primary rounded-full',
    crosshair: 'border border-primary',
  };

  const blendModeClasses = {
    normal: 'mix-blend-normal',
    difference: 'mix-blend-difference',
    multiply: 'mix-blend-multiply',
    screen: 'mix-blend-screen',
  };

  return (
    <>
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className={cn(
          'pointer-events-none fixed z-[9999] transition-all duration-150 ease-out',
          sizeClasses[size],
          variantClasses[variant],
          blendModeClasses[blendMode],
          {
            'scale-150': isHovering && hoverTarget === 'scale',
            'scale-75': isClicking,
            'opacity-50': isClicking,
            'bg-red-500': hoverTarget === 'danger',
            'bg-green-500': hoverTarget === 'success',
            'bg-yellow-500': hoverTarget === 'warning',
            'animate-pulse': hoverTarget === 'pulse',
          }
        )}
        style={{
          left: position.x - (variant === 'crosshair' ? 8 : 12),
          top: position.y - (variant === 'crosshair' ? 8 : 12),
          transform: `translate(-50%, -50%)`,
        }}
      >
        {variant === 'crosshair' && (
          <>
            <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 transform bg-primary" />
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 transform bg-primary" />
          </>
        )}
      </div>

      {/* Cursor trail */}
      <div
        ref={trailRef}
        className={cn(
          'pointer-events-none fixed z-[9998] opacity-30 transition-all duration-300 ease-out',
          'h-8 w-8 rounded-full border border-primary',
          blendModeClasses[blendMode]
        )}
        style={{
          left: position.x - 16,
          top: position.y - 16,
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`,
        }}
      />
    </>
  );
};

// Hook for cursor interactions
export const useCursor = () => {
  const setCursorHover = (type: string) => {
    return {
      'data-cursor-hover': type,
      onMouseEnter: () => (document.body.style.cursor = 'none'),
      onMouseLeave: () => (document.body.style.cursor = 'auto'),
    };
  };

  return { setCursorHover };
};
