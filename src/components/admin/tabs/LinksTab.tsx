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
import { Plus, Trash2, ExternalLink, Link, Loader2, RefreshCw, Edit, Download } from "lucide-react";

const PRESET_CATEGORIES = [
  "Enterprise Solutions", "Web Applications", "Open Source",
  "MAB Modules", "Adobe Commerce", "Consulting", "Other",
];

const EMPTY_LINK: PortfolioLinkInput = {
  label: "", url: "", category: "Enterprise Solutions",
  description: "", icon: "", active: true, priority: 50, openInNewTab: true,
};

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

function LinkFormFields({
  form,
  categories,
  onChange,
}: {
  form: PortfolioLinkInput;
  categories: string[];
  onChange: (key: keyof PortfolioLinkInput, value: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Label *</Label>
          <Input
            value={form.label}
            onChange={(e) => onChange("label", e.target.value)}
            placeholder="hotech.systems"
          />
        </div>
        <div className="space-y-1.5">
          <Label>URL *</Label>
          <Input
            value={form.url}
            onChange={(e) => onChange("url", e.target.value)}
            placeholder="https://hotech.systems"
            type="url"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => onChange("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Icon (emoji)</Label>
          <Input
            value={form.icon ?? ""}
            onChange={(e) => onChange("icon", e.target.value)}
            placeholder="🌐"
            className="w-full"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>Description</Label>
          <Input
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Brief description…"
          />
        </div>
      </div>
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Switch checked={form.openInNewTab} onCheckedChange={(v) => onChange("openInNewTab", v)} />
          <Label className="text-sm">Open in new tab</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.active} onCheckedChange={(v) => onChange("active", v)} />
          <Label className="text-sm">Active</Label>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Priority</Label>
          <Input
            type="number" min={1} max={100}
            value={form.priority}
            onChange={(e) => onChange("priority", Number(e.target.value))}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
}

export function LinksTab() {
  const { links, loading, addLink, deleteLink, updateLink, seedDefaults } = useLinks();

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState<PortfolioLinkInput>({ ...EMPTY_LINK });
  const [addSaving, setAddSaving] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PortfolioLinkInput>({ ...EMPTY_LINK });
  const [editSaving, setEditSaving] = useState(false);

  const [seeding, setSeeding] = useState(false);

  // Dynamic categories = union of presets + live data categories
  const allCategories = [...new Set([...PRESET_CATEGORIES, ...links.map((l) => l.category)])];

  function openEdit(link: PortfolioLink) {
    setEditId(link.id);
    setEditForm({
      label: link.label,
      url: link.url,
      category: link.category,
      description: link.description,
      icon: link.icon ?? "",
      active: link.active,
      priority: link.priority,
      openInNewTab: link.openInNewTab,
    });
    setEditOpen(true);
  }

  async function handleAdd() {
    if (!addForm.label || !addForm.url) return;
    setAddSaving(true);
    try {
      await addLink(addForm);
      setAddForm({ ...EMPTY_LINK });
      setAddOpen(false);
    } finally { setAddSaving(false); }
  }

  async function handleEdit() {
    if (!editId || !editForm.label || !editForm.url) return;
    setEditSaving(true);
    try {
      await updateLink(editId, editForm);
      setEditOpen(false);
      setEditId(null);
    } finally { setEditSaving(false); }
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    await deleteLink(id);
  }

  async function handleSeedDefaults() {
    setSeeding(true);
    try { await seedDefaults(); }
    finally { setSeeding(false); }
  }

  // Group by category (only categories that have links)
  const categorised = allCategories.reduce((acc, cat) => {
    const catLinks = links.filter((l) => l.category === cat);
    if (catLinks.length > 0) acc[cat] = catLinks;
    return acc;
  }, {} as Record<string, typeof links>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">Links Manager</h2>
          <p className="text-sm text-muted-foreground">
            {links.length} links · Stored in Firebase (syncs to live site footer)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => downloadJSON(links, "links")}>
            <Download className="h-4 w-4 mr-2" />Export JSON
          </Button>
          {links.length === 0 && (
            <Button variant="outline" onClick={handleSeedDefaults} disabled={seeding}>
              {seeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Load Defaults
            </Button>
          )}
          <Button onClick={() => { setAddForm({ ...EMPTY_LINK }); setAddOpen(true); }} className="shadow-glow">
            <Plus className="h-4 w-4 mr-2" />Add Link
          </Button>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="h-4 w-4" />Add New Link</DialogTitle>
          </DialogHeader>
          <LinkFormFields
            form={addForm}
            categories={allCategories}
            onChange={(key, value) => setAddForm((f) => ({ ...f, [key]: value }))}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addSaving || !addForm.label || !addForm.url} className="shadow-glow">
              {addSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Edit className="h-4 w-4" />Edit Link</DialogTitle>
          </DialogHeader>
          <LinkFormFields
            form={editForm}
            categories={allCategories}
            onChange={(key, value) => setEditForm((f) => ({ ...f, [key]: value }))}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={editSaving || !editForm.label || !editForm.url} className="shadow-glow">
              {editSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Edit className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Loading */}
      {loading && <div className="text-center py-8 text-muted-foreground">Loading links…</div>}

      {/* Empty state */}
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
            {catLinks.sort((a, b) => b.priority - a.priority).map((link) => (
              <div
                key={link.id}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  link.active ? "bg-card/50 border-border/50" : "bg-muted/20 border-border/30 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {link.icon && <span className="text-base shrink-0">{link.icon}</span>}
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
                    onCheckedChange={(v) => updateLink(link.id, { active: v })}
                    className="scale-75"
                  />
                  <Button
                    size="sm" variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => openEdit(link)}
                    title="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(link.id, link.label)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
