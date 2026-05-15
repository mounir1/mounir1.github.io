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
import { useTestimonials, DEFAULT_TESTIMONIAL, type TestimonialInput } from "@/hooks/useTestimonials";
import { Plus, Edit, Trash2, Eye, EyeOff, Star, MessageSquare, ExternalLink, Loader2, Download } from "lucide-react";

function downloadJSON(data: any[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`text-xl transition-transform hover:scale-110 ${
            s <= rating ? "text-yellow-400" : "text-muted-foreground/30"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function TestimonialsTab() {
  const { testimonials, loading, addTestimonial, updateTestimonial, deleteTestimonial } =
    useTestimonials(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TestimonialInput>({ ...DEFAULT_TESTIMONIAL });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof TestimonialInput>(key: K, value: TestimonialInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openAdd() {
    setEditId(null);
    setForm({ ...DEFAULT_TESTIMONIAL });
    setOpen(true);
  }

  function openEdit(t: any) {
    setEditId(t.id);
    setForm({
      author:      t.author      ?? "",
      role:        t.role        ?? "",
      company:     t.company     ?? "",
      companyUrl:  t.companyUrl  ?? "",
      avatar:      t.avatar      ?? "",
      linkedin:    t.linkedin    ?? "",
      content:     t.content     ?? "",
      rating:      t.rating      ?? 5,
      projectName: t.projectName ?? "",
      projectId:   t.projectId   ?? "",
      date:        t.date        ?? "",
      source:      t.source      ?? "linkedin",
      sourceUrl:   t.sourceUrl   ?? "",
      verified:    t.verified    ?? false,
      featured:    t.featured    ?? false,
      disabled:    t.disabled    ?? false,
      priority:    t.priority    ?? 50,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.author || !form.content) return;
    setSaving(true);
    try {
      if (editId) await updateTestimonial(editId, form);
      else await addTestimonial(form);
      setOpen(false);
    } catch (e) {
      console.error("Failed to save testimonial:", e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial? This cannot be undone.")) return;
    await deleteTestimonial(id);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Testimonials</h2>
          <Button variant="outline" size="sm" onClick={() => downloadJSON(testimonials, "testimonials")}>
            <Download className="h-4 w-4 mr-2" />Export JSON
          </Button>
          <p className="text-sm text-muted-foreground">
            {testimonials.length} total · {testimonials.filter((t) => t.featured && !t.disabled).length} featured
          </p>
        </div>
        <Button onClick={openAdd} className="shadow-glow">
          <Plus className="h-4 w-4 mr-2" />
          Add Testimonial
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty */}
      {!loading && testimonials.length === 0 && (
        <Card className="border-0 shadow-medium">
          <CardContent className="py-14 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No testimonials yet</p>
            <p className="text-sm">Add your first client review to build social proof.</p>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-3">
        {testimonials.map((t) => (
          <Card
            key={t.id}
            className={`border-0 shadow-medium transition-opacity ${t.disabled ? "opacity-50" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.author}
                      className="w-10 h-10 rounded-full object-cover border border-border/60"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {t.author.charAt(0) || "?"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm">{t.author}</span>
                    {t.featured && (
                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-400/20 text-xs">
                        <Star className="h-2.5 w-2.5 mr-0.5" />Featured
                      </Badge>
                    )}
                    {t.verified && (
                      <Badge className="bg-green-500/10 text-green-700 border-green-400/20 text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                    {t.disabled && (
                      <Badge className="bg-red-500/10 text-red-600 text-xs">Hidden</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.role}{t.company ? ` · ${t.company}` : ""}
                  </div>
                  <StarRating rating={t.rating} />
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">"{t.content}"</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <Badge variant="outline" className="text-xs capitalize">{t.source}</Badge>
                    {t.projectName && <span>Project: {t.projectName}</span>}
                    {t.date && <span>{t.date}</span>}
                    {t.sourceUrl && (
                      <a
                        href={t.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> View
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
                    onClick={() => updateTestimonial(t.id, { featured: !t.featured })}
                    title={t.featured ? "Unfeature" : "Feature"}
                  >
                    <Star className={`h-4 w-4 ${t.featured ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => updateTestimonial(t.id, { disabled: !t.disabled })}
                    title={t.disabled ? "Show" : "Hide"}
                  >
                    {t.disabled
                      ? <Eye className="h-4 w-4" />
                      : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => openEdit(t)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(t.id)}
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

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Author info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Author Name *</Label>
                <Input
                  value={form.author}
                  onChange={(e) => set("author", e.target.value)}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role / Title</Label>
                <Input
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  placeholder="CEO"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input
                  value={form.company ?? ""}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Company URL</Label>
                <Input
                  value={form.companyUrl ?? ""}
                  onChange={(e) => set("companyUrl", e.target.value)}
                  placeholder="https://acme.com"
                  type="url"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Avatar URL</Label>
                <Input
                  value={form.avatar ?? ""}
                  onChange={(e) => set("avatar", e.target.value)}
                  placeholder="https://…/photo.jpg"
                />
              </div>
              <div className="space-y-1.5">
                <Label>LinkedIn URL</Label>
                <Input
                  value={form.linkedin ?? ""}
                  onChange={(e) => set("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Project Name</Label>
                <Input
                  value={form.projectName ?? ""}
                  onChange={(e) => set("projectName", e.target.value)}
                  placeholder="E-commerce Platform"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date ?? ""}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <StarRating rating={form.rating} onChange={(r) => set("rating", r)} />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <Label>Testimonial Content *</Label>
              <Textarea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                rows={4}
                placeholder="What the client said about working with you…"
              />
            </div>

            {/* Source */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Select
                  value={form.source}
                  onValueChange={(v) => set("source", v as any)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["linkedin", "email", "upwork", "direct", "referral", "other"].map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Source URL</Label>
                <Input
                  value={form.sourceUrl ?? ""}
                  onChange={(e) => set("sourceUrl", e.target.value)}
                  placeholder="https://linkedin.com/…"
                  type="url"
                />
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label>Priority (1–100)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.priority}
                onChange={(e) => set("priority", Number(e.target.value))}
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-5 pt-1">
              {[
                { key: "featured", label: "Featured" },
                { key: "verified", label: "Verified" },
                { key: "disabled", label: "Hidden" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <Switch
                    checked={!!(form as any)[key]}
                    onCheckedChange={(v) => set(key as any, v)}
                  />
                  <Label>{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.author || !form.content}
              className="shadow-glow"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {saving ? "Saving…" : editId ? "Save Changes" : "Add Testimonial"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
