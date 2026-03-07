import React, { useState, useEffect } from 'react';
import { ChevronDown, Code2, Zap, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Professional Hero Section with optimized copywriting
 * Showcases technical depth and consulting expertise
 */
export const OptimizedHeroSection: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/10 pb-16 pt-20">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 w-full overflow-hidden">
        <div
          className="absolute right-10 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 text-center md:px-6 lg:px-8">
        {/* Badge */}
        <div className="mb-8 inline-flex animate-fade-in items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-sm font-medium text-foreground">
            Available for Enterprise Projects
          </span>
        </div>

        {/* Primary headline */}
        <h1 className="mb-6 max-w-5xl text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl">
          <span className="block">Architecting</span>
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Digital Excellence
          </span>
        </h1>

        {/* Subheading */}
        <p className="mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
          Senior Full-Stack Developer & Solution Architect transforming complex
          business requirements into scalable, high-performance software
          solutions.
        </p>

        {/* CTA Buttons */}
        <div className="mb-16 flex flex-col gap-4 sm:flex-row">
          <Button
            size="lg"
            className="h-14 gap-2 px-8 text-lg shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
          >
            View Case Studies
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-lg"
            onClick={() =>
              document
                .getElementById('contact')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Start a Project
          </Button>
        </div>

        {/* Tech Stack / Trust Indicators */}
        <div className="grid w-full max-w-4xl grid-cols-2 gap-8 border-t border-border/50 pt-12 md:grid-cols-4 md:gap-16">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-foreground">10+</div>
            <p className="text-sm font-medium text-muted-foreground">
              Years Experience
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-foreground">50+</div>
            <p className="text-sm font-medium text-muted-foreground">
              Enterprise Projects
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-foreground">250K+</div>
            <p className="text-sm font-medium text-muted-foreground">
              Users Impacted
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-foreground">99.9%</div>
            <p className="text-sm font-medium text-muted-foreground">
              Uptime Delivered
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-2 text-muted-foreground"
        style={{ opacity: 1 - scrollY / 400 }}
      >
        <span className="text-xs font-medium">Scroll to explore</span>
        <ChevronDown className="h-4 w-4" />
      </div>
    </section>
  );
};

export default OptimizedHeroSection;
