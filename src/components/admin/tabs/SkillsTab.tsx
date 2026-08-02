import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSkills, type SkillInput, type SkillCategory, SKILLS_COLLECTION } from "@/hooks/useSkills";
import { useToast } from "@/hooks/use-toast";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { addDoc, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { SKILL_ICONS, getSkillColor } from "@/lib/skill-icons";
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Zap, Palette, Search, Download } from "lucide-react";

// Module-scope handler: uses Date.now(), so it must stay out of the
// render path (react-hooks/purity). db is a module import.
async function toggleField(id: string, field: "disabled" | "featured", value: boolean) {
  if (!db) return;
  await updateDoc(doc(db, SKILLS_COLLECTION, id), { [field]: value, updatedAt: Date.now() });
}

function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const SKILL_CATEGORIES: SkillCategory[] = [
  "Frontend Development", "Backend Development", "Database",
  "Cloud & DevOps", "Mobile Development", "Machine Learning",
  "Design", "Project Management", "Languages", "Frameworks",
  "LMS & Education", "Hospitality Solutions", "Testing", "Tools", "Other",
];

// Icon picker: top icons from the SKILL_ICONS map for quick selection
const QUICK_ICONS = [
  "⚛️", "🟢", "📘", "🐍", "🔥", "☁️", "🐳", "⚓", "🐘", "🍃",
  "🎨", "📱", "🧠", "⚡", "🔗", "📊", "🎓", "🏨", "🎫", "🔧",
  "🛡️", "🔴", "💚", "▲", "🏗️", "🔌", "💳", "🔍", "🎥", "🖥️",
];

const DEFAULT_SKILL: SkillInput = {
  name: "", category: "Frontend Development", level: 80,
  yearsOfExperience: 1, description: "", certifications: [],
  projects: [], icon: "", color: "", featured: false,
  disabled: false, priority: 50, createdAt: Date.now(), updatedAt: Date.now(),
};

