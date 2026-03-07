/**
 * Base Card Component
 * Reusable card component to reduce duplication across ProjectCard, SkillCard, etc.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { ALIGN_CLASSES } from '@/lib/shared/ui-utils';
import { BaseCardProps } from '@/lib/shared/types';

const cardVariants = {
  default: 'bg-card text-card-foreground border border-border',
  outlined: 'bg-transparent border-2 border-border hover:border-primary/50',
  elevated:
    'bg-card text-card-foreground border border-border shadow-lg hover:shadow-xl',
  ghost: 'bg-transparent border-0 hover:bg-muted/50',
};

const sizeVariants = {
  sm: 'p-3 rounded-md',
  md: 'p-4 rounded-lg',
  lg: 'p-6 rounded-xl',
};

export const BaseCard: React.FC<BaseCardProps> = ({
  children,
  title,
  description,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'transition-all duration-200',
        cardVariants[variant],
        sizeVariants[size],
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// Card Header Component
export interface CardHeaderProps extends BaseCardProps {
  actions?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  title,
  description,
  actions,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('mb-4 flex items-start justify-between', className)}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
      {actions && <div className="ml-4 flex items-center gap-2">{actions}</div>}
    </div>
  );
};

// Card Content Component
export const CardContent: React.FC<BaseCardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('flex-1', className)} {...props}>
      {children}
    </div>
  );
};

// Card Footer Component
export const CardFooter: React.FC<BaseCardProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('mt-4 border-t border-border pt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Actions Component
export interface CardActionsProps extends BaseCardProps {
  align?: 'left' | 'center' | 'right';
}

export const CardActions: React.FC<CardActionsProps> = ({
  children,
  align = 'right',
  className,
  ...props
}) => {
  const alignClasses = ALIGN_CLASSES;

  return (
    <div
      className={cn('flex items-center gap-2', alignClasses[align], className)}
      {...props}
    >
      {children}
    </div>
  );
};
