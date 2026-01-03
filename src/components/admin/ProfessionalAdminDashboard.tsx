import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Award, 
  BarChart3, 
  Settings, 
  User,
  LogOut,
  Plus,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { AnalyticsCharts } from './dashboard/AnalyticsCharts';
import { PerformanceMetrics } from './dashboard/PerformanceMetrics';
import { ActivityLogs } from './dashboard/ActivityLogs';
import { StatsGrid, type StatsData } from './dashboard/StatsGrid2';
import { ProjectsTab } from './projects/ProjectsTab';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/hooks/useProjects';
import { useSkills } from '@/hooks/useSkills';
import { useAdminStats } from '@/hooks/useAdminStats';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

import { User as FirebaseUser } from 'firebase/auth';

interface ProfessionalAdminDashboardProps {
  user: FirebaseUser;
}

export function ProfessionalAdminDashboard({ user }: ProfessionalAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const { projects, loading: projectsLoading } = useProjects();
  const { skills, loading: skillsLoading } = useSkills();

  const handleLogout = async () => {
    try {
      await signOut(auth!);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const adminStats = useAdminStats(projects, skills);
  
  const stats: StatsData = {
    projects: {
      total: adminStats.projects.total,
      featured: adminStats.projects.featured,
      active: adminStats.projects.active,
      categories: adminStats.projects.categories,
      recentlyUpdated: adminStats.projects.recentlyUpdated
    },
    skills: {
      total: adminStats.skills.total,
      featured: adminStats.skills.featured,
      categories: Object.keys(adminStats.skills.byCategory).length
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 w-full">
      {/* Professional Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src="/mounir-signature.svg" 
                  alt="Mounir Signature" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    // Fallback to text if signature SVG is not found
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div className="text-xl font-bold text-slate-900 dark:text-white hidden">
                  Mounir Abderrahmani
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                Professional Admin
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-8">
        {/* Stats Overview */}
        <StatsGrid data={stats} className="mb-8" />

        {/* Main Content */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-xl w-full">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                  Portfolio Management
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Manage your projects, skills, and portfolio content
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center space-x-2">
                  <FolderOpen className="h-4 w-4" />
                  <span>Projects</span>
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Skills</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {projectsLoading ? (
                        <div className="animate-pulse space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-4 bg-slate-200 rounded w-full"></div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {projects.slice(0, 5).map((project) => (
                            <div key={project.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{project.title}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{project.category}</p>
                              </div>
                              {project.featured && (
                                <Badge variant="secondary">Featured</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {skillsLoading ? (
                        <div className="animate-pulse space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-4 bg-slate-200 rounded w-full"></div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {skills.slice(0, 5).map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{skill.name}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{skill.category}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  {skill.level}%
                                </div>
                                {skill.featured && (
                                  <Badge variant="secondary">Featured</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="flex items-center justify-center space-x-4 pt-6">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Project
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="w-full">
                <ProjectsTab className="w-full" />
              </TabsContent>

              <TabsContent value="skills">
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Skills Management
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Advanced skills CRUD operations will be implemented here
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="space-y-6">
                  <AnalyticsCharts />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PerformanceMetrics />
                    <ActivityLogs />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Professional Footer with Signature */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-400">
            <span className="text-sm">Crafted by</span>
            <img 
              src="/mounir-signature.svg" 
              alt="Mounir Signature" 
              className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'inline';
              }}
            />
            <span className="text-sm font-medium hidden">Mounir Abderrahmani</span>
          </div>
        </div>
      </div>
    </div>
  );
}
