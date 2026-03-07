import React, { forwardRef, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  useFocusManagement,
  useKeyboardNavigation,
  useScreenReader,
  useAriaAttributes,
  useSkipLinks,
  AriaProps,
} from '@/hooks/useAccessibility';
import { Accessibility, Eye, Keyboard, Volume2 } from 'lucide-react';

// Enhanced Skip Links Component with Better Design
export const SkipLinks: React.FC<{
  links: Array<{ id: string; label: string; target: string }>;
  className?: string;
}> = ({ links, className }) => {
  const { skipTo } = useSkipLinks();

  if (links.length === 0) return null;

  return (
    <nav
      className={cn('sr-only focus-within:not-sr-only', className)}
      aria-label="Skip navigation"
    >
      {/* Enhanced design with glass morphism and better positioning */}
      <div className="fixed left-6 top-6 z-[9999] max-w-sm">
        <div className="rounded-xl border border-white/20 bg-gradient-to-br from-slate-900/95 to-blue-900/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2 text-white/90">
            <Accessibility className="h-4 w-4" />
            <span className="text-sm font-medium">Skip Navigation</span>
          </div>
          <ul className="space-y-2">
            {links.map(link => (
              <li key={link.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTo(link.target)}
                  className="w-full rounded-lg text-left text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

// Accessible Heading Component
export interface AccessibleHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  id?: string;
  className?: string;
  skipLinkLabel?: string;
}

export const AccessibleHeading: React.FC<AccessibleHeadingProps> = ({
  level,
  children,
  id,
  className,
  skipLinkLabel,
}) => {
  const { addSkipLink, removeSkipLink } = useSkipLinks();
  const { generateId } = useAriaAttributes();

  const headingId = id || generateId('heading');

  useEffect(() => {
    if (skipLinkLabel && headingId) {
      addSkipLink(headingId, skipLinkLabel, headingId);
      return () => removeSkipLink(headingId);
    }
  }, [skipLinkLabel, headingId, addSkipLink, removeSkipLink]);

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <HeadingTag id={headingId} className={className} tabIndex={-1}>
      {children}
    </HeadingTag>
  );
};

// Accessible Button Component
export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  loadingText?: string;
  describedBy?: string;
  expanded?: boolean;
  controls?: string;
  pressed?: boolean;
  children: React.ReactNode;
}

export const AccessibleButton = forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      variant = 'default',
      size = 'default',
      loading = false,
      loadingText = 'Loading',
      describedBy,
      expanded,
      controls,
      pressed,
      disabled,
      children,
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    const { announce } = useScreenReader();
    const { createAriaProps } = useAriaAttributes();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;

      onClick?.(e);

      // Announce action completion
      if (!e.defaultPrevented) {
        announce('Action completed');
      }
    };

    const ariaProps = createAriaProps({
      describedBy,
      expanded,
      controls,
      pressed,
      disabled: disabled || loading,
    });

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        onClick={handleClick}
        className={className}
        {...ariaProps}
        {...props}
      >
        {loading ? (
          <>
            <span className="sr-only">{loadingText}</span>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
            {children}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

// Accessible Status Badge
export interface AccessibleBadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
  announcement?: string;
}

export const AccessibleBadge: React.FC<AccessibleBadgeProps> = ({
  variant = 'default',
  status,
  children,
  className,
  announcement,
}) => {
  const { announce } = useScreenReader();
  const { createAriaProps } = useAriaAttributes();

  useEffect(() => {
    if (announcement) {
      announce(announcement);
    }
  }, [announcement, announce]);

  const statusLabels = {
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
    info: 'Information',
    neutral: 'Status',
  };

  const ariaProps = createAriaProps({
    label: `${statusLabels[status]}: ${children}`,
    role: 'status',
  });

  return (
    <Badge variant={variant} className={className} {...ariaProps}>
      <span className="sr-only">{statusLabels[status]}:</span>
      {children}
    </Badge>
  );
};

// Accessible Card Component
export interface AccessibleCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const AccessibleCard = forwardRef<HTMLDivElement, AccessibleCardProps>(
  (
    {
      children,
      className,
      title,
      description,
      interactive = false,
      selected = false,
      onClick,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const { handleKeyDown } = useKeyboardNavigation({
      onEnter: onClick,
      enabled: interactive,
    });
    const { createAriaProps, generateId } = useAriaAttributes();

    const titleId = generateId('card-title');
    const descId = generateId('card-desc');

    const ariaProps = createAriaProps({
      labelledBy: title ? titleId : undefined,
      describedBy: description ? descId : undefined,
      selected: interactive ? selected : undefined,
      role: interactive ? 'button' : undefined,
    });

    const combinedKeyDown = (e: React.KeyboardEvent) => {
      // Fix TypeScript issue by properly casting the event
      const domEvent = e.nativeEvent as KeyboardEvent;
      handleKeyDown(domEvent);
      onKeyDown?.(e);
    };

    return (
      <Card
        ref={ref}
        className={cn(
          interactive &&
            'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary',
          selected && 'ring-2 ring-primary',
          className
        )}
        onClick={interactive ? onClick : undefined}
        onKeyDown={interactive ? combinedKeyDown : onKeyDown}
        tabIndex={interactive ? 0 : undefined}
        {...ariaProps}
        {...props}
      >
        {title && (
          <h3 id={titleId} className="sr-only">
            {title}
          </h3>
        )}
        {description && (
          <p id={descId} className="sr-only">
            {description}
          </p>
        )}
        {children}
      </Card>
    );
  }
);

// Accessible Navigation Component
export interface AccessibleNavProps {
  children: React.ReactNode;
  label: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const AccessibleNav: React.FC<AccessibleNavProps> = ({
  children,
  label,
  className,
  orientation = 'horizontal',
}) => {
  const { createAriaProps } = useAriaAttributes();

  const ariaProps = createAriaProps({
    label,
    role: 'navigation',
  });

  return (
    <nav className={className} data-orientation={orientation} {...ariaProps}>
      {children}
    </nav>
  );
};

// Accessible List Component
export interface AccessibleListProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  ordered?: boolean;
  role?: 'list' | 'listbox' | 'menu';
}

export const AccessibleList: React.FC<AccessibleListProps> = ({
  children,
  className,
  label,
  ordered = false,
  role = 'list',
}) => {
  const { createAriaProps } = useAriaAttributes();

  const ariaProps = createAriaProps({
    label,
    role,
  });

  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <ListTag className={className} {...ariaProps}>
      {children}
    </ListTag>
  );
};

// Accessible List Item Component
export interface AccessibleListItemProps {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  role?: 'listitem' | 'option' | 'menuitem';
}

export const AccessibleListItem: React.FC<AccessibleListItemProps> = ({
  children,
  className,
  selected = false,
  disabled = false,
  onClick,
  role = 'listitem',
}) => {
  const { handleKeyDown } = useKeyboardNavigation({
    onEnter: onClick,
    enabled: !!onClick && !disabled,
  });
  const { createAriaProps } = useAriaAttributes();

  const ariaProps = createAriaProps({
    selected: role === 'option' ? selected : undefined,
    disabled,
    role,
  });

  return (
    <li
      className={cn(
        onClick &&
          !disabled &&
          'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary',
        selected && 'bg-accent',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={
        !disabled
          ? (e: React.KeyboardEvent<HTMLLIElement>) => {
              const domEvent = e.nativeEvent as KeyboardEvent;
              handleKeyDown(domEvent);
            }
          : undefined
      }
      tabIndex={onClick && !disabled ? 0 : undefined}
      {...ariaProps}
    >
      {children}
    </li>
  );
};

// Accessible Progress Component
export interface AccessibleProgressProps {
  value: number;
  max?: number;
  label?: string;
  description?: string;
  className?: string;
  showPercentage?: boolean;
}

export const AccessibleProgress: React.FC<AccessibleProgressProps> = ({
  value,
  max = 100,
  label,
  description,
  className,
  showPercentage = true,
}) => {
  const { announce } = useScreenReader();
  const { createAriaProps, generateId } = useAriaAttributes();
  const prevValueRef = useRef(value);

  const percentage = Math.round((value / max) * 100);
  const labelId = generateId('progress-label');
  const descId = generateId('progress-desc');

  // Announce progress changes
  useEffect(() => {
    const prevPercentage = Math.round((prevValueRef.current / max) * 100);
    if (percentage !== prevPercentage && percentage % 10 === 0) {
      announce(`Progress: ${percentage}%`);
    }
    prevValueRef.current = value;
  }, [percentage, announce, max, value]);

  const ariaProps = createAriaProps({
    labelledBy: label ? labelId : undefined,
    describedBy: description ? descId : undefined,
    role: 'progressbar',
  });

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div id={labelId} className="flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          {showPercentage && (
            <span className="text-sm text-muted-foreground">{percentage}%</span>
          )}
        </div>
      )}

      <div
        className="h-2 w-full rounded-full bg-secondary"
        {...ariaProps}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${percentage}%`}
      >
        <div
          className="h-2 rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {description && (
        <p id={descId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

// Enhanced Focus Trap Component
export interface FocusTrapProps {
  children: React.ReactNode;
  enabled?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  enabled = true,
  restoreFocus = true,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    storeFocus,
    restoreFocus: restore,
    trapFocus,
    focusFirst,
  } = useFocusManagement();

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    if (restoreFocus) {
      storeFocus();
    }

    const cleanup = trapFocus(containerRef.current);
    focusFirst(containerRef.current);

    return () => {
      cleanup?.();
      if (restoreFocus) {
        restore();
      }
    };
  }, [enabled, restoreFocus, storeFocus, restore, trapFocus, focusFirst]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// Accessibility Menu Component (Hidden by default)
export interface AccessibilityMenuProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showLabel?: boolean;
  hidden?: boolean;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  className,
  position = 'top-right',
  showLabel = true,
  hidden = true, // Hidden by default as requested
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { announce } = useScreenReader();

  // Don't render if hidden
  if (hidden) {
    return null;
  }

  const positionClasses = {
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    announce(
      isOpen ? 'Accessibility menu closed' : 'Accessibility menu opened'
    );
  };

  return (
    <div className={cn('fixed z-[9998]', positionClasses[position], className)}>
      {/* Accessibility Toggle Button with improved dark mode styling */}
      <Button
        onClick={toggleMenu}
        size="sm"
        variant="outline"
        className="border-border bg-background/90 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
        aria-label="Open accessibility menu"
        aria-expanded={isOpen}
      >
        <Accessibility className="h-4 w-4" />
        {showLabel && <span className="ml-2 text-xs">A11y</span>}
      </Button>

      {/* Accessibility Options Panel with improved dark mode */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-foreground">
                Accessibility Options
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">High Contrast</span>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Toggle
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Large Text</span>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Toggle
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reduced Motion</span>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Toggle
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-2">
              <Button
                size="sm"
                className="w-full text-xs"
                onClick={() => setIsOpen(false)}
              >
                Close Menu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
