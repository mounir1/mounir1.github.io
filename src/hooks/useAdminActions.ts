import { useState, useCallback, useRef } from 'react';
import { useAdminStats } from '@/contexts/AdminStatsContext';

// Types for common admin operations
export interface Project {
  id: string;
  title: string;
  description: string;
  technology: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkActionResult<T> {
  success: T[];
  failed: Array<{ item: T; error: string }>;
  total: number;
}

export interface ActionOptions {
  silent?: boolean; // Don't show notifications
  optimistic?: boolean; // Update UI before API call
  timeout?: number; // Request timeout in ms
}

// Hook return type
export interface UseAdminActionsReturn {
  // Loading states
  isLoading: boolean;
  loadingActions: Set<string>;

  // Project actions
  createProject: (
    project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
    options?: ActionOptions
  ) => Promise<Project>;
  updateProject: (
    id: string,
    updates: Partial<Project>,
    options?: ActionOptions
  ) => Promise<Project>;
  deleteProject: (id: string, options?: ActionOptions) => Promise<void>;
  bulkDeleteProjects: (
    ids: string[],
    options?: ActionOptions
  ) => Promise<BulkActionResult<string>>;
  toggleProjectFeatured: (
    id: string,
    options?: ActionOptions
  ) => Promise<Project>;
  duplicateProject: (id: string, options?: ActionOptions) => Promise<Project>;

  // Skill actions
  createSkill: (
    skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>,
    options?: ActionOptions
  ) => Promise<Skill>;
  updateSkill: (
    id: string,
    updates: Partial<Skill>,
    options?: ActionOptions
  ) => Promise<Skill>;
  deleteSkill: (id: string, options?: ActionOptions) => Promise<void>;
  bulkDeleteSkills: (
    ids: string[],
    options?: ActionOptions
  ) => Promise<BulkActionResult<string>>;
  reorderSkills: (skillIds: string[], options?: ActionOptions) => Promise<void>;

  // Export/Import actions
  exportData: (
    type: 'projects' | 'skills' | 'all',
    format: 'json' | 'csv',
    options?: ActionOptions
  ) => Promise<string>;
  importData: (
    file: File,
    type: 'projects' | 'skills',
    options?: ActionOptions
  ) => Promise<BulkActionResult<any>>;

  // Backup/Restore actions
  createBackup: (options?: ActionOptions) => Promise<string>;
  restoreBackup: (backupId: string, options?: ActionOptions) => Promise<void>;

  // Cache management
  clearCache: (options?: ActionOptions) => Promise<void>;
  refreshData: (options?: ActionOptions) => Promise<void>;

  // Utility functions
  isActionLoading: (actionName: string) => boolean;
  cancelAllActions: () => void;
}

// Mock API functions (replace with actual API calls)
const mockAPI = {
  async createProject(
    data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const now = new Date().toISOString();
    return {
      ...data,
      id: `proj_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id,
      title: 'Updated Project',
      description: 'Updated description',
      technology: ['React', 'TypeScript'],
      status: 'published' as const,
      featured: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      ...updates,
    };
  },

  async deleteProject(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  async createSkill(
    data: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Skill> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const now = new Date().toISOString();
    return {
      ...data,
      id: `skill_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
  },

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      id,
      name: 'Updated Skill',
      category: 'Frontend',
      level: 'advanced' as const,
      yearsOfExperience: 3,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      ...updates,
    };
  },

  async deleteSkill(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
  },

  async exportData(type: string, format: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `${type}_export_${Date.now()}.${format}`;
  },

  async importData(file: File, type: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return []; // Mock imported data
  },
};

