import React from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from './ResponsiveDesign';

// Mobile navigation drawer
export interface MobileDrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  position?: 'left' | 'right';
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  children,
  isOpen,
  onClose,
  className,
  position = 'left',
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isMobile) return null;

  const drawerClasses = cn(
    'fixed top-0 z-50 h-full w-80 bg-background border-r transform transition-transform duration-300 ease-in-out',
    position === 'left' ? 'left-0' : 'right-0',
    position === 'left'
      ? isOpen
        ? 'translate-x-0'
        : '-translate-x-full'
      : isOpen
        ? 'translate-x-0'
        : 'translate-x-full',
    className
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={drawerClasses}>{children}</div>
    </>
  );
};

// Swipeable carousel for mobile
export interface SwipeableCarouselProps {
  children: React.ReactNode[];
  className?: string;
  autoplay?: boolean;
  interval?: number;
  showDots?: boolean;
}

export const SwipeableCarousel: React.FC<SwipeableCarouselProps> = ({
  children,
  className,
  autoplay = false,
  interval = 3000,
  showDots = true,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % children.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + children.length) % children.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  React.useEffect(() => {
    if (!autoplay) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchMove={isMobile ? handleTouchMove : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>

      {showDots && (
        <div className="mt-4 flex justify-center space-x-2">
          {children.map((_, index) => (
            <button
              key={index}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
              )}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Mobile-optimized button with larger touch targets
export interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const baseClasses =
    'rounded-lg font-medium transition-colors touch-manipulation';

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
  };

  const sizeClasses = {
    sm: isMobile ? 'px-4 py-3 text-sm min-h-[44px]' : 'px-3 py-2 text-sm',
    md: isMobile ? 'px-6 py-4 text-base min-h-[48px]' : 'px-4 py-2 text-sm',
    lg: isMobile ? 'px-8 py-5 text-lg min-h-[52px]' : 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Pull-to-refresh component
export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className,
  threshold = 60,
}) => {
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [touchStart, setTouchStart] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      setTouchStart(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const touchY = e.touches[0].clientY;
    const distance = Math.max(0, touchY - touchStart);
    setPullDistance(Math.min(distance, threshold * 1.5));
  };

  const handleTouchEnd = async () => {
    if (!isPulling || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    setTouchStart(0);
  };

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <div
          className="absolute left-0 right-0 top-0 flex items-center justify-center bg-muted/50 transition-all duration-200"
          style={{
            height: Math.max(pullDistance, isRefreshing ? threshold : 0),
            opacity: pullDistance > 20 ? 1 : 0,
          }}
        >
          <div
            className={cn(
              'transition-transform duration-200',
              isRefreshing && 'animate-spin'
            )}
          >
            {isRefreshing ? '🔄' : pullDistance >= threshold ? '⬆️' : '⬇️'}
          </div>
        </div>
      )}

      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${isPulling ? pullDistance : 0}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
