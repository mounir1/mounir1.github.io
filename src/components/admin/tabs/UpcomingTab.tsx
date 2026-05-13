import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useUpcoming, type UpcomingProjectInput, type UpcomingStatus } from "@/hooks/useUpcoming";
import { Plus, Trash2, Calendar, Loader2, Clock, Edit, Eye, EyeOff, ExternalLink } from "lucide-react";

const STATUS_COLORS: Record<UpcomingStatus, string> = {
  idea:             "bg-gray-500/10 text-gray-600 border-gray-400/20",
  planned:          "bg-blue-500/10 text-blue-600 border-blue-400/20",
  "in-development": "bg-primary/10 text-primary border-primary/20",
  beta:             "bg-orange-500/10 text-orange-600 border-orange-400/20",
  soon:             "bg-green-500/10 text-green-600 border-green-400/20",
};

const STATUS_LIST: UpcomingStatus[] = ["idea", "planned", "in-development", "beta", "soon"];

const EMPTY: UpcomingProjectInput = {
  title: "",
  description: "",
  status: "planned",
  targetDate: "",
  technologies: [],
  category: undefined,
  estimatedDuration: "",
  publicVisible: true,
  priority: 50,
  githubUrl: "",
};

export function UpcomingTab() {
  const { upcoming, loading, addUpcoming, deleteUpcoming, updateUpcoming } = useUpcoming();

  // ── Dialog state ──────────────────────────────────────────────────────────────
  const [open, setOpen]         = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm]         = useState<UpcomingProjectInput>(EMPTY);
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving]     = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function setF<K extends keyof UpcomingProjectInput>(key: K, value: UpcomingProjectInput[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function openAdd() {
    setEditId(null);
    setForm(EMPTY);
    setTechInput("");
    setOpen(true);
  }

  function openEdit(p: any) {
    setEditId(p.id);
    setForm({
      title:             p.title             ?? "",
      description:       p.description       ?? "",
      status:            p.status            ?? "planned",
      targetDate:        p.targetDate        ?? "",
      technologies:      p.technologies      ?? [],
      category:          p.category          ?? undefined,
      estimatedDuration: p.estimatedDuration ?? "",
      publicVisible:     p.publicVisible     ?? true,
      priority:          p.priority          ?? 50,
      githubUrl:         p.githubUrl         ?? "",
    });
    setTechInput((p.technologies ?? []).join(", "));
    setOpen(true);
  }

  async function handleSave() {
    if (!form.title) return;
    setSaving(true);
    try {
      const techArr = techInput.split(",").map(t => t.trim()).filter(Boolean);
      const payload = { ...form, technologies: techArr };
      if (editId) {
        await updateUpcoming(editId, payload);
      } else {
        await addUpcoming(payload);
      }
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await deleteUpcoming(id);
  }

  async function toggleVisibility(id: string, current: boolean) {
    await updateUpcoming(id, { publicVisible: !current });
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Upcoming Projects</h2>
          <p className="text-sm text-muted-foreground">
            {upcoming.length} planned · Stored in Firebase
          </p>
        </div>
        <Button onClick={openAdd} className="shadow-glow">
          <Plus className="h-4 w-4 mr-2" />
          Add Upcoming
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && upcoming.length === 0 && (
        <Card className="border-0 shadow-medium">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No upcoming projects yet</p>
            <p className="text-sm">Plan something exciting and share it on your portfolio!</p>
          </CardContent>
        </Card>
      )}

      {/* Project list */}
      <div className="space-y-3">
        {[...upcoming].sort((a, b) => b.priority - a.priority).map(project => (
          <Card key={project.id} className={`border-0 shadow-medium transition-opacity ${!project.publicVisible ? "opacity-60" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{project.title}</h3>
                    <Badge className={`text-xs border ${STATUS_COLORS[project.status as UpcomingStatus] ?? STATUS_COLORS.planned} capitalize`}>
                      {project.status}
                    </Badge>
                    {!project.publicVisible && (
                      <Badge variant="secondary" className="text-xs">Admin-only</Badge>
                    )}
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      P{project.priority}
                    </Badge>
                  </div>

                  {project.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{project.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 items-center">
                    {project.technologies?.map(t => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                    {project.targetDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.targetDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                      </span>
                    )}
                    {project.estimatedDuration && (
                      <span className="text-xs text-muted-foreground">⏱ {project.estimatedDuration}</span>
                    )}
                    {(project as any).githubUrl && (
                      <a
                        href={(project as any).githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />GitHub
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => toggleVisibility(project.id, project.publicVisible)}
                    title={project.publicVisible ? "Hide from public" : "Show publicly"}
                  >
                    {project.publicVisible
                      ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                      : <Eye className="h-4 w-4" />
                    }
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => openEdit(project)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => handleDelete(project.id, project.title)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Upcoming Project" : "Add Upcoming Project"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid md:grid-cols-2 gap-3">

              {/* Title */}
              <div className="space-y-1.5 md:col-span-2">
                <Label>Project Title *</Label>
                <Input
                  value={form.title}
                  onChange={e => setF("title", e.target.value)}
                  placeholder="Next SaaS Platform"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setF("status", v as UpcomingStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_LIST.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <Label>Priority (1–100)</Label>
                <Input
                  type="number" min={1} max={100}
                  value={form.priority}
                  onChange={e => setF("priority", Number(e.target.value))}
                />
              </div>

              {/* Target Date */}
              <div className="space-y-1.5">
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={form.targetDate ?? ""}
                  onChange={e => setF("targetDate", e.target.value)}
                />
              </div>

              {/* Estimated Duration */}
              <div className="space-y-1.5">
                <Label>Estimated Duration</Label>
                <Input
                  value={form.estimatedDuration ?? ""}
                  onChange={e => setF("estimatedDuration", e.target.value)}
                  placeholder="2–3 months"
                />
              </div>

              {/* Technologies */}
              <div className="space-y-1.5 md:col-span-2">
                <Label>Technologies (comma-separated)</Label>
                <Input
                  value={techInput}
                  onChange={e => setTechInput(e.target.value)}
                  placeholder="React, Node.js, TypeScript…"
                />
              </div>

              {/* GitHub URL */}
              <div className="space-y-1.5 md:col-span-2">
                <Label>GitHub URL</Label>
                <Input
                  value={form.githubUrl ?? ""}
                  onChange={e => setF("githubUrl", e.target.value)}
                  placeholder="https://github.com/username/repo"
                  type="url"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setF("description", e.target.value)}
                  rows={3}
                  placeholder="What will this project do and who is it for?"
                />
              </div>
            </div>

            {/* Visibility toggle */}
            <div className="flex items-center gap-2 pt-1">
              <Switch
                checked={form.publicVisible}
                onCheckedChange={v => setF("publicVisible", v)}
              />
              <Label className="text-sm">Show publicly on portfolio</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.title}
              className="shadow-glow"
            >
              {saving
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                : editId ? "Save Changes" : "Add Project"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