// Hook implementation
export const useAdminActions = (): UseAdminActionsReturn => {
  const { actions: statsActions } = useAdminStats();
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Helper to manage loading state
  const withLoading = useCallback(
    async <T>(
      actionName: string,
      asyncAction: (signal: AbortSignal) => Promise<T>,
      options: ActionOptions = {}
    ): Promise<T> => {
      const { timeout = 30000 } = options;

      // Create abort controller
      const controller = new AbortController();
      abortControllers.current.set(actionName, controller);

      // Set timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      try {
        // Start loading
        setLoadingActions(prev => new Set([...prev, actionName]));

        // Execute action
        const result = await asyncAction(controller.signal);

        return result;
      } catch (error) {
        if (controller.signal.aborted) {
          throw new Error(`Action ${actionName} was cancelled or timed out`);
        }
        throw error;
      } finally {
        // Cleanup
        clearTimeout(timeoutId);
        abortControllers.current.delete(actionName);
        setLoadingActions(prev => {
          const newSet = new Set(prev);
          newSet.delete(actionName);
          return newSet;
        });
      }
    },
    []
  );

  // Project actions
  const createProject = useCallback(
    async (
      project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
      options: ActionOptions = {}
    ): Promise<Project> => {
      return withLoading(
        'createProject',
        async () => {
          const newProject = await mockAPI.createProject(project);

          // Update stats
          statsActions.updateProjectStats({
            total: undefined, // Will be recalculated
            [newProject.status]: undefined, // Will be recalculated
          });

          return newProject;
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  const updateProject = useCallback(
    async (
      id: string,
      updates: Partial<Project>,
      options: ActionOptions = {}
    ): Promise<Project> => {
      return withLoading(
        'updateProject',
        async () => {
          const updatedProject = await mockAPI.updateProject(id, updates);

          // Update stats if needed
          if (updates.status || updates.featured !== undefined) {
            statsActions.refreshStats();
          }

          return updatedProject;
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  const deleteProject = useCallback(
    async (id: string, options: ActionOptions = {}): Promise<void> => {
      return withLoading(
        'deleteProject',
        async () => {
          await mockAPI.deleteProject(id);

          // Update stats
          statsActions.refreshStats();
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  const bulkDeleteProjects = useCallback(
    async (
      ids: string[],
      options: ActionOptions = {}
    ): Promise<BulkActionResult<string>> => {
      return withLoading(
        'bulkDeleteProjects',
        async () => {
          const results: BulkActionResult<string> = {
            success: [],
            failed: [],
            total: ids.length,
          };

          for (const id of ids) {
            try {
              await mockAPI.deleteProject(id);
              results.success.push(id);
            } catch (error) {
              results.failed.push({
                item: id,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }

          // Update stats
          if (results.success.length > 0) {
            statsActions.refreshStats();
          }

          return results;
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  const toggleProjectFeatured = useCallback(
    async (id: string, options: ActionOptions = {}): Promise<Project> => {
      return withLoading(
        'toggleProjectFeatured',
        async () => {
          // This would typically fetch current state first
          const updatedProject = await mockAPI.updateProject(id, {
            featured: true,
          });
          statsActions.refreshStats();
          return updatedProject;
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  const duplicateProject = useCallback(
    async (id: string, options: ActionOptions = {}): Promise<Project> => {
      return withLoading(
        'duplicateProject',
        async () => {
          // Mock: fetch original project and create duplicate
          const duplicatedProject = await mockAPI.createProject({
            title: 'Copy of Project',
            description: 'Duplicated project',
            technology: ['React'],
            status: 'draft',
            featured: false,
          });

          statsActions.refreshStats();
          return duplicatedProject;
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  // Skill actions
  const createSkill = useCallback(
    async (
      skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>,
      options: ActionOptions = {}
    ): Promise<Skill> => {
      return withLoading(
        'createSkill',
        async () => {
          const newSkill = await mockAPI.createSkill(skill);
          statsActions.refreshStats();
          return newSkill;
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  const updateSkill = useCallback(
    async (
      id: string,
      updates: Partial<Skill>,
      options: ActionOptions = {}
    ): Promise<Skill> => {
      return withLoading(
        'updateSkill',
        async () => {
          const updatedSkill = await mockAPI.updateSkill(id, updates);
          statsActions.refreshStats();
          return updatedSkill;
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  const deleteSkill = useCallback(
    async (id: string, options: ActionOptions = {}): Promise<void> => {
      return withLoading(
        'deleteSkill',
        async () => {
          await mockAPI.deleteSkill(id);
          statsActions.refreshStats();
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  const bulkDeleteSkills = useCallback(
    async (
      ids: string[],
      options: ActionOptions = {}
    ): Promise<BulkActionResult<string>> => {
      return withLoading(
        'bulkDeleteSkills',
        async () => {
          const results: BulkActionResult<string> = {
            success: [],
            failed: [],
            total: ids.length,
          };

          for (const id of ids) {
            try {
              await mockAPI.deleteSkill(id);
              results.success.push(id);
            } catch (error) {
              results.failed.push({
                item: id,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }

          if (results.success.length > 0) {
            statsActions.refreshStats();
          }

          return results;
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  const reorderSkills = useCallback(
    async (skillIds: string[], options: ActionOptions = {}): Promise<void> => {
      return withLoading(
        'reorderSkills',
        async () => {
          // Mock API call for reordering
          await new Promise(resolve => setTimeout(resolve, 1000));
        },
        options
      );
    },
    [withLoading]
  );

  // Export/Import actions
  const exportData = useCallback(
    async (
      type: 'projects' | 'skills' | 'all',
      format: 'json' | 'csv',
      options: ActionOptions = {}
    ): Promise<string> => {
      return withLoading(
        'exportData',
        async () => {
          return await mockAPI.exportData(type, format);
        },
        options
      );
    },
    [withLoading]
  );

  const importData = useCallback(
    async (
      file: File,
      type: 'projects' | 'skills',
      options: ActionOptions = {}
    ): Promise<BulkActionResult<any>> => {
      return withLoading(
        'importData',
        async () => {
          const importedData = await mockAPI.importData(file, type);

          // Refresh stats after import
          statsActions.refreshStats();

          return {
            success: importedData,
            failed: [],
            total: importedData.length,
          };
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  // Backup/Restore actions
  const createBackup = useCallback(
    async (options: ActionOptions = {}): Promise<string> => {
      return withLoading(
        'createBackup',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return `backup_${Date.now()}.json`;
        },
        options
      );
    },
    [withLoading]
  );

  const restoreBackup = useCallback(
    async (backupId: string, options: ActionOptions = {}): Promise<void> => {
      return withLoading(
        'restoreBackup',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 3000));
          statsActions.refreshStats();
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  // Cache management
  const clearCache = useCallback(
    async (options: ActionOptions = {}): Promise<void> => {
      return withLoading(
        'clearCache',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 500));
        },
        options
      );
    },
    [withLoading]
  );

  const refreshData = useCallback(
    async (options: ActionOptions = {}): Promise<void> => {
      return withLoading(
        'refreshData',
        async () => {
          await statsActions.refreshStats();
        },
        options
      );
    },
    [withLoading, statsActions]
  );

  // Utility functions
  const isActionLoading = useCallback(
    (actionName: string) => {
      return loadingActions.has(actionName);
    },
    [loadingActions]
  );

  const cancelAllActions = useCallback(() => {
    abortControllers.current.forEach(controller => {
      controller.abort();
    });
    abortControllers.current.clear();
    setLoadingActions(new Set());
  }, []);

  const isLoading = loadingActions.size > 0;

  return {
    // Loading states
    isLoading,
    loadingActions,

    // Project actions
    createProject,
    updateProject,
    deleteProject,
    bulkDeleteProjects,
    toggleProjectFeatured,
    duplicateProject,

    // Skill actions
    createSkill,
    updateSkill,
    deleteSkill,
    bulkDeleteSkills,
    reorderSkills,

    // Export/Import actions
    exportData,
    importData,

    // Backup/Restore actions
    createBackup,
    restoreBackup,

    // Cache management
    clearCache,
    refreshData,

    // Utility functions
    isActionLoading,
    cancelAllActions,
  };
};

export default useAdminActions;
