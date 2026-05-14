import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useExperience, type ExperienceInput, EXPERIENCE_COLLECTION } from "@/hooks/useExperience";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { addDoc, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { BrandAssetPicker } from "@/components/admin/BrandAssetPicker";
import {
  Plus, Edit, Trash2, Eye, EyeOff, Star, MapPin, Calendar,
  TrendingUp, Briefcase, ChevronDown, ChevronUp, Building2, Palette, Download,
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

const DEFAULT_EXP: ExperienceInput = {
  title: "", company: "", companyUrl: "", companyLogo: "",
  location: "", type: "freelance",
  startDate: "", endDate: "", current: false,
  description: "", achievements: [], technologies: [],
  projects: [], skills: [], responsibilities: [], featured: false,
  disabled: false, priority: 50, icon: "💼",
  createdAt: Date.now(), updatedAt: Date.now(),
};

const EXP_TYPES = ["full-time", "part-time", "freelance", "contract", "internship", "consulting"];

export function ExperienceTab() {
  const { experiences, loading } = useExperience(true);
  // export all experience records as JSON
  const handleExport = () => {
    const ts = new Date().toISOString().slice(0, 10);
    downloadJSON(experiences, `experience-${ts}.json`);
  };
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ExperienceInput>(DEFAULT_EXP);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [logoOpen, setLogoOpen] = useState(false);

  function setF<K extends keyof ExperienceInput>(key: K, value: ExperienceInput[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function setArr(field: keyof ExperienceInput, raw: string) {
    setForm(f => ({ ...f, [field]: raw.split("\n").map(s => s.trim()).filter(Boolean) }));
  }

  function setArrComma(field: keyof ExperienceInput, raw: string) {
    setForm(f => ({ ...f, [field]: raw.split(",").map(s => s.trim()).filter(Boolean) }));
  }

  function openAdd() {
    setEditId(null);
    setForm({ ...DEFAULT_EXP, createdAt: Date.now(), updatedAt: Date.now() });
    setLogoOpen(false);
    setOpen(true);
  }

  function openEdit(exp: any) {
    setEditId(exp.id);
    setForm({ ...DEFAULT_EXP, ...exp });
    setLogoOpen(false);
    setOpen(true);
  }

  function handleBrandAsset(logoUrl: string, iconUrl: string) {
    if (logoUrl) setF("companyLogo" as any, logoUrl);
    else if (iconUrl) setF("companyLogo" as any, iconUrl);
  }

  async function handleSave() {
    if (!isFirebaseEnabled || !db) return;
    setSaving(true);
    try {
      const data: ExperienceInput = { ...form, updatedAt: Date.now() };
      if (editId) {
        await updateDoc(doc(db, EXPERIENCE_COLLECTION, editId), data as any);
      } else {
        await addDoc(collection(db, EXPERIENCE_COLLECTION), { ...data, createdAt: Date.now() });
      }
      setOpen(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string, title: string) {
    if (!db || !confirm(`Delete "${title}"?`)) return;
    await deleteDoc(doc(db, EXPERIENCE_COLLECTION, id));
  }

  async function toggleField(id: string, field: "disabled" | "featured", value: boolean) {
    if (!db) return;
    await updateDoc(doc(db, EXPERIENCE_COLLECTION, id), { [field]: value, updatedAt: Date.now() });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Experience Management</h2>
          <p className="text-sm text-muted-foreground">{experiences.length} entries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={experiences.length === 0}>
            <Download className="h-4 w-4 mr-2" />Export JSON
          </Button>
          <Button onClick={openAdd} className="shadow-glow">
            <Plus className="h-4 w-4 mr-2" />Add Experience
          </Button>
        </div>
      </div>

      {loading && <div className="text-center py-8 text-muted-foreground">Loading…</div>}

      {!loading && experiences.length === 0 && (
        <Card className="border-0 shadow-medium">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No experience entries. Add your first role!</p>
          </CardContent>
        </Card>
      )}

      {/* Experience Cards */}
      <div className="space-y-3">
        {experiences.map((exp) => (
          <Card key={exp.id} className={`border-0 shadow-medium overflow-hidden ${exp.disabled ? "opacity-60" : ""}`}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Company logo or icon */}
                  <div className="shrink-0 w-11 h-11 rounded-lg bg-muted/50 border flex items-center justify-center overflow-hidden">
                    {(exp as any).companyLogo ? (
                      <img
                        src={(exp as any).companyLogo}
                        alt={exp.company}
                        className="w-8 h-8 object-contain"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <span className="text-xl">{exp.icon || "💼"}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">{exp.title}</h3>
                      {exp.current && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-400/20 text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />Current
                        </Badge>
                      )}
                      {exp.featured && (
                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-400/20 text-xs">
                          <Star className="h-3 w-3 mr-1 fill-current" />Featured
                        </Badge>
                      )}
                      {exp.disabled && (
                        <Badge variant="secondary" className="bg-red-500/10 text-red-600 text-xs">Hidden</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />{exp.company}
                      </span>
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{exp.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1 capitalize">
                        <Calendar className="h-3 w-3" />{exp.type}
                      </span>
                    </div>
                    {exp.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exp.technologies.slice(0, 5).map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                        ))}
                        {exp.technologies.length > 5 && (
                          <Badge variant="outline" className="text-xs">+{exp.technologies.length - 5}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0"
                    onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}>
                    {expanded === exp.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0"
                    onClick={() => toggleField(exp.id, "featured", !exp.featured)}>
                    <Star className={`h-4 w-4 ${exp.featured ? "fill-current text-yellow-500" : ""}`} />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0"
                    onClick={() => toggleField(exp.id, "disabled", !exp.disabled)}>
                    {exp.disabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => openEdit(exp)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(exp.id, exp.title)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === exp.id && (
                <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                  {exp.description && <p className="text-sm text-muted-foreground">{exp.description}</p>}
                  {exp.achievements?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
                        Achievements
                      </div>
                      <ul className="space-y-1">
                        {exp.achievements.map((a, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Experience" : "Add Experience"}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[74vh] pr-3">
            <div className="space-y-5 py-1">

              {/* ── Basic Info ── */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Basic Info</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 col-span-2">
                    <Label>Job Title *</Label>
                    <Input
                      value={form.title}
                      onChange={e => setF("title", e.target.value)}
                      placeholder="Senior Full-Stack Developer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Company *</Label>
                    <Input value={form.company} onChange={e => setF("company", e.target.value)} placeholder="HoTech Systems" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input value={form.location} onChange={e => setF("location", e.target.value)} placeholder="Algeria • Remote" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={v => setF("type", v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EXP_TYPES.map(t => (
                          <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Company URL</Label>
                    <Input value={(form as any).companyUrl || ""} onChange={e => setF("companyUrl" as any, e.target.value)} placeholder="https://company.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Start Date</Label>
                    <Input type="date" value={form.startDate} onChange={e => setF("startDate", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={form.endDate || ""}
                      onChange={e => setF("endDate", e.target.value)}
                      disabled={form.current}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Icon (emoji)</Label>
                    <Input value={form.icon || ""} onChange={e => setF("icon", e.target.value)} placeholder="💼" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Priority (1–100)</Label>
                    <Input
                      type="number" min={1} max={100}
                      value={form.priority}
                      onChange={e => setF("priority", Number(e.target.value))}
                    />
                  </div>
                </div>
              </section>

              {/* ── Toggles ── */}
              <div className="flex gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.current}
                    onCheckedChange={v => setForm(f => ({ ...f, current: v, endDate: v ? "" : f.endDate }))}
                  />
                  <Label>Currently working here</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.featured} onCheckedChange={v => setF("featured", v)} />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.disabled} onCheckedChange={v => setF("disabled", v)} />
                  <Label>Hidden</Label>
                </div>
              </div>

              <Separator />

              {/* ── Company Logo & Brand Assets ── */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5" />
                  Company Logo & Brand Assets
                </h4>

                {/* Current logo preview + URL input */}
                <div className="space-y-1.5">
                  <Label>Company Logo URL</Label>
                  <div className="flex gap-2 items-center">
                    {(form as any).companyLogo && (
                      <div className="shrink-0 w-10 h-10 rounded border bg-white flex items-center justify-center overflow-hidden">
                        <img
                          src={(form as any).companyLogo}
                          alt="logo"
                          className="w-8 h-8 object-contain"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                    )}
                    <Input
                      value={(form as any).companyLogo || ""}
                      onChange={e => setF("companyLogo" as any, e.target.value)}
                      placeholder="/hotech-logo.svg  or  https://..."
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Logo + Brand collapsible */}
                <Collapsible open={logoOpen} onOpenChange={setLogoOpen}>
                  <CollapsibleTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="w-full justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        Upload Logo / Fetch from Brandfetch
                      </span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${logoOpen ? "rotate-180" : ""}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-3">
                    <ImageUpload
                      label="Upload Logo File"
                      folder="experience/logos"
                      currentImageUrl=""
                      showUrlTab={false}
                      onUploadComplete={url => setF("companyLogo" as any, url)}
                      onRemove={() => setF("companyLogo" as any, "")}
                    />
                    <BrandAssetPicker
                      label="Auto-Fetch Company Logo (Brandfetch)"
                      currentLogoUrl={(form as any).companyLogo}
                      onAssetSelect={handleBrandAsset}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </section>

              <Separator />

              {/* ── Description & Content ── */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Role Content</h4>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={e => setF("description", e.target.value)}
                    rows={3}
                    placeholder="Describe your role and impact…"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Achievements (one per line)</Label>
                  <Textarea
                    value={(form.achievements || []).join("\n")}
                    onChange={e => setArr("achievements", e.target.value)}
                    rows={4}
                    placeholder="Reduced load time by 40%&#10;Served 100K+ users"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Responsibilities (one per line)</Label>
                  <Textarea
                    value={(form.responsibilities || []).join("\n")}
                    onChange={e => setArr("responsibilities", e.target.value)}
                    rows={3}
                    placeholder="Led technical architecture&#10;Mentored junior developers"
                  />
                </div>
              </section>

              <Separator />

              {/* ── Skills & Technologies ── */}
              <section className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Skills & Technologies</h4>
                <div className="space-y-1.5">
                  <Label>Technologies (comma-separated)</Label>
                  <Input
                    value={(form.technologies || []).join(", ")}
                    onChange={e => setArrComma("technologies", e.target.value)}
                    placeholder="React, Node.js, TypeScript…"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Skills (comma-separated)</Label>
                  <Input
                    value={(form.skills || []).join(", ")}
                    onChange={e => setArrComma("skills", e.target.value)}
                    placeholder="Leadership, Architecture, Communication…"
                  />
                </div>
              </section>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title || !form.company} className="shadow-glow">
              {saving ? "Saving…" : editId ? "Save Changes" : "Add Experience"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
