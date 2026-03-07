/**
 * Base composable components
 * Reusable base components to reduce duplication and ensure consistency
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import type { BaseComponentProps } from '@/lib/shared/types';

// Define missing types that were previously imported from shared/types
export interface LoadingStateProps extends BaseComponentProps {
  variant?: 'spinner' | 'skeleton' | 'pulse';
  size?: 'default' | 'sm' | 'md' | 'lg' | 'icon';
  inline?: boolean;
  loadingText?: string;
  loading?: boolean;
  children?: React.ReactNode;
  onRetry?: () => void;
}

export interface ErrorStateProps extends BaseComponentProps {
  error?: any;
  title?: string;
  size?: 'default' | 'sm' | 'md' | 'lg';
  showRetry?: boolean;
  onRetry?: () => void;
  children?: React.ReactNode;
  loading?: boolean;
}

export interface AsyncContentProps extends BaseComponentProps {
  data?: any;
  loading?: boolean;
  error?: any;
  onRetry?: () => void;
  emptyState?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Base card component with consistent styling
 */
export interface BaseCardProps extends BaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  interactive?: boolean;
}

export const BaseCard = forwardRef<HTMLDivElement, BaseCardProps>(
  (
    {
      children,
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      interactive = false,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'border bg-card text-card-foreground shadow-sm',
      outlined: 'border-2 bg-card text-card-foreground',
      elevated: 'border bg-card text-card-foreground shadow-lg',
      ghost: 'bg-transparent',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg',
          variants[variant],
          paddings[padding],
          hover && 'transition-shadow hover:shadow-md',
          interactive && 'cursor-pointer transition-all hover:scale-[1.02]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BaseCard.displayName = 'BaseCard';

/**
 * Enhanced card with header and content sections
 */
export interface EnhancedCardProps extends BaseComponentProps {
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: BaseCardProps['variant'];
  padding?: BaseCardProps['padding'];
  hover?: boolean;
  loading?: boolean;
  error?: string | null;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className,
  title,
  description,
  headerAction,
  footer,
  variant = 'default',
  padding = 'none',
  hover = false,
  loading = false,
  error = null,
  ...props
}) => {
  return (
    <BaseCard
      variant={variant}
      padding={padding}
      hover={hover}
      className={className}
      {...props}
    >
      {(title || description || headerAction) && (
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {title && <CardTitle className="text-lg">{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {headerAction && (
              <div className="flex-shrink-0">{headerAction}</div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent
        className={cn(title || description || headerAction ? 'pt-0' : '')}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 py-4 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          children
        )}
      </CardContent>

      {footer && <div className="px-6 pb-6 pt-0">{footer}</div>}
    </BaseCard>
  );
};

/**
 * Base button with consistent variants
 */
export interface BaseButtonProps
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
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      children,
      className,
      variant = 'default',
      size = 'default',
      loading = false,
      loadingText,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        disabled={isDisabled}
        className={cn(fullWidth && 'w-full', className)}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || 'Loading...'}
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="mr-2">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className="ml-2">{icon}</span>
            )}
          </>
        )}
      </Button>
    );
  }
);

BaseButton.displayName = 'BaseButton';

/**
 * Status badge component
 */
export interface StatusBadgeProps extends BaseComponentProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  className,
  status,
  variant = 'default',
  size = 'md',
  showIcon = true,
  ...props
}) => {
  const statusConfig = {
    success: {
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
    },
    warning: {
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: AlertTriangle,
    },
    error: {
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: X,
    },
    info: {
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Info,
    },
    neutral: {
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: Info,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={variant}
      className={cn(
        config.className,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-0.5 text-sm',
        size === 'lg' && 'px-3 py-1 text-base',
        className
      )}
      {...props}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {children}
    </Badge>
  );
};

/**
 * Empty state component
 */
export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  size?: 'default' | 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  size = 'md',
  className,
  ...props
}) => {
  const sizes = {
    default: {
      container: 'py-12',
      icon: 'w-12 h-12',
      title: 'text-xl',
      description: 'text-base',
    },
    sm: {
      container: 'py-8',
      icon: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-12 h-12',
      title: 'text-xl',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'w-16 h-16',
      title: 'text-2xl',
      description: 'text-lg',
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeConfig.container,
        className
      )}
      {...props}
    >
      {icon && (
        <div className={cn('mb-4 text-muted-foreground', sizeConfig.icon)}>
          {icon}
        </div>
      )}

      <h3
        className={cn('mb-2 font-semibold text-foreground', sizeConfig.title)}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            'mb-6 max-w-md text-muted-foreground',
            sizeConfig.description
          )}
        >
          {description}
        </p>
      )}

      {action && action}
    </div>
  );
};

