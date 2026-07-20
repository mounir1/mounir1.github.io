import { Suspense, lazy } from "react";
// ── Above-fold: loaded eagerly (critical render path) ─────────────────────────
import { Navigation } from "@/components/ui/navigation";
import { Hero } from "@/components/sections/hero";
import { Signature } from "@/components/ui/signature";
import { useSettings } from "@/hooks/useSettings";
import { useLinks } from "@/hooks/useLinks";

// ── Below-fold: lazy-loaded into separate async chunks ────────────────────────
const Experience   = lazy(() => import("@/components/sections/experience").then(m => ({ default: m.Experience })));
const Skills       = lazy(() => import("@/components/sections/skills").then(m => ({ default: m.Skills })));
const Projects     = lazy(() => import("@/components/sections/projects").then(m => ({ default: m.Projects })));
const Upcoming     = lazy(() => import("@/components/sections/upcoming").then(m => ({ default: m.Upcoming })));
const Testimonials = lazy(() => import("@/components/sections/testimonials").then(m => ({ default: m.Testimonials })));
const Contact      = lazy(() => import("@/components/sections/contact").then(m => ({ default: m.Contact })));

// ─── Section Error Boundary (lightweight inline version) ─────────────────────
import React from "react";

class SectionErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { name: string; children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[${this.props.name}] section error:`, error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="py-12 text-center text-muted-foreground text-sm">
          <p className="opacity-50">Section temporarily unavailable.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Lightweight section skeleton shown while lazy chunks load ────────────────
function SectionSkeleton() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="text-center space-y-3">
          <div className="h-8 w-48 bg-muted/50 rounded-lg mx-auto" />
          <div className="h-4 w-72 bg-muted/30 rounded mx-auto" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted/20 rounded-xl border border-border/30" />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer Links (dynamic from Firebase) ─────────────────────────────────────
function FooterLinks() {
  const { links } = useLinks();

  // Group by category
  const grouped = links.reduce<Record<string, typeof links>>((acc, link) => {
    if (!link.active) return acc;
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {});

  const categories = Object.entries(grouped)
    .filter(([, items]) => items.length > 0)
    .sort((a, b) => {
      const maxA = Math.max(...a[1].map((l) => l.priority));
      const maxB = Math.max(...b[1].map((l) => l.priority));
      return maxB - maxA;
    });

  if (categories.length === 0) return null;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {categories.slice(0, 3).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <h4 className="font-semibold text-primary">{category}</h4>
          <div className="flex flex-wrap gap-2 text-sm">
            {items
              .sort((a, b) => b.priority - a.priority)
              .map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={link.openInNewTab ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  title={link.description}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 rounded-lg text-muted-foreground hover:text-primary hover:bg-card/80 transition-all duration-300 hover:scale-105 border border-border/50"
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  {link.label}
                </a>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Static footer links fallback (always shown if Firebase links empty) ─────
const STATIC_FOOTER_LINKS = [
  {
    category: "Enterprise Solutions",
    links: [
      { href: "https://hotech.systems",                  label: "hotech.systems" },
      { href: "https://en.hotech.systems",               label: "HoTech EN" },
      { href: "https://technostationery.com",            label: "technostationery.com" },
      { href: "https://dashboard.technostationery.com",  label: "Dashboard · AI · Monitoring" },
      { href: "https://etl.techno-dz.com",               label: "ETL Platform" },
    ],
  },
  {
    category: "Magento & Adobe Commerce",
    links: [
      { href: "https://mab-modules.github.io",   label: "mab-modules.github.io" },
      { href: "https://mounirtms.github.io",     label: "mounirtms.github.io" },
      { href: "https://github.com/mab-modules",  label: "GitHub: mab-modules" },
      { href: "https://github.com/mounirtms",    label: "GitHub: mounirtms" },
    ],
  },
  {
    category: "Web Applications",
    links: [
      { href: "https://jskit-app.web.app",                  label: "JSKit App" },
      { href: "https://www.nooralmaarifa.com",               label: "Noor Al Maarifa" },
      { href: "https://it-collaborator-techno.web.app",      label: "IT Collaborator" },
    ],
  },
];

function StaticFooterLinks() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {STATIC_FOOTER_LINKS.map(({ category, links }) => (
        <div key={category} className="space-y-3">
          <h4 className="font-semibold text-primary">{category}</h4>
          <div className="flex flex-wrap gap-2 text-sm">
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-card/50 rounded-lg text-muted-foreground hover:text-primary hover:bg-card/80 transition-all duration-300 hover:scale-105 border border-border/50"
              >
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                </svg>
                {label}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const Index = () => {
  const { settings } = useSettings();
  const { links } = useLinks();

  const hasFirebaseLinks = links.filter((l) => l.active).length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main>
        {/* ── Above fold: Hero loads eagerly ───────────────────────────────── */}
        <SectionErrorBoundary name="Hero">
          <Hero />
        </SectionErrorBoundary>

        {/* ── Below fold: each section is a separate lazy async chunk ─────── */}
        <SectionErrorBoundary name="Experience">
          <Suspense fallback={<SectionSkeleton />}>
            <Experience />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary name="Skills">
          <Suspense fallback={<SectionSkeleton />}>
            <Skills />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary name="Projects">
          <Suspense fallback={<SectionSkeleton />}>
            <Projects />
          </Suspense>
        </SectionErrorBoundary>

        <SectionErrorBoundary name="Upcoming">
          <Suspense fallback={<SectionSkeleton />}>
            <Upcoming />
          </Suspense>
        </SectionErrorBoundary>

        {settings.features.showTestimonials && (
          <SectionErrorBoundary name="Testimonials">
            <Suspense fallback={<SectionSkeleton />}>
              <Testimonials />
            </Suspense>
          </SectionErrorBoundary>
        )}

        {settings.features.showContactForm && (
          <SectionErrorBoundary name="Contact">
            <Suspense fallback={<SectionSkeleton />}>
              <Contact />
            </Suspense>
          </SectionErrorBoundary>
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        id="contact"
        className="py-20 px-6 bg-gradient-to-br from-card/30 via-card/50 to-card/30 backdrop-blur-sm border-t border-border/50"
      >
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Main contact section — shown only when contact form is disabled */}
          {!settings.features.showContactForm && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Let's Build Something Great Together
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Ready to transform your ideas into reality? I specialize in creating scalable,
                  high-performance solutions that drive business growth and user engagement.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
                <a
                  href={`mailto:${settings.personalInfo.email}`}
                  className="group inline-flex items-center gap-3 px-10 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all duration-300 font-semibold shadow-glow hover:shadow-large hover:scale-105 text-lg"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Get In Touch
                </a>

                <div className="flex flex-wrap gap-8 justify-center">
                  {settings.social.linkedin && (
                    <a href={settings.social.linkedin} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  {settings.social.github && (
                    <a href={settings.social.github} target="_blank" rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                      </svg>
                      GitHub
                    </a>
                  )}
                  {settings.personalInfo.phone && (
                    <a href={`tel:${settings.personalInfo.phone.replace(/\s/g, "")}`}
                      className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {settings.personalInfo.phone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Featured Work Links */}
          <div className="grid gap-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Featured Work & Collaborations</h3>
              <p className="text-muted-foreground mb-6">
                Explore some of my recent projects and professional collaborations
              </p>
            </div>
            {hasFirebaseLinks ? <FooterLinks /> : <StaticFooterLinks />}
          </div>

          {/* Signature & copyright */}
          <div className="pt-8 border-t border-border/50 space-y-4">
            <div className="flex justify-center">
              <Signature size="lg" className="text-primary" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} {settings.personalInfo.name}. Crafted with passion using modern web technologies.
              </p>
              <p className="text-xs text-muted-foreground/60">
                Built with React, TypeScript & Tailwind CSS
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
