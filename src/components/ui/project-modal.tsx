/**
 * Project Detail Modal / Case Study overlay
 * Full case-study layout: hero, metrics, tech stack, achievements, challenges, team
 */
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  X, ExternalLink, Github, Calendar, Users, Target,
  CheckCircle, AlertCircle, Lightbulb, BarChart3, Globe,
  Clock, Building2, Star,
} from "lucide-react";
import type { ProjectSchema } from "@/lib/database-schema";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-card border border-border/60 rounded-xl p-4 text-center">
      <div className="flex justify-center mb-2 text-primary">{icon}</div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Tech Badge ───────────────────────────────────────────────────────────────

const TECH_COLORS: Record<string, string> = {
  React: "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Node.js": "bg-green-100 text-green-700 border-green-200",
  TypeScript: "bg-blue-100 text-blue-700 border-blue-200",
  JavaScript: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Python: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Firebase: "bg-orange-100 text-orange-700 border-orange-200",
  PostgreSQL: "bg-blue-100 text-blue-800 border-blue-200",
  MongoDB: "bg-green-100 text-green-800 border-green-200",
  Docker: "bg-sky-100 text-sky-700 border-sky-200",
  "Tailwind CSS": "bg-teal-100 text-teal-700 border-teal-200",
  Redux: "bg-purple-100 text-purple-700 border-purple-200",
  GraphQL: "bg-pink-100 text-pink-700 border-pink-200",
};

