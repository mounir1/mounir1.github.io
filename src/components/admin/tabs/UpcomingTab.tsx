import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpcoming, type UpcomingProjectInput, type UpcomingStatus } from "@/hooks/useUpcoming";
import { Plus, Trash2, Calendar, Loader2, Clock } from "lucide-react";

const STATUS_COLORS: Record<UpcomingStatus, string> = {
  idea: "bg-gray-500/10 text-gray-600 border-gray-400/20",
  planned: "bg-blue-500/10 text-blue-600 border-blue-400/20",
  "in-development": "bg-primary/10 text-primary border-primary/20",
  beta: "bg-orange-500/10 text-orange-600 border-orange-400/20",
  soon: "bg-green-500/10 text-green-600 border-green-400/20",
};

const EMPTY: UpcomingProjectInput = {
  title: "", description: "", status: "planned",
  targetDate: "", technologies: [], category: undefined,
  estimatedDuration: "", publicVisible: true, priority: 50, githubUrl: "",
};

export function UpcomingTab() {
  const { upcoming, loading, addUpcoming, deleteUpcoming, updateUpcoming } = useUpcoming();
  const [form, setForm] = useState<UpcomingProjectInput>(EMPTY);
  const [techInput, setTechInput] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!form.title) return;
    setSaving(true);
    try {
      await addUpcoming({
        ...form,
        technologies: techInput.split(",").map(t => t.trim()).filter(Boolean),
      });
      setForm(EMPTY);
      setTechInput("");
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Upcoming Projects</h2>
          <p className="text-sm text-muted-foreground">
            {upcoming.length} planned · Stored in Firebase
          </p>
        </div>
      </div>

      {/* Add Form */}
      <Card className="border-0 shadow-medium">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Upcoming Project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Project Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="New SaaS Platform" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as UpcomingStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["idea", "planned", "in-development", "beta", "soon"] as UpcomingStatus[]).map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Target Date</Label>
              <Input type="date" value={form.targetDate || ""} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Estimated Duration</Label>
              <Input value={form.estimatedDuration || ""} onChange={e => setForm(f => ({ ...f, estimatedDuration: e.target.value }))} placeholder="2–3 months" />
            </div>
            <div className="space-y-1.5">
              <Label>Technologies (comma-separated)</Label>
              <Input value={techInput} onChange={e => setTechInput(e.target.value)} placeholder="React, Node.js, TypeScript…" />
            </div>
            <div className="space-y-1.5">
              <Label>Priority (1–100)</Label>
              <Input type="number" min={1} max={100} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="What will this project do?" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={form.publicVisible} onCheckedChange={v => setForm(f => ({ ...f, publicVisible: v }))} />
              <Label className="text-sm">Show publicly on portfolio</Label>
            </div>
          </div>
          <Button onClick={handleAdd} disabled={saving || !form.title} className="shadow-glow">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add Upcoming Project
          </Button>
        </CardContent>
      </Card>

      {loading && <div className="text-center py-8 text-muted-foreground">Loading…</div>}

      {!loading && upcoming.length === 0 && (
        <Card className="border-0 shadow-medium">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No upcoming projects. Plan something exciting!</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {[...upcoming].sort((a, b) => b.priority - a.priority).map(project => (
          <Card key={project.id} className="border-0 shadow-medium">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{project.title}</h3>
                    <Badge className={`text-xs border ${STATUS_COLORS[project.status as UpcomingStatus] || STATUS_COLORS.planned} capitalize`}>
                      {project.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">P{project.priority}</Badge>
                    {!project.publicVisible && (
                      <Badge variant="secondary" className="text-xs">Admin-only</Badge>
                    )}
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
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm" variant="ghost"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                    onClick={() => deleteUpcoming(project.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
