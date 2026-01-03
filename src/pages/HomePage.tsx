import React, { Suspense, lazy, useEffect } from 'react';
import { Mail, Phone, Linkedin, Github, MapPin, Twitter } from "lucide-react";

// Core Components
import { Navigation } from "../components/ui/navigation";
import { Skills } from "../components/sections/skills";
import { Projects } from "../components/sections/projects";
import { Experience } from "../components/sections/experience";
import { ContactSection } from "../components/portfolio/ContactSection";
import { OptimizedHeroSection } from "../components/portfolio/OptimizedHeroSection";
import { portfolioSEO, pagesSEO } from "@/lib/seo-config";

// Lazy load PIM expertise section for performance
const PIMExpertiseSection = lazy(() => import("../components/portfolio/PIMExpertiseSection"));

// Define type for dataLayer
interface DataLayerEvent {
  event: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Professional Portfolio Homepage
 * @author Mounir Abderrahmani
 * @description Modern, responsive portfolio showcasing full-stack development expertise
 */
const HomePage = () => {
  // SEO meta tags
  useEffect(() => {
    const page = pagesSEO.home || {};
    const title = page.title || portfolioSEO.title;
    const description = page.description || portfolioSEO.description;

    if (title) document.title = title;

    const ensureMeta = (name: string, content: string) => {
      if (!content) return;
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    ensureMeta('description', description || '');
    ensureMeta('keywords', (portfolioSEO.keywords || []).join(', '));

    // Basic OpenGraph
    const ensureOG = (property: string, content: string) => {
      if (!content) return;
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    ensureOG('og:title', title);
    ensureOG('og:description', description || '');
    ensureOG('og:image', portfolioSEO.ogImage);
    ensureOG('og:url', portfolioSEO.ogUrl);
  }, []);
  // Analytics tracking
  const pushToDataLayer = (eventData: DataLayerEvent) => {
    if (typeof window !== 'undefined' && (window as unknown as { dataLayer: DataLayerEvent[] }).dataLayer) {
      (window as unknown as { dataLayer: DataLayerEvent[] }).dataLayer.push(eventData);
    }
  };

  const handleContactClick = () => {
    pushToDataLayer({
      event: 'cta_click',
      button: 'contact_from_hero'
    });
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "name": "Mounir Abderrahmani",
        "url": "https://mounir1.github.io",
        "jobTitle": "Senior Full-Stack Developer & Solution Architect",
        "image": "https://mounir1.github.io/mounir-icon.svg",
        "sameAs": [
          "https://www.linkedin.com/in/mounir1badi/",
          "https://github.com/mounir1",
          "https://x.com/Mounir1badi"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Algiers",
          "addressCountry": "Algeria"
        },
        "knowsAbout": ["React", "TypeScript", "Node.js", "Firebase", "PIM", "ERP", "System Architecture"]
      },
      {
        "@type": "WebSite",
        "url": "https://mounir1.github.io",
        "name": "Mounir Abderrahmani - Portfolio",
        "description": "Professional portfolio of Mounir Abderrahmani, a Senior Full-Stack Developer specializing in modern web technologies and digital solutions.",
        "author": {
          "@type": "Person",
          "name": "Mounir Abderrahmani"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navigation />

      <main className="w-full">
        {/* Optimized Hero Section */}
        <section id="hero" className="relative w-full">
          <OptimizedHeroSection />
        </section>



        {/* Skills Section */}
        <section id="skills" className="py-16 lg:py-24 w-full px-4 md:px-6 lg:px-8">
          <Skills />
        </section>

        {/* Featured Projects Section */}
        <section id="projects" className="py-16 lg:py-24 bg-muted/30 w-full px-4 md:px-6 lg:px-8">
          <Projects />
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-16 lg:py-24 w-full px-4 md:px-6 lg:px-8">
          <Experience />
        </section>

        {/* PIM Expertise Section */}
        <section id="pim-expertise" className="py-16 lg:py-24 w-full px-4 md:px-6 lg:px-8">
          <Suspense fallback={
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          }>
            <PIMExpertiseSection />
          </Suspense>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 lg:py-24 w-full px-4 md:px-6 lg:px-8">
          <ContactSection />
        </section>
      </main>

      {/* Professional Footer */}
      <footer className="border-t border-border/50 py-12 bg-gradient-to-b from-background to-muted/20 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 text-2xl font-bold text-foreground mb-3">
                <img src="/mounir-icon.svg" alt="Mounir Abderrahmani" className="w-10 h-10 rounded-full" />
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Mounir Abderrahmani
                </span>
              </div>
              <p className="text-muted-foreground max-w-lg leading-relaxed mb-4">
                Senior Full-Stack Developer & Solution Architect specializing in modern web technologies,
                scalable applications, and innovative digital solutions.
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Algiers, Algeria • Available Worldwide</span>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-4">
              <div className="flex gap-3">
                <a
                  href="mailto:mounir.webdev@gmail.com"
                  className="text-primary hover:text-primary/80 transition-colors track-click"
                  aria-label="Email me"
                  onClick={() => {
                    pushToDataLayer({
                      event: 'footer_link_click',
                      link: 'email'
                    });
                  }}
                >
                  <Mail className="h-5 w-5" />
                </a>
                <a
                  href="tel:+213555123456"
                  className="text-primary hover:text-primary/80 transition-colors track-click"
                  aria-label="Call me"
                  onClick={() => {
                    pushToDataLayer({
                      event: 'footer_link_click',
                      link: 'phone'
                    });
                  }}
                >
                  <Phone className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/mounir1badi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors track-click"
                  aria-label="LinkedIn profile"
                  onClick={() => {
                    pushToDataLayer({
                      event: 'footer_link_click',
                      link: 'linkedin'
                    });
                  }}
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/mounir1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors track-click"
                  aria-label="GitHub profile"
                  onClick={() => {
                    pushToDataLayer({
                      event: 'footer_link_click',
                      link: 'github'
                    });
                  }}
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/Mounir1badi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors track-click"
                  aria-label="Twitter profile"
                  onClick={() => {
                    pushToDataLayer({
                      event: 'footer_link_click',
                      link: 'twitter'
                    });
                  }}
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>

              <div className="text-center lg:text-right">
                <div className="text-xs text-muted-foreground mb-2">
                  Let's build something amazing together
                </div>
                <a href="mailto:mounir.webdev@gmail.com"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  mounir.webdev@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Mounir Abderrahmani. Crafted with ❤️ using React & TypeScript
              </p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span>
                <span className="hover:text-foreground transition-colors cursor-pointer">Terms</span>
                <span className="hover:text-foreground transition-colors cursor-pointer">Sitemap</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;