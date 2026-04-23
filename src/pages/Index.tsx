import React from 'react';
import { Navigation }   from '@/components/ui/navigation';
import { Hero }         from '@/components/sections/hero';
import { Skills }       from '@/components/sections/skills';
import { Projects }     from '@/components/sections/projects';
import { Experience }   from '@/components/sections/experience';
import { Testimonials } from '@/components/sections/testimonials';
import { ContactForm }  from '@/components/sections/contact';
import { ExternalLink, Github, Linkedin, Mail, Phone } from 'lucide-react';

/* ── Featured projects / clients ──────────────────────────── */
const featuredWork = [
  {
    category: 'Enterprise Solutions',
    items: [
      { label: 'hotech.systems',       href: 'https://hotech.systems',               logo: '/hotech-logo.svg' },
      { label: 'technostationery.com', href: 'https://technostationery.com',         logo: '/technostationery-logo.svg' },
      { label: 'ETL Platform',         href: 'https://etl.techno-dz.com',            logo: '/etl-platform-logo.svg' },
    ],
  },
  {
    category: 'Web Applications',
    items: [
      { label: 'JSKit App',       href: 'https://jskit-app.web.app',              logo: '/jskit-logo.svg' },
      { label: 'Noor Al Maarifa', href: 'https://www.nooralmaarifa.com',          logo: '/noor-almaarifa-logo.svg' },
      { label: 'IT Collaborator', href: 'https://it-collaborator-techno.web.app', logo: '/it-collaborator-logo.svg' },
    ],
  },
];

const socialLinks = [
  { icon: Github,   href: 'https://github.com/mounir1',         label: 'GitHub',   color: 'hover:text-foreground hover:bg-foreground/10' },
  { icon: Linkedin, href: 'https://linkedin.com/in/mounir1badi', label: 'LinkedIn', color: 'hover:text-blue-500 hover:bg-blue-500/10' },
  { icon: Mail,     href: 'mailto:mounir.webdev@gmail.com',      label: 'Email',    color: 'hover:text-red-500 hover:bg-red-500/10' },
  { icon: Phone,    href: 'tel:+213674094855',                   label: 'Phone',    color: 'hover:text-green-500 hover:bg-green-500/10' },
];

const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navigation />

    <main id="main-content">
      <Hero />
      <Skills />
      <Projects />
      <Experience />
      <Testimonials />
      <ContactForm />
    </main>

    {/* ── Footer ─────────────────────────────────────────────── */}
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-14 space-y-12">

        {/* Featured work links */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold">Featured Work & Collaborations</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Selected projects and professional partnerships
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredWork.map(({ category, items }) => (
              <div key={category} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">{category}</p>
                <div className="space-y-1.5">
                  {items.map(({ label, href, logo }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-card hover:text-foreground hover:shadow-sm"
                    >
                      <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-lg bg-muted/50 p-1 flex items-center justify-center">
                        <img
                          src={logo}
                          alt={label}
                          className="h-full w-full object-contain"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <span className="flex-1 font-medium">{label}</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-40 group-hover:opacity-70 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/40" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <button
            onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-sm font-bold text-white shadow-md group-hover:shadow-lg transition-shadow">
              M
            </div>
            <span className="font-bold text-foreground group-hover:text-primary transition-colors">
              Mounir Abderrahmani
            </span>
          </button>

          {/* Copyright */}
          <p className="order-last text-center text-xs text-muted-foreground sm:order-none">
            © {new Date().getFullYear()} Mounir Abderrahmani · Built with ⚛️ React, TypeScript &amp; Firebase
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-1">
            {socialLinks.map(({ icon: Icon, href, label, color }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={label}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:scale-110 ${color}`}
              >
                <Icon size={17} />
              </a>
            ))}
            {/* Discrete admin link */}
            <a
              href="/admin"
              className="ml-1 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground/50 transition-all hover:bg-muted/40 hover:text-muted-foreground"
              title="Admin Dashboard"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
);

export default Index;