function TechBadge({ name }: { name: string }) {
  const cls = TECH_COLORS[name] ?? "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", cls)}>
      {name}
    </Badge>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
  active: "bg-violet-100 text-violet-700 border-violet-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  archived: "bg-gray-100 text-gray-600 border-gray-200",
  concept: "bg-pink-100 text-pink-700 border-pink-200",
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface ProjectModalProps {
  project: ProjectSchema | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { trackProject } = useAnalytics();

  useEffect(() => {
    if (!project) return;
    trackProject(project.id, project.title);
    // Lock body scroll
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [project]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!project) return null;

  const statusStyle = STATUS_STYLES[project.status] ?? "bg-muted text-muted-foreground";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-4xl border border-border/60 overflow-hidden my-auto">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="relative h-52 md:h-72 bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
          {project.image && (
            <img
              src={project.image}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />

          {/* Close button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Hero content */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end gap-4">
            {project.logo && (
              <img src={project.logo} alt="" className="w-14 h-14 rounded-xl object-contain bg-white/10 backdrop-blur-sm p-2 border border-white/20" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline" className={cn("text-xs", statusStyle)}>
                  {project.status}
                </Badge>
                {project.featured && (
                  <Badge className="text-xs bg-amber-500/20 text-amber-600 border-amber-300">
                    <Star className="w-3 h-3 mr-1" />Featured
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">{project.category}</Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{project.title}</h2>
              {project.role && (
                <p className="text-sm text-muted-foreground mt-1">
                  Role: <span className="text-primary font-medium">{project.role}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────── */}
        <div className="p-6 md:p-8 space-y-8">

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {project.liveUrl && (
              <Button asChild>
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />Live Demo
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button variant="outline" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />Source Code
                </a>
              </Button>
            )}
            {project.demoUrl && (
              <Button variant="outline" asChild>
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />Demo
                </a>
              </Button>
            )}
            {project.caseStudyUrl && (
              <Button variant="outline" asChild>
                <a href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />Case Study
                </a>
              </Button>
            )}
          </div>

          {/* Description */}
          <div>
            <p className="text-muted-foreground leading-relaxed">
              {project.longDescription || project.description}
            </p>
          </div>

          <Separator />

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {project.teamSize && (
              <MetricCard icon={<Users className="w-5 h-5" />} label="Team Size" value={`${project.teamSize} people`} />
            )}
            {project.duration && (
              <MetricCard icon={<Clock className="w-5 h-5" />} label="Duration" value={project.duration} />
            )}
            {project.startDate && (
              <MetricCard icon={<Calendar className="w-5 h-5" />} label="Started" value={project.startDate} />
            )}
            {project.clientInfo?.industry && (
              <MetricCard icon={<Building2 className="w-5 h-5" />} label="Industry" value={project.clientInfo.industry} />
            )}
          </div>

          {/* Performance metrics */}
          {project.metrics && Object.values(project.metrics).some(Boolean) && (
            <>
              <Separator />
              <Section title="Impact & Metrics" icon={<BarChart3 className="w-4 h-4" />}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {project.metrics.usersReached && (
                    <div className="bg-card border border-border/60 rounded-lg p-4">
                      <div className="text-2xl font-bold text-primary">
                        {project.metrics.usersReached.toLocaleString()}+
                      </div>
                      <div className="text-sm text-muted-foreground">Users Reached</div>
                    </div>
                  )}
                  {project.metrics.performanceImprovement && (
                    <div className="bg-card border border-border/60 rounded-lg p-4">
                      <div className="text-2xl font-bold text-emerald-600">{project.metrics.performanceImprovement}</div>
                      <div className="text-sm text-muted-foreground">Performance Improvement</div>
                    </div>
                  )}
                  {project.metrics.costSavings && (
                    <div className="bg-card border border-border/60 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{project.metrics.costSavings}</div>
                      <div className="text-sm text-muted-foreground">Cost Savings</div>
                    </div>
                  )}
                  {project.metrics.revenueImpact && (
                    <div className="bg-card border border-border/60 rounded-lg p-4">
                      <div className="text-2xl font-bold text-violet-600">{project.metrics.revenueImpact}</div>
                      <div className="text-sm text-muted-foreground">Revenue Impact</div>
                    </div>
                  )}
                  {project.metrics.uptime && (
                    <div className="bg-card border border-border/60 rounded-lg p-4">
                      <div className="text-2xl font-bold text-teal-600">{project.metrics.uptime}</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                      <Progress value={parseFloat(project.metrics.uptime)} className="h-1.5 mt-2" />
                    </div>
                  )}
                  {project.metrics.customMetrics &&
                    Object.entries(project.metrics.customMetrics).map(([k, v]) => (
                      <div key={k} className="bg-card border border-border/60 rounded-lg p-4">
                        <div className="text-2xl font-bold text-primary">{String(v)}</div>
                        <div className="text-sm text-muted-foreground capitalize">{k.replace(/_/g, " ")}</div>
                      </div>
                    ))}
                </div>
              </Section>
            </>
          )}

          <Separator />

          {/* Two-column layout: achievements + challenges/solutions */}
          <div className="grid md:grid-cols-2 gap-8">
            {project.achievements?.length > 0 && (
              <Section title="Key Achievements" icon={<Target className="w-4 h-4" />}>
                <ul className="space-y-2">
                  {project.achievements.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {a}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {project.challenges?.length > 0 && (
              <Section title="Challenges & Solutions" icon={<AlertCircle className="w-4 h-4" />}>
                <ul className="space-y-4">
                  {project.challenges.map((c, i) => (
                    <li key={i} className="space-y-1">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        {c}
                      </div>
                      {project.solutions?.[i] && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground ml-6">
                          <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          {project.solutions[i]}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          <Separator />

          {/* Tech stack */}
          {project.technologies?.length > 0 && (
            <Section title="Technology Stack" icon={<Globe className="w-4 h-4" />}>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((t) => <TechBadge key={t} name={t} />)}
              </div>
            </Section>
          )}

          {/* Tags */}
          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>
              ))}
            </div>
          )}

          {/* Client info */}
          {project.clientInfo?.isPublic && project.clientInfo.name && (
            <>
              <Separator />
              <Section title="Client" icon={<Building2 className="w-4 h-4" />}>
                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                  <div className="font-medium">{project.clientInfo.name}</div>
                  {project.clientInfo.industry && (
                    <div className="text-sm text-muted-foreground">Industry: {project.clientInfo.industry}</div>
                  )}
                  {project.clientInfo.location && (
                    <div className="text-sm text-muted-foreground">Location: {project.clientInfo.location}</div>
                  )}
                  {project.clientInfo.website && (
                    <a href={project.clientInfo.website} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />{project.clientInfo.website}
                    </a>
                  )}
                  {project.clientInfo.testimonial && (
                    <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3 mt-2">
                      "{project.clientInfo.testimonial}"
                    </p>
                  )}
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
