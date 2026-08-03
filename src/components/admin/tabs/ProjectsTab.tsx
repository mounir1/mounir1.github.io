import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useProjects, PROJECTS_COLLECTION, type ProjectInput, DEFAULT_PROJECT } from "@/hooks/useProjects";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { BrandAssetPicker } from "@/components/admin/BrandAssetPicker";
import {
  Database, Plus, Edit, Trash2, Eye, EyeOff, Star,
  Globe, Github, Search, Loader2, ChevronDown, Image as ImageIcon,
  Palette, ExternalLink, Download,
} from "lucide-react";

function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const CATEGORIES = [
  "Web Application", "Mobile Application", "Enterprise Integration",
  "E-commerce", "Machine Learning", "API Development",
  "ERP Solutions", "Retail Solutions", "Hospitality Solutions",
  "Education Technology", "ITSM Solutions", "Project Management",
  "DevOps & Infrastructure", "Other",
];

const STATUSES = ["completed", "in-progress", "maintenance", "active", "archived"];

// ─── ProjectForm ────────────────────────────────────────────────────────────
function ProjectForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: Partial<ProjectInput>;
  onSubmit: (data: ProjectInput) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<ProjectInput>({
    ...DEFAULT_PROJECT,
    title: "",
    description: "",
    category: "Web Application",
    ...initial,
  });
  const [assetsOpen, setAssetsOpen] = useState(false);

  function set(key: keyof ProjectInput, value: any) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function setNested(section: "clientInfo" | "metrics", key: string, value: any) {
    setForm((p) => ({ ...p, [section]: { ...(p[section] as any), [key]: value } }));
  }

  function handleBrandAsset(logoUrl: string, iconUrl: string, colors?: string[]) {
    if (logoUrl) set("logo", logoUrl);
    if (iconUrl && !logoUrl) set("logo", iconUrl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[78vh] overflow-y-auto pr-2">

      {/* ── Basic Info ── */}
      <section className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Basic Info</h4>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="Amazing Project" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Short Description *</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} required rows={2} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Long Description</Label>
            <Textarea value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Technologies (comma-separated)</Label>
            <Input
              value={form.technologies.join(", ")}
              onChange={(e) => set("technologies", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="React, Node.js, TypeScript..."
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Tags (comma-separated)</Label>
            <Input
              value={form.tags.join(", ")}
              onChange={(e) => set("tags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="react, frontend, responsive..."
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Media & Assets ── */}
      <section className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5" />
          Media & Assets
        </h4>

        {/* Project image */}
        <ImageUpload
          label="Project Cover Image"
          folder="projects"
          currentImageUrl={form.image}
          showUrlTab
          onUploadComplete={(url) => set("image", url)}
          onUrlChange={(url) => set("image", url)}
          onRemove={() => set("image", "")}
        />

        {/* Logo + Brand picker collapsible */}
        <Collapsible open={assetsOpen} onOpenChange={setAssetsOpen}>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="w-full justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                Logo & Brand Assets
              </span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${assetsOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-3">
            {/* Logo URL or upload */}
            <div className="space-y-2">
              <Label className="text-sm">Logo / Company Icon</Label>
              <div className="flex gap-2">
                <Input
                  value={form.logo}
                  onChange={(e) => set("logo", e.target.value)}
                  placeholder="/company-logo.svg  or  https://..."
                  className="flex-1 text-sm"
                />
                {form.logo && (
                  <div className="shrink-0 w-10 h-10 rounded border bg-white flex items-center justify-center overflow-hidden">
                    <img src={form.logo} alt="logo" className="w-8 h-8 object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Use a local path like <code className="text-xs bg-muted px-1 rounded">/hotech-logo.svg</code> for files in /public, or a full URL.
              </p>
            </div>

            {/* Logo file upload */}
            <ImageUpload
              label="Upload Logo File"
              folder="projects/logos"
              currentImageUrl=""
              showUrlTab={false}
              onUploadComplete={(url) => set("logo", url)}
              onRemove={() => set("logo", "")}
            />

            {/* Brandfetch picker */}
            <BrandAssetPicker
              label="Auto-Fetch Brand Logo (Brandfetch)"
              currentLogoUrl={form.logo}
              onAssetSelect={handleBrandAsset}
            />

            {/* Icon emoji */}
            <div className="space-y-1.5">
              <Label>Icon (emoji)</Label>
              <Input value={form.icon} onChange={(e) => set("icon", e.target.value)} placeholder="🚀" className="w-24" />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </section>

      <Separator />

      {/* ── Links ── */}
      <section className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Links</h4>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Live URL</Label>
            <Input value={form.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} placeholder="https://..." type="url" />
          </div>
          <div className="space-y-1.5">
            <Label>GitHub URL</Label>
            <Input value={form.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} placeholder="https://github.com/..." type="url" />
          </div>
          <div className="space-y-1.5">
            <Label>Demo URL</Label>
            <Input value={form.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} placeholder="https://demo...." type="url" />
          </div>
          <div className="space-y-1.5">
            <Label>Case Study URL</Label>
            <Input value={form.caseStudyUrl} onChange={(e) => set("caseStudyUrl", e.target.value)} placeholder="https://..." type="url" />
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Project Details ── */}
      <section className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Project Details</h4>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Key Achievements (one per line)</Label>
            <Textarea
              value={form.achievements.join("\n")}
              onChange={(e) => set("achievements", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
              rows={3}
              placeholder="Improved performance by 40%&#10;Reduced loading time by 60%"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Challenges (one per line)</Label>
            <Textarea
              value={(form.challenges ?? []).join("\n")}
              onChange={(e) => set("challenges", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
              rows={2}
              placeholder="One challenge per line..."
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Solutions (one per line)</Label>
            <Textarea
              value={(form.solutions ?? []).join("\n")}
              onChange={(e) => set("solutions", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
              rows={2}
              placeholder="One solution per line..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Your Role</Label>
            <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Full-Stack Developer" />
          </div>
          <div className="space-y-1.5">
            <Label>Team Size</Label>
            <Input type="number" min={1} value={form.teamSize} onChange={(e) => set("teamSize", Number(e.target.value))} />
          </div>
          <div className="space-y-1.5">
            <Label>Start Date</Label>
            <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>End Date</Label>
            <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="3 months" />
          </div>
          <div className="space-y-1.5">
            <Label>Priority (1–100)</Label>
            <Input type="number" min={1} max={100} value={form.priority} onChange={(e) => set("priority", Number(e.target.value))} />
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Client Info ── */}
      <section className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Client Information</h4>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Client Name</Label>
            <Input value={form.clientInfo.name} onChange={(e) => setNested("clientInfo", "name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Industry</Label>
            <Input value={form.clientInfo.industry} onChange={(e) => setNested("clientInfo", "industry", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Client Website</Label>
            <Input value={form.clientInfo.website} onChange={(e) => setNested("clientInfo", "website", e.target.value)} type="url" placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input value={form.clientInfo.location} onChange={(e) => setNested("clientInfo", "location", e.target.value)} placeholder="City, Country" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Switch checked={form.clientInfo.isPublic} onCheckedChange={(v) => setNested("clientInfo", "isPublic", v)} />
            <Label>Public Client</Label>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Visibility ── */}
      <section className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Visibility</h4>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
            <Label>Featured Project</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.disabled} onCheckedChange={(v) => set("disabled", v)} />
            <Label>Hide from Portfolio</Label>
          </div>
        </div>
      </section>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2 sticky bottom-0 bg-background py-3 border-t">
        <Button type="submit" disabled={submitting} className="flex-1 shadow-glow">
          {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          {submitting ? "Saving…" : initial?.title ? "Update Project" : "Add Project"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

// ─── ProjectsTab ─────────────────────────────────────────────────────────────
export function ProjectsTab() {
  // adminMode — include disabled projects so they can be re-enabled
  const { projects, loading } = useProjects(true);
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editProject, setEditProject] = useState<{ id: string; data: ProjectInput } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = projects.filter((p) => {
    const matchCat = filterCat === "all" || p.category === filterCat;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.technologies.some((t) => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const categories = [...new Set(projects.map((p) => p.category))];

  async function handleAdd(data: ProjectInput) {
    if (!db) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, PROJECTS_COLLECTION), {
        ...data, createdAt: Date.now(), updatedAt: Date.now(), version: 1,
      });
      setAddOpen(false);
      toast({ title: "Project added", description: data.title });
    } catch (e) {
      console.error("Failed to add project:", e);
      toast({ title: "Failed to add project", description: String(e), variant: "destructive" });
    }
    finally { setSubmitting(false); }
  }

  async function handleEdit(data: ProjectInput) {
    if (!db || !editProject) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, PROJECTS_COLLECTION, editProject.id), { ...data, updatedAt: Date.now() });
      setEditProject(null);
      toast({ title: "Project updated", description: data.title });
    } catch (e) {
      console.error("Failed to update project:", e);
      toast({ title: "Failed to update project", description: String(e), variant: "destructive" });
    }
    finally { setSubmitting(false); }
  }

  async function handleToggle(id: string, key: "featured" | "disabled", current: boolean) {
    if (!db) return;
    try {
      await updateDoc(doc(db, PROJECTS_COLLECTION, id), { [key]: !current, updatedAt: Date.now() });
      toast({
        title: key === "featured"
          ? (!current ? "Marked as featured" : "Removed from featured")
          : (!current ? "Project hidden from site" : "Project visible on site"),
      });
    } catch (e) {
      toast({ title: "Failed to toggle project", description: String(e), variant: "destructive" });
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!db || !confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, PROJECTS_COLLECTION, id));
      toast({ title: "Project deleted", description: title });
    } catch (e) {
      toast({ title: "Failed to delete project", description: String(e), variant: "destructive" });
    }
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => { const ts = new Date().toISOString().slice(0,10); downloadJSON(projects, `projects-${ts}.json`); }} disabled={!projects.length}>
          <Download className="h-4 w-4 mr-2" />Export JSON
        </Button>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-glow"><Plus className="h-4 w-4 mr-2" />Add Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Add New Project</DialogTitle></DialogHeader>
            <ProjectForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} submitting={submitting} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{projects.length} total</span>
        <span className="text-yellow-600">{projects.filter((p) => p.featured).length} featured</span>
        <span className="text-green-600">{projects.filter((p) => !p.disabled).length} visible</span>
        {(search || filterCat !== "all") && <span className="text-primary">{filtered.length} shown</span>}
      </div>

      {/* Project List */}
      <Card className="border-0 shadow-medium">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Database className="h-12 w-12 mb-3 opacity-30" />
              <p className="font-medium">No projects found</p>
              <p className="text-sm">{search || filterCat !== "all" ? "Try different filters" : "Add your first project"}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filtered.map((project, i) => (
                <div
                  key={project.id}
                  className={`p-4 flex items-start gap-4 hover:bg-muted/20 transition-colors ${project.disabled ? "opacity-60" : ""}`}
                >
                  {/* Rank */}
                  <div className="shrink-0 w-8 text-center pt-1">
                    <span className="text-xs text-muted-foreground font-mono">#{i + 1}</span>
                  </div>

                  {/* Logo */}
                  <div className="shrink-0 w-11 h-11 rounded-lg bg-muted/50 border flex items-center justify-center overflow-hidden">
                    {project.logo ? (
                      <img
                        src={project.logo}
                        alt=""
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <span className={`text-xl ${project.logo ? "hidden" : ""}`}>
                      {project.icon || "📁"}
                    </span>
                  </div>

                  {/* Cover thumbnail */}
                  {project.image && (
                    <div className="shrink-0 w-14 h-11 rounded overflow-hidden border hidden sm:block">
                      <img src={project.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold truncate">{project.title}</span>
                      {project.featured && (
                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs">
                          <Star className="h-2.5 w-2.5 mr-1 fill-current" />Featured
                        </Badge>
                      )}
                      {project.disabled && (
                        <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
                          <EyeOff className="h-2.5 w-2.5 mr-1" />Hidden
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">{project.category}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{project.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.technologies.slice(0, 5).map((t) => (
                        <span key={t} className="text-xs bg-muted/60 rounded px-1.5 py-0.5">{t}</span>
                      ))}
                      {project.technologies.length > 5 && (
                        <span className="text-xs text-muted-foreground">+{project.technologies.length - 5}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-0.5">
                    {project.liveUrl && (
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.open(project.liveUrl, "_blank")} title="View live">
                        <Globe className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.open(project.githubUrl, "_blank")} title="GitHub">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="icon" variant="ghost" className="h-8 w-8"
                      onClick={() => handleToggle(project.id, "featured", project.featured)}
                      title={project.featured ? "Unfeature" : "Feature"}
                    >
                      <Star className={`h-3.5 w-3.5 ${project.featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-8 w-8"
                      onClick={() => handleToggle(project.id, "disabled", project.disabled)}
                      title={project.disabled ? "Show" : "Hide"}
                    >
                      {project.disabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-8 w-8"
                      onClick={() => setEditProject({ id: project.id, data: project as ProjectInput })}
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(project.id, project.title)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editProject} onOpenChange={(o) => !o && setEditProject(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit: {editProject?.data.title}
            </DialogTitle>
          </DialogHeader>
          {editProject && (
            <ProjectForm
              initial={editProject.data}
              onSubmit={handleEdit}
              onCancel={() => setEditProject(null)}
              submitting={submitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
