import { useEffect, useMemo, useState, useCallback } from "react";
import { firebaseService } from "@/lib/services/firebaseService";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { initialProjects } from "@/data/initial-projects";

// Import types from main type file to avoid conflicts
import type { Project as MainProject, ProjectInput as MainProjectInput } from '@/types/project';

export type Project = MainProject;
export type ProjectInput = MainProjectInput;

export const PROJECTS_COLLECTION = "projects";

// Default project template matching main Project interface
export const DEFAULT_PROJECT: Omit<ProjectInput, 'title' | 'description' | 'category'> = {
  role: "Full-Stack Developer",
  technologies: [],
  status: "completed",
  priority: 50,
  startDate: "",
  endDate: "",
  githubUrl: "",
  liveUrl: "",
  images: [],
  achievements: [],
  challenges: [],
  lessons: [],
  collaborators: [],
  featured: false
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    setLoading(true);

    // Subscribe to real-time updates
    const unsubscribe = firebaseService.subscribeToProjects((updatedProjects) => {
      // Validate and sanitize data
      const validProjects = (updatedProjects as Project[]).filter(project =>
        project.title && project.description && project.category
      );

      // Deduplicate by normalized title + category
      const seen = new Set<string>();
      const deduped: Project[] = [];
      for (const p of validProjects) {
        const key = `${p.title.trim().toLowerCase()}::${(p.category || '').trim().toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(p);
        }
      }

      // Sort: featured first, then by priority desc
      deduped.sort((a, b) => {
        if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
        const pa = typeof a.priority === 'number' ? a.priority : 0;
        const pb = typeof b.priority === 'number' ? b.priority : 0;
        return pb - pa;
      });

      setProjects(deduped);
      setLoading(false);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, [isOnline]);

  const featured = useMemo(() =>
    projects.filter(project => project.featured && !project.disabled)
    , [projects]);

  const others = useMemo(() =>
    projects.filter(project => !project.featured && !project.disabled)
    , [projects]);

  // CRUD Operations using firebaseService
  const addProject = useCallback(async (projectData: ProjectInput) => {
    try {
      const id = await firebaseService.createProject(projectData);
      console.log(`✅ Project added to Firebase with ID: ${id}`);
      return id;
    } catch (error) {
      console.error("Error adding project:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to add project: ${errorMessage}. Please try again.`);
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<ProjectInput>) => {
    try {
      await firebaseService.updateProject(id, updates);
      console.log(`✅ Project ${id} updated in Firebase`);
    } catch (error) {
      console.error("Error updating project:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to update project: ${errorMessage}. Please try again.`);
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await firebaseService.deleteProject(id);
      console.log(`✅ Project ${id} deleted from Firebase`);
    } catch (error) {
      console.error("Error deleting project:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to delete project: ${errorMessage}. Please try again.`);
    }
  }, []);

  return {
    projects,
    featured,
    others,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    isOnline,
    refetch: () => { }, // No-op as we use real-time subscription
  };
}
