import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackButtonClick } from '@/utils/analytics';

const navItems = [
  { label: 'Home', href: '#hero' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);

    // Track navigation clicks
    trackButtonClick('navigation_click', {
      section: sectionId.replace('#', ''),
      location: 'main_navigation',
    });
  };

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
    trackButtonClick('mobile_menu_toggle', {
      action: isOpen ? 'close' : 'open',
      location: 'main_navigation',
    });
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => {
                scrollToSection('#hero');
                trackButtonClick('logo_click', { location: 'main_navigation' });
              }}
              className="flex items-center space-x-2 text-xl font-bold text-primary transition-colors hover:text-primary/80"
            >
              <img src="/mounir-icon.svg" alt="Mounir" className="h-8 w-8" />
              <span>Mounir</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex rtl:space-x-reverse">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(item.href)}
                className="group relative font-medium text-muted-foreground transition-colors duration-300 hover:text-primary"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
            <ThemeToggle />
            <Button
              size="sm"
              className="shadow-glow transition-all duration-300 hover:shadow-medium"
              onClick={() => {
                scrollToSection('#contact');
                trackButtonClick('lets_talk_button', {
                  location: 'main_navigation',
                  button_type: 'cta',
                });
              }}
            >
              Let's Talk
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-500 ease-in-out md:hidden',
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="space-y-2 py-4">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(item.href)}
                className="block w-full rounded-lg px-4 py-2 text-left text-muted-foreground transition-colors duration-200 hover:bg-primary/5 hover:text-primary"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2">
              <Button
                size="sm"
                className="w-full shadow-glow transition-all duration-300 hover:shadow-medium"
                onClick={() => {
                  scrollToSection('#contact');
                  trackButtonClick('lets_talk_button_mobile', {
                    location: 'mobile_navigation',
                    button_type: 'cta',
                  });
                }}
              >
                Let's Talk
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
