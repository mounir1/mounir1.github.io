import React from 'react';
import { Navigation }   from '@/components/ui/navigation';
import { Hero }         from '@/components/sections/hero';
import { Skills }       from '@/components/sections/skills';
import { Projects }     from '@/components/sections/projects';
import { Experience }   from '@/components/sections/experience';
import { Testimonials } from '@/components/sections/testimonials';
import { ContactForm }  from '@/components/sections/contact';

const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Navigation />

    <main>
      <Hero />
      <Skills />
      <Projects />
      <Experience />
      <Testimonials />
      <ContactForm />
    </main>

    <footer className="border-t border-border/40 bg-card/30 py-10 px-6 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 text-sm text-muted-foreground sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-xs font-bold text-white">
              M
            </div>
            Mounir Abderrahmani
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-5">
            {[
              { label: 'LinkedIn', href: 'https://linkedin.com/in/mounir1badi' },
              { label: 'GitHub',   href: 'https://github.com/mounir1' },
              { label: 'Blog',     href: '/blog' },
              { label: 'Admin',    href: '/admin' },
            ].map(l => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="transition-colors hover:text-primary"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs">© 2025 Mounir Abderrahmani · React & Firebase</p>
        </div>
      </div>
    </footer>
  </div>
);

export default Index;
