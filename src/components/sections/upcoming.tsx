import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUpcoming } from "@/hooks/useUpcoming";
import { Github, Clock, Rocket, Lightbulb, Code2, ExternalLink } from "lucide-react";
import { useEffect, useRef } from "react";

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  "in-development": {
    label: "In Development",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    dot: "bg-blue-500",
    bar: "bg-gradient-to-r from-blue-500 to-cyan-400",
    icon: Code2,
  },
  "planned": {
    label: "Planned",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    dot: "bg-purple-500",
    bar: "bg-gradient-to-r from-purple-500 to-violet-400",
    icon: Clock,
  },
  "beta": {
    label: "Beta",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    dot: "bg-orange-500",
    bar: "bg-gradient-to-r from-orange-500 to-amber-400",
    icon: Rocket,
  },
  "soon": {
    label: "Coming Soon",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    dot: "bg-green-500",
    bar: "bg-gradient-to-r from-green-500 to-emerald-400",
    icon: Rocket,
  },
  "idea": {
    label: "Idea / R&D",
    color: "bg-muted/80 text-muted-foreground border-border",
    dot: "bg-muted-foreground",
    bar: "bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/10",
    icon: Lightbulb,
  },
} as const;

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function UpcomingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-0 shadow-medium">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-4/5 mt-1" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-5 w-16 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-8 w-28 rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Scroll-reveal hook (lightweight IntersectionObserver, no library) ────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respect reduced-motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("revealed");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          io.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

// ─── Single card ──────────────────────────────────────────────────────────────
function UpcomingCard({
  project,
  index,
}: {
  project: ReturnType<typeof useUpcoming>["upcoming"][number];
  index: number;
}) {
  const ref = useReveal();
  const cfg = STATUS_CONFIG[project.status] ?? STATUS_CONFIG["idea"];
  const StatusIcon = cfg.icon;

  return (
    <div
      ref={ref}
      className="reveal"
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <Card className="group h-full border-0 shadow-medium hover:shadow-large transition-all duration-300 hover:scale-[1.015] bg-card/60 backdrop-blur-sm overflow-hidden">
        {/* Top colour bar */}
        <div className={`h-1 w-full ${cfg.bar}`} />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base font-semibold leading-snug group-hover:text-primary transition-colors duration-300 flex-1">
              {project.title}
            </CardTitle>
            <Badge
              variant="outline"
              className={`shrink-0 text-xs flex items-center gap-1.5 ${cfg.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${project.status === "in-development" ? "animate-pulse" : ""}`} />
              {cfg.label}
            </Badge>
          </div>

          {project.category && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <StatusIcon className="h-3 w-3" />
              <span>{project.category}</span>
              {project.targetDate && (
                <>
                  <span className="text-border">·</span>
                  <Clock className="h-3 w-3" />
                  <span>{project.targetDate}</span>
                </>
              )}
            </div>
          )}

          {project.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 pt-1">
              {project.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tech stack badges */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.slice(0, 6).map((tech) => (
                <Badge
                  key={tech}
                  variant="outline"
                  className="text-xs py-0.5 hover:bg-primary/10 transition-colors"
                >
                  {tech}
                </Badge>
              ))}
              {project.technologies.length > 6 && (
                <Badge variant="outline" className="text-xs py-0.5 text-muted-foreground">
                  +{project.technologies.length - 6}
                </Badge>
              )}
            </div>
          )}

          {/* Footer: duration + GitHub */}
          <div className="flex items-center justify-between pt-1">
            {project.estimatedDuration && (
              <span className="text-xs text-muted-foreground">
                Est. {project.estimatedDuration}
              </span>
            )}
            {project.githubUrl && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs gap-1.5 hover:text-primary"
                asChild
              >
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-3.5 w-3.5" />
                  Follow progress
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function Upcoming() {
  const { upcoming, loading } = useUpcoming();
  const headerRef = useReveal();

  const visible = upcoming
    .filter((p) => p.publicVisible !== false)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  if (!loading && visible.length === 0) return null;

  const inDev   = visible.filter((p) => p.status === "in-development").length;
  const planned = visible.filter((p) => p.status === "planned" || p.status === "soon").length;
  const ideas   = visible.filter((p) => p.status === "idea").length;

  return (
    <section
      id="upcoming"
      className="py-24 px-6 bg-gradient-to-br from-background via-primary/[0.03] to-background"
    >
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <div ref={headerRef} className="reveal text-center space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
            What's Next
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Upcoming Projects
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A transparent look at what I'm currently building, planning, and exploring next.
          </p>

          {/* Status summary pills */}
          {!loading && (
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              {inDev > 0 && (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  {inDev} In Development
                </span>
              )}
              {planned > 0 && (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  {planned} Planned
                </span>
              )}
              {ideas > 0 && (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm bg-muted/80 text-muted-foreground border border-border">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                  {ideas} Ideas / R&D
                </span>
              )}
            </div>
          )}
        </div>

        {/* Cards */}
        {loading ? (
          <UpcomingSkeleton />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {visible.map((project, i) => (
              <UpcomingCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}

        {/* Footer note */}
        {!loading && (
          <p className="text-center text-xs text-muted-foreground/60 pt-2">
            Roadmap updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} · Subject to change based on priorities
          </p>
        )}
      </div>
    </section>
  );
}
