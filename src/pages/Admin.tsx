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
import { addDoc, collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
import { ProfessionalSignature } from "@/components/ui/signature";
import { DataManager } from "@/components/admin/DataManager";
import {
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Calendar,
  Globe,
  Github,
  ExternalLink,
  Settings,
  Users,
  TrendingUp,
  Database,
  Upload,
  Link,
  Clock,
  Save,
  X
} from "lucide-react";

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(() => auth?.currentUser ?? null);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { projects, loading } = useProjects();

  // Links Manager state
  const [links, setLinks] = useState<{id: string; label: string; url: string; category: string; description: string}[]>(() => {
    try { return JSON.parse(localStorage.getItem("portfolio_links") || "[]"); } catch { return []; }
  });
  const [newLink, setNewLink] = useState({ label: "", url: "", category: "Enterprise Solutions", description: "" });
  const [editingLink, setEditingLink] = useState<string | null>(null);

  // Upcoming Projects state
  const [upcomingProjects, setUpcomingProjects] = useState<{id: string; title: string; description: string; status: string; targetDate: string; technologies: string; priority: number}[]>(() => {
    try { return JSON.parse(localStorage.getItem("portfolio_upcoming") || "[]"); } catch { return []; }
  });
  const [newUpcoming, setNewUpcoming] = useState({ title: "", description: "", status: "planned", targetDate: "", technologies: "", priority: 50 });

  function saveLinks(updated: typeof links) {
    setLinks(updated);
    localStorage.setItem("portfolio_links", JSON.stringify(updated));
  }

  function saveUpcoming(updated: typeof upcomingProjects) {
    setUpcomingProjects(updated);
    localStorage.setItem("portfolio_upcoming", JSON.stringify(updated));
  }

  function addLink() {
    if (!newLink.label || !newLink.url) return;
    const updated = [...links, { ...newLink, id: Date.now().toString() }];
    saveLinks(updated);
    setNewLink({ label: "", url: "", category: "Enterprise Solutions", description: "" });
  }

  function removeLink(id: string) {
    saveLinks(links.filter(l => l.id !== id));
  }

  function addUpcomingProject() {
    if (!newUpcoming.title) return;
    const updated = [...upcomingProjects, { ...newUpcoming, id: Date.now().toString() }];
    saveUpcoming(updated);
    setNewUpcoming({ title: "", description: "", status: "planned", targetDate: "", technologies: "", priority: 50 });
  }

  function removeUpcoming(id: string) {
    saveUpcoming(upcomingProjects.filter(p => p.id !== id));
  }

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const canUseAdmin = isFirebaseEnabled && !!db && !!auth;

  const stats = useMemo(() => {
    const total = projects.length;
    const featured = projects.filter(p => p.featured).length;
    const active = projects.filter(p => !p.disabled).length;
    const categories = [...new Set(projects.map(p => p.category))].length;
    
    return { total, featured, active, categories };
  }, [projects]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) return;
    
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Login failed:", error);
      setAuthError(error.message || "Login failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!auth) return;
    
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google login failed:", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(error.message || "Google login failed. Please try again.");
      }
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    if (!auth) return;
    await signOut(auth);
  }

  async function addProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!db) return;
    
    const form = new FormData(e.currentTarget);
    
    const data: ProjectInput = {
      ...DEFAULT_PROJECT,
      title: String(form.get("title") || "Untitled"),
      description: String(form.get("description") || ""),
      longDescription: String(form.get("longDescription") || ""),
      category: String(form.get("category") || "Web Application") as any,
      status: String(form.get("status") || "completed") as any,
      achievements: String(form.get("achievements") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      technologies: String(form.get("technologies") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tags: String(form.get("tags") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
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
        size: String(form.get("clientSize") || "medium") as any,
        location: String(form.get("clientLocation") || ""),
        website: String(form.get("clientWebsite") || ""),
        isPublic: form.get("clientIsPublic") === "on"
      },
      metrics: {
        usersReached: Number(form.get("usersReached") || 0),
        performanceImprovement: String(form.get("performanceImprovement") || ""),
        revenueImpact: String(form.get("revenueImpact") || ""),
        uptime: String(form.get("uptime") || ""),
        customMetrics: {}
      },
      challenges: String(form.get("challenges") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      solutions: String(form.get("solutions") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1
    };

    try {
      await addDoc(collection(db, PROJECTS_COLLECTION), data);
      e.currentTarget.reset();
    } catch (error) {
      console.error("Failed to add project:", error);
    }
  }

  async function updateProject(id: string, updates: Partial<ProjectInput>) {
    if (!db) return;
    try {
      await updateDoc(doc(db, PROJECTS_COLLECTION, id), {
        ...updates,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  }

  async function deleteProject(id: string) {
    if (!db || !confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteDoc(doc(db, PROJECTS_COLLECTION, id));
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  }

  if (!canUseAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-subtle">
        <Card className="max-w-lg w-full shadow-glow border-0">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src="/mounir-icon.svg" alt="Admin" className="w-16 h-16 mx-auto opacity-80" />
            </div>
            <CardTitle className="text-2xl">Admin Panel Unavailable</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Firebase is not configured properly. Please check your environment variables and rebuild the application.
            </p>
            <div className="text-xs text-muted-foreground/70">
              Required: Firebase Auth, Firestore Database
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-subtle">
        <Card className="max-w-md w-full shadow-glow border-0">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <img src="/mounir-icon.svg" alt="Admin Login" className="w-16 h-16 mx-auto opacity-80" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <p className="text-muted-foreground">Sign in to manage your portfolio</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Error Display */}
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {authError}
                </div>
              )}

              {/* Google Sign In */}
              <Button 
                onClick={handleGoogleLogin}
                disabled={authLoading}
                variant="outline"
                className="w-full h-12 text-base font-medium border-2 hover:bg-muted/50 transition-all duration-300 disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {authLoading ? "Signing in..." : "Continue with Google"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="admin@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={authLoading}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="•••••••���" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={authLoading}
                    required 
                  />
                </div>
                <Button type="submit" disabled={authLoading} className="w-full shadow-glow">
                  {authLoading ? "Signing in..." : "Sign In with Email"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/mounir-icon.svg" alt="Admin" className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold">Portfolio Admin</h1>
                <p className="text-sm text-muted-foreground">Content Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProfessionalSignature />
              <Button variant="outline" onClick={handleLogout} size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.featured}</div>
                  <div className="text-sm text-muted-foreground">Featured</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Eye className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-medium">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.categories}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Data
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="add-project" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium">{project.title}</div>
                          <div className="text-xs text-muted-foreground">{project.category}</div>
                        </div>
                        <Badge variant={project.featured ? "default" : "outline"}>
                          {project.featured ? "Featured" : "Standard"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab("upload")} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Portfolio Data
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("add-project")} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Project
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("projects")} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Manage Projects
                  </Button>
                  <Button
                    onClick={() => setActiveTab("links")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Manage Links
                  </Button>
                  <Button
                    onClick={() => setActiveTab("upcoming")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Upcoming Projects
                  </Button>
                  <Button
                    onClick={() => window.open("/", "_blank")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live Site
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <DataManager />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Project Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading projects...</div>
                ) : !projects.length ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No projects found. Upload your portfolio data or add your first project to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              {project.logo && (
                                <img src={project.logo} alt="" className="w-6 h-6 object-contain" />
                              )}
                              <h3 className="font-semibold text-lg">{project.title}</h3>
                              <div className="flex gap-2">
                                {project.featured && (
                                  <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                                <Badge variant="outline">{project.category}</Badge>
                                {project.disabled && (
                                  <Badge variant="secondary" className="bg-red-500/10 text-red-600">
                                    <EyeOff className="h-3 w-3 mr-1" />
                                    Hidden
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{project.description}</p>
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {project.technologies.slice(0, 5).map((tech, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                                {project.technologies.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{project.technologies.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {project.liveUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                                  <Globe className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {project.githubUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                                  <Github className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProject(project.id, { disabled: !project.disabled })}
                            >
                              {project.disabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateProject(project.id, { featured: !project.featured })}
                            >
                              <Star className={`h-4 w-4 ${project.featured ? 'fill-current text-yellow-500' : ''}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteProject(project.id)}
                              className="text-red-600 hover:text-red-700"
                            >
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

          {/* Links Manager Tab */}
          <TabsContent value="links" className="space-y-6">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Links Manager
                </CardTitle>
                <p className="text-sm text-muted-foreground">Manage portfolio links, project URLs, and external references displayed on the site.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Link Form */}
                <div className="border rounded-lg p-4 space-y-4 bg-muted/10">
                  <h3 className="font-semibold">Add New Link</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        placeholder="hotech.systems"
                        value={newLink.label}
                        onChange={e => setNewLink(p => ({ ...p, label: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        placeholder="https://hotech.systems"
                        value={newLink.url}
                        onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newLink.category} onValueChange={v => setNewLink(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Enterprise Solutions">Enterprise Solutions</SelectItem>
                          <SelectItem value="Web Applications">Web Applications</SelectItem>
                          <SelectItem value="Open Source">Open Source</SelectItem>
                          <SelectItem value="MAB Modules">MAB Modules</SelectItem>
                          <SelectItem value="Adobe Commerce">Adobe Commerce</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Brief description..."
                        value={newLink.description}
                        onChange={e => setNewLink(p => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button onClick={addLink} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>

                {/* Pre-populated default links */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Saved Links ({links.length})</h3>
                    {links.length === 0 && (
                      <Button variant="outline" size="sm" onClick={() => saveLinks([
                        { id: "1", label: "hotech.systems", url: "https://hotech.systems", category: "Enterprise Solutions", description: "Hospitality digital transformation platform" },
                        { id: "2", label: "HoTech EN", url: "https://en.hotech.systems", category: "Enterprise Solutions", description: "English portal for HoTech Systems" },
                        { id: "3", label: "technostationery.com", url: "https://technostationery.com", category: "Enterprise Solutions", description: "E-commerce for office supplies" },
                        { id: "4", label: "ETL Platform", url: "https://etl.techno-dz.com", category: "Enterprise Solutions", description: "ETL data processing platform" },
                        { id: "5", label: "MAB Modules", url: "https://mab-modules.github.io", category: "MAB Modules", description: "Open-source Adobe Commerce module library" },
                        { id: "6", label: "JSKit App", url: "https://jskit-app.web.app", category: "Web Applications", description: "JavaScript development toolkit" },
                        { id: "7", label: "Noor Al Maarifa", url: "https://www.nooralmaarifa.com", category: "Web Applications", description: "Educational platform" },
                        { id: "8", label: "IT Collaborator", url: "https://it-collaborator-techno.web.app", category: "Web Applications", description: "Project management platform" },
                      ])}>
                        Load Defaults
                      </Button>
                    )}
                  </div>
                  {links.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">No links saved yet. Add a link above or click "Load Defaults".</p>
                  ) : (
                    <div className="space-y-2">
                      {links.map(link => (
                        <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            <Badge variant="outline" className="text-xs shrink-0">{link.category}</Badge>
                            <div>
                              <div className="font-medium text-sm">{link.label}</div>
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">{link.url}</a>
                              {link.description && <div className="text-xs text-muted-foreground">{link.description}</div>}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => removeLink(link.id)} className="text-red-600 hover:text-red-700 shrink-0">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Projects Tab */}
          <TabsContent value="upcoming" className="space-y-6">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Projects
                </CardTitle>
                <p className="text-sm text-muted-foreground">Track planned and in-development projects for the portfolio roadmap.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Upcoming Project Form */}
                <div className="border rounded-lg p-4 space-y-4 bg-muted/10">
                  <h3 className="font-semibold">Add Upcoming Project</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Title *</Label>
                      <Input
                        placeholder="New SaaS Platform"
                        value={newUpcoming.title}
                        onChange={e => setNewUpcoming(p => ({ ...p, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={newUpcoming.status} onValueChange={v => setNewUpcoming(p => ({ ...p, status: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="in-development">In Development</SelectItem>
                          <SelectItem value="beta">Beta</SelectItem>
                          <SelectItem value="soon">Coming Soon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Date</Label>
                      <Input
                        type="date"
                        value={newUpcoming.targetDate}
                        onChange={e => setNewUpcoming(p => ({ ...p, targetDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority (1–100)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={newUpcoming.priority}
                        onChange={e => setNewUpcoming(p => ({ ...p, priority: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="What will this project do?"
                        value={newUpcoming.description}
                        onChange={e => setNewUpcoming(p => ({ ...p, description: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Technologies (comma separated)</Label>
                      <Input
                        placeholder="React, Node.js, TypeScript..."
                        value={newUpcoming.technologies}
                        onChange={e => setNewUpcoming(p => ({ ...p, technologies: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button onClick={addUpcomingProject} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Upcoming Project
                  </Button>
                </div>

                {/* Upcoming Projects List */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Upcoming Projects ({upcomingProjects.length})</h3>
                  {upcomingProjects.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">No upcoming projects added yet. Plan something!</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingProjects.sort((a,b) => b.priority - a.priority).map(project => (
                        <div key={project.id} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{project.title}</h4>
                              <Badge variant={project.status === 'in-development' ? 'default' : 'outline'} className="text-xs">
                                {project.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">P{project.priority}</Badge>
                            </div>
                            {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
                            <div className="flex flex-wrap gap-2 text-xs">
                              {project.technologies && project.technologies.split(",").map((t, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{t.trim()}</Badge>
                              ))}
                              {project.targetDate && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {project.targetDate}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => removeUpcoming(project.id)} className="text-red-600 hover:text-red-700 shrink-0 ml-3">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-project" className="space-y-6">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Project
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-8" onSubmit={addProject}>
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Project Title *</Label>
                          <Input id="title" name="title" placeholder="Amazing Project" required />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Short Description *</Label>
                          <Textarea id="description" name="description" placeholder="Brief project description..." required />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="longDescription">Detailed Description</Label>
                          <Textarea id="longDescription" name="longDescription" placeholder="Detailed project description..." rows={4} />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select name="category">
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Web Application">Web Application</SelectItem>
                                <SelectItem value="Mobile Application">Mobile Application</SelectItem>
                                <SelectItem value="Enterprise Integration">Enterprise Integration</SelectItem>
                                <SelectItem value="E-commerce">E-commerce</SelectItem>
                                <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                                <SelectItem value="API Development">API Development</SelectItem>
                                <SelectItem value="DevOps & Infrastructure">DevOps & Infrastructure</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status">
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="technologies">Technologies (comma separated)</Label>
                          <Textarea id="technologies" name="technologies" placeholder="React, Node.js, TypeScript..." />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="tags">Tags (comma separated)</Label>
                          <Input id="tags" name="tags" placeholder="react, frontend, responsive..." />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Media & Links */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Media & Links</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="image">Featured Image URL</Label>
                          <Input id="image" name="image" type="url" placeholder="https://example.com/image.jpg" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="logo">Company Logo URL</Label>
                          <Input id="logo" name="logo" type="url" placeholder="/company-logo.svg" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="icon">Project Icon (emoji)</Label>
                          <Input id="icon" name="icon" placeholder="🚀" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="liveUrl">Live URL</Label>
                          <Input id="liveUrl" name="liveUrl" type="url" placeholder="https://example.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="githubUrl">GitHub URL</Label>
                          <Input id="githubUrl" name="githubUrl" type="url" placeholder="https://github.com/..." />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="demoUrl">Demo URL</Label>
                          <Input id="demoUrl" name="demoUrl" type="url" placeholder="https://demo.example.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="caseStudyUrl">Case Study URL</Label>
                          <Input id="caseStudyUrl" name="caseStudyUrl" type="url" placeholder="https://case-study.com" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Project Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="achievements">Key Achievements (one per line)</Label>
                          <Textarea id="achievements" name="achievements" placeholder="Improved performance by 40%&#10;Reduced loading time by 2 seconds&#10;Increased user engagement by 25%" rows={4} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="challenges">Challenges (one per line)</Label>
                          <Textarea id="challenges" name="challenges" placeholder="Complex data integration&#10;Performance optimization&#10;Scalability requirements" rows={3} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="solutions">Solutions (one per line)</Label>
                          <Textarea id="solutions" name="solutions" placeholder="Implemented microservices&#10;Used caching strategies&#10;Built auto-scaling system" rows={3} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="teamSize">Team Size</Label>
                            <Input id="teamSize" name="teamSize" type="number" min="1" defaultValue="1" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Your Role</Label>
                            <Input id="role" name="role" placeholder="Full-Stack Developer" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Timeline</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" name="startDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input id="endDate" name="endDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input id="duration" name="duration" placeholder="3 months" />
                      </div>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Client Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientName">Client Name</Label>
                          <Input id="clientName" name="clientName" placeholder="Company Name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clientIndustry">Industry</Label>
                          <Input id="clientIndustry" name="clientIndustry" placeholder="Technology" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clientWebsite">Client Website</Label>
                          <Input id="clientWebsite" name="clientWebsite" type="url" placeholder="https://client.com" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientSize">Company Size</Label>
                          <Select name="clientSize">
                            <SelectTrigger>
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="startup">Startup</SelectItem>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clientLocation">Location</Label>
                          <Input id="clientLocation" name="clientLocation" placeholder="City, Country" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch id="clientIsPublic" name="clientIsPublic" />
                          <Label htmlFor="clientIsPublic">Public Client</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Project Metrics</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="usersReached">Users Reached</Label>
                          <Input id="usersReached" name="usersReached" type="number" placeholder="10000" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="performanceImprovement">Performance Improvement</Label>
                          <Input id="performanceImprovement" name="performanceImprovement" placeholder="75% faster processing" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="revenueImpact">Revenue Impact</Label>
                          <Input id="revenueImpact" name="revenueImpact" placeholder="$1M+ revenue increase" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="uptime">Uptime</Label>
                          <Input id="uptime" name="uptime" placeholder="99.9%" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Settings</h3>
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                        <Switch id="featured" name="featured" />
                        <Label htmlFor="featured">Featured Project</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch id="disabled" name="disabled" />
                        <Label htmlFor="disabled">Hide from Portfolio</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority (1-100)</Label>
                        <Input id="priority" name="priority" type="number" min="1" max="100" defaultValue="50" className="w-20" />
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full shadow-glow">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}