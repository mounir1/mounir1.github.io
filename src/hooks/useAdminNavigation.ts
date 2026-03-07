import { useState, useCallback, useEffect, useMemo } from 'react';

// Navigation item type
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavItem[];
  isActive?: boolean;
  isExpanded?: boolean;
}

// Breadcrumb item type
export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

// Navigation state type
export interface NavigationState {
  currentPath: string;
  activeNavId: string | null;
  breadcrumbs: BreadcrumbItem[];
  sidebarCollapsed: boolean;
  expandedItems: Set<string>;
}

// Navigation hook configuration
export interface UseAdminNavigationConfig {
  navItems: NavItem[];
  defaultCollapsed?: boolean;
  persistCollapsedState?: boolean;
  autoExpandParents?: boolean;
}

// Default navigation items for admin dashboard
export const defaultAdminNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin',
    icon: '📊',
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/admin/projects',
    icon: '💼',
    children: [
      { id: 'projects-list', label: 'All Projects', path: '/admin/projects' },
      { id: 'projects-add', label: 'Add Project', path: '/admin/projects/add' },
      {
        id: 'projects-categories',
        label: 'Categories',
        path: '/admin/projects/categories',
      },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    path: '/admin/skills',
    icon: '🎯',
    children: [
      { id: 'skills-list', label: 'All Skills', path: '/admin/skills' },
      { id: 'skills-add', label: 'Add Skill', path: '/admin/skills/add' },
      {
        id: 'skills-categories',
        label: 'Categories',
        path: '/admin/skills/categories',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/admin/analytics',
    icon: '📈',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/admin/settings',
    icon: '⚙️',
    children: [
      { id: 'settings-general', label: 'General', path: '/admin/settings' },
      {
        id: 'settings-profile',
        label: 'Profile',
        path: '/admin/settings/profile',
      },
      {
        id: 'settings-security',
        label: 'Security',
        path: '/admin/settings/security',
      },
    ],
  },
];

// Storage key for persisting sidebar state
const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';

// Hook implementation
export const useAdminNavigation = (config: UseAdminNavigationConfig) => {
  const {
    navItems,
    defaultCollapsed = false,
    persistCollapsedState = true,
    autoExpandParents = true,
  } = config;

  // Initialize sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return defaultCollapsed;

    if (persistCollapsedState) {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultCollapsed;
    }

    return defaultCollapsed;
  });

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Get current path (using window.location for browser compatibility)
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    return '/admin';
  });

  // Listen for location changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };

    // Listen for browser navigation
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Find active nav item based on current path
  const activeNavItem = useMemo(() => {
    const findActiveItem = (items: NavItem[]): NavItem | null => {
      for (const item of items) {
        if (item.path === currentPath) {
          return item;
        }
        if (item.children) {
          const childMatch = findActiveItem(item.children);
          if (childMatch) return childMatch;
        }
      }
      return null;
    };

    return findActiveItem(navItems);
  }, [currentPath, navItems]);

  // Get active nav ID
  const activeNavId = activeNavItem?.id || null;

  // Generate breadcrumbs based on current path
  const breadcrumbs = useMemo(() => {
    const crumbs: BreadcrumbItem[] = [];

    // Add home/dashboard
    crumbs.push({ label: 'Dashboard', path: '/admin' });

    // Find path to current item
    const findPathToItem = (
      items: NavItem[],
      targetPath: string,
      path: NavItem[] = []
    ): NavItem[] | null => {
      for (const item of items) {
        const currentPath = [...path, item];

        if (item.path === targetPath) {
          return currentPath;
        }

        if (item.children) {
          const childPath = findPathToItem(
            item.children,
            targetPath,
            currentPath
          );
          if (childPath) return childPath;
        }
      }
      return null;
    };

    const pathToActive = findPathToItem(navItems, currentPath);

    if (pathToActive && pathToActive.length > 0) {
      // Skip dashboard if it's already added and it's the first item
      const startIndex = pathToActive[0]?.path === '/admin' ? 1 : 0;

      pathToActive.slice(startIndex).forEach((item, index, array) => {
        crumbs.push({
          label: item.label,
          path: item.path,
          isActive: index === array.length - 1,
        });
      });
    }

    return crumbs;
  }, [currentPath, navItems]);

  // Auto-expand parent items when child is active
  useEffect(() => {
    if (autoExpandParents && activeNavItem) {
      const findParentItems = (
        items: NavItem[],
        targetId: string,
        parents: string[] = []
      ): string[] => {
        for (const item of items) {
          if (item.id === targetId) {
            return parents;
          }
          if (item.children) {
            const childParents = findParentItems(item.children, targetId, [
              ...parents,
              item.id,
            ]);
            if (
              childParents.length > 0 ||
              item.children.some(child => child.id === targetId)
            ) {
              return [...parents, item.id];
            }
          }
        }
        return [];
      };

      const parentsToExpand = findParentItems(navItems, activeNavItem.id);
      if (parentsToExpand.length > 0) {
        setExpandedItems(prev => new Set([...prev, ...parentsToExpand]));
      }
    }
  }, [activeNavItem, navItems, autoExpandParents]);

  // Navigation actions
  const navigateTo = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const newState = !prev;
      if (persistCollapsedState) {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(newState));
      }
      return newState;
    });
  }, [persistCollapsedState]);

  const collapseSidebar = useCallback(() => {
    setSidebarCollapsed(true);
    if (persistCollapsedState) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(true));
    }
  }, [persistCollapsedState]);

  const expandSidebar = useCallback(() => {
    setSidebarCollapsed(false);
    if (persistCollapsedState) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(false));
    }
  }, [persistCollapsedState]);

  const toggleNavItem = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const expandNavItem = useCallback((itemId: string) => {
    setExpandedItems(prev => new Set([...prev, itemId]));
  }, []);

  const collapseNavItem = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  const collapseAllNavItems = useCallback(() => {
    setExpandedItems(new Set());
  }, []);

  // Enhanced nav items with active and expanded states
  const enhancedNavItems = useMemo(() => {
    const enhanceItems = (items: NavItem[]): NavItem[] => {
      return items.map(item => ({
        ...item,
        isActive: item.id === activeNavId || item.path === currentPath,
        isExpanded: expandedItems.has(item.id),
        children: item.children ? enhanceItems(item.children) : undefined,
      }));
    };

    return enhanceItems(navItems);
  }, [navItems, activeNavId, currentPath, expandedItems]);

  // Navigation state
  const navigationState: NavigationState = {
    currentPath,
    activeNavId,
    breadcrumbs,
    sidebarCollapsed,
    expandedItems,
  };

  // Check if current path is admin route
  const isAdminRoute = currentPath.startsWith('/admin');

  // Check if sidebar should be shown
  const showSidebar = isAdminRoute;

  return {
    // State
    ...navigationState,
    navItems: enhancedNavItems,
    activeNavItem,
    isAdminRoute,
    showSidebar,

    // Actions
    navigateTo,
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
    toggleNavItem,
    expandNavItem,
    collapseNavItem,
    collapseAllNavItems,
  };
};

// Default hook with predefined nav items
export const useDefaultAdminNavigation = (
  options?: Partial<UseAdminNavigationConfig>
) => {
  return useAdminNavigation({
    navItems: defaultAdminNavItems,
    ...options,
  });
};

export default useAdminNavigation;
