import { cn } from '@/lib/utils';

interface SignatureProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'svg' | 'text' | 'icon' | 'full' | 'minimal' | 'compact';
  interactive?: boolean;
  showTitle?: boolean;
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const iconSizes = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-10 h-10',
};

const svgSizes = {
  xs: 'w-16 h-6',
  sm: 'w-20 h-8',
  md: 'w-24 h-10',
  lg: 'w-32 h-12',
  xl: 'w-40 h-16',
};

export function Signature({
  className,
  size = 'md',
  variant = 'svg',
  interactive = false,
  showTitle = false,
}: SignatureProps) {
  const baseClasses = cn(
    'transition-all duration-300',
    interactive && 'hover:scale-105 cursor-pointer',
    className
  );

  // SVG Signature (default - most unique and mobile-optimized)
  if (variant === 'svg') {
    return (
      <div className={cn('flex items-center justify-center', baseClasses)}>
        <img
          src="/mounir-signature.svg"
          alt="Mounir Abderrahmani Signature"
          className={cn(
            svgSizes[size],
            'object-contain',
            interactive && 'transition-transform duration-300 hover:scale-110'
          )}
        />
      </div>
    );
  }

  // Icon only
  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center justify-center', baseClasses)}>
        <img
          src="/mounir-icon.svg"
          alt="Mounir Abderrahmani"
          className={cn(
            iconSizes[size],
            interactive && 'transition-transform duration-300 hover:scale-110'
          )}
        />
      </div>
    );
  }

  // Text only
  if (variant === 'text') {
    return (
      <div
        className={cn(
          'font-signature select-none',
          sizeClasses[size],
          baseClasses
        )}
      >
        Mounir Abderrahmani
      </div>
    );
  }

  // Full signature with icon and text
  if (variant === 'full') {
    return (
      <div className={cn('flex flex-col items-center gap-1', baseClasses)}>
        <div className="flex items-center gap-2">
          <img
            src="/mounir-icon.svg"
            alt="Mounir Abderrahmani"
            className={cn(
              iconSizes[size],
              interactive && 'transition-transform duration-300 hover:scale-110'
            )}
          />
          <div className={cn('font-signature', sizeClasses[size])}>
            Mounir Abderrahmani
          </div>
        </div>
        {showTitle && (
          <div
            className={cn(
              'text-center font-medium text-muted-foreground',
              size === 'xs' && 'text-xs',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base',
              size === 'xl' && 'text-lg'
            )}
          >
            Senior Full-Stack Developer
          </div>
        )}
      </div>
    );
  }

  // Minimal signature
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', baseClasses)}>
        <div
          className={cn(
            'h-2 w-2 rounded-full bg-gradient-to-r from-primary to-primary/60',
            interactive && 'animate-pulse'
          )}
        />
        <div
          className={cn(
            'font-signature text-muted-foreground',
            sizeClasses[size]
          )}
        >
          MAB
        </div>
      </div>
    );
  }

  // Compact signature for very small spaces
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1.5', baseClasses)}>
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        <div
          className={cn(
            'font-signature text-muted-foreground',
            sizeClasses[size]
          )}
        >
          M.A
        </div>
      </div>
    );
  }

  // Default to SVG
  return (
    <div className={cn('flex items-center justify-center', baseClasses)}>
      <img
        src="/mounir-signature.svg"
        alt="Mounir Abderrahmani Signature"
        className={cn(
          svgSizes[size],
          'object-contain',
          interactive && 'transition-transform duration-300 hover:scale-110'
        )}
      />
    </div>
  );
}

// Professional signature with icon and text
export function ProfessionalSignature({
  className,
  size = 'md',
  interactive = false,
  showTitle = false,
}: SignatureProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src="/mounir-icon.svg"
        alt="Mounir Abderrahmani"
        className={cn(
          iconSizes[size],
          'opacity-80',
          interactive && 'transition-transform duration-300 hover:scale-110'
        )}
      />
      <div className="flex flex-col">
        <div
          className={cn('font-medium text-muted-foreground', sizeClasses[size])}
        >
          Mounir Abderrahmani
        </div>
        {showTitle && (
          <div
            className={cn(
              'font-normal text-muted-foreground/70',
              size === 'xs' && 'text-xs',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base',
              size === 'xl' && 'text-lg'
            )}
          >
            Senior Full-Stack Developer
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile-optimized signature for headers and footers
export function MobileSignature({
  className,
  size = 'sm',
}: Pick<SignatureProps, 'className' | 'size'>) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img src="/mounir-icon.svg" alt="MA" className={iconSizes[size]} />
      <div className={cn('font-signature', sizeClasses[size])}>
        <span className="hidden sm:inline">Mounir Abderrahmani</span>
        <span className="sm:hidden">M. Abderrahmani</span>
      </div>
    </div>
  );
}

// Compact signature for small spaces
export function CompactSignature({
  className,
  size = 'xs',
}: Pick<SignatureProps, 'className' | 'size'>) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
      <div
        className={cn(
          'font-signature text-muted-foreground',
          sizeClasses[size]
        )}
      >
        MAB
      </div>
    </div>
  );
}

// SVG-only signature for maximum flexibility
export function SVGSignature({
  className,
  size = 'md',
}: Pick<SignatureProps, 'className' | 'size'>) {
  return (
    <img
      src="/mounir-signature.svg"
      alt="Mounir Abderrahmani"
      className={cn(svgSizes[size], 'object-contain', className)}
    />
  );
}
