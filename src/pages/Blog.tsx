/**
 * Blog / Case Studies page
 * – Lists all projects with full case-study detail via modal
 * – Filter by category, status, technology
 * – Search by title / description
 * – URL params: ?category=&search=&tech=
 */
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { ProjectModal } from "@/components/ui/project-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Search, Filter, ExternalLink, Github, Star, Clock,
  Users, ChevronRight, Loader2, X,
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSeo } from "@/lib/seo";
import type { ProjectSchema } from "@/lib/database-schema";
import { cn } from "@/lib/utils";

// ─── Category colours ─────────────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  "Web Application": "bg-blue-100 text-blue-700 border-blue-200",
  "Enterprise Integration": "bg-purple-100 text-purple-700 border-purple-200",
  "E-commerce": "bg-orange-100 text-orange-700 border-orange-200",
  "Commerce Infrastructure": "bg-amber-100 text-amber-700 border-amber-200",
  "Mobile Application": "bg-green-100 text-green-700 border-green-200",
  "Machine Learning": "bg-pink-100 text-pink-700 border-pink-200",
  "API Development": "bg-teal-100 text-teal-700 border-teal-200",
  "DevOps & Infrastructure": "bg-slate-100 text-slate-700 border-slate-200",
  "UI/UX Design": "bg-rose-100 text-rose-700 border-rose-200",
  "Consulting": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Other": "bg-gray-100 text-gray-600 border-gray-200",
};

// ─── Project card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onClick }: { project: ProjectSchema; onClick: () => void }) {
  return (
    <Card
      className="group cursor-pointer border border-border/60 hover:border-primary/40 hover:shadow-large transition-all duration-300 overflow-hidden"
      onClick={onClick}
    >
      {/* Hero image */}
      <div className="relative h-40 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
        {project.image && (
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        {project.featured && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-500/20 text-amber-600 border-amber-300 text-xs">
              <Star className="w-3 h-3 mr-1" />Featured
            </Badge>
          </div>
        )}
        {project.logo && (
          <img
            src={project.logo}
            alt=""
            className="absolute bottom-2 left-3 w-8 h-8 object-contain rounded bg-white/10 backdrop-blur-sm p-1"
          />
        )}
      </div>

      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 min-w-0">
            <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
              {project.title}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className={cn("text-[10px] py-0", CAT_COLORS[project.category] ?? "")}>
                {project.category}
              </Badge>
              <Badge variant="outline" className="text-[10px] py-0 capitalize">{project.status}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

        {/* Tech stack */}
        {project.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.technologies.slice(0, 4).map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px] py-0">{t}</Badge>
            ))}
            {project.technologies.length > 4 && (
              <Badge variant="secondary" className="text-[10px] py-0">+{project.technologies.length - 4}</Badge>
            )}
          </div>
        )}

        {/* Quick stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {project.teamSize && (
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{project.teamSize}</span>
          )}
          {project.duration && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{project.duration}</span>
          )}
        </div>

        {/* Links */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs flex items-center gap-1 text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />Live
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <Github className="w-3 h-3" />Code
              </a>
            )}
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7 px-2 gap-1 group-hover:text-primary">
            Case Study <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Blog() {
  useSeo({
    title: "Case Studies & Projects",
    description: "Explore 150+ projects spanning enterprise integrations, e-commerce, React apps, and API development.",
    keywords: ["portfolio", "case studies", "React projects", "Node.js", "full-stack developer"],
  });

  const { projects, loading } = useProjects();
  const { trackPage, trackProject } = useAnalytics();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProject, setSelectedProject] = useState<ProjectSchema | null>(null);

  const search = searchParams.get("search") ?? "";
  const catFilter = searchParams.get("category") ?? "";
  const techFilter = searchParams.get("tech") ?? "";
  const statusFilter = searchParams.get("status") ?? "";

  useEffect(() => { trackPage("/blog"); }, []);

  // Derived filter options
  const categories = useMemo(
    () => [...new Set(projects.map((p) => p.category))].sort(),
    [projects]
  );
  const allTechs = useMemo(
    () => [...new Set(projects.flatMap((p) => p.technologies ?? []))].sort(),
    [projects]
  );

  // Filtered list
  const filtered = useMemo(() => {
    let list = projects.filter((p) => !p.disabled);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s) ||
          p.technologies?.some((t) => t.toLowerCase().includes(s))
      );
    }
    if (catFilter) list = list.filter((p) => p.category === catFilter);
    if (techFilter) list = list.filter((p) => p.technologies?.includes(techFilter));
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    return list.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }, [projects, search, catFilter, techFilter, statusFilter]);

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
  }

  function clearAll() {
    setSearchParams(new URLSearchParams());
  }

  const hasFilters = search || catFilter || techFilter || statusFilter;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="text-primary border-primary/30">Portfolio</Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Projects & Case Studies
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            150+ projects across web, mobile, enterprise, and e-commerce. Click any card for the full case study.
          </p>
        </div>

        {/* Search & filters */}
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setParam("search", e.target.value)}
                placeholder="Search by title, description, or technology…"
                className="pl-10"
              />
            </div>
            {hasFilters && (
              <Button variant="outline" onClick={clearAll} className="gap-1 shrink-0">
                <X className="w-3.5 h-3.5" />Clear
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              Category:
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setParam("category", catFilter === cat ? "" : cat)}
                className={cn(
                  "text-xs px-3 py-1 rounded-full border transition-all",
                  catFilter === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary/50 hover:text-primary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </div>
            {["completed", "in-progress", "active", "maintenance"].map((s) => (
              <button
                key={s}
                onClick={() => setParam("status", statusFilter === s ? "" : s)}
                className={cn(
                  "text-xs px-3 py-1 rounded-full border capitalize transition-all",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary/50 hover:text-primary"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${filtered.length} project${filtered.length !== 1 ? "s" : ""} found`}
          {hasFilters && " (filtered)"}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-3" />Loading projects…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg">No projects match your filters.</p>
            <Button variant="link" onClick={clearAll}>Clear all filters</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => {
                  setSelectedProject(project);
                  trackProject(project.id, project.title);
                }}
              />
            ))}
          </div>
        )}
      </main>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
}
