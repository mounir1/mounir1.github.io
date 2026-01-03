import React, { useState, useEffect } from "react";
import { ChevronDown, Code2, Zap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Professional Hero Section with optimized copywriting
 * Showcases technical depth and consulting expertise
 */
export const OptimizedHeroSection: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/10 pt-20 pb-16 w-full">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none w-full">
        <div
          className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col items-center text-center z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
          <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            Available for Enterprise Projects
          </span>
        </div>

        {/* Primary headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight mb-6 max-w-5xl">
          <span className="block">Architecting</span>
          <span className="text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text">
            Digital Excellence
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mb-10">
          Senior Full-Stack Developer & Solution Architect transforming complex business requirements into scalable, high-performance software solutions.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button size="lg" className="text-lg px-8 h-14 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            View Case Studies
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 h-14"
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Start a Project
          </Button>
        </div>

        {/* Tech Stack / Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-border/50 pt-12 w-full max-w-4xl">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-foreground">10+</div>
            <p className="text-sm text-muted-foreground font-medium">Years Experience</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-foreground">50+</div>
            <p className="text-sm text-muted-foreground font-medium">Enterprise Projects</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-foreground">250K+</div>
            <p className="text-sm text-muted-foreground font-medium">Users Impacted</p>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-foreground">99.9%</div>
            <p className="text-sm text-muted-foreground font-medium">Uptime Delivered</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-bounce"
        style={{ opacity: 1 - scrollY / 400 }}
      >
        <span className="text-xs font-medium">Scroll to explore</span>
        <ChevronDown className="h-4 w-4" />
      </div>
    </section>
  );
};

export default OptimizedHeroSection;
