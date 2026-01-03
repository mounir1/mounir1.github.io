import React, { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { useProjects } from "@/hooks/useProjects";
import { useSkills } from "@/hooks/useSkills";
import { PortfolioDataManager } from "@/lib/data-management-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Award,
  Database,
  TrendingUp,
  Settings,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Activity,
  RefreshCw,
  Download,
  Users,
  Code,
  FileText,
  Layers,
  Server
} from "lucide-react";
import { AdminStats } from "./AdminStats";
import { SkillsManager } from "./SkillsManager";
import { ProjectsManager } from "./ProjectsManager";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { AdminHeader } from "./AdminHeader";
import { useTheme } from "@/contexts/ThemeContext";

// Define types for data layer events
type DataLayerEvent = {
  event: string;
  action?: string;
  tab?: string;
  theme?: string;
};

export function OptimizedAdminDashboard() {
  const { skills, loading: skillsLoading, error: skillsError, refetch: refetchSkills } = useSkills();
  const { projects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalSkills: 0,
    totalProjects: 0,
    featuredSkills: 0,
    featuredProjects: 0,
    totalUsers: 0,
    totalTechnologies: 0
  });
  const [loading, setLoading] = useState(true);

  // Check online status
  const isOnline = navigator.onLine;

  // Push event to dataLayer if available
  const pushToDataLayer = (eventData: DataLayerEvent) => {
    if (typeof window !== 'undefined' && (window as unknown as { dataLayer: DataLayerEvent[] }).dataLayer) {
      (window as unknown as { dataLayer: DataLayerEvent[] }).dataLayer.push(eventData);
    }
  };

  const handleLogout = async () => {
    // Push event to dataLayer if available
    pushToDataLayer({
      event: 'admin_logout',
      action: 'click'
    });
    
    try {
      const { getAuth, signOut } = await import("firebase/auth");
      const auth = getAuth();
      await signOut(auth);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin panel."
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Calculate stats
  useEffect(() => {
    const calculateStats = () => {
      const totalSkills = skills.length;
      const totalProjects = projects.length;
      const featuredSkills = skills.filter(s => s.featured).length;
      const featuredProjects = projects.filter(p => p.featured).length;
      
      // Calculate unique technologies across all projects
      const allTechnologies = projects.flatMap(p => p.technologies || []);
      const uniqueTechnologies = new Set(allTechnologies).size;
      
      setStats({
        totalSkills,
        totalProjects,
        featuredSkills,
        featuredProjects,
        totalUsers: 1, // Assuming single admin user
        totalTechnologies: uniqueTechnologies
      });
    };

    calculateStats();
    setLoading(false);
  }, [skills, projects]);

  // Theme toggle with dataLayer tracking
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    // Push event to dataLayer if available
    pushToDataLayer({
      event: 'theme_toggle',
      theme: newTheme
    });
  };

  // Refresh data
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refetchProjects();
      await refetchSkills();
      toast({
        title: "Data refreshed",
        description: "Projects and skills data has been updated."
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Export data as JSON
  const handleExportData = () => {
    const data = {
      projects: projects,
      skills: skills,
      exportedAt: new Date().toISOString(),
      totalProjects: stats.totalProjects,
      totalSkills: stats.totalSkills
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `portfolio-data-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    pushToDataLayer({
      event: 'admin_action',
      action: 'export_data'
    });
    
    toast({
      title: "Data exported",
      description: "Portfolio data has been exported successfully."
    });
  };

  return (
    <div className="admin-dashboard min-h-screen bg-background">
      {/* Professional Admin Dashboard by Mounir Abderrahmani */}
      <AdminHeader 
        user={{ email: "admin@portfolio.com", displayName: "Admin User" }} // This would come from auth in real implementation
        onLogout={handleLogout}
      />
      
      {/* Admin Stats */}
      <div className="admin-dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        <AdminStats stats={stats} />
      </div>
      
      <div className="admin-dashboard-grid grid grid-cols-1 p-4">
        {/* Main Content Area */}
        <main className="col-span-12">
          {/* Tab Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-muted mb-6 rounded-lg p-1 h-auto sm:h-12">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md flex items-center gap-2 py-2 track-click"
                onClick={() => {
                  pushToDataLayer({
                    event: 'admin_tab_change',
                    tab: 'overview'
                  });
                }}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="skills" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md flex items-center gap-2 py-2 track-click"
                onClick={() => {
                  pushToDataLayer({
                    event: 'admin_tab_change',
                    tab: 'skills'
                  });
                }}
              >
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline">Skills</span>
                <span className="sm:hidden">Skills</span>
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md flex items-center gap-2 py-2 track-click"
                onClick={() => {
                  pushToDataLayer({
                    event: 'admin_tab_change',
                    tab: 'projects'
                  });
                }}
              >
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Projects</span>
                <span className="sm:hidden">Projects</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md flex items-center gap-2 py-2 track-click"
                onClick={() => {
                  pushToDataLayer({
                    event: 'admin_tab_change',
                    tab: 'analytics'
                  });
                }}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Status</CardTitle>
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        {isOnline ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <Wifi className="h-5 w-5" />
                            <span>Online</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <WifiOff className="h-5 w-5" />
                            <span>Offline</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {loading ? 'Loading...' : 'Ready'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="track-click flex items-center gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleExportData}
                        className="track-click flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export Data
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleTheme}
                        className="track-click flex items-center gap-2"
                      >
                        {theme === "dark" ? (
                          <Sun className="h-4 w-4" />
                        ) : (
                          <Moon className="h-4 w-4" />
                        )}
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <Layers className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProjects}</div>
                    <p className="text-xs text-muted-foreground">+{projects.filter(p => p.featured).length} featured</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
                    <Code className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSkills}</div>
                    <p className="text-xs text-muted-foreground">+{skills.filter(s => s.featured).length} featured</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Technologies</CardTitle>
                    <Server className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalTechnologies}</div>
                    <p className="text-xs text-muted-foreground">Across all projects</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground">Admin account</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="skills">
              <SkillsManager />
            </TabsContent>
            
            <TabsContent value="projects">
              <ProjectsManager />
            </TabsContent>
            
            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}