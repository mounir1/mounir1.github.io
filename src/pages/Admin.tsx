/**
 * Admin Panel – Portfolio CMS
 * Tabs: Overview | Upload | Projects | Experience | Skills | Performance | Data Quality | Add Project
 */

import { useEffect, useMemo, useState } from "react";
import { auth, db, isFirebaseEnabled } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects, PROJECTS_COLLECTION, type ProjectInput, DEFAULT_PROJECT } from "@/hooks/useProjects";
import { useExperience } from "@/hooks/useExperience";
import { useSkills } from "@/hooks/useSkills";
import { addDoc, collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { ProfessionalSignature } from "@/components/ui/signature";
import { DataManager } from "@/components/admin/DataManager";
import { ExperienceManager } from "@/components/admin/ExperienceManager";
import { SkillsManager } from "@/components/admin/SkillsManager";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { PerformanceDashboard } from "@/components/admin/PerformanceDashboard";
import { DataQualityDashboard } from "@/components/admin/DataQualityDashboard";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Activity, BarChart3, Briefcase, Code2, Database, Edit,
  ExternalLink, Eye, EyeOff, Github, Globe, MessageSquare, Plus, Settings,
  Shield, Star, Trash2, TrendingUp, Upload, Zap,
} from "lucide-react";

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function StatCard({ icon, bg, value, label, sub }: { icon: React.ReactNode; bg: string; value: number; label: string; sub?: string; }) {
  return (
    <Card className="border-0 shadow-medium">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
          <div>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
            {sub && <div className="text-xs text-muted-foreground/70">{sub}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(() => auth?.currentUser ?? null);
  const [activeTab, setActiveTab] = useState("overview");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { projects, loading: projectsLoading } = useProjects();
  const { experiences } = useExperience();
  const { skills } = useSkills();

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  const canUseAdmin = isFirebaseEnabled && !!db && !!auth;

  const stats = useMemo(() => ({
    projTotal: projects.length,
    projFeatured: projects.filter(p => p.featured).length,
    projActive: projects.filter(p => !p.disabled).length,
    projCategories: new Set(projects.map(p => p.category)).size,
    expTotal: experiences.length,
    expCurrent: experiences.filter(e => e.current).length,
    skillTotal: skills.length,
    skillCategories: new Set(skills.map(s => s.category)).size,
  }), [projects, experiences, skills]);

  // ── Auth ──────────────────────────────────────────────────────────────────

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    setAuthLoading(true); setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(""); setPassword("");
    } catch (error: unknown) {
      setAuthError(error instanceof Error ? error.message : "Login failed.");
    } finally { setAuthLoading(false); }
  }

  async function handleGoogleLogin() {
    if (!auth) return;
    setAuthLoading(true); setAuthError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "";
      if (!msg.includes("popup-closed")) setAuthError(msg);
    } finally { setAuthLoading(false); }
  }

  // ── Project CRUD ──────────────────────────────────────────────────────────

  async function addProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!db) return;
    const form = new FormData(e.currentTarget);
    const data: ProjectInput = {
      ...DEFAULT_PROJECT,
      title: String(form.get("title") || "Untitled"),
      description: String(form.get("description") || ""),
      longDescription: String(form.get("longDescription") || ""),
      category: String(form.get("category") || "Web Application") as ProjectInput["category"],
      status: String(form.get("status") || "completed") as ProjectInput["status"],
      achievements: String(form.get("achievements") || "").split("\n").map(s => s.trim()).filter(Boolean),
      technologies: String(form.get("technologies") || "").split(",").map(s => s.trim()).filter(Boolean),
      tags: String(form.get("tags") || "").split(",").map(s => s.trim()).filter(Boolean),
      image: String(form.get("image") || ""),
      logo: String(form.get("logo") || ""),
      icon: String(form.get("icon") || ""),
      liveUrl: String(form.get("liveUrl") || ""),
      githubUrl: String(form.get("githubUrl") || ""),
      demoUrl: String(form.get("demoUrl") || ""),
      caseStudyUrl: String(form.get("caseStudyUrl") || ""),
      featured: form.get("featured") === "on",
      disabled: form.get("disabled") === "on",
      priority: Number(form.get("priority") || 50),
      startDate: String(form.get("startDate") || ""),
      endDate: String(form.get("endDate") || ""),
      duration: String(form.get("duration") || ""),
      teamSize: Number(form.get("teamSize") || 1),
      role: String(form.get("role") || "Full-Stack Developer"),
      clientInfo: {
        name: String(form.get("clientName") || ""),
        industry: String(form.get("clientIndustry") || ""),
        size: String(form.get("clientSize") || "medium") as ProjectInput["clientInfo"]["size"],
        location: String(form.get("clientLocation") || ""),
        website: String(form.get("clientWebsite") || ""),
        isPublic: form.get("clientIsPublic") === "on",
      },
      metrics: {
        usersReached: Number(form.get("usersReached") || 0),
        performanceImprovement: String(form.get("performanceImprovement") || ""),
        revenueImpact: String(form.get("revenueImpact") || ""),
        uptime: String(form.get("uptime") || ""),
        customMetrics: {},
      },
      challenges: String(form.get("challenges") || "").split("\n").map(s => s.trim()).filter(Boolean),
      solutions: String(form.get("solutions") || "").split("\n").map(s => s.trim()).filter(Boolean),
      createdAt: Date.now(), updatedAt: Date.now(), version: 1,
    };
    try {
      await addDoc(collection(db, PROJECTS_COLLECTION), data);
      e.currentTarget.reset();
    } catch (err) { console.error("Failed to add project:", err); }
  }

  async function updateProject(id: string, updates: Partial<ProjectInput>) {
    if (!db) return;
    try { await updateDoc(doc(db, PROJECTS_COLLECTION, id), { ...updates, updatedAt: Date.now() }); }
    catch (err) { console.error("Failed to update project:", err); }
  }

  async function deleteProject(id: string) {
    if (!db || !confirm("Delete this project?")) return;
    try { await deleteDoc(doc(db, PROJECTS_COLLECTION, id)); }
    catch (err) { console.error("Failed to delete project:", err); }
  }

  // ── Not configured ────────────────────────────────────────────────────────

  if (!canUseAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-subtle">
        <Card className="max-w-lg w-full shadow-glow border-0">
          <CardHeader className="text-center">
            <img src="/mounir-icon.svg" alt="Admin" className="w-16 h-16 mx-auto opacity-80 mb-4" />
            <CardTitle className="text-2xl">Admin Panel Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">Firebase is not configured. Check your environment variables.</p>
            <p className="text-xs text-muted-foreground/70">Required: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-subtle">
        <Card className="max-w-md w-full shadow-glow border-0">
          <CardHeader className="text-center">
            <img src="/mounir-icon.svg" alt="Admin Login" className="w-16 h-16 mx-auto opacity-80 mb-4" />
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <p className="text-muted-foreground">Sign in to manage your portfolio</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {authError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{authError}</div>}
              <Button onClick={handleGoogleLogin} disabled={authLoading} variant="outline" className="w-full h-12 text-base font-medium border-2">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {authLoading ? "Signing in…" : "Continue with Google"}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>
              <form className="space-y-4" onSubmit={handleLogin}>
                <Field label="Email"><Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={authLoading} required /></Field>
                <Field label="Password"><Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={authLoading} required /></Field>
                <Button type="submit" disabled={authLoading} className="w-full shadow-glow">{authLoading ? "Signing in…" : "Sign In with Email"}</Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Authenticated ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/mounir-icon.svg" alt="Admin" className="w-10 h-10" />
            <div>
              <h1 className="text-2xl font-bold">Portfolio Admin</h1>
              <p className="text-sm text-muted-foreground">Content Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ProfessionalSignature />
            <Button variant="outline" onClick={() => signOut(auth!)} size="sm">Sign Out</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <StatCard icon={<Database className="h-5 w-5 text-primary" />} bg="bg-primary/10" value={stats.projTotal} label="Projects" />
          <StatCard icon={<Star className="h-5 w-5 text-yellow-500" />} bg="bg-yellow-500/10" value={stats.projFeatured} label="Featured" />
          <StatCard icon={<Eye className="h-5 w-5 text-green-500" />} bg="bg-green-500/10" value={stats.projActive} label="Active" />
          <StatCard icon={<Activity className="h-5 w-5 text-orange-500" />} bg="bg-orange-500/10" value={stats.projCategories} label="Categories" />
          <StatCard icon={<Briefcase className="h-5 w-5 text-blue-500" />} bg="bg-blue-500/10" value={stats.expTotal} label="Roles" sub={`${stats.expCurrent} current`} />
          <StatCard icon={<Code2 className="h-5 w-5 text-purple-500" />} bg="bg-purple-500/10" value={stats.skillTotal} label="Skills" sub={`${stats.skillCategories} cats`} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2"><Upload className="h-4 w-4" />Upload</TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2"><Database className="h-4 w-4" />Projects</TabsTrigger>
            <TabsTrigger value="experiences" className="flex items-center gap-2"><Briefcase className="h-4 w-4" />Experience</TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2"><Code2 className="h-4 w-4" />Skills</TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2"><Zap className="h-4 w-4" />Performance</TabsTrigger>
            <TabsTrigger value="data-quality" className="flex items-center gap-2"><Shield className="h-4 w-4" />Data Quality</TabsTrigger>
            <TabsTrigger value="add-project" className="flex items-center gap-2"><Plus className="h-4 w-4" />Add Project</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-medium">
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Recent Projects</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <div className="flex-1"><div className="font-medium">{p.title}</div><div className="text-xs text-muted-foreground">{p.category}</div></div>
                        <Badge variant={p.featured ? "default" : "outline"}>{p.featured ? "Featured" : "Standard"}</Badge>
                      </div>
                    ))}
                    {projects.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No projects yet</p>}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-medium">
                <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Quick Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { tab: "upload", icon: <Upload className="h-4 w-4 mr-2" />, label: "Upload Portfolio Data" },
                    { tab: "add-project", icon: <Plus className="h-4 w-4 mr-2" />, label: "Add New Project" },
                    { tab: "experiences", icon: <Briefcase className="h-4 w-4 mr-2" />, label: "Manage Experience" },
                    { tab: "skills", icon: <Code2 className="h-4 w-4 mr-2" />, label: "Manage Skills" },
                    { tab: "performance", icon: <Zap className="h-4 w-4 mr-2" />, label: "Performance Monitor" },
                    { tab: "data-quality", icon: <Shield className="h-4 w-4 mr-2" />, label: "Data Quality Audit" },
                  ].map(({ tab, icon, label }) => (
                    <Button key={tab} onClick={() => setActiveTab(tab)} className="w-full justify-start" variant="outline">{icon}{label}</Button>
                  ))}
                  <Button onClick={() => window.open("/", "_blank")} className="w-full justify-start" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />View Live Site
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Upload */}
          <TabsContent value="upload"><DataManager /></TabsContent>

          {/* Projects */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />Project Management<Badge variant="outline">{projects.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading projects…</div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No projects found. Upload data or add a project.</div>
                ) : (
                  <div className="space-y-4">
                    {projects.map(project => (
                      <div key={project.id} className="border rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              {project.logo && <img src={project.logo} alt="" className="w-6 h-6 object-contain" />}
                              <h3 className="font-semibold text-lg truncate">{project.title}</h3>
                              <div className="flex gap-2 flex-wrap">
                                {project.featured && <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
                                <Badge variant="outline">{project.category}</Badge>
                                {project.disabled && <Badge variant="secondary" className="bg-red-500/10 text-red-600"><EyeOff className="h-3 w-3 mr-1" />Hidden</Badge>}
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm">{project.description}</p>
                            {project.technologies?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {project.technologies.slice(0, 5).map((t, i) => <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}
                                {project.technologies.length > 5 && <Badge variant="outline" className="text-xs">+{project.technologies.length - 5}</Badge>}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {project.liveUrl && <Button size="sm" variant="outline" asChild><a href={project.liveUrl} target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4" /></a></Button>}
                            {project.githubUrl && <Button size="sm" variant="outline" asChild><a href={project.githubUrl} target="_blank" rel="noopener noreferrer"><Github className="h-4 w-4" /></a></Button>}
                            <Button size="sm" variant="outline" onClick={() => updateProject(project.id, { disabled: !project.disabled })}>
                              {project.disabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateProject(project.id, { featured: !project.featured })}>
                              <Star className={`h-4 w-4 ${project.featured ? "fill-current text-yellow-500" : ""}`} />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteProject(project.id)} className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience */}
          <TabsContent value="experiences"><ExperienceManager /></TabsContent>

          {/* Skills */}
          <TabsContent value="skills"><SkillsManager /></TabsContent>

          {/* Performance */}
          <TabsContent value="performance"><PerformanceDashboard /></TabsContent>

          {/* Data Quality */}
          <TabsContent value="data-quality"><DataQualityDashboard /></TabsContent>

          {/* Add Project */}
          <TabsContent value="add-project" className="space-y-6">
            <Card className="border-0 shadow-medium">
              <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" />Add New Project</CardTitle></CardHeader>
              <CardContent>
                <form className="space-y-8" onSubmit={addProject}>
                  <Section title="Basic Information">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Field label="Project Title *"><Input name="title" placeholder="Amazing Project" required /></Field>
                        <Field label="Short Description *"><Textarea name="description" placeholder="Brief project description…" required /></Field>
                        <Field label="Detailed Description"><Textarea name="longDescription" placeholder="Full project description…" rows={4} /></Field>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Category">
                            <Select name="category">
                              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                              <SelectContent>
                                {["Web Application","Mobile Application","Enterprise Integration","E-commerce","Commerce Infrastructure","Machine Learning","API Development","DevOps & Infrastructure","Other"].map(c =>
                                  <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field label="Status">
                            <Select name="status">
                              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                              <SelectContent>
                                {["completed","in-progress","active","maintenance","archived"].map(s =>
                                  <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </Field>
                        </div>
                        <Field label="Technologies (comma-separated)"><Textarea name="technologies" placeholder="React, Node.js, TypeScript…" /></Field>
                        <Field label="Tags (comma-separated)"><Input name="tags" placeholder="react, frontend…" /></Field>
                      </div>
                    </div>
                  </Section>

                  <Section title="Media & Links">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Field label="Featured Image URL"><Input name="image" type="url" placeholder="https://…/image.jpg" /></Field>
                        <Field label="Company Logo URL"><Input name="logo" type="url" placeholder="/company-logo.svg" /></Field>
                        <Field label="Project Icon (emoji)"><Input name="icon" placeholder="🚀" /></Field>
                      </div>
                      <div className="space-y-4">
                        <Field label="Live URL"><Input name="liveUrl" type="url" placeholder="https://example.com" /></Field>
                        <Field label="GitHub URL"><Input name="githubUrl" type="url" placeholder="https://github.com/…" /></Field>
                        <Field label="Demo URL"><Input name="demoUrl" type="url" placeholder="https://demo.example.com" /></Field>
                        <Field label="Case Study URL"><Input name="caseStudyUrl" type="url" placeholder="https://case-study.com" /></Field>
                      </div>
                    </div>
                  </Section>

                  <Section title="Project Details">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Field label="Key Achievements (one per line)"><Textarea name="achievements" rows={4} placeholder="Improved performance by 40%&#10;Reduced loading time…" /></Field>
                        <Field label="Challenges (one per line)"><Textarea name="challenges" rows={3} /></Field>
                      </div>
                      <div className="space-y-4">
                        <Field label="Solutions (one per line)"><Textarea name="solutions" rows={3} /></Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Team Size"><Input name="teamSize" type="number" min="1" defaultValue="1" /></Field>
                          <Field label="Your Role"><Input name="role" placeholder="Full-Stack Developer" /></Field>
                        </div>
                      </div>
                    </div>
                  </Section>

                  <Section title="Timeline">
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="Start Date"><Input name="startDate" type="date" /></Field>
                      <Field label="End Date"><Input name="endDate" type="date" /></Field>
                      <Field label="Duration"><Input name="duration" placeholder="3 months" /></Field>
                    </div>
                  </Section>

                  <Section title="Settings">
                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex items-center gap-2"><Switch id="featured" name="featured" /><Label htmlFor="featured">Featured Project</Label></div>
                      <div className="flex items-center gap-2"><Switch id="disabled" name="disabled" /><Label htmlFor="disabled">Hide from Portfolio</Label></div>
                      <Field label="Priority (1–100)"><Input name="priority" type="number" min="1" max="100" defaultValue="50" className="w-20" /></Field>
                    </div>
                  </Section>

                  <Button type="submit" className="w-full shadow-glow"><Plus className="h-4 w-4 mr-2" />Add Project</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
