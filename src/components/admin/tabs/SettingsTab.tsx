import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings, type SiteSettings, type AvailabilityStatus } from "@/hooks/useSettings";
import {
  Settings, User, Globe, BarChart3, Zap, Save, Loader2,
  Linkedin, Github, Twitter, Youtube, Link, CheckCircle,
} from "lucide-react";

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "available", label: "Available", color: "bg-green-500" },
  { value: "limited", label: "Limited", color: "bg-yellow-500" },
  { value: "busy", label: "Busy", color: "bg-orange-500" },
  { value: "unavailable", label: "Unavailable", color: "bg-red-500" },
];

function SectionHeader({ icon: Icon, title, description }: { icon: any; title: string; description?: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b mb-5">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-base">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export function SettingsTab() {
  const { settings, loading, saveSettings } = useSettings();
  const [draft, setDraft] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Use draft if exists, else live settings
  const s = draft ?? settings;

  function patch<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setDraft((prev) => ({ ...(prev ?? settings), [key]: value }));
    setSaved(false);
  }

  function patchNested<K extends keyof SiteSettings>(
    section: K,
    key: keyof SiteSettings[K],
    value: any
  ) {
    setDraft((prev) => {
      const current = prev ?? settings;
      return {
        ...current,
        [section]: { ...(current[section] as any), [key]: value },
      };
    });
    setSaved(false);
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    try {
      await saveSettings(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save settings:", e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Bar */}
      <div className="flex items-center justify-between bg-card border rounded-xl p-4 shadow-sm sticky top-20 z-10">
        <div className="text-sm text-muted-foreground">
          {draft ? "You have unsaved changes" : "All changes saved"}
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !draft}
          className="shadow-glow"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <SectionHeader icon={User} title="Personal Info" description="Name, bio, availability" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={s.personalInfo.name}
                  onChange={(e) => patchNested("personalInfo", "name", e.target.value)}
                  placeholder="Mounir Abderrahmani"
                />
              </div>
              <div className="space-y-2">
                <Label>Title / Role</Label>
                <Input
                  value={s.personalInfo.title}
                  onChange={(e) => patchNested("personalInfo", "title", e.target.value)}
                  placeholder="Senior Full-Stack Developer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={s.personalInfo.bio}
                onChange={(e) => patchNested("personalInfo", "bio", e.target.value)}
                rows={3}
                placeholder="Short professional bio..."
              />
            </div>

            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={s.personalInfo.tagline ?? ""}
                onChange={(e) => patchNested("personalInfo", "tagline", e.target.value)}
                placeholder="Building the future, one commit at a time."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={s.personalInfo.email}
                  onChange={(e) => patchNested("personalInfo", "email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={s.personalInfo.phone ?? ""}
                  onChange={(e) => patchNested("personalInfo", "phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={s.personalInfo.location}
                  onChange={(e) => patchNested("personalInfo", "location", e.target.value)}
                  placeholder="Algeria • Remote"
                />
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={s.personalInfo.availability}
                  onValueChange={(v) => patchNested("personalInfo", "availability", v as AvailabilityStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${opt.color} inline-block`} />
                          {opt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Availability Note</Label>
              <Input
                value={s.personalInfo.availabilityNote ?? ""}
                onChange={(e) => patchNested("personalInfo", "availabilityNote", e.target.value)}
                placeholder="Open to remote contracts and full-time opportunities"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Profile Photo URL</Label>
                <Input
                  value={s.personalInfo.profilePhoto ?? ""}
                  onChange={(e) => patchNested("personalInfo", "profilePhoto", e.target.value)}
                  placeholder="/profile.webp"
                />
              </div>
              <div className="space-y-2">
                <Label>Resume URL</Label>
                <Input
                  value={s.personalInfo.resumeUrl ?? ""}
                  onChange={(e) => patchNested("personalInfo", "resumeUrl", e.target.value)}
                  placeholder="/Mounir_CV_2025.pdf"
                />
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={s.personalInfo.openToWork}
                  onCheckedChange={(v) => patchNested("personalInfo", "openToWork", v)}
                />
                <Label>Open to Work</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={s.personalInfo.remoteOnly}
                  onCheckedChange={(v) => patchNested("personalInfo", "remoteOnly", v)}
                />
                <Label>Remote Only</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Stats */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <SectionHeader icon={BarChart3} title="Hero Statistics" description="Numbers shown on the homepage" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  min={0}
                  value={s.heroStats.yearsExperience}
                  onChange={(e) =>
                    patchNested("heroStats", "yearsExperience", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Projects Completed</Label>
                <Input
                  type="number"
                  min={0}
                  value={s.heroStats.projectsCompleted}
                  onChange={(e) =>
                    patchNested("heroStats", "projectsCompleted", Number(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Users Served</Label>
                <Input
                  value={s.heroStats.usersServed}
                  onChange={(e) => patchNested("heroStats", "usersServed", e.target.value)}
                  placeholder="10K+"
                />
              </div>
              <div className="space-y-2">
                <Label>Client Satisfaction</Label>
                <Input
                  value={s.heroStats.clientSatisfaction}
                  onChange={(e) =>
                    patchNested("heroStats", "clientSatisfaction", e.target.value)
                  }
                  placeholder="98%"
                />
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Preview</p>
              <div className="flex gap-6 mt-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">{s.heroStats.yearsExperience}+</div>
                  <div className="text-xs">Years</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">{s.heroStats.projectsCompleted}+</div>
                  <div className="text-xs">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">{s.heroStats.usersServed}</div>
                  <div className="text-xs">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-primary">{s.heroStats.clientSatisfaction}</div>
                  <div className="text-xs">Satisfaction</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <SectionHeader icon={Link} title="Social Links" description="Profile URLs for social networks" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
              { key: "github", label: "GitHub", icon: Github, placeholder: "https://github.com/username" },
              { key: "twitter", label: "Twitter / X", icon: Twitter, placeholder: "https://twitter.com/username" },
              { key: "youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@channel" },
              { key: "devto", label: "Dev.to", icon: Globe, placeholder: "https://dev.to/username" },
              { key: "stackoverflow", label: "Stack Overflow", icon: Globe, placeholder: "https://stackoverflow.com/users/..." },
            ].map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key} className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </Label>
                <Input
                  value={(s.social as any)[key] ?? ""}
                  onChange={(e) => patchNested("social", key as any, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <SectionHeader icon={Globe} title="SEO & Metadata" description="Search engine optimization settings" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Title</Label>
              <Input
                value={s.seo.siteTitle}
                onChange={(e) => patchNested("seo", "siteTitle", e.target.value)}
                placeholder="Mounir Abderrahmani — Senior Full-Stack Developer"
              />
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea
                value={s.seo.siteDescription}
                onChange={(e) => patchNested("seo", "siteDescription", e.target.value)}
                rows={3}
                placeholder="Portfolio of Mounir Abderrahmani..."
              />
              <p className="text-xs text-muted-foreground">
                {s.seo.siteDescription.length}/160 chars recommended
              </p>
            </div>
            <div className="space-y-2">
              <Label>Keywords (comma-separated)</Label>
              <Textarea
                value={s.seo.keywords.join(", ")}
                onChange={(e) =>
                  patchNested(
                    "seo",
                    "keywords",
                    e.target.value.split(",").map((k) => k.trim()).filter(Boolean)
                  )
                }
                rows={2}
                placeholder="full-stack developer, react, node.js..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Twitter Handle</Label>
                <Input
                  value={s.seo.twitterHandle ?? ""}
                  onChange={(e) => patchNested("seo", "twitterHandle", e.target.value)}
                  placeholder="@username"
                />
              </div>
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input
                  value={s.seo.googleAnalyticsId ?? ""}
                  onChange={(e) => patchNested("seo", "googleAnalyticsId", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card className="border-0 shadow-medium lg:col-span-2">
          <CardHeader>
            <SectionHeader icon={Zap} title="Feature Flags" description="Toggle sections and features on the live site" />
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: "showTestimonials", label: "Testimonials Section" },
                { key: "showContactForm", label: "Contact Form" },
                { key: "showAvailabilityBanner", label: "Availability Banner" },
                { key: "showBlog", label: "Blog Section" },
                { key: "showServices", label: "Services Section" },
                { key: "showEducation", label: "Education Section" },
                { key: "showCertifications", label: "Certifications" },
                { key: "maintenanceMode", label: "Maintenance Mode" },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    (s.features as any)[key]
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/20 border-border/40"
                  }`}
                >
                  <Label className="cursor-pointer font-medium text-sm">{label}</Label>
                  <Switch
                    checked={(s.features as any)[key]}
                    onCheckedChange={(v) => patchNested("features", key as any, v)}
                  />
                </div>
              ))}
            </div>

            {s.features.maintenanceMode && (
              <div className="mt-4 space-y-2">
                <Label className="text-orange-600">Maintenance Message</Label>
                <Textarea
                  value={s.features.maintenanceMessage ?? ""}
                  onChange={(e) =>
                    patchNested("features", "maintenanceMessage", e.target.value)
                  }
                  placeholder="We're currently updating the site. Back soon!"
                  rows={2}
                  className="border-orange-300"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Status Badge */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Availability status:</span>
        <Badge
          className={
            s.personalInfo.availability === "available"
              ? "bg-green-500/15 text-green-700 border-green-500/30"
              : s.personalInfo.availability === "limited"
              ? "bg-yellow-500/15 text-yellow-700 border-yellow-500/30"
              : s.personalInfo.availability === "busy"
              ? "bg-orange-500/15 text-orange-700 border-orange-500/30"
              : "bg-red-500/15 text-red-700 border-red-500/30"
          }
        >
          {AVAILABILITY_OPTIONS.find((o) => o.value === s.personalInfo.availability)?.label}
        </Badge>
        {s.personalInfo.openToWork && (
          <Badge className="bg-green-500/15 text-green-700 border-green-500/30">
            Open to Work
          </Badge>
        )}
      </div>
    </div>
  );
}
