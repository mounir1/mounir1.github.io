import { useEffect, useMemo, useState } from "react";
import { 
  Award,
  Check
} from "lucide-react";
import { auth, db, isFirebaseEnabled } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Removed accessibility components to fix provider errors
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjects, PROJECTS_COLLECTION, type ProjectInput, DEFAULT_PROJECT, type Project } from "@/hooks/useProjects";
import { addDoc, collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { ProfessionalSignature } from "@/components/ui/signature";
import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { SkillsTab } from "@/components/admin/skills";
import { ThemeToggle } from "@/components/theme";
import { DashboardOverview } from "@/components/admin/dashboard";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { ProfessionalAdminDashboard } from "@/components/admin/ProfessionalAdminDashboard";
import { AdminLoading, DataLoading } from "@/components/ui/loading";
import { FirebaseConfigChecker } from "@/components/FirebaseConfigChecker";
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
  Activity,
  Zap,
  Shield,
  Sparkles,
  Crown,
  Palette,
  Code,
  Cpu,
  Server,
  Layers,
  Building2,
  Briefcase,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Target,
  LineChart,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import type { ClientInfo, ProjectMetrics, ProjectCategory, ProjectStatus } from "@/hooks/useProjects";
import { trackAdminAction, trackError, trackButtonClick } from "@/utils/analytics";
import { toast } from "@/hooks/use-toast";

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(() => auth?.currentUser ?? null);
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingProjectData, setEditingProjectData] = useState<ProjectInput | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const { projects, loading, refetch } = useProjects();

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        trackAdminAction('login_success', { user_email: u.email });
        setAuthError(null);
      }
    });
    return () => unsub();
  }, []);

  const canUseAdmin = isFirebaseEnabled && !!db && !!auth;

  const stats = useMemo(() => {
    const projectStats = {
      total: projects.length,
      featured: projects.filter(p => p.featured).length,
      active: projects.filter(p => !p.disabled).length,
      categories: [...new Set(projects.map(p => p.category))].length
    };
    
    return {
      projects: projectStats
    };
  }, [projects]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) {
      const error = "Firebase Auth is not available";
      setAuthError(error);
      trackError('auth_error', error, { location: 'admin_login' });
      return;
    }
    
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      trackAdminAction('login_attempt', { email });
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard!",
        variant: "default"
      });
    } catch (error: unknown) {
      console.error("Login failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
      setAuthError(errorMessage);
      trackError('login_failed', errorMessage, { 
        location: 'admin_login',
        email: email 
      });
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    if (!auth) return;
    try {
      trackAdminAction('logout_attempt', { user_email: user?.email });
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Logout failed";
      trackError('logout_failed', errorMessage, { location: 'admin_logout' });
      toast({
        title: "Logout Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }

  async function addProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!db) {
      const error = "Firestore database is not available";
      setOperationError(error);
      trackError('database_error', error, { location: 'add_project' });
      return;
    }
    
    setOperationLoading(true);
    setOperationError(null);
    
    const form = new FormData(e.currentTarget);
    
    const data: ProjectInput = {
      ...DEFAULT_PROJECT,
      title: String(form.get("title") || "Untitled"),
      description: String(form.get("description") || ""),
      longDescription: String(form.get("longDescription") || ""),
      category: String(form.get("category") || "Web Application") as ProjectCategory,
      status: String(form.get("status") || "completed") as ProjectStatus,
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
        size: String(form.get("clientSize") || "medium") as ClientInfo['size'],
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
      trackAdminAction('add_project', { 
        project_title: data.title,
        project_category: data.category,
        section: 'projects'
      });
      
      await addDoc(collection(db, PROJECTS_COLLECTION), data);
      e.currentTarget.reset();
      
      toast({
        title: "Project Added",
        description: `"${data.title}" has been successfully added.`,
        variant: "default"
      });
      
      // Refresh projects list
      await refetch();
    } catch (error) {
      console.error("Failed to add project:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add project";
      setOperationError(errorMessage);
      trackError('add_project_failed', errorMessage, { 
        location: 'add_project',
        project_title: data.title 
      });
      toast({
        title: "Add Project Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setOperationLoading(false);
    }
  }

  async function updateProject(id: string, updates: Partial<ProjectInput>) {
    if (!db) {
      const error = "Firestore database is not available";
      trackError('database_error', error, { location: 'update_project' });
      return;
    }
    
    try {
      trackAdminAction('update_project', { 
        project_id: id,
        section: 'projects'
      });
      
      await updateDoc(doc(db, PROJECTS_COLLECTION, id), {
        ...updates,
        updatedAt: Date.now(),
      });
      
      toast({
        title: "Project Updated",
        description: "Project has been successfully updated.",
        variant: "default"
      });
      
      // Refresh projects list
      await refetch();
    } catch (error) {
      console.error("Failed to update project:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update project";
      trackError('update_project_failed', errorMessage, { 
        location: 'update_project',
        project_id: id 
      });
      toast({
        title: "Update Project Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }

  async function deleteProject(id: string) {
    if (!db) {
      const error = "Firestore database is not available";
      trackError('database_error', error, { location: 'delete_project' });
      return;
    }
    
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }
    
    try {
      trackAdminAction('delete_project', { 
        project_id: id,
        section: 'projects'
      });
      
      await deleteDoc(doc(db, PROJECTS_COLLECTION, id));
      
      toast({
        title: "Project Deleted",
        description: "Project has been successfully deleted.",
        variant: "default"
      });
      
      // Refresh projects list
      await refetch();
    } catch (error) {
      console.error("Failed to delete project:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete project";
      trackError('delete_project_failed', errorMessage, { 
        location: 'delete_project',
        project_id: id 
      });
      toast({
        title: "Delete Project Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }

  function startEditingProject(project: Project) {
    setEditingProject(project.id);
    setEditingProjectData({ ...project });
    setActiveTab("add-project");
    trackAdminAction('start_edit_project', { 
      project_id: project.id,
      project_title: project.title,
      section: 'projects'
    });
  }

  async function saveEditedProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!db || !editingProject || !editingProjectData) {
      const error = "Missing required data for editing";
      setOperationError(error);
      trackError('edit_project_error', error, { location: 'save_edited_project' });
      return;
    }
    
    setOperationLoading(true);
    setOperationError(null);
    
    try {
      trackAdminAction('save_edited_project', { 
        project_id: editingProject,
        project_title: editingProjectData.title,
        section: 'projects'
      });
      
      await updateDoc(doc(db, PROJECTS_COLLECTION, editingProject), {
        ...editingProjectData,
        updatedAt: Date.now(),
      });
      
      setEditingProject(null);
      setEditingProjectData(null);
      setActiveTab("projects");
      
      toast({
        title: "Project Updated",
        description: `"${editingProjectData.title}" has been successfully updated.`,
        variant: "default"
      });
      
      // Refresh projects list
      await refetch();
    } catch (error) {
      console.error("Failed to update project:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update project";
      setOperationError(errorMessage);
      trackError('save_edited_project_failed', errorMessage, { 
        location: 'save_edited_project',
        project_id: editingProject 
      });
      toast({
        title: "Update Project Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setOperationLoading(false);
    }
  }

  function handleProjectFormChange(field: keyof ProjectInput, value: string | number | boolean | string[]) {
    if (editingProjectData) {
      setEditingProjectData({
        ...editingProjectData,
        [field]: value
      });
    }
  }

  function handleClientInfoChange(field: keyof ClientInfo, value: string | boolean) {
    if (editingProjectData?.clientInfo) {
      setEditingProjectData({
        ...editingProjectData,
        clientInfo: {
          ...editingProjectData.clientInfo,
          [field]: value
        }
      });
    }
  }

  function handleMetricsChange(field: keyof ProjectMetrics, value: string | number) {
    if (editingProjectData?.metrics) {
      setEditingProjectData({
        ...editingProjectData,
        metrics: {
          ...editingProjectData.metrics,
          [field]: value
        }
      });
    }
  }

  // Clear operation errors when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setOperationError(null);
    trackAdminAction('tab_change', { 
      tab: value,
      section: 'admin_navigation'
    });
  };

  if (!canUseAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-mesh relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-6s' }} />
        </div>
        
        <Card className="glass-card max-w-lg w-full shadow-2xl animate-scale-in border-0 backdrop-blur-xl relative z-10">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-glow transition-opacity" />
              <div className="relative bg-white dark:bg-gray-900 rounded-full p-4">
                <img src="/mounir-icon.svg" alt="Admin" className="w-12 h-12" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Admin Panel Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FirebaseConfigChecker showDetails={true} />
            
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0"
            >
              <Activity className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-mesh">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-6s' }} />
        </div>
        
        <div className="relative flex items-center justify-center min-h-screen p-6">
          <Card className="glass-card max-w-md w-full shadow-2xl animate-scale-in border-0 backdrop-blur-xl">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-6 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-75 group-hover:opacity-100 animate-glow transition-opacity" />
                <div className="relative bg-white dark:bg-gray-900 rounded-full p-4">
                  <img src="/mounir-icon.svg" alt="Admin" className="w-12 h-12" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <p className="text-white/80 mt-2 font-medium">Portfolio Admin Panel</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Display */}
              {authError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm backdrop-blur-sm animate-slide-up">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Authentication Error</span>
                  </div>
                  <p className="mt-1 text-red-200">{authError}</p>
                </div>
              )}

              {/* Email/Password Form */}
              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label className="text-white/90 font-medium flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                    Email Address
                  </Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="admin@example.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={authLoading}
                    required 
                    className="h-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/15 focus:border-purple-400/50 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/90 font-medium flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                    Password
                  </Label>
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={authLoading}
                    required 
                    className="h-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:bg-white/15 focus:border-purple-400/50 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={authLoading} 
                  className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden group"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {authLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Access Admin Panel
                      </>
                    )}
                  </span>
                </Button>
              </form>
              
              {/* Footer */}
              <div className="text-center pt-4">
                <p className="text-white/50 text-xs">
                  Secured by Firebase Authentication
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full">
      <div className="w-full py-4 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage your portfolio content and settings
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
        
        {canUseAdmin ? (
          <div className="w-full">
            <ProfessionalAdminDashboard user={user} />
          </div>
        ) : (
          <Card className="border-0 shadow-medium w-full">
            <CardHeader>
              <CardTitle>Admin Panel Unavailable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Firebase is not configured properly. Please check your environment variables.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}