import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useSkills, type SkillInput, type SkillCategory, SKILLS_COLLECTION } from "@/hooks/useSkills";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { addDoc, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Zap } from "lucide-react";

const SKILL_CATEGORIES: SkillCategory[] = [
  "Frontend Development", "Backend Development", "Database",
  "Cloud & DevOps", "Mobile Development", "Machine Learning",
  "Design", "Project Management", "Languages", "Frameworks", "Testing", "Tools", "Other",
];

const DEFAULT_SKILL: SkillInput = {
  name: "", category: "Frontend Development", level: 80,
  yearsOfExperience: 1, description: "", certifications: [],
  projects: [], icon: "", color: "", featured: false,
  disabled: false, priority: 50, createdAt: Date.now(), updatedAt: Date.now(),
};

export function SkillsTab() {
  const { skills, skillsByCategory, loading } = useSkills();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SkillInput>(DEFAULT_SKILL);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("All");

  const categories = ["All", ...SKILL_CATEGORIES.filter(c => skills.some(s => s.category === c))];
  const displaySkills = filterCat === "All" ? skills : skills.filter(s => s.category === filterCat);

  function openAdd() {
    setEditId(null);
    setForm({ ...DEFAULT_SKILL, createdAt: Date.now(), updatedAt: Date.now() });
    setOpen(true);
  }

  function openEdit(skill: any) {
    setEditId(skill.id);
    setForm({ ...skill });
    setOpen(true);
  }

  async function handleSave() {
    if (!isFirebaseEnabled || !db) return;
    setSaving(true);
    try {
      const data = { ...form, updatedAt: Date.now() };
      if (editId) {
        await updateDoc(doc(db, SKILLS_COLLECTION, editId), data as any);
      } else {
        await addDoc(collection(db, SKILLS_COLLECTION), { ...data, createdAt: Date.now() });
      }
      setOpen(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!db || !confirm("Delete this skill?")) return;
    await deleteDoc(doc(db, SKILLS_COLLECTION, id));
  }

  async function toggleField(id: string, field: "disabled" | "featured", value: boolean) {
    if (!db) return;
    await updateDoc(doc(db, SKILLS_COLLECTION, id), { [field]: value, updatedAt: Date.now() });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Skills Management</h2>
          <p className="text-sm text-muted-foreground">{skills.length} skills across {Object.keys(skillsByCategory).length} categories</p>
        </div>
        <Button onClick={openAdd} className="shadow-glow">
          <Plus className="h-4 w-4 mr-2" /> Add Skill
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              filterCat === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card/50 text-muted-foreground border-border/50 hover:border-primary/40"
            }`}
          >
            {cat}
            {cat !== "All" && (
              <span className="ml-1.5 opacity-60">
                {skills.filter(s => s.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-8 text-muted-foreground">Loading…</div>}

      {!loading && skills.length === 0 && (
        <Card className="border-0 shadow-medium">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Zap className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No skills yet. Add your first skill or upload seed data!</p>
          </CardContent>
        </Card>
      )}

      {/* Skills Grid */}
      {!loading && displaySkills.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {displaySkills.map(skill => (
            <Card key={skill.id} className={`border-0 shadow-medium transition-all ${skill.disabled ? "opacity-50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{skill.icon || "🛠️"}</span>
                    <div>
                      <div className="font-semibold text-sm leading-tight">{skill.name}</div>
                      <div className="text-xs text-muted-foreground">{skill.category}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {skill.featured && <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-400/20 text-[10px] px-1.5"><Star className="h-2.5 w-2.5" /></Badge>}
                    {(skill as any).trending && <Badge className="bg-orange-500/10 text-orange-600 border-orange-400/20 text-[10px] px-1.5">🔥</Badge>}
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Proficiency</span>
                    <span className="font-medium">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-1.5" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{skill.yearsOfExperience}y exp</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleField(skill.id, "featured", !skill.featured)}>
                      <Star className={`h-3.5 w-3.5 ${skill.featured ? "fill-current text-yellow-500" : "text-muted-foreground"}`} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleField(skill.id, "disabled", !skill.disabled)}>
                      {skill.disabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(skill)}>
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(skill.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Skill" : "Add Skill"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Skill Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="React" />
              </div>
              <div className="space-y-1.5">
                <Label>Icon (emoji)</Label>
                <Input value={form.icon || ""} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="⚛️" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as SkillCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Proficiency Level</Label>
                <span className="text-sm font-semibold text-primary">{form.level}%</span>
              </div>
              <Slider
                value={[form.level]}
                onValueChange={([v]) => setForm(f => ({ ...f, level: v }))}
                min={0} max={100} step={5}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Years of Experience</Label>
                <Input type="number" min={0} max={30} value={form.yearsOfExperience} onChange={e => setForm(f => ({ ...f, yearsOfExperience: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Priority (1–100)</Label>
                <Input type="number" min={1} max={100} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="Brief description of your experience with this skill…" />
            </div>

            <div className="space-y-1.5">
              <Label>Color (hex)</Label>
              <div className="flex gap-2">
                <Input value={form.color || ""} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="#61DAFB" className="flex-1" />
                {form.color && (
                  <div className="w-10 h-10 rounded-lg border border-border shrink-0" style={{ backgroundColor: form.color }} />
                )}
              </div>
            </div>

            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.disabled} onCheckedChange={v => setForm(f => ({ ...f, disabled: v }))} />
                <Label>Hidden</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={(form as any).trending || false} onCheckedChange={v => setForm(f => ({ ...f, trending: v } as any))} />
                <Label>🔥 Trending</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name} className="shadow-glow">
              {saving ? "Saving…" : editId ? "Save Changes" : "Add Skill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
