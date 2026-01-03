import React, { useState, useMemo, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { useProjects, type Project } from "@/hooks/useProjects";
import { ProjectForm } from "./ProjectForm";
import { ProjectCard } from "./ProjectCard";
import { ProjectBulkActions } from "./ProjectBulkActions";
import { AdminDataTable } from "../AdminDataTable";
import { createActionColumnDef } from "../ActionColumn";
import { StatusBadge } from "@/components/ui/data-table";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

import {
  Database,
  Calendar,
  Star,
  Eye,
  EyeOff,
  Plus,
  Grid3X3,
  List,
  RefreshCw,
  Settings,
} from "lucide-react";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ViewMode = "table" | "grid" | "list";

interface ProjectsTabProps {
  className?: string;
}

export function ProjectsTab({ className }: ProjectsTabProps) {
  const { projects, loading, deleteProject, refetch } = useProjects();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedProjects, setSelectedProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Filtered projects based on search and filters
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = !searchQuery || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !categoryFilter || project.category === categoryFilter;
      const matchesStatus = !statusFilter || project.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [projects, searchQuery, categoryFilter, statusFilter]);

  // Data for filter dropdowns
  const categoryOptions = useMemo(() => {
    const categories = [...new Set(projects.map(p => p.category))];
    return categories.map(cat => ({ label: cat, value: cat }));
  }, [projects]);

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(projects.map(p => p.status))];
    return statuses.map(status => ({ label: status.replace(/-/g, ' '), value: status }));
  }, [projects]);

  // Event handlers
  const handleAddProject = useCallback(() => {
    setEditingProject(null);
    setShowForm(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  }, []);

  const handleDeleteProject = useCallback(async (project: Project) => {
    if (!confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(project.id);
    try {
      await deleteProject(project.id);
      toast({
        title: "Project deleted",
        description: `"${project.title}" has been deleted successfully.`,
      });
      await refetch();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }, [deleteProject, refetch]);

  const handleFormClose = useCallback(() => {
    setShowForm(false);
    setEditingProject(null);
  }, []);

  const handleProjectSelect = useCallback((project: Project, selected: boolean) => {
    setSelectedProjects(prev => {
      if (selected) {
        return [...prev, project];
      } else {
        return prev.filter(p => p.id !== project.id);
      }
    });
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedProjects(filteredProjects);
    } else {
      setSelectedProjects([]);
    }
  }, [filteredProjects]);

  const handleBulkAction = useCallback(() => {
    if (selectedProjects.length > 0) {
      setShowBulkActions(true);
    } else {
      toast({
        title: "No projects selected",
        description: "Please select one or more projects to perform bulk actions.",
        variant: "destructive",
      });
    }
  }, [selectedProjects]);

  // Table columns for table view
  const columns = useMemo<ColumnDef<Project, unknown>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedProjects.some(p => p.id === row.original.id)}
          onChange={(e) => handleProjectSelect(row.original, e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Project",
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-md flex-shrink-0 overflow-hidden bg-muted flex items-center justify-center">
              {project.logo ? (
                <img src={project.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Database className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="font-medium">{project.title}</div>
              <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                {project.description.substring(0, 60)}
                {project.description.length > 60 ? "..." : ""}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.category}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
        
        if (status === "completed") variant = "default";
        if (status === "in-progress") variant = "secondary";
        if (status === "archived") variant = "destructive";
        
        return <StatusBadge status={status} variant={variant} />;
      },
    },
    {
      accessorKey: "technologies",
      header: "Technologies",
      cell: ({ row }) => {
        const techs = row.original.technologies;
        const displayCount = 2;
        
        return (
          <div className="flex flex-wrap gap-1">
            {techs.slice(0, displayCount).map((tech, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {techs.length > displayCount && (
              <Badge variant="outline" className="text-xs">
                +{techs.length - displayCount}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.featured ? (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          ) : (
            <Star className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "disabled",
      header: "Visible",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {row.original.disabled ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-green-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => {
        const timestamp = row.original.updatedAt;
        const date = new Date(timestamp);
        return (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{format(date, "dd MMM yyyy")}</span>
          </div>
        );
      },
    },
    createActionColumnDef({
      onEdit: handleEditProject,
      onDelete: handleDeleteProject,
    }),
  ], [selectedProjects, handleSelectAll, handleProjectSelect, handleEditProject, handleDeleteProject]);

  return (
    <div className={`${className} w-full`}>
      <Card className="border-0 shadow-medium w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Project Management
              </CardTitle>
              <CardDescription>
                Manage your portfolio projects with advanced filtering and bulk operations
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-x"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>

              {selectedProjects.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkAction}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Bulk Actions ({selectedProjects.length})
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="hidden md:flex"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button size="sm" onClick={handleAddProject}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <TabsContent value="table">
              <AdminDataTable
                title="Projects"
                columns={columns}
                data={filteredProjects}
                loading={loading}
                searchPlaceholder="Search projects..."
                filterFields={[
                  {
                    key: "category",
                    title: "Category",
                    options: categoryOptions
                  },
                  {
                    key: "status",
                    title: "Status",
                    options: statusOptions
                  }
                ]}
                rowClassName={(row) => {
                  if (row.original.disabled) return "opacity-60";
                  if (row.original.featured) return "bg-yellow-50/30 dark:bg-yellow-950/20";
                  return "";
                }}
              />
            </TabsContent>
            
            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    viewMode="grid"
                    selected={selectedProjects.some(p => p.id === project.id)}
                    onSelect={(selected) => handleProjectSelect(project, selected)}
                    onEdit={() => handleEditProject(project)}
                    onDelete={() => handleDeleteProject(project)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Project Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "Add New Project"}
            </DialogTitle>
            <DialogDescription>
              {editingProject 
                ? "Update the project information below." 
                : "Fill in the details to create a new project."
              }
            </DialogDescription>
          </DialogHeader>
          
          <ProjectForm
            project={editingProject}
            onSubmit={async () => {
              await refetch();
              handleFormClose();
            }}
            onCancel={handleFormClose}
            mode={editingProject ? "edit" : "create"}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Perform actions on {selectedProjects.length} selected projects.
            </DialogDescription>
          </DialogHeader>
          
          <ProjectBulkActions
            projects={selectedProjects}
            onComplete={() => {
              setShowBulkActions(false);
              setSelectedProjects([]);
            }}
            onCancel={() => setShowBulkActions(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}