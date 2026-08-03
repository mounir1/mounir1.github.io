/**
 * Site Configuration for Senior Developer Portfolio
 * Centralized configuration for SEO, branding, and site metadata
 */

export const siteConfig = {
  // Basic Information
  name: "Senior Full-Stack Developer",
  title: "Senior Full-Stack Developer & Technical Lead (10+ Years)",
  description: "Experienced Senior Full-Stack Developer specializing in scalable web applications, cloud architecture, and technical leadership. Expert in React, TypeScript, Node.js, Python, AWS, and microservices.",
  
  // Personal Information
  person: {
    name: "Your Name",
    role: "Senior Full-Stack Developer",
    level: "10+ years experience",
    location: "Algiers, Algeria",
    availability: "Open to remote opportunities",
    email: "your.email@example.com",
    phone: "+213 XX XXX XXXX",
  },

  // URLs
  url: "https://yourportfolio.com",
  ogImage: "https://yourportfolio.com/og-image.jpg",
  
  // Social Links
  social: {
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
    twitter: "https://twitter.com/yourusername",
    stackoverflow: "https://stackoverflow.com/users/yourid",
    gitlab: "",
    bitbucket: "",
  },

  // Keywords for SEO
  keywords: [
    "Senior Developer",
    "Full-Stack Developer",
    "Technical Lead",
    "Software Architect",
    "React Developer",
    "TypeScript Expert",
    "Node.js Developer",
    "Python Developer",
    "AWS Certified",
    "Cloud Architecture",
    "Microservices",
    "System Design",
    "Team Leadership",
    "Code Review",
    "Mentoring",
    "Agile",
    "DevOps",
    "CI/CD",
    "REST API",
    "GraphQL",
    "PostgreSQL",
    "MongoDB",
    "Docker",
    "Kubernetes",
    "Frontend Architecture",
    "Backend Development",
    "Web Performance",
    "Security Best Practices",
    "Remote Developer",
  ],

  // Language & Internationalization
  language: "en",
  alternateLanguages: [
    { code: "en", href: "https://yourportfolio.com/en" },
    { code: "ar", href: "https://yourportfolio.com/ar" },
    { code: "fr", href: "https://yourportfolio.com/fr" },
  ],

  // Business/Service Information
  services: [
    {
      name: "Full-Stack Development",
      description: "End-to-end web application development using modern technologies",
    },
    {
      name: "Technical Leadership",
      description: "Leading development teams and architectural decision-making",
    },
    {
      name: "Code Review & Mentoring",
      description: "Improving code quality and mentoring junior developers",
    },
    {
      name: "System Architecture",
      description: "Designing scalable and maintainable system architectures",
    },
    {
      name: "Performance Optimization",
      description: "Optimizing web applications for speed and efficiency",
    },
  ],

  // Structured Data Types
  occupation: "Software Developer",
  award: "Best Developer Award 2023", // Update with actual awards
  sameAs: [], // Will be populated from social links
};

// Navigation Configuration
export const navigationConfig = {
  mainNav: [
    { label: "Home", href: "#home" },
    { label: "Experience", href: "#experience" },
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Case Studies", href: "#case-studies" },
    { label: "Contact", href: "#contact" },
  ],
  socialNav: [
    { label: "GitHub", href: siteConfig.social.github, icon: "github" },
    { label: "LinkedIn", href: siteConfig.social.linkedin, icon: "linkedin" },
    { label: "Twitter", href: siteConfig.social.twitter, icon: "twitter" },
  ],
};

// Theme Configuration
export const themeConfig = {
  colors: {
    primary: "#0f172a",
    secondary: "#64748b",
    accent: "#3b82f6",
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#f1f5f9",
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
    mono: "Fira Code, monospace",
  },
};

// Analytics Configuration
export const analyticsConfig = {
  googleAnalytics: "", // Add GA4 measurement ID
  plausible: "", // Add Plausible domain
  posthog: "", // Add PostHog API key
  sentry: "", // Add Sentry DSN
};

// Feature Flags
export const featureFlags = {
  enableCaseStudies: true,
  enableBlog: false,
  enableTestimonials: true,
  enableDarkMode: true,
  enableAnimations: true,
  enablePWA: true,
};
