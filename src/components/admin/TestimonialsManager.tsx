/**
 * TestimonialsManager – Full CRUD admin panel for the testimonials collection.
 * Features: add, inline edit, delete-with-confirm, toggle featured/disabled,
 *           star-rating picker, priority ordering, real-time Firebase sync.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFirestoreCRUD } from "@/hooks/useFirestoreCRUD";
import { COLLECTIONS } from "@/lib/database-schema";
import type { TestimonialSchema } from "@/lib/database-schema";
import {
  Edit,
  Eye,
  EyeOff,
  MessageSquare,
  Plus,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  clientName: "",
  clientTitle: "",
  clientCompany: "",
  clientPhoto: "",
  content: "",
  rating: 5,
  projectId: "",
  experienceId: "",
  featured: false,
  disabled: false,
  priority: 50,
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`h-5 w-5 ${
              s <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TestimonialsManager() {
  const FALLBACK: Omit<TestimonialSchema, "id">[] = [];

  const { documents: testimonials, loading, error, add, update, remove, toggleField } =
    useFirestoreCRUD<TestimonialSchema>({
      collectionName: COLLECTIONS.TESTIMONIALS,
      fallbackData: FALLBACK,
      includeDisabled: true,
    });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TestimonialSchema>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState({ ...EMPTY_FORM });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  function startEdit(t: TestimonialSchema) {
    setEditingId(t.id);
    setEditForm({ ...t });
  }

  async function saveEdit() {
    if (!editingId) return;
    await update(editingId, editForm);
    setEditingId(null);
    setEditForm({});
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await add({
      ...newForm,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setNewForm({ ...EMPTY_FORM });
    setShowAddForm(false);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Testimonials
              <Badge variant="outline">{testimonials.length}</Badge>
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowAddForm((v) => !v)}
              className="shadow-glow"
            >
              {showAddForm ? (
                <><X className="h-4 w-4 mr-2" />Cancel</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" />Add Testimonial</>
              )}
            </Button>
          </div>
        </CardHeader>

        {/* Error banner */}
        {error && (
          <CardContent className="pt-0">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          </CardContent>
        )}

        {/* Add form */}
        {showAddForm && (
          <CardContent className="pt-0">
            <form
              onSubmit={handleAdd}
              className="border rounded-xl p-5 bg-muted/20 space-y-4"
            >
              <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                New Testimonial
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Client Name *</Label>
                  <Input
                    required
                    placeholder="Ahmed Benali"
                    value={newForm.clientName}
                    onChange={(e) =>
                      setNewForm((f) => ({ ...f, clientName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input
                    placeholder="CTO"
                    value={newForm.clientTitle}
                    onChange={(e) =>
                      setNewForm((f) => ({ ...f, clientTitle: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Company</Label>
                  <Input
                    placeholder="HoTech Systems"
                    value={newForm.clientCompany}
                    onChange={(e) =>
                      setNewForm((f) => ({
                        ...f,
                        clientCompany: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Testimonial Content *</Label>
                <Textarea
                  required
                  rows={3}
                  placeholder="What the client said about your work…"
                  value={newForm.content}
                  onChange={(e) =>
                    setNewForm((f) => ({ ...f, content: e.target.value }))
                  }
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Photo URL</Label>
                  <Input
                    placeholder="https://…/photo.jpg"
                    value={newForm.clientPhoto}
                    onChange={(e) =>
                      setNewForm((f) => ({
                        ...f,
                        clientPhoto: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Rating</Label>
                  <StarRating
                    value={newForm.rating}
                    onChange={(v) => setNewForm((f) => ({ ...f, rating: v }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={newForm.priority}
                    onChange={(e) =>
                      setNewForm((f) => ({
                        ...f,
                        priority: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newForm.featured}
                    onCheckedChange={(v) =>
                      setNewForm((f) => ({ ...f, featured: v }))
                    }
                  />
                  <Label>Featured</Label>
                </div>
              </div>
              <Button type="submit" className="shadow-glow">
                <Plus className="h-4 w-4 mr-2" />Add Testimonial
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading testimonials…
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-xl">
          No testimonials yet. Add the first one above.
        </div>
      ) : (
        <div className="space-y-4">
          {testimonials.map((t) =>
            editingId === t.id ? (
              /* ─ Edit Mode ─ */
              <Card key={t.id} className="border-primary/40 shadow-medium">
                <CardContent className="p-5 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Client Name</Label>
                      <Input
                        value={editForm.clientName ?? ""}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            clientName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input
                        value={editForm.clientTitle ?? ""}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            clientTitle: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Company</Label>
                      <Input
                        value={editForm.clientCompany ?? ""}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            clientCompany: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Content</Label>
                    <Textarea
                      rows={3}
                      value={editForm.content ?? ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, content: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Photo URL</Label>
                      <Input
                        value={editForm.clientPhoto ?? ""}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            clientPhoto: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Rating</Label>
                      <StarRating
                        value={editForm.rating ?? 5}
                        onChange={(v) =>
                          setEditForm((f) => ({ ...f, rating: v }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Priority</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={editForm.priority ?? 50}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            priority: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button onClick={saveEdit} className="shadow-glow">
                      <Save className="h-4 w-4 mr-2" />Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setEditingId(null); setEditForm({}); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* ─ View Mode ─ */
              <Card
                key={t.id}
                className={`border-0 shadow-medium transition-opacity ${
                  t.disabled ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      {t.clientPhoto ? (
                        <img
                          src={t.clientPhoto}
                          alt={t.clientName}
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-lg font-bold text-primary">
                          {t.clientName.charAt(0)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold">{t.clientName}</span>
                          <span className="text-muted-foreground text-sm">
                            {t.clientTitle}
                            {t.clientCompany && ` · ${t.clientCompany}`}
                          </span>
                          {t.featured && (
                            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                              <Star className="h-3 w-3 mr-1" />Featured
                            </Badge>
                          )}
                          {t.disabled && (
                            <Badge variant="secondary" className="bg-red-500/10 text-red-600">
                              <EyeOff className="h-3 w-3 mr-1" />Hidden
                            </Badge>
                          )}
                        </div>
                        {/* Stars */}
                        <div className="flex gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < t.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/20"
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            {t.rating}/5
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                          "{t.content}"
                        </p>
                        <div className="text-xs text-muted-foreground/60 mt-1">
                          Priority: {t.priority} · Added{" "}
                          {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        title={t.disabled ? "Show" : "Hide"}
                        onClick={() => toggleField(t.id, "disabled")}
                      >
                        {t.disabled ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        title="Toggle Featured"
                        onClick={() => toggleField(t.id, "featured")}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            t.featured
                              ? "fill-yellow-400 text-yellow-400"
                              : ""
                          }`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(t)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {confirmDeleteId === t.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              await remove(t.id);
                              setConfirmDeleteId(null);
                            }}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setConfirmDeleteId(t.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
