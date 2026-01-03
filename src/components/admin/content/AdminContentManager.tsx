import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useProjectManagement, usePortfolioSettings, type PortfolioSettings } from "@/hooks/useAdminContent";
import { Plus, Edit2, Trash2, Save, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

/**
 * Admin Content Management Dashboard
 * Manage projects, settings, and portfolio content via Firebase
 */
const AdminContentManager: React.FC = () => {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjectManagement();
  const { settings, updateSettings } = usePortfolioSettings();

  const [activeTab, setActiveTab] = useState<"projects" | "settings">("projects");
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingSettings, setEditingSettings] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "",
    technologies: [] as string[],
    featured: false,
  });

  const [editSettings, setEditSettings] = useState<PortfolioSettings | Record<string, unknown>>(settings || {});

  const handleCreateProject = async () => {
    if (!newProject.title || !newProject.description) {
      toast.error("Title and description are required");
      return;
    }

    try {
      await createProject({
        ...newProject,
        featured: false,
      });
      setNewProject({
        title: "",
        description: "",
        category: "",
        technologies: [],
        featured: false,
      });
      setShowNewProjectForm(false);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await updateSettings(editSettings);
      setEditingSettings(false);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "projects" ? "default" : "outline"}
            onClick={() => setActiveTab("projects")}
          >
            Projects
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "outline"}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Portfolio Projects</h2>
            <Button onClick={() => setShowNewProjectForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {/* New Project Form */}
          {showNewProjectForm && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle>Create New Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Project Title"
                  value={newProject.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Project Description"
                  value={newProject.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  className="min-h-[100px]"
                />
                <Input
                  placeholder="Category"
                  value={newProject.category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewProject({ ...newProject, category: e.target.value })
                  }
                />
                <Input
                  placeholder="Technologies (comma-separated)"
                  value={newProject.technologies.join(", ")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewProject({
                      ...newProject,
                      technologies: e.target.value
                        .split(",")
                        .map((t: string) => t.trim()),
                    })
                  }
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateProject} className="gap-2">
                    <Save className="h-4 w-4" />
                    Create Project
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewProjectForm(false)}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle>{project.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {project.featured && (
                          <Badge className="bg-yellow-500">Featured</Badge>
                        )}
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProject(project.id)}
                        className="gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteProject(project.id)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Portfolio Settings</h2>

          {editingSettings ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Hero Title</label>
                  <Input
                    value={((editSettings as PortfolioSettings).heroTitle) || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditSettings({
                        ...editSettings,
                        heroTitle: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Hero Subtitle</label>
                  <Input
                    value={((editSettings as PortfolioSettings).heroSubtitle) || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditSettings({
                        ...editSettings,
                        heroSubtitle: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    value={((editSettings as PortfolioSettings).bio) || ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setEditSettings({
                        ...editSettings,
                        bio: e.target.value,
                      })
                    }
                    className="mt-1 min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={editSettings.email || ""}
                    onChange={(e) =>
                      setEditSettings({
                        ...editSettings,
                        email: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={((editSettings as PortfolioSettings).location) || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditSettings({
                        ...editSettings,
                        location: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpdateSettings} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Settings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingSettings(false)}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Current Settings</CardTitle>
                <Button
                  onClick={() => {
                    setEditSettings(settings || {});
                    setEditingSettings(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Hero Title</label>
                  <p className="font-medium">{settings?.heroTitle || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Hero Subtitle</label>
                  <p className="font-medium">{settings?.heroSubtitle || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{settings?.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Location</label>
                  <p className="font-medium">{settings?.location || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminContentManager;
