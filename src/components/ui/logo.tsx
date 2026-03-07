import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full' | 'signature';
  animate?: boolean;
}

export const Logo = ({
  className,
  size = 'md',
  variant = 'icon',
  animate = true,
}: LogoProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const MounirIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-full w-full transition-all duration-300', {
        'group-hover:rotate-3 group-hover:scale-110': animate,
        'drop-shadow-lg': animate,
      })}
    >
      <defs>
        <linearGradient id="simpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4361ee" />
          <stop offset="100%" stopColor="#7209b7" />
        </linearGradient>
        <filter id="iconGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
          <feFlood floodColor="#4361ee" floodOpacity="0.4" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Left brace */}
      <path
        d="M6,4 C4,4 4,8 6,8 C4,8 4,12 6,12 C4,12 4,16 6,16 C4,16 4,20 6,20"
        fill="none"
        stroke="url(#simpleGradient)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={animate ? 'url(#iconGlow)' : undefined}
      />

      {/* Letter "M" stylized */}
      <path
        d="M9 20V4h1v7l3-7h1l3 7v-7h1v16h-1v-9l-3-7-3 7v9H9z"
        fill="url(#simpleGradient)"
        filter={animate ? 'url(#iconGlow)' : undefined}
      />

      {/* Right brace */}
      <path
        d="M18,4 C20,4 20,8 18,8 C20,8 20,12 18,12 C20,12 20,16 18,16 C20,16 20,20 18,20"
        fill="none"
        stroke="url(#simpleGradient)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={animate ? 'url(#iconGlow)' : undefined}
      />
    </svg>
  );

  const FullLogo = () => (
    <div className="group flex cursor-pointer items-center space-x-3">
      <div className={cn('transition-all duration-300', sizeClasses[size])}>
        <MounirIcon />
      </div>
      <div className="flex flex-col transition-all duration-300 group-hover:translate-x-1">
        <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-lg font-bold leading-none text-transparent">
          Mounir Abderrahmani
        </span>
        <span className="mt-0.5 text-xs font-medium leading-none text-muted-foreground">
          Senior Full-Stack Developer
        </span>
      </div>
    </div>
  );

  const SignatureLogo = () => (
    <div className="group flex items-center space-x-2">
      <div
        className={cn(
          'transition-all duration-300',
          sizeClasses[size === 'xl' ? 'lg' : size]
        )}
      >
        <MounirIcon />
      </div>
      <svg
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-auto transition-all duration-300 group-hover:scale-105"
      >
        <defs>
          <linearGradient
            id="signatureGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#4361ee" />
            <stop offset="50%" stopColor="#3a0ca3" />
            <stop offset="100%" stopColor="#7209b7" />
          </linearGradient>
        </defs>

        {/* Signature text path */}
        <path
          d="M5 25 Q15 15 25 25 Q35 35 45 25 Q55 15 65 25 Q75 35 85 25 Q95 15 105 25 Q110 30 115 25"
          stroke="url(#signatureGradient)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-80"
        />

        {/* Decorative dots */}
        <circle cx="10" cy="20" r="1.5" fill="#4361ee" className="opacity-60" />
        <circle
          cx="110"
          cy="20"
          r="1.5"
          fill="#7209b7"
          className="opacity-60"
        />
      </svg>
    </div>
  );

  if (variant === 'full') {
    return (
      <div className={cn('group relative', className)}>
        <FullLogo />
      </div>
    );
  }

  if (variant === 'signature') {
    return (
      <div className={cn('relative', className)}>
        <SignatureLogo />
      </div>
    );
  }

  return (
    <div className={cn('group relative', sizeClasses[size], className)}>
      <MounirIcon />
    </div>
  );
};

// Legacy export for backward compatibility
export const SignatureLogo = ({ className }: { className?: string }) => {
  return <Logo variant="signature" className={className} />;
};
