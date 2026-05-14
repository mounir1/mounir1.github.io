import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Logo } from "@/components/ui/logo";
import { useSettings } from "@/hooks/useSettings";

// ─── Section IDs tracked for active highlighting ──────────────────────────────
const SECTION_IDS = ["home", "experience", "skills", "projects", "upcoming", "contact"];

const NAV_ITEMS = [
  { label: "Home",       href: "#home"       },
  { label: "Experience", href: "#experience" },
  { label: "Skills",     href: "#skills"     },
  { label: "Projects",   href: "#projects"   },
  { label: "Upcoming",   href: "#upcoming"   },
  { label: "Contact",    href: "#contact"    },
];

export const Navigation = () => {
  const { settings } = useSettings();
  const firstName = settings.personalInfo.name.split(" ")[0] ?? "Mounir";
  const navSubtitle = settings.personalInfo.title.split(" ").slice(0, 3).join(" ") || "Full-Stack Developer";

  const [isOpen,   setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── Scroll shadow ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Active section via IntersectionObserver ──────────────────────────────
  useEffect(() => {
    // Track best-intersecting section
    const ratios: Record<string, number> = {};

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios[entry.target.id] = entry.intersectionRatio;
        });
        // Pick the section with the highest visible ratio
        let best = "";
        let bestRatio = 0;
        SECTION_IDS.forEach((id) => {
          if ((ratios[id] ?? 0) > bestRatio) {
            bestRatio = ratios[id] ?? 0;
            best = id;
          }
        });
        if (best) setActiveId(best);
      },
      {
        // Middle 20–40% of viewport → most prominent section
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      }
    );

    const io = observerRef.current;
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      // Optimistically set active — observer will confirm shortly
      setActiveId(href.slice(1));
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border/60 shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => scrollToSection("#home")}
          >
            <Logo size="md" className="text-primary" />
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {firstName}
              </div>
              <div className="text-xs text-muted-foreground -mt-1">{navSubtitle}</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeId === item.href.slice(1);
              return (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {item.label}
                  {/* Animated underline pill */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-primary transition-all duration-300 ${
                      isActive ? "w-4/5 opacity-100" : "w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-50"
                    }`}
                  />
                </button>
              );
            })}

            <div className="ml-2 flex items-center gap-2">
              <ThemeToggle />
              <Button
                size="sm"
                className="shadow-glow hover:shadow-large transition-all duration-300 rounded-lg"
                onClick={() => scrollToSection("#contact")}
              >
                Let's Talk
              </Button>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="w-9 h-9 p-0"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-1 pt-4">
              {NAV_ITEMS.map((item) => {
                const isActive = activeId === item.href.slice(1);
                return (
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.href)}
                    className={`text-left font-medium py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                    }`}
                  >
                    {/* Active dot indicator */}
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-200 ${
                        isActive ? "bg-primary scale-100" : "bg-transparent scale-0"
                      }`}
                    />
                    {item.label}
                  </button>
                );
              })}
              <Button
                size="sm"
                className="self-start mt-3 shadow-glow"
                onClick={() => scrollToSection("#contact")}
              >
                Let's Talk
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
