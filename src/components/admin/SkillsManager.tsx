/**
 * SkillsManager – Admin CRUD panel for Skills, grouped by category.
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
import { Code2, Edit, Eye, EyeOff, Plus, Star, Trash2, X } from "lucide-react";
import { useFirestoreCRUD } from "@/hooks/useFirestoreCRUD";
import { initialSkills } from "@/data/initial-skills";
import type { Skill, SkillCategory, SkillInput } from "@/hooks/useSkills";

const SKILL_CATEGORIES: SkillCategory[] = [
  "Frontend Development","Backend Development","Database","Cloud & DevOps",
  "Mobile Development","Machine Learning","E-commerce","Design",
  "Project Management","Languages","Tools","Other",
];

const BLANK: SkillInput = {
  name: "", category: "Other", level: 80, yearsOfExperience: 1,
  description: "", certifications: [], projects: [], icon: "", color: "#6366f1",
  featured: false, disabled: false, priority: 50,
  createdAt: Date.now(), updatedAt: Date.now(),
};

function LevelBar({ level, color }: { level: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${level}%`, backgroundColor: color ?? "#6366f1" }} />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{level}%</span>
    </div>
  );
}

interface FormProps { initial?: Partial<SkillInput>; onSubmit: (d: SkillInput) => void; onCancel: () => void; submitting?: boolean; }

const SkillForm = memo(function SkillForm({ initial = {}, onSubmit, onCancel, submitting }: FormProps) {
  const [form, setForm] = useState<SkillInput>({ ...BLANK, ...initial });
  const set = <K extends keyof SkillInput>(k: K, v: SkillInput[K]) => setForm(f => ({ ...f, [k]: v }));
  const parseComma = (v: string) => v.split(",").map(s => s.trim()).filter(Boolean);
  const joinComma = (a?: string[]) => (a ?? []).join(", ");

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, updatedAt: Date.now() }); }} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Skill Name *</Label>
          <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="React" required />
        </div>
        <div className="space-y-2"><Label>Category *</Label>
          <Select value={form.category} onValueChange={v => set("category", v as SkillCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SKILL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Level (1–100)</Label>
          <Input type="number" min={1} max={100} value={form.level} onChange={e => set("level", Number(e.target.value))} />
        </div>
        <div className="space-y-2"><Label>Years Experience</Label>
          <Input type="number" min={0} max={30} value={form.yearsOfExperience} onChange={e => set("yearsOfExperience", Number(e.target.value))} />
        </div>
        <div className="space-y-2"><Label>Priority (1–100)</Label>
          <Input type="number" min={1} max={100} value={form.priority} onChange={e => set("priority", Number(e.target.value))} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Icon (emoji or URL)</Label>
          <Input value={form.icon ?? ""} onChange={e => set("icon", e.target.value)} placeholder="⚛️" />
        </div>
        <div className="space-y-2"><Label>Color (hex)</Label>
          <div className="flex gap-2">
            <Input type="color" value={form.color ?? "#6366f1"} onChange={e => set("color", e.target.value)} className="w-14 p-1 h-10" />
            <Input value={form.color ?? ""} onChange={e => set("color", e.target.value)} placeholder="#6366f1" />
          </div>
        </div>
      </div>
      <div className="space-y-2"><Label>Description</Label>
        <Textarea value={form.description ?? ""} onChange={e => set("description", e.target.value)} rows={2} />
      </div>
      <div className="space-y-2"><Label>Certifications (comma-separated)</Label>
        <Input value={joinComma(form.certifications)} onChange={e => set("certifications", parseComma(e.target.value))} placeholder="AWS Certified, Google Cloud Professional…" />
      </div>
      <div className="flex flex-wrap items-center gap-6 pt-2 border-t">
        <div className="flex items-center gap-2">
          <Switch id="sk-feat" checked={form.featured} onCheckedChange={v => set("featured", v)} />
          <Label htmlFor="sk-feat">Featured</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="sk-dis" checked={form.disabled} onCheckedChange={v => set("disabled", v)} />
          <Label htmlFor="sk-dis">Hidden</Label>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}><X className="h-4 w-4 mr-1" />Cancel</Button>
        <Button type="submit" disabled={submitting} className="shadow-glow">{submitting ? "Saving…" : "Save Skill"}</Button>
      </div>
    </form>
  );
});

export const SkillsManager = memo(function SkillsManager() {
  const { documents: skills, loading, error, add, update, remove, toggleField } =
    useFirestoreCRUD<Skill>({ collectionName: "skills", fallbackData: initialSkills as unknown as Omit<Skill, "id">[] });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterCat, setFilterCat] = useState<SkillCategory | "All">("All");

  const filtered = useMemo(() => {
    const base = filterCat === "All" ? skills : skills.filter(s => s.category === filterCat);
    return [...base].sort((a, b) => b.priority - a.priority || b.level - a.level);
  }, [skills, filterCat]);

  const grouped = useMemo(() =>
    filtered.reduce<Record<string, Skill[]>>((acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    }, {}), [filtered]);

  const handleAdd = useCallback(async (data: SkillInput) => {
    setSubmitting(true);
    await add(data as Omit<Skill, "id" | "createdAt" | "updatedAt">);
    setSubmitting(false); setShowForm(false);
  }, [add]);

  const handleEdit = useCallback(async (data: SkillInput) => {
    if (!editing) return;
    setSubmitting(true);
    await update(editing.id, data);
    setSubmitting(false); setEditing(null);
  }, [editing, update]);

  const handleDelete = useCallback(async (skill: Skill) => {
    if (!confirm(`Delete skill "${skill.name}"?`)) return;
    await remove(skill.id);
  }, [remove]);

  return (
    <Card className="border-0 shadow-medium">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />Skills Management
            <Badge variant="outline">{skills.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={filterCat} onValueChange={v => setFilterCat(v as SkillCategory | "All")}>
              <SelectTrigger className="w-52"><SelectValue placeholder="Filter category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {SKILL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => { setEditing(null); setShowForm(true); }} className="shadow-glow">
              <Plus className="h-4 w-4 mr-1" />Add Skill
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
        {showForm && !editing && (
          <div className="border rounded-xl p-6 bg-muted/20">
            <h3 className="font-semibold mb-4">New Skill</h3>
            <SkillForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} submitting={submitting} />
          </div>
        )}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading skills…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No skills found.</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, catSkills]) => (
              <div key={category}>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
                  {category} <span className="text-xs font-normal">({catSkills.length})</span>
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {catSkills.map(skill => (
                    <div key={skill.id}>
                      {editing?.id === skill.id ? (
                        <div className="border rounded-xl p-4 bg-muted/20">
                          <h4 className="font-semibold mb-3">Edit Skill</h4>
                          <SkillForm initial={skill} onSubmit={handleEdit} onCancel={() => setEditing(null)} submitting={submitting} />
                        </div>
                      ) : (
                        <div className="border rounded-xl p-4 space-y-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {skill.icon && <span className="text-xl shrink-0">{skill.icon}</span>}
                              <div className="min-w-0">
                                <div className="font-medium truncate">{skill.name}</div>
                                <div className="text-xs text-muted-foreground">{skill.yearsOfExperience}y exp.</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleField(skill.id, "disabled")}>
                                {skill.disabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleField(skill.id, "featured")}>
                                <Star className={`h-3.5 w-3.5 ${skill.featured ? "fill-current text-yellow-500" : ""}`} />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setShowForm(false); setEditing(skill); }}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:text-red-700" onClick={() => handleDelete(skill)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <LevelBar level={skill.level} color={skill.color} />
                          <div className="flex flex-wrap gap-1">
                            {skill.featured && <Badge className="text-xs bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Featured</Badge>}
                            {skill.disabled && <Badge variant="secondary" className="text-xs bg-red-500/10 text-red-600">Hidden</Badge>}
                            <Badge variant="outline" className="text-xs">P:{skill.priority}</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
