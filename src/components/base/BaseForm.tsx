/**
 * Base Form Component
 * Reusable form component to reduce duplication across ProjectForm, SkillForm, etc.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { ALIGN_CLASSES } from '@/lib/shared/ui-utils';
import { BaseFormProps } from '@/lib/shared/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  collapsible = false,
  defaultExpanded = true,
  className,
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'flex items-center justify-between',
          collapsible && 'cursor-pointer'
        )}
        onClick={collapsible ? () => setExpanded(!expanded) : undefined}
      >
        <div>
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {collapsible && (
          <Button variant="ghost" size="sm">
            {expanded ? '−' : '+'}
          </Button>
        )}
      </div>

      {(!collapsible || expanded) && (
        <div className="space-y-4">{children}</div>
      )}
    </div>
  );
};

export interface BaseFormLayoutProps extends BaseFormProps {
  title?: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  showCancel?: boolean;
  sections?: boolean;
}

export const BaseFormLayout: React.FC<BaseFormLayoutProps> = ({
  children,
  title,
  description,
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
  submitText = 'Save',
  cancelText = 'Cancel',
  showCancel = true,
  sections = false,
  className,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && !loading && !disabled) {
      onSubmit(e);
    }
  };

  return (
    <Card className={cn('mx-auto w-full max-w-2xl', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      )}

      <form onSubmit={handleSubmit}>
        <CardContent className={cn(sections && 'space-y-8')}>
          {children}
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          {showCancel && onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
          )}
          <Button
            type="submit"
            disabled={disabled || loading}
            className="min-w-[100px]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitText}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

// Form Field Wrapper
export interface FormFieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  label,
  required = false,
  error,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {children}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

// Form Grid Layout
export interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = 2,
  className,
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={cn('grid gap-4', gridClasses[columns], className)}>
      {children}
    </div>
  );
};

// Form Actions
export interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
  className,
}) => {
  const alignClasses = ALIGN_CLASSES;

  return (
    <div className={cn('flex gap-3', alignClasses[align], className)}>
      {children}
    </div>
  );
};
