/**
 * ExperienceManager – Admin CRUD panel for Work Experience entries.
 */

import { memo, useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Edit, Eye, EyeOff, Plus, Star, Trash2, X } from "lucide-react";
import { useFirestoreCRUD } from "@/hooks/useFirestoreCRUD";
import { initialExperience } from "@/data/initial-experience";
import type { Experience } from "@/hooks/useExperience";

type ExpInput = Omit<Experience, "id">;

const BLANK: ExpInput = {
  title: "", company: "", companyUrl: "", companyLogo: "", location: "",
  type: "full-time", startDate: "", endDate: "", current: false,
  description: "", achievements: [], technologies: [], projects: [],
  skills: [], responsibilities: [], icon: "",
  featured: false, disabled: false, priority: 50,
  createdAt: Date.now(), updatedAt: Date.now(),
};

const parseLines = (v: string) => v.split("\n").map(s => s.trim()).filter(Boolean);
const parseComma = (v: string) => v.split(",").map(s => s.trim()).filter(Boolean);
const joinLines = (a?: string[]) => (a ?? []).join("\n");
const joinComma = (a?: string[]) => (a ?? []).join(", ");

// ── Form ──────────────────────────────────────────────────────────────────────

interface FormProps { initial?: Partial<ExpInput>; onSubmit: (d: ExpInput) => void; onCancel: () => void; submitting?: boolean; }

