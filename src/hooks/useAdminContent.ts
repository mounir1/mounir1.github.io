/**
 * Admin Content Management Hooks
 * Firebase-integrated hooks for managing portfolio content
 */

import { useState, useCallback, useEffect } from "react";
import {
  projectService,
  analyticsService,
  contentService,
  type PortfolioProject,
  type AnalyticsData,
} from "@/lib/firebase-services";
import { toast } from "sonner";

// ============================================
// PROJECT MANAGEMENT HOOK
// ============================================

export const useProjectManagement = () => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch projects";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create project
  const createProject = useCallback(
    async (project: Omit<PortfolioProject, "id" | "createdAt" | "updatedAt">) => {
      try {
        const id = await projectService.create(project);
        await fetchProjects();
        toast.success("Project created successfully");
        return id;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create project";
        setError(message);
        toast.error(message);
        throw err;
      }
    },
    [fetchProjects]
  );

  // Update project
  const updateProject = useCallback(
    async (id: string, updates: Partial<PortfolioProject>) => {
      try {
        await projectService.update(id, updates);
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
        toast.success("Project updated successfully");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update project";
        setError(message);
        toast.error(message);
        throw err;
      }
    },
    []
  );

  // Delete project
  const deleteProject = useCallback(
    async (id: string) => {
      try {
        await projectService.delete(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toast.success("Project deleted successfully");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete project";
        setError(message);
        toast.error(message);
        throw err;
      }
    },
    []
  );

  // Toggle featured status
  const toggleFeatured = useCallback(
    async (id: string) => {
      const project = projects.find((p) => p.id === id);
      if (!project) return;

      try {
        await updateProject(id, { featured: !project.featured });
      } catch (err) {
        console.error("Failed to toggle featured status:", err);
      }
    },
    [projects, updateProject]
  );

  // Batch update projects
  const batchUpdate = useCallback(
    async (updates: { id: string; data: Partial<PortfolioProject> }[]) => {
      try {
        await projectService.batchUpdate(updates);
        setProjects((prev) =>
          prev.map((p) => {
            const update = updates.find((u) => u.id === p.id);
            return update ? { ...p, ...update.data } : p;
          })
        );
        toast.success("Projects updated successfully");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update projects";
        setError(message);
        toast.error(message);
        throw err;
      }
    },
    []
  );

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    toggleFeatured,
    batchUpdate,
  };
};

// ============================================
// ANALYTICS HOOK
// ============================================

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest analytics
  const fetchLatest = useCallback(async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getLatest();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch analytics for date range
  const fetchByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      const data = await analyticsService.getByDateRange(startDate, endDate);
      if (data.length > 0) {
        setAnalytics(data[0]);
      }
      setError(null);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch analytics";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save analytics
  const save = useCallback(
    async (data: Omit<AnalyticsData, "id">) => {
      try {
        const id = await analyticsService.save(data);
        setAnalytics({ id, ...data });
        toast.success("Analytics saved successfully");
        return id;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save analytics";
        setError(message);
        toast.error(message);
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  return {
    analytics,
    loading,
    error,
    fetchLatest,
    fetchByDateRange,
    save,
  };
};

// ============================================
// CONTENT MANAGEMENT HOOK
// ============================================

export interface ContentDocument {
  id: string;
  [key: string]: unknown;
}

export const useContentManagement = (collectionName: string) => {
  const [documents, setDocuments] = useState<ContentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all documents
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contentService.getAll(collectionName);
      setDocuments(data as ContentDocument[]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to fetch ${collectionName}`;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  // Set document
  const setDocument = useCallback(
    async (docId: string, data: Record<string, unknown>) => {
      try {
        await contentService.setDocument(collectionName, docId, data);
        setDocuments((prev) => {
          const existing = prev.findIndex((d) => d.id === docId);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = { id: docId, ...data };
            return updated;
          }
          return [...prev, { id: docId, ...data }];
        });
        toast.success("Document saved successfully");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save document";
        setError(message);
        toast.error(message);
        throw err;
      }
    },
    [collectionName]
  );

  // Delete document
  const deleteDocument = useCallback(
    async (docId: string) => {
      try {
        await contentService.deleteDocument(collectionName, docId);
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        toast.success("Document deleted successfully");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete document";
        setError(message);
        toast.error(message);
        throw err;
      }
    },
    [collectionName]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    documents,
    loading,
    error,
    fetchAll,
    setDocument,
    deleteDocument,
  };
};

// ============================================
// PORTFOLIO SETTINGS HOOK
// ============================================

export interface PortfolioSettings {
  heroTitle: string;
  heroSubtitle: string;
  bio: string;
  email: string;
  phone?: string;
  location: string;
  socialLinks: Record<string, string>;
  keywords: string[];
  description: string;
}

export const usePortfolioSettings = () => {
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await contentService.getMetadata();
      setSettings((data as unknown as PortfolioSettings) || {});
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch settings";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<PortfolioSettings>) => {
    try {
      await contentService.updateMetadata(updates);
      setSettings((prev) => (prev ? { ...prev, ...updates } : (updates as PortfolioSettings)));
      toast.success("Settings updated successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update settings";
      setError(message);
      toast.error(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
  };
};