/**
 * Loading state component
 */
export interface LoadingStateProps extends BaseComponentProps {
  variant?: 'spinner' | 'skeleton' | 'pulse';
  size?: 'default' | 'sm' | 'md' | 'lg' | 'icon';
  inline?: boolean;
  loadingText?: string;
  loading?: boolean;
  children?: React.ReactNode;
  onRetry?: () => void;
}

export const LoadingState = ({
  variant = 'spinner',
  size = 'md',
  loadingText = 'Loading...',
  inline = false,
  className,
  ...props
}: LoadingStateProps) => {
  const sizes: Record<string, { icon: string; text: string; spacing: string }> =
    {
      default: {
        icon: 'h-4 w-4',
        text: 'text-sm',
        spacing: 'gap-2 px-3 py-1.5',
      },
      sm: { icon: 'h-3 w-3', text: 'text-xs', spacing: 'gap-1 px-2 py-1' },
      md: { icon: 'h-4 w-4', text: 'text-sm', spacing: 'gap-2 px-3 py-1.5' },
      lg: { icon: 'h-5 w-5', text: 'text-base', spacing: 'gap-2 px-4 py-2' },
    };

  const sizeConfig = sizes[size];

  if (variant === 'skeleton') {
    return (
      <div className={cn('animate-pulse space-y-3', className)} {...props}>
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div
        className={cn(
          'animate-pulse rounded bg-muted',
          sizeConfig.icon,
          className
        )}
        {...props}
      />
    );
  }

  const containerClass = inline
    ? `inline-flex items-center ${sizeConfig.spacing}`
    : `flex flex-col items-center justify-center ${sizeConfig.spacing} py-8`;

  return (
    <div className={cn(containerClass, className)} {...props}>
      <Loader2
        className={cn('animate-spin text-muted-foreground', sizeConfig.icon)}
      />
      {loadingText && (
        <span className={cn('text-muted-foreground', sizeConfig.text)}>
          {loadingText}
        </span>
      )}
    </div>
  );
};

/**
 * Error state component
 */
export interface ErrorStateProps extends BaseComponentProps {
  error?: any;
  title?: string;
  size?: 'default' | 'sm' | 'md' | 'lg';
  showRetry?: boolean;
  onRetry?: () => void;
  children?: React.ReactNode;
  loading?: boolean;
}

export const ErrorState = ({
  error,
  title = 'Something went wrong',
  onRetry,
  showRetry = true,
  size = 'md',
  className,
  ...props
}: ErrorStateProps) => {
  const errorMessage =
    typeof error === 'string'
      ? error
      : error?.message || 'An unexpected error occurred';

  return (
    <EmptyState
      title={title}
      description={errorMessage}
      icon={<AlertTriangle />}
      size={size}
      className={className}
      action={
        showRetry &&
        onRetry && (
          <BaseButton
            variant="outline"
            onClick={onRetry}
            size={size === 'sm' ? 'sm' : 'default'}
          >
            Try Again
          </BaseButton>
        )
      }
      {...props}
    />
  );
};

/**
 * Async content wrapper
 */
export interface AsyncContentProps extends BaseComponentProps {
  data?: any;
  emptyState?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  loading?: boolean;
  error?: any;
  onRetry?: () => void;
}

export const AsyncContent = ({
  children,
  loading = false,
  error = null,
  data,
  emptyState,
  loadingComponent,
  errorComponent,
  onRetry,
  className,
  ...props
}: AsyncContentProps) => {
  if (loading) {
    return loadingComponent || <LoadingState />;
  }

  if (error) {
    return errorComponent || <ErrorState error={error} onRetry={onRetry} />;
  }

  if (
    data === null ||
    data === undefined ||
    (Array.isArray(data) && data.length === 0)
  ) {
    return emptyState || null;
  }

  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

/**
 * Section container with consistent spacing
 */
export interface SectionProps extends BaseComponentProps {
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  background?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  description,
  headerAction,
  spacing = 'md',
  background = false,
  className,
  ...props
}) => {
  const spacings = {
    sm: 'py-4',
    md: 'py-6',
    lg: 'py-8',
    xl: 'py-12',
  };

  return (
    <section
      className={cn(
        spacings[spacing],
        background && 'rounded-lg bg-muted/30 px-6',
        className
      )}
      {...props}
    >
      {(title || description || headerAction) && (
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              {title && (
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              )}
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
            {headerAction && (
              <div className="flex-shrink-0">{headerAction}</div>
            )}
          </div>
        </div>
      )}
      {children}
    </section>
  );
};

export default {
  BaseCard,
  EnhancedCard,
  BaseButton,
  StatusBadge,
  EmptyState,
  LoadingState,
  ErrorState,
  AsyncContent,
  Section,
};
