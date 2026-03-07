/**
 * Loading Screen Component
 * Brand animation with smooth transitions and progress indication
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
  variant?: 'minimal' | 'brand' | 'progress' | 'particles';
  duration?: number;
  showProgress?: boolean;
  brandLogo?: string;
  brandName?: string;
  className?: string;
}

// Animated logo component
const AnimatedLogo: React.FC<{ logo?: string; name?: string }> = ({
  logo,
  name,
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {logo ? (
        <div className="relative">
          <img src={logo} alt="Logo" className="h-16 w-16 animate-pulse" />
          <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        </div>
      ) : (
        <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-br from-primary to-secondary" />
      )}

      {name && (
        <h1 className="animate-fade-in text-2xl font-bold text-foreground">
          {name}
        </h1>
      )}
    </div>
  );
};

// Progress bar component
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="h-1 w-64 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

// Particle animation component
const ParticleAnimation: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle}
          className="absolute h-2 w-2 animate-float rounded-full bg-primary/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

// Minimal loading variant
const MinimalLoading: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-primary"
        style={{ animationDelay: '0ms' }}
      />
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-primary"
        style={{ animationDelay: '150ms' }}
      />
      <div
        className="h-2 w-2 animate-bounce rounded-full bg-primary"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
};

// Brand loading variant
const BrandLoading: React.FC<{
  logo?: string;
  name?: string;
  progress?: number;
}> = ({ logo, name, progress }) => {
  return (
    <div className="flex flex-col items-center gap-8">
      <AnimatedLogo logo={logo} name={name} />

      {progress !== undefined && (
        <div className="flex flex-col items-center gap-2">
          <ProgressBar progress={progress} />
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="h-1 w-1 animate-pulse rounded-full bg-current" />
        <span className="text-sm">Loading amazing content</span>
        <div className="h-1 w-1 animate-pulse rounded-full bg-current" />
      </div>
    </div>
  );
};

// Progress loading variant
const ProgressLoading: React.FC<{ progress: number }> = ({ progress }) => {
  const steps = [
    { label: 'Initializing', threshold: 20 },
    { label: 'Loading assets', threshold: 40 },
    { label: 'Preparing interface', threshold: 70 },
    { label: 'Almost ready', threshold: 90 },
    { label: 'Complete', threshold: 100 },
  ];

  const currentStep =
    steps.find(step => progress <= step.threshold) || steps[steps.length - 1];

  return (
    <div className="flex w-80 flex-col items-center gap-6">
      <div className="relative h-20 w-20">
        <svg
          className="h-full w-full -rotate-90 transform"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className="text-primary transition-all duration-300 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <div className="text-center">
        <h3 className="mb-1 text-lg font-medium text-foreground">
          {currentStep.label}
        </h3>
        <p className="text-sm text-muted-foreground">
          Please wait while we prepare everything for you
        </p>
      </div>
    </div>
  );
};

// Particles loading variant
const ParticlesLoading: React.FC<{ logo?: string; name?: string }> = ({
  logo,
  name,
}) => {
  return (
    <div className="relative flex flex-col items-center gap-8">
      <ParticleAnimation />
      <div className="relative z-10">
        <AnimatedLogo logo={logo} name={name} />
      </div>
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 backdrop-blur-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Creating magic</span>
        </div>
      </div>
    </div>
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isLoading,
  onComplete,
  variant = 'brand',
  duration = 3000,
  showProgress = true,
  brandLogo,
  brandName,
  className,
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(isLoading);

  useEffect(() => {
    if (!isLoading) {
      // Fade out animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
      setProgress(0);
    }
  }, [isLoading, onComplete]);

  useEffect(() => {
    if (!isLoading || !showProgress) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 15 + 5; // Random increment between 5-20
        const newProgress = Math.min(prev + increment, 100);

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
          }, 500);
        }

        return newProgress;
      });
    }, duration / 20); // Update 20 times during the duration

    return () => clearInterval(interval);
  }, [isLoading, showProgress, duration, onComplete]);

  if (!isVisible) return null;

  const renderLoadingVariant = () => {
    switch (variant) {
      case 'minimal':
        return <MinimalLoading />;
      case 'brand':
        return (
          <BrandLoading
            logo={brandLogo}
            name={brandName}
            progress={showProgress ? progress : undefined}
          />
        );
      case 'progress':
        return <ProgressLoading progress={progress} />;
      case 'particles':
        return <ParticlesLoading logo={brandLogo} name={brandName} />;
      default:
        return <MinimalLoading />;
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-500',
        !isLoading && 'opacity-0',
        className
      )}
    >
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        {renderLoadingVariant()}
      </div>
    </div>
  );
};

// Hook for managing loading states
export const useLoadingScreen = (initialLoading = true) => {
  const [isLoading, setIsLoading] = useState(initialLoading);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return {
    isLoading,
    startLoading,
    stopLoading,
    setIsLoading,
  };
};
