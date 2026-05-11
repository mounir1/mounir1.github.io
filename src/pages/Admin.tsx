import { useEffect, useState, useRef } from "react";
import { isFirebaseEnabled, db, getFirebaseAuth } from "@/lib/firebase";
// Auth types sourced inline to avoid any static module reference to firebase/auth
// that would pull the auth SDK into the synchronous entry chunk.
type Auth = import("firebase/auth").Auth;
type User = import("firebase/auth").User;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessionalSignature } from "@/components/ui/signature";

// Tab components
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { ProjectsTab } from "@/components/admin/tabs/ProjectsTab";
import { ExperienceTab } from "@/components/admin/tabs/ExperienceTab";
import { SkillsTab } from "@/components/admin/tabs/SkillsTab";
import { TestimonialsTab } from "@/components/admin/tabs/TestimonialsTab";
import { LinksTab } from "@/components/admin/tabs/LinksTab";
import { UpcomingTab } from "@/components/admin/tabs/UpcomingTab";
import { MessagesTab } from "@/components/admin/tabs/MessagesTab";
import { SettingsTab } from "@/components/admin/tabs/SettingsTab";
import { DataManager } from "@/components/admin/DataManager";
import { useContactMessages } from "@/hooks/useContactMessages";

import {
  BarChart3, Database, Briefcase, Wrench, MessageSquareQuote,
  Link, Clock, Mail, Settings, Upload, LogOut, ExternalLink,
  User as UserIcon,
} from "lucide-react";

// ─── Tab config ──────────────────────────────────────────────────────────────

const TAB_ITEMS = [
  { id: "overview",      label: "Overview",      icon: BarChart3,           shortLabel: "Overview" },
  { id: "projects",      label: "Projects",      icon: Database,            shortLabel: "Projects" },
  { id: "experience",    label: "Experience",    icon: Briefcase,           shortLabel: "Experience" },
  { id: "skills",        label: "Skills",        icon: Wrench,              shortLabel: "Skills" },
  { id: "testimonials",  label: "Testimonials",  icon: MessageSquareQuote,  shortLabel: "Reviews" },
  { id: "links",         label: "Links",         icon: Link,                shortLabel: "Links" },
  { id: "upcoming",      label: "Upcoming",      icon: Clock,               shortLabel: "Upcoming" },
  { id: "messages",      label: "Messages",      icon: Mail,                shortLabel: "Messages" },
  { id: "upload",        label: "Data Upload",   icon: Upload,              shortLabel: "Upload" },
  { id: "settings",      label: "Settings",      icon: Settings,            shortLabel: "Settings" },
] as const;

type TabId = typeof TAB_ITEMS[number]["id"];

// ─── Unavailable Screen ───────────────────────────────────────────────────────

function AdminUnavailable() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-subtle">
      <Card className="max-w-lg w-full shadow-glow border-0">
        <CardHeader className="text-center">
          <img src="/mounir-icon.svg" alt="Admin" className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <CardTitle className="text-2xl">Admin Panel Unavailable</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-3">
          <p className="text-muted-foreground">
            Firebase is not configured. Check your environment variables and rebuild the application.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Required: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function AdminLogin({ auth }: { auth: Auth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message ?? "Google login failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-subtle">
      <Card className="max-w-md w-full shadow-glow border-0">
        <CardHeader className="text-center">
          <img src="/mounir-icon.svg" alt="Admin" className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <p className="text-muted-foreground">Sign in to manage your portfolio</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google */}
          <Button
            variant="outline"
            className="w-full h-12 text-base font-medium border-2 hover:bg-muted/50"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? "Signing in…" : "Continue with Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-pw">Password</Label>
              <Input
                id="login-pw"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full shadow-glow">
              {loading ? "Signing in…" : "Sign In with Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Admin Shell ─────────────────────────────────────────────────────────

function AdminShell({ user, auth }: { user: User; auth: Auth }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { unreadCount } = useContactMessages();

  async function handleLogout() {
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/mounir-icon.svg" alt="Admin" className="w-9 h-9" />
            <div>
              <h1 className="text-lg font-bold leading-tight">Portfolio Admin</h1>
              <p className="text-xs text-muted-foreground leading-tight">Content Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <UserIcon className="h-4 w-4" />
              <span className="max-w-40 truncate">{user.email}</span>
            </div>
            <ProfessionalSignature />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/", "_blank")}
              className="hidden sm:flex"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Live Site
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="max-w-[1400px] mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
          {/* Tab Navigation */}
          <div className="overflow-x-auto pb-1 mb-6">
            <TabsList className="inline-flex h-auto gap-1 bg-card/60 p-1.5 rounded-2xl border border-border/60 shadow-sm min-w-max">
              {TAB_ITEMS.map(({ id, icon: Icon, label, shortLabel }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden lg:inline">{label}</span>
                  <span className="inline lg:hidden">{shortLabel}</span>
                  {id === "messages" && unreadCount > 0 && (
                    <Badge className="ml-1 h-4 min-w-[16px] px-1 text-[10px] bg-blue-500 text-white rounded-full leading-none flex items-center justify-center">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Tab Panels ── */}
          <TabsContent value="overview">
            <OverviewTab onNavigate={(t) => setActiveTab(t as TabId)} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsTab />
          </TabsContent>

          <TabsContent value="experience">
            <ExperienceTab />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsTab />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialsTab />
          </TabsContent>

          <TabsContent value="links">
            <LinksTab />
          </TabsContent>

          <TabsContent value="upcoming">
            <UpcomingTab />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesTab />
          </TabsContent>

          <TabsContent value="upload">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk Data Upload
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload JSON seed data to populate your Firestore collections.
                </p>
              </CardHeader>
              <CardContent>
                <DataManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  // Lazy-load firebase/auth only when Admin page mounts
  useEffect(() => {
    if (!isFirebaseEnabled || !db) {
      setAuthChecked(true);
      return;
    }

    let cancelled = false;

    getFirebaseAuth().then(({ auth: lazyAuth }) => {
      if (cancelled || !lazyAuth) {
        setAuthChecked(true);
        return;
      }
      setAuth(lazyAuth);

      // Listen for auth state changes
      import("firebase/auth").then(({ onAuthStateChanged }) => {
        if (cancelled) return;
        const unsub = onAuthStateChanged(lazyAuth, (u) => {
          setUser(u);
          setAuthChecked(true);
        });
        unsubRef.current = unsub;
      });
    });

    return () => {
      cancelled = true;
      unsubRef.current?.();
    };
  }, []);

  // Firebase not configured at all
  if (!isFirebaseEnabled || !db) return <AdminUnavailable />;

  // Still loading auth module / checking auth state
  if (!authChecked || !auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="flex flex-col items-center gap-4">
          <img src="/mounir-icon.svg" alt="Loading" className="w-12 h-12 animate-pulse opacity-60" />
          <p className="text-muted-foreground text-sm">Loading admin…</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) return <AdminLogin auth={auth} />;

  // Logged in — render full admin
  return <AdminShell user={user} auth={auth} />;
}
