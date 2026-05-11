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
import { useExperience, type ExperienceInput } from "@/hooks/useExperience";
import { db, isFirebaseEnabled } from "@/lib/firebase";
import { addDoc, collection, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { EXPERIENCE_COLLECTION } from "@/hooks/useExperience";
import {
  Plus, Edit, Trash2, Eye, EyeOff, Star, MapPin, Calendar,
  TrendingUp, Briefcase, ChevronDown, ChevronUp,
} from "lucide-react";

const DEFAULT_EXP: ExperienceInput = {
  title: "", company: "", location: "", type: "freelance",
  startDate: "", endDate: "", current: false,
  description: "", achievements: [], technologies: [],
  skills: [], responsibilities: [], featured: false,
  disabled: false, priority: 50, icon: "💼",
  createdAt: Date.now(), updatedAt: Date.now(),
};

export function ExperienceTab() {
  const { experiences, loading } = useExperience(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ExperienceInput>(DEFAULT_EXP);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  function openAdd() {
    setEditId(null);
    setForm({ ...DEFAULT_EXP, createdAt: Date.now(), updatedAt: Date.now() });
    setOpen(true);
  }

  function openEdit(exp: any) {
    setEditId(exp.id);
    setForm({ ...exp });
    setOpen(true);
  }

  async function handleSave() {
    if (!isFirebaseEnabled || !db) return;
    setSaving(true);
    try {
      const data: ExperienceInput = {
        ...form,
        updatedAt: Date.now(),
        achievements: form.achievements,
        technologies: form.technologies,
        skills: form.skills,
        responsibilities: form.responsibilities,
      };
      if (editId) {
        await updateDoc(doc(db, EXPERIENCE_COLLECTION, editId), data as any);
      } else {
        await addDoc(collection(db, EXPERIENCE_COLLECTION), { ...data, createdAt: Date.now() });
      }
      setOpen(false);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!db || !confirm("Delete this experience entry?")) return;
    await deleteDoc(doc(db, EXPERIENCE_COLLECTION, id));
  }

  async function toggleField(id: string, field: "disabled" | "featured", value: boolean) {
    if (!db) return;
    await updateDoc(doc(db, EXPERIENCE_COLLECTION, id), { [field]: value, updatedAt: Date.now() });
  }

  const setArr = (field: keyof ExperienceInput, raw: string) =>
    setForm((f) => ({ ...f, [field]: raw.split("\n").map((s) => s.trim()).filter(Boolean) }));

  const setArrComma = (field: keyof ExperienceInput, raw: string) =>
    setForm((f) => ({ ...f, [field]: raw.split(",").map((s) => s.trim()).filter(Boolean) }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Experience Management</h2>
          <p className="text-sm text-muted-foreground">{experiences.length} entries</p>
        </div>
        <Button onClick={openAdd} className="shadow-glow">
          <Plus className="h-4 w-4 mr-2" /> Add Experience
        </Button>
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

      <div className="space-y-3">
        {experiences.map((exp) => (
          <Card key={exp.id} className="border-0 shadow-medium overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-2xl mt-0.5">{exp.icon || "💼"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">{exp.title}</h3>
                      {exp.current && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-400/20 text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" /> Current
                        </Badge>
                      )}
                      {exp.featured && (
                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-400/20 text-xs">
                          <Star className="h-3 w-3 mr-1" /> Featured
                        </Badge>
                      )}
                      {exp.disabled && (
                        <Badge variant="secondary" className="bg-red-500/10 text-red-600 text-xs">Hidden</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{exp.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{exp.location}</span>
                      <span className="flex items-center gap-1 capitalize"><Calendar className="h-3 w-3" />{exp.type}</span>
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

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}>
                    {expanded === exp.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleField(exp.id, "featured", !exp.featured)}>
                    <Star className={`h-4 w-4 ${exp.featured ? "fill-current text-yellow-500" : ""}`} />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleField(exp.id, "disabled", !exp.disabled)}>
                    {exp.disabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(exp)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(exp.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expanded === exp.id && (
                <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                  <p className="text-sm text-muted-foreground">{exp.description}</p>
                  {exp.achievements?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Achievements</div>
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

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Experience" : "Add Experience"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Job Title *</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Senior Full-Stack Developer" />
              </div>
              <div className="space-y-1.5">
                <Label>Company *</Label>
                <Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} placeholder="Freelance" />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Algeria • Remote" />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["full-time", "part-time", "freelance", "contract", "internship", "consulting"].map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate || ""} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} disabled={form.current} />
              </div>
              <div className="space-y-1.5">
                <Label>Company URL</Label>
                <Input value={form.companyUrl || ""} onChange={(e) => setForm((f) => ({ ...f, companyUrl: e.target.value }))} placeholder="https://company.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Icon (emoji)</Label>
                <Input value={form.icon || ""} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="💼" />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch checked={form.current} onCheckedChange={(v) => setForm((f) => ({ ...f, current: v, endDate: v ? "" : f.endDate }))} />
                <Label>Currently working here</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.disabled} onCheckedChange={(v) => setForm((f) => ({ ...f, disabled: v }))} />
                <Label>Hidden</Label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe your role and responsibilities…" />
            </div>
            <div className="space-y-1.5">
              <Label>Achievements (one per line)</Label>
              <Textarea value={(form.achievements || []).join("\n")} onChange={(e) => setArr("achievements", e.target.value)} rows={4} placeholder="Reduced load time by 40%&#10;Served 100K+ users" />
            </div>
            <div className="space-y-1.5">
              <Label>Technologies (comma-separated)</Label>
              <Input value={(form.technologies || []).join(", ")} onChange={(e) => setArrComma("technologies", e.target.value)} placeholder="React, Node.js, TypeScript…" />
            </div>
            <div className="space-y-1.5">
              <Label>Skills (comma-separated)</Label>
              <Input value={(form.skills || []).join(", ")} onChange={(e) => setArrComma("skills", e.target.value)} placeholder="Leadership, Architecture, Communication…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Priority (1–100)</Label>
                <Input type="number" min={1} max={100} value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Company Logo URL</Label>
                <Input value={form.companyLogo || ""} onChange={(e) => setForm((f) => ({ ...f, companyLogo: e.target.value }))} placeholder="/logo.svg" />
              </div>
            </div>
          </div>
          <DialogFooter>
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
