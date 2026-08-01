import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLinks, type PortfolioLink, type PortfolioLinkInput } from "@/hooks/useLinks";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ExternalLink, Link, Loader2, RefreshCw, Download, Edit } from "lucide-react";

const LINK_CATEGORIES = [
  "Enterprise Solutions", "Web Applications", "Open Source",
  "MAB Modules", "Adobe Commerce", "Consulting", "Other",
];

const EMPTY_LINK: PortfolioLinkInput = {
  label: "", url: "", category: "Enterprise Solutions",
  description: "", icon: "", active: true, priority: 50, openInNewTab: true,
};

function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Shared form fields ───────────────────────────────────────────────────────
function LinkFormFields({
  form,
  onChange,
  categories,
}: {
  form: PortfolioLinkInput;
  onChange: (f: PortfolioLinkInput) => void;
  categories: string[];
}) {
  function set<K extends keyof PortfolioLinkInput>(key: K, value: PortfolioLinkInput[K]) {
    onChange({ ...form, [key]: value });
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Label *</Label>
          <Input value={form.label} onChange={e => set("label", e.target.value)} placeholder="hotech.systems" />
        </div>
        <div className="space-y-1.5">
          <Label>URL *</Label>
          <Input value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://hotech.systems" type="url" />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Icon (emoji or URL)</Label>
          <Input value={form.icon ?? ""} onChange={e => set("icon", e.target.value)} placeholder="🔗 or https://..." />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label>Description</Label>
          <Input value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description…" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={form.active} onCheckedChange={v => set("active", v)} />
          <Label className="text-sm">Active</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.openInNewTab} onCheckedChange={v => set("openInNewTab", v)} />
          <Label className="text-sm">Open in new tab</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Priority</Label>
          <Input
            type="number" min={1} max={100}
            value={form.priority}
            onChange={e => set("priority", Number(e.target.value))}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LinksTab() {
  const { links, loading, addLink, deleteLink, updateLink, seedDefaults } = useLinks();
  const { toast } = useToast();

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<PortfolioLinkInput>({ ...EMPTY_LINK });

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PortfolioLinkInput>({ ...EMPTY_LINK });

  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  function openEdit(link: PortfolioLink) {
    setEditId(link.id);
    setEditForm({
      label: link.label, url: link.url, category: link.category,
      description: link.description ?? "", icon: link.icon ?? "",
      active: link.active, priority: link.priority, openInNewTab: link.openInNewTab,
    });
    setEditOpen(true);
  }

  async function handleAdd() {
    if (!addForm.label || !addForm.url) return;
    setSaving(true);
    try {
      await addLink(addForm);
      setAddForm({ ...EMPTY_LINK });
      setAddOpen(false);
      toast({ title: "Link added", description: addForm.label });
    } catch (e) {
      toast({ title: "Failed to add link", description: String(e), variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleEditSave() {
    if (!editId || !editForm.label || !editForm.url) return;
    setSaving(true);
    try {
      await updateLink(editId, editForm);
      setEditOpen(false);
      toast({ title: "Link updated", description: editForm.label });
    } catch (e) {
      toast({ title: "Failed to update link", description: String(e), variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleToggle(id: string, active: boolean) {
    try {
      await updateLink(id, { active });
      toast({ title: active ? "Link activated" : "Link hidden" });
    } catch (e) {
      toast({ title: "Failed to toggle link", description: String(e), variant: "destructive" });
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    try {
      await deleteLink(id);
      toast({ title: "Link deleted", description: label });
    } catch (e) {
      toast({ title: "Failed to delete link", description: String(e), variant: "destructive" });
    }
  }

  async function handleSeedDefaults() {
    setSeeding(true);
    try { await seedDefaults(); }
    finally { setSeeding(false); }
  }

  // Dynamic category grouping from live data + defaults
  const allCats = [...new Set([...LINK_CATEGORIES, ...links.map(l => l.category)])];
  const categorised = allCats.reduce((acc, cat) => {
    const catLinks = links.filter(l => l.category === cat);
    if (catLinks.length > 0) acc[cat] = catLinks;
    return acc;
  }, {} as Record<string, PortfolioLink[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Links Manager</h2>
          <p className="text-sm text-muted-foreground">
            {links.length} links · Stored in Firebase (syncs to live site)
          </p>
        </div>
        <div className="flex gap-2">
          {links.length === 0 && (
            <Button variant="outline" onClick={handleSeedDefaults} disabled={seeding}>
              {seeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Load Defaults
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => { const ts = new Date().toISOString().slice(0,10); downloadJSON(links, `links-${ts}.json`); }} disabled={!links.length}>
            <Download className="h-4 w-4 mr-2" />Export JSON
          </Button>
          <Button onClick={() => { setAddForm({ ...EMPTY_LINK }); setAddOpen(true); }} className="shadow-glow">
            <Plus className="h-4 w-4 mr-2" />Add Link
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="text-center py-8 text-muted-foreground">Loading links…</div>}

      {/* Empty */}
      {!loading && links.length === 0 && (
        <Card className="border-0 shadow-medium">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Link className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No links yet. Add one above or load the defaults.</p>
          </CardContent>
        </Card>
      )}

      {/* Links by Category */}
      {!loading && Object.entries(categorised).map(([category, catLinks]) => (
        <Card key={category} className="border-0 shadow-medium">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {category} · {catLinks.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {catLinks.sort((a, b) => b.priority - a.priority).map(link => (
              <div
                key={link.id}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  link.active ? "bg-card/50 border-border/50" : "bg-muted/20 border-border/30 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {link.icon && <span className="text-lg shrink-0">{link.icon}</span>}
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{link.label}</div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      <span className="truncate max-w-[200px]">{link.url}</span>
                    </a>
                    {link.description && (
                      <div className="text-xs text-muted-foreground truncate">{link.description}</div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0 ml-2">P{link.priority}</Badge>
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <Switch
                    checked={link.active}
                    onCheckedChange={v => handleToggle(link.id, v)}
                    className="scale-75"
                  />
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-primary" onClick={() => openEdit(link)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(link.id, link.label)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* ── Add Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Link</DialogTitle></DialogHeader>
          <LinkFormFields form={addForm} onChange={setAddForm} categories={allCats} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving || !addForm.label || !addForm.url} className="shadow-glow">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Link</DialogTitle></DialogHeader>
          <LinkFormFields form={editForm} onChange={setEditForm} categories={allCats} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={saving || !editForm.label || !editForm.url} className="shadow-glow">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