export function SkillsTab() {
  const { skills, skillsByCategory, loading } = useSkills(true);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<SkillInput>(DEFAULT_SKILL);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("All");
  const [iconSearch, setIconSearch] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const categories = ["All", ...SKILL_CATEGORIES.filter(c => skills.some(s => s.category === c))];
  const displaySkills = filterCat === "All" ? skills : skills.filter(s => s.category === filterCat);

  // Filter SKILL_ICONS keys for the picker
  const skillIconKeys = Object.keys(SKILL_ICONS);
  const filteredIconKeys = iconSearch
    ? skillIconKeys.filter(k => k.includes(iconSearch.toLowerCase()))
    : skillIconKeys;

  function setF<K extends keyof SkillInput>(key: K, value: SkillInput[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function openAdd() {
    setEditId(null);
    setForm({ ...DEFAULT_SKILL, createdAt: Date.now(), updatedAt: Date.now() });
    setIconSearch("");
    setShowIconPicker(false);
    setOpen(true);
  }

  function openEdit(skill: any) {
    setEditId(skill.id);
    setForm({ ...DEFAULT_SKILL, ...skill });
    setIconSearch("");
    setShowIconPicker(false);
    setOpen(true);
  }

  // Auto-fill color from skill name when name changes
  function handleNameChange(name: string) {
    setF("name", name);
    if (!form.color || form.color === "") {
      const autoColor = getSkillColor(name);
      if (autoColor !== "#6B7280") setF("color", autoColor);
    }
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
      toast({ title: editId ? "Skill updated" : "Skill added", description: form.name });
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to save skill", description: String(e), variant: "destructive" });
    }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!db || !confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, SKILLS_COLLECTION, id));
      toast({ title: "Skill deleted", description: name });
    } catch (e) {
      toast({ title: "Failed to delete skill", description: String(e), variant: "destructive" });
    }
  }

  async function handleToggleField(id: string, field: "disabled" | "featured", value: boolean) {
    try {
      await toggleField(id, field, value);
      toast({
        title: field === "featured"
          ? (value ? "Marked as featured" : "Removed from featured")
          : (value ? "Skill hidden from site" : "Skill visible on site"),
      });
    } catch (e) {
      toast({ title: "Failed to toggle skill", description: String(e), variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Skills Management</h2>
          <p className="text-sm text-muted-foreground">
            {skills.length} skills across {Object.keys(skillsByCategory).length} categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { const ts = new Date().toISOString().slice(0,10); downloadJSON(skills, `skills-${ts}.json`); }} disabled={skills.length === 0}>
            <Download className="h-4 w-4 mr-2" />Export JSON
          </Button>
          <Button onClick={openAdd} className="shadow-glow">
            <Plus className="h-4 w-4 mr-2" />Add Skill
          </Button>
        </div>
      </div>

      {/* Category Filter pills */}
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
              <span className="ml-1.5 opacity-60">{skills.filter(s => s.category === cat).length}</span>
            )}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-8 text-muted-foreground">Loading…</div>}

      {!loading && skills.length === 0 && (
        <Card className="border-0 shadow-medium">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Zap className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No skills yet. Add your first skill!</p>
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
                  <div className="flex items-center gap-2.5">
                    {/* Color swatch / icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 border"
                      style={skill.color ? { backgroundColor: `${skill.color}20`, borderColor: `${skill.color}40` } : {}}
                    >
                      {skill.icon && skill.icon.length <= 2 ? (
                        <span>{skill.icon}</span>
                      ) : skill.icon ? (
                        <img src={skill.icon} alt={skill.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <span>🛠️</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm leading-tight">{skill.name}</div>
                      <div className="text-xs text-muted-foreground">{skill.category}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {skill.featured && (
                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-400/20 text-[10px] px-1.5">
                        <Star className="h-2.5 w-2.5" />
                      </Badge>
                    )}
                    {(skill as any).trending && (
                      <Badge className="bg-orange-500/10 text-orange-600 border-orange-400/20 text-[10px] px-1.5">🔥</Badge>
                    )}
                  </div>
                </div>

                {/* Proficiency bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Proficiency</span>
                    <span className="font-medium" style={skill.color ? { color: skill.color } : {}}>
                      {skill.level}%
                    </span>
                  </div>
                  <Progress
                    value={skill.level}
                    className="h-1.5"
                    style={skill.color ? { "--progress-color": skill.color } as any : {}}
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{skill.yearsOfExperience}y exp</span>
                  <div className="flex gap-0.5">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                      onClick={() => handleToggleField(skill.id, "featured", !skill.featured)}>
                      <Star className={`h-3.5 w-3.5 ${skill.featured ? "fill-current text-yellow-500" : "text-muted-foreground"}`} />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                      onClick={() => handleToggleField(skill.id, "disabled", !skill.disabled)}>
                      {skill.disabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(skill)}>
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(skill.id, skill.name)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Skill" : "Add Skill"}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[72vh] pr-3">
            <div className="space-y-4 py-1">

              {/* Name + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label>Skill Name *</Label>
                  <Input
                    value={form.name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="React, Python, Docker…"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setF("category", v as SkillCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SKILL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Proficiency */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Proficiency Level</Label>
                  <span className="text-sm font-semibold text-primary">{form.level}%</span>
                </div>
                <Slider
                  value={[form.level]}
                  onValueChange={([v]) => setF("level", v)}
                  min={0} max={100} step={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Years of Experience</Label>
                  <Input type="number" min={0} max={30} value={form.yearsOfExperience}
                    onChange={e => setF("yearsOfExperience", Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Priority (1–100)</Label>
                  <Input type="number" min={1} max={100} value={form.priority}
                    onChange={e => setF("priority", Number(e.target.value))} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description || ""} onChange={e => setF("description", e.target.value)}
                  rows={2} placeholder="Brief description of your experience…" />
              </div>

              <Separator />

              {/* ── Icon & Color ── */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5" />
                  Icon & Color
                </h4>

                {/* Emoji / URL icon input */}
                <div className="space-y-1.5">
                  <Label>Icon (emoji or image URL)</Label>
                  <div className="flex gap-2 items-center">
                    <div
                      className="w-10 h-10 rounded-lg border flex items-center justify-center text-xl shrink-0"
                      style={form.color ? { backgroundColor: `${form.color}20`, borderColor: `${form.color}40` } : {}}
                    >
                      {form.icon && form.icon.startsWith("http") ? (
                        <img src={form.icon} alt="" className="w-7 h-7 object-contain" />
                      ) : (
                        <span>{form.icon || "🛠️"}</span>
                      )}
                    </div>
                    <Input
                      value={form.icon || ""}
                      onChange={e => setF("icon", e.target.value)}
                      placeholder="⚛️  or  https://cdn.../icon.svg"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Quick emoji picker */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Quick Pick (emoji)</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_ICONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setF("icon", emoji)}
                        className={`text-lg p-1 rounded hover:bg-muted transition-colors ${form.icon === emoji ? "bg-primary/10 ring-1 ring-primary" : ""}`}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lucide icon picker from SKILL_ICONS */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Skill Icons Library</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setShowIconPicker(p => !p)}
                    >
                      {showIconPicker ? "Hide" : "Browse"}
                    </Button>
                  </div>
                  {showIconPicker && (
                    <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          className="pl-7 h-7 text-xs"
                          placeholder="react, docker, aws…"
                          value={iconSearch}
                          onChange={e => setIconSearch(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-36">
                        <div className="flex flex-wrap gap-1">
                          {filteredIconKeys.slice(0, 80).map(key => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => {
                                // Use the tech name as context — user can refine icon/color via manual input
                                setF("icon", key.length <= 4 ? key : "");
                                // Auto-set color if not set
                                const autoColor = getSkillColor(key);
                                if (autoColor !== "#6B7280") setF("color", autoColor);
                                setShowIconPicker(false);
                              }}
                              className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                              title={key}
                            >
                              <span className="text-muted-foreground">{SKILL_ICONS[key]}</span>
                              <span>{key}</span>
                            </button>
                          ))}
                          {filteredIconKeys.length > 80 && (
                            <span className="text-xs text-muted-foreground px-2 py-1">
                              +{filteredIconKeys.length - 80} more — refine search
                            </span>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>

                {/* Color */}
                <div className="space-y-1.5">
                  <Label>Brand Color (hex)</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={form.color || "#6B7280"}
                      onChange={e => setF("color", e.target.value)}
                      className="h-9 w-10 rounded border cursor-pointer shrink-0"
                    />
                    <Input
                      value={form.color || ""}
                      onChange={e => setF("color", e.target.value)}
                      placeholder="#61DAFB"
                      className="flex-1"
                    />
                    {form.color && (
                      <div className="w-9 h-9 rounded-lg border shrink-0" style={{ backgroundColor: form.color }} />
                    )}
                  </div>
                </div>

                {/* Icon image upload */}
                <ImageUpload
                  label="Upload Custom Icon Image"
                  folder="skills/icons"
                  currentImageUrl={form.icon?.startsWith("http") ? form.icon : ""}
                  showUrlTab={false}
                  onUploadComplete={(url) => setF("icon", url)}
                  onRemove={() => setF("icon", "")}
                />
              </div>

              <Separator />

              {/* Certifications */}
              <div className="space-y-1.5">
                <Label>Certifications (comma-separated)</Label>
                <Input
                  value={(form.certifications || []).join(", ")}
                  onChange={e => setF("certifications", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                  placeholder="AWS Solutions Architect, Google Cloud Professional…"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Switch checked={form.featured} onCheckedChange={v => setF("featured", v)} />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.disabled} onCheckedChange={v => setF("disabled", v)} />
                  <Label>Hidden</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={(form as any).trending || false}
                    onCheckedChange={v => setForm(f => ({ ...f, trending: v } as any))}
                  />
                  <Label>🔥 Trending</Label>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-2">
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