const ExperienceForm = memo(function ExperienceForm({ initial = {}, onSubmit, onCancel, submitting }: FormProps) {
  const [form, setForm] = useState<ExpInput>({ ...BLANK, ...initial });
  const set = <K extends keyof ExpInput>(k: K, v: ExpInput[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, updatedAt: Date.now() }); }} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Job Title *</Label>
          <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Senior Full-Stack Engineer" required />
        </div>
        <div className="space-y-2"><Label>Company *</Label>
          <Input value={form.company} onChange={e => set("company", e.target.value)} placeholder="OWeb – Hotech" required />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Location</Label>
          <Input value={form.location} onChange={e => set("location", e.target.value)} placeholder="Algiers, Algeria" />
        </div>
        <div className="space-y-2"><Label>Employment Type</Label>
          <Select value={form.type} onValueChange={v => set("type", v as ExpInput["type"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["full-time","part-time","contract","freelance","internship"].map(t =>
                <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Start Date *</Label>
          <Input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} required />
        </div>
        <div className="space-y-2"><Label>End Date</Label>
          <Input type="date" value={form.endDate ?? ""} onChange={e => set("endDate", e.target.value)} disabled={form.current} />
        </div>
        <div className="flex items-end pb-1 gap-2">
          <Switch id="exp-cur" checked={form.current} onCheckedChange={v => { set("current", v); if (v) set("endDate", ""); }} />
          <Label htmlFor="exp-cur">Current position</Label>
        </div>
      </div>
      <div className="space-y-2"><Label>Description *</Label>
        <Textarea value={form.description} onChange={e => set("description", e.target.value)} rows={3} required />
      </div>
      <div className="space-y-2"><Label>Key Achievements (one per line)</Label>
        <Textarea value={joinLines(form.achievements)} onChange={e => set("achievements", parseLines(e.target.value))} rows={4} placeholder="Reduced API latency by 60%&#10;Led migration to microservices…" />
      </div>
      <div className="space-y-2"><Label>Responsibilities (one per line)</Label>
        <Textarea value={joinLines(form.responsibilities)} onChange={e => set("responsibilities", parseLines(e.target.value))} rows={3} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Technologies (comma-separated)</Label>
          <Textarea value={joinComma(form.technologies)} onChange={e => set("technologies", parseComma(e.target.value))} rows={2} placeholder="Node.js, React, PostgreSQL…" />
        </div>
        <div className="space-y-2"><Label>Skills (comma-separated)</Label>
          <Textarea value={joinComma(form.skills)} onChange={e => set("skills", parseComma(e.target.value))} rows={2} placeholder="System Architecture, CI/CD…" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Company URL</Label>
          <Input type="url" value={form.companyUrl ?? ""} onChange={e => set("companyUrl", e.target.value)} placeholder="https://company.com" />
        </div>
        <div className="space-y-2"><Label>Company Logo URL</Label>
          <Input type="url" value={form.companyLogo ?? ""} onChange={e => set("companyLogo", e.target.value)} placeholder="https://cdn.company.com/logo.svg" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 pt-2 border-t">
        <div className="flex items-center gap-2">
          <Switch id="exp-feat" checked={form.featured} onCheckedChange={v => set("featured", v)} />
          <Label htmlFor="exp-feat">Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="exp-dis" checked={form.disabled} onCheckedChange={v => set("disabled", v)} />
          <Label htmlFor="exp-dis">Hidden</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label>Priority</Label>
          <Input type="number" min={1} max={100} className="w-20" value={form.priority} onChange={e => set("priority", Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-2">
          <Label>Icon</Label>
          <Input className="w-20" value={form.icon ?? ""} onChange={e => set("icon", e.target.value)} placeholder="💼" />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}><X className="h-4 w-4 mr-1" />Cancel</Button>
        <Button type="submit" disabled={submitting} className="shadow-glow">{submitting ? "Saving…" : "Save Experience"}</Button>
      </div>
    </form>
  );
});

// ── Manager ───────────────────────────────────────────────────────────────────

export const ExperienceManager = memo(function ExperienceManager() {
  const { documents: experiences, loading, error, add, update, remove, toggleField } =
    useFirestoreCRUD<Experience & { id: string }>({
      collectionName: "experiences",
      fallbackData: initialExperience as unknown as Omit<Experience, "id">[],
    });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sorted = useMemo(() => [...experiences].sort((a, b) => b.priority - a.priority), [experiences]);

  const handleAdd = useCallback(async (data: ExpInput) => {
    setSubmitting(true);
    await add(data as Omit<Experience, "id" | "createdAt" | "updatedAt">);
    setSubmitting(false); setShowForm(false);
  }, [add]);

  const handleEdit = useCallback(async (data: ExpInput) => {
    if (!editing) return;
    setSubmitting(true);
    await update(editing.id, data);
    setSubmitting(false); setEditing(null);
  }, [editing, update]);

  const handleDelete = useCallback(async (exp: Experience) => {
    if (!confirm(`Delete "${exp.title}" at ${exp.company}?`)) return;
    await remove(exp.id);
  }, [remove]);

  return (
    <Card className="border-0 shadow-medium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />Experience Management
            <Badge variant="outline">{sorted.length}</Badge>
          </CardTitle>
          <Button onClick={() => { setEditing(null); setShowForm(true); }} className="shadow-glow">
            <Plus className="h-4 w-4 mr-1" />Add Experience
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        {showForm && !editing && (
          <div className="border rounded-xl p-6 bg-muted/20">
            <h3 className="font-semibold mb-4">New Experience</h3>
            <ExperienceForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} submitting={submitting} />
          </div>
        )}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading experiences…</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No experiences yet.</div>
        ) : (
          <div className="space-y-4">
            {sorted.map(exp => (
              <div key={exp.id} className="border rounded-xl overflow-hidden">
                {editing?.id === exp.id ? (
                  <div className="p-6 bg-muted/20">
                    <h3 className="font-semibold mb-4">Edit Experience</h3>
                    <ExperienceForm initial={exp} onSubmit={handleEdit} onCancel={() => setEditing(null)} submitting={submitting} />
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {exp.icon && <span className="text-xl">{exp.icon}</span>}
                          <h3 className="font-semibold text-lg truncate">{exp.title}</h3>
                          <span className="text-muted-foreground font-medium">@ {exp.company}</span>
                          {exp.current && <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Current</Badge>}
                          {exp.featured && <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
                          {exp.disabled && <Badge variant="secondary" className="bg-red-500/10 text-red-600">Hidden</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                          <span>{exp.location}</span><span>•</span><span>{exp.type}</span><span>•</span>
                          <span>{exp.startDate} – {exp.current ? "Present" : exp.endDate ?? ""}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{exp.description}</p>
                        {exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {exp.technologies.slice(0, 6).map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                            {exp.technologies.length > 6 && <Badge variant="outline" className="text-xs">+{exp.technologies.length - 6}</Badge>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => toggleField(exp.id, "disabled")}>
                          {exp.disabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toggleField(exp.id, "featured")}>
                          <Star className={`h-4 w-4 ${exp.featured ? "fill-current text-yellow-500" : ""}`} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditing(exp); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(exp)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
