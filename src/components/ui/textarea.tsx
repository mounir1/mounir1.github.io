import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'glass' | 'modern';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses =
      'flex min-h-[80px] w-full rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-none';

    const variantClasses = {
      default:
        'border border-input bg-background hover:border-primary/50 focus-visible:border-primary',
      glass:
        'border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/70 hover:border-primary/50 focus-visible:bg-background/80 focus-visible:border-primary shadow-sm',
      modern:
        'border-2 border-border bg-background/80 hover:border-primary/60 focus-visible:border-primary focus-visible:shadow-lg hover:shadow-md backdrop-blur-sm',
    };

    return (
      <textarea
        className={cn(baseClasses, variantClasses[variant], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
