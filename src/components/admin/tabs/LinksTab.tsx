import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLinks, type PortfolioLinkInput } from "@/hooks/useLinks";
import { Plus, Trash2, ExternalLink, Link, Loader2, RefreshCw } from "lucide-react";

const LINK_CATEGORIES = [
  "Enterprise Solutions", "Web Applications", "Open Source",
  "MAB Modules", "Adobe Commerce", "Consulting", "Other",
];

const EMPTY_LINK: PortfolioLinkInput = {
  label: "", url: "", category: "Enterprise Solutions",
  description: "", active: true, priority: 50, openInNewTab: true,
};

export function LinksTab() {
  const { links, loading, addLink, deleteLink, updateLink, seedDefaults } = useLinks();
  const [form, setForm] = useState<PortfolioLinkInput>(EMPTY_LINK);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function handleAdd() {
    if (!form.label || !form.url) return;
    setSaving(true);
    try {
      await addLink(form);
      setForm(EMPTY_LINK);
    } finally { setSaving(false); }
  }

  async function handleSeedDefaults() {
    setSeeding(true);
    try { await seedDefaults(); }
    finally { setSeeding(false); }
  }

  const categorised = LINK_CATEGORIES.reduce((acc, cat) => {
    const catLinks = links.filter(l => l.category === cat);
    if (catLinks.length > 0) acc[cat] = catLinks;
    return acc;
  }, {} as Record<string, typeof links>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Links Manager</h2>
          <p className="text-sm text-muted-foreground">
            {links.length} links · Stored in Firebase (syncs to live site footer)
          </p>
        </div>
        {links.length === 0 && (
          <Button variant="outline" onClick={handleSeedDefaults} disabled={seeding}>
            {seeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Load Defaults
          </Button>
        )}
      </div>

      {/* Add Link Form */}
      <Card className="border-0 shadow-medium">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add New Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div className="space-y-1.5">
              <Label>Label *</Label>
              <Input
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="hotech.systems"
              />
            </div>
            <div className="space-y-1.5">
              <Label>URL *</Label>
              <Input
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://hotech.systems"
                type="url"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LINK_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description…"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Switch checked={form.openInNewTab} onCheckedChange={v => setForm(f => ({ ...f, openInNewTab: v }))} />
              <Label className="text-sm">Open in new tab</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} />
              <Label className="text-sm">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Priority</Label>
              <Input
                type="number" min={1} max={100}
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                className="w-20"
              />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={saving || !form.label || !form.url} className="shadow-glow">
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Add Link
          </Button>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && <div className="text-center py-8 text-muted-foreground">Loading links…</div>}

      {/* Links by Category */}
      {!loading && links.length === 0 && (
        <Card className="border-0 shadow-medium">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Link className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No links yet. Add one above or load the defaults.</p>
          </CardContent>
        </Card>
      )}

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
                  <div className="flex items-center gap-2 flex-1 min-w-0">
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
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">P{link.priority}</Badge>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <Switch
                    checked={link.active}
                    onCheckedChange={v => updateLink(link.id, { active: v })}
                    className="scale-75"
                  />
                  <Button
                    size="sm" variant="ghost"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                    onClick={() => deleteLink(link.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Uncategorised */}
      {!loading && links.filter(l => !LINK_CATEGORIES.includes(l.category)).length > 0 && (
        <Card className="border-0 shadow-medium">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Other</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {links.filter(l => !LINK_CATEGORIES.includes(l.category)).map(link => (
              <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                <div>
                  <div className="font-medium text-sm">{link.label}</div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">{link.url}</a>
                </div>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500" onClick={() => deleteLink(link.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
