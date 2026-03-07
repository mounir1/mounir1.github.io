import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';

// Types for admin statistics
export interface ProjectStats {
  total: number;
  published: number;
  draft: number;
  featured: number;
  recentlyUpdated: number;
}

export interface SkillStats {
  total: number;
  byCategory: Record<string, number>;
  byLevel: Record<string, number>;
  recentlyAdded: number;
}

export interface SystemStats {
  totalViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  popularPages: Array<{ path: string; views: number }>;
}

export interface AdminStats {
  projects: ProjectStats;
  skills: SkillStats;
  system: SystemStats;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
}

// Actions for the stats reducer
type StatsAction =
  | { type: 'FETCH_STATS_START' }
  | { type: 'FETCH_STATS_SUCCESS'; payload: Partial<AdminStats> }
  | { type: 'FETCH_STATS_ERROR'; payload: string }
  | { type: 'UPDATE_PROJECT_STATS'; payload: Partial<ProjectStats> }
  | { type: 'UPDATE_SKILL_STATS'; payload: Partial<SkillStats> }
  | { type: 'UPDATE_SYSTEM_STATS'; payload: Partial<SystemStats> }
  | { type: 'RESET_STATS' };

// Initial state
const initialStats: AdminStats = {
  projects: {
    total: 0,
    published: 0,
    draft: 0,
    featured: 0,
    recentlyUpdated: 0,
  },
  skills: {
    total: 0,
    byCategory: {},
    byLevel: {},
    recentlyAdded: 0,
  },
  system: {
    totalViews: 0,
    uniqueVisitors: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    popularPages: [],
  },
  lastUpdated: null,
  isLoading: false,
  error: null,
};

// Stats reducer
function statsReducer(state: AdminStats, action: StatsAction): AdminStats {
  switch (action.type) {
    case 'FETCH_STATS_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'FETCH_STATS_SUCCESS':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      };

    case 'FETCH_STATS_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'UPDATE_PROJECT_STATS':
      return {
        ...state,
        projects: {
          ...state.projects,
          ...action.payload,
        },
        lastUpdated: new Date(),
      };

    case 'UPDATE_SKILL_STATS':
      return {
        ...state,
        skills: {
          ...state.skills,
          ...action.payload,
        },
        lastUpdated: new Date(),
      };

    case 'UPDATE_SYSTEM_STATS':
      return {
        ...state,
        system: {
          ...state.system,
          ...action.payload,
        },
        lastUpdated: new Date(),
      };

    case 'RESET_STATS':
      return initialStats;

    default:
      return state;
  }
}

// Context type
interface AdminStatsContextType {
  stats: AdminStats;
  actions: {
    fetchStats: () => Promise<void>;
    updateProjectStats: (stats: Partial<ProjectStats>) => void;
    updateSkillStats: (stats: Partial<SkillStats>) => void;
    updateSystemStats: (stats: Partial<SystemStats>) => void;
    refreshStats: () => Promise<void>;
    resetStats: () => void;
  };
}

// Create context
const AdminStatsContext = createContext<AdminStatsContextType | null>(null);

// Provider props
interface AdminStatsProviderProps {
  children: React.ReactNode;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

// Mock data fetching functions (replace with actual API calls)
const fetchProjectStats = async (): Promise<ProjectStats> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    total: 12,
    published: 10,
    draft: 2,
    featured: 3,
    recentlyUpdated: 1,
  };
};

const fetchSkillStats = async (): Promise<SkillStats> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    total: 25,
    byCategory: {
      Frontend: 8,
      Backend: 6,
      Database: 4,
      DevOps: 3,
      Design: 4,
    },
    byLevel: {
      Expert: 8,
      Advanced: 10,
      Intermediate: 7,
    },
    recentlyAdded: 2,
  };
};

const fetchSystemStats = async (): Promise<SystemStats> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 400));

  return {
    totalViews: 15420,
    uniqueVisitors: 8930,
    bounceRate: 0.32,
    avgSessionDuration: 245,
    popularPages: [
      { path: '/', views: 5430 },
      { path: '/projects', views: 3210 },
      { path: '/about', views: 2890 },
      { path: '/contact', views: 1650 },
      { path: '/blog', views: 1240 },
    ],
  };
};

// Provider component
export const AdminStatsProvider: React.FC<AdminStatsProviderProps> = ({
  children,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
}) => {
  const [stats, dispatch] = useReducer(statsReducer, initialStats);

  // Fetch all stats
  const fetchStats = useCallback(async () => {
    dispatch({ type: 'FETCH_STATS_START' });

    try {
      const [projectStats, skillStats, systemStats] = await Promise.all([
        fetchProjectStats(),
        fetchSkillStats(),
        fetchSystemStats(),
      ]);

      dispatch({
        type: 'FETCH_STATS_SUCCESS',
        payload: {
          projects: projectStats,
          skills: skillStats,
          system: systemStats,
        },
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_STATS_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to fetch stats',
      });
    }
  }, []);

  // Update individual stat sections
  const updateProjectStats = useCallback(
    (projectStats: Partial<ProjectStats>) => {
      dispatch({ type: 'UPDATE_PROJECT_STATS', payload: projectStats });
    },
    []
  );

  const updateSkillStats = useCallback((skillStats: Partial<SkillStats>) => {
    dispatch({ type: 'UPDATE_SKILL_STATS', payload: skillStats });
  }, []);

  const updateSystemStats = useCallback((systemStats: Partial<SystemStats>) => {
    dispatch({ type: 'UPDATE_SYSTEM_STATS', payload: systemStats });
  }, []);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  const resetStats = useCallback(() => {
    dispatch({ type: 'RESET_STATS' });
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    // Initial fetch
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStats, autoRefresh, refreshInterval]);

  // Context value
  const contextValue: AdminStatsContextType = {
    stats,
    actions: {
      fetchStats,
      updateProjectStats,
      updateSkillStats,
      updateSystemStats,
      refreshStats,
      resetStats,
    },
  };

  return (
    <AdminStatsContext.Provider value={contextValue}>
      {children}
    </AdminStatsContext.Provider>
  );
};

// Hook to use the admin stats context
export const useAdminStats = (): AdminStatsContextType => {
  const context = useContext(AdminStatsContext);

  if (!context) {
    throw new Error('useAdminStats must be used within an AdminStatsProvider');
  }

  return context;
};

// Convenience hooks for specific stat sections
export const useProjectStats = () => {
  const { stats, actions } = useAdminStats();
  return {
    ...stats.projects,
    updateStats: actions.updateProjectStats,
    isLoading: stats.isLoading,
  };
};

export const useSkillStats = () => {
  const { stats, actions } = useAdminStats();
  return {
    ...stats.skills,
    updateStats: actions.updateSkillStats,
    isLoading: stats.isLoading,
  };
};

export const useSystemStats = () => {
  const { stats, actions } = useAdminStats();
  return {
    ...stats.system,
    updateStats: actions.updateSystemStats,
    isLoading: stats.isLoading,
  };
};

export default AdminStatsContext;
