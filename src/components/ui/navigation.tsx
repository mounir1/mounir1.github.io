import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { trackButtonClick } from '@/utils/analytics';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Home',       href: '#hero'       },
  { label: 'Skills',     href: '#skills'     },
  { label: 'Projects',   href: '#projects'   },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact',    href: '#contact'    },
];

export const Navigation = () => {
  const [isOpen,   setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
    trackButtonClick('navigation_click', { section: href.replace('#', ''), location: 'navbar' });
  };

  return (
    <nav
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border/40 bg-background/85 shadow-sm backdrop-blur-xl'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => scrollTo('#hero')}
            className="flex items-center gap-2 font-bold text-primary transition-opacity hover:opacity-80"
            aria-label="Go to top"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-sm font-bold text-white shadow-md">
              M
            </div>
            <span className="hidden text-lg sm:block">Mounir</span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map(item => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.href)}
                className="group relative px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
                <span className="absolute bottom-0.5 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-primary transition-all duration-300 group-hover:w-4/5" />
              </button>
            ))}
          </div>

          {/* Right: theme toggle + CTA + hamburger */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              size="sm"
              className="hidden rounded-full px-5 text-sm font-semibold shadow-md transition-all hover:scale-105 sm:inline-flex"
              onClick={() => scrollTo('#contact')}
            >
              Let's Talk
            </Button>
            <button
              onClick={() => {
                setIsOpen(o => !o);
                trackButtonClick('hamburger_toggle', { action: isOpen ? 'close' : 'open' });
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="container mx-auto space-y-1 px-4 py-4">
            {NAV_ITEMS.map(item => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.href)}
                className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
            <Button
              className="mt-3 w-full rounded-full text-sm font-semibold"
              onClick={() => scrollTo('#contact')}
            >
              Let's Talk
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
