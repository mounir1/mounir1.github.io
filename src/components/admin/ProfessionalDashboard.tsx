import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Award,
  BarChart3,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  User,
  LogOut,
} from 'lucide-react';
import { AnalyticsCharts } from './dashboard/AnalyticsCharts';
import { PerformanceMetrics } from './dashboard/PerformanceMetrics';
import { ActivityLogs } from './dashboard/ActivityLogs';
import { StatsGrid } from './dashboard/StatsGrid';
import { AddItemDialog } from './forms/AddItemDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { useProjects } from '@/hooks/useProjects';
import { useSkills } from '@/hooks/useSkills';
import type { User as FirebaseUser } from 'firebase/auth';
import { saveAs } from 'file-saver';

interface ProfessionalDashboardProps {
  user: FirebaseUser;
}

export function ProfessionalDashboard({ user }: ProfessionalDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const {
    projects,
    loading: projectsLoading,
    refetch: refetchProjects,
  } = useProjects();
  const {
    skills,
    loading: skillsLoading,
    refetch: refetchSkills,
  } = useSkills();

  const handleLogout = async () => {
    try {
      if (!auth) throw new Error('Auth not initialized');
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleExportData = async () => {
    try {
      if (!db) throw new Error('Firestore not initialized');

      // Export projects
      const projectsRef = collection(db, 'projects');
      const projectsSnap = await getDocs(projectsRef);
      const projectsData = projectsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Export skills
      const skillsRef = collection(db, 'skills');
      const skillsSnap = await getDocs(skillsRef);
      const skillsData = skillsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Create export data
      const exportData = {
        projects: projectsData,
        skills: skillsData,
        exportDate: new Date().toISOString(),
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      saveAs(blob, `portfolio-data-${new Date().toISOString()}.json`);
    } catch (error) {
      console.error('Export error:', error);
      // Here you could show an error toast
    }
  };

  const handleImportData = () => {
    // Create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        // Here you would implement the logic to import the data to Firebase
        console.log('Importing data:', data);
        // After import is complete, refetch the data
        refetchProjects();
        refetchSkills();
      } catch (error) {
        console.error('Import error:', error);
        // Here you could show an error toast
      }
    };

    input.click();
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage your portfolio content and analyze performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">{user.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span>Projects</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Skills</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleImportData}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>

              {activeTab === 'projects' && (
                <AddItemDialog type="project" onSuccess={refetchProjects} />
              )}
              {activeTab === 'skills' && (
                <AddItemDialog type="skill" onSuccess={refetchSkills} />
              )}
            </div>
          </div>

          <TabsContent value="overview">
            <div className="space-y-6">
              <StatsGrid />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {projectsLoading ? (
                      <div className="animate-pulse space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="h-4 w-full rounded bg-muted"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {projects.slice(0, 5).map(project => (
                          <div
                            key={project.id}
                            className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                          >
                            <div>
                              <p className="font-medium">{project.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {project.category}
                              </p>
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
                          <div
                            key={i}
                            className="h-4 w-full rounded bg-muted"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {skills.slice(0, 5).map(skill => (
                          <div
                            key={skill.id}
                            className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                          >
                            <div>
                              <p className="font-medium">{skill.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {skill.category}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {skill.level}%
                              </span>
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
            </div>
          </TabsContent>

          <TabsContent value="projects">
            {/* Projects list/grid will go here */}
          </TabsContent>

          <TabsContent value="skills">
            {/* Skills list/grid will go here */}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <AnalyticsCharts />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <PerformanceMetrics />
                <ActivityLogs />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
