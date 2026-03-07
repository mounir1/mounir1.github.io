import { useCallback, useState, useRef, useEffect } from 'react';

// Activity log entry types
export interface AdminActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, { from: any; to: any }>;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'data' | 'config' | 'security' | 'system';
  status: 'success' | 'failure' | 'partial';
  duration?: number; // in milliseconds
}

// Activity categories and their configurations
export const ACTIVITY_CATEGORIES = {
  auth: {
    actions: ['login', 'logout', 'password_change', 'permission_change'],
    defaultSeverity: 'medium' as const,
  },
  data: {
    actions: [
      'create',
      'read',
      'update',
      'delete',
      'export',
      'import',
      'bulk_operation',
    ],
    defaultSeverity: 'low' as const,
  },
  config: {
    actions: [
      'settings_change',
      'user_management',
      'role_assignment',
      'system_config',
    ],
    defaultSeverity: 'high' as const,
  },
  security: {
    actions: [
      'failed_login',
      'suspicious_activity',
      'privilege_escalation',
      'data_breach',
    ],
    defaultSeverity: 'critical' as const,
  },
  system: {
    actions: ['backup', 'restore', 'maintenance', 'error', 'performance_issue'],
    defaultSeverity: 'medium' as const,
  },
};

// Logging configuration
export interface ActivityLoggingConfig {
  enabled: boolean;
  bufferSize: number;
  flushInterval: number; // ms
  retentionDays: number;
  storage: 'memory' | 'localStorage' | 'api';
  apiEndpoint?: string;
  onLogEntry?: (entry: AdminActivityLog) => void;
  onLogBatch?: (entries: AdminActivityLog[]) => void;
  filterRules?: {
    excludeActions?: string[];
    includeCategories?: (keyof typeof ACTIVITY_CATEGORIES)[];
    minSeverity?: AdminActivityLog['severity'];
  };
}

// Default configuration
const DEFAULT_CONFIG: ActivityLoggingConfig = {
  enabled: true,
  bufferSize: 100,
  flushInterval: 30000, // 30 seconds
  retentionDays: 90,
  storage: 'memory',
  filterRules: {
    minSeverity: 'low',
  },
};

// Severity levels for filtering
const SEVERITY_LEVELS = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

// Admin activity logging hook
export const useAdminActivityLogging = (
  config: Partial<ActivityLoggingConfig> = {},
  currentUser?: { id: string; username: string; sessionId: string }
) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [isLogging, setIsLogging] = useState(fullConfig.enabled);

  const logBuffer = useRef<AdminActivityLog[]>([]);
  const flushTimer = useRef<NodeJS.Timeout>();

  // Generate unique log ID
  const generateLogId = useCallback((): string => {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Check if log entry should be recorded based on filter rules
  const shouldLog = useCallback(
    (entry: Omit<AdminActivityLog, 'id' | 'timestamp'>): boolean => {
      if (!isLogging) return false;

      const { filterRules } = fullConfig;
      if (!filterRules) return true;

      // Check excluded actions
      if (filterRules.excludeActions?.includes(entry.action)) return false;

      // Check included categories
      if (
        filterRules.includeCategories &&
        !filterRules.includeCategories.includes(entry.category)
      ) {
        return false;
      }

      // Check minimum severity
      if (filterRules.minSeverity) {
        const entryLevel = SEVERITY_LEVELS[entry.severity];
        const minLevel = SEVERITY_LEVELS[filterRules.minSeverity];
        if (entryLevel < minLevel) return false;
      }

      return true;
    },
    [isLogging, fullConfig]
  );

  // Log an admin activity
  const logActivity = useCallback(
    (
      action: string,
      entity: string,
      options: {
        entityId?: string;
        changes?: Record<string, { from: any; to: any }>;
        metadata?: Record<string, any>;
        severity?: AdminActivityLog['severity'];
        category?: AdminActivityLog['category'];
        status?: AdminActivityLog['status'];
        duration?: number;
      } = {}
    ) => {
      if (!currentUser) {
        console.warn('Cannot log activity: no current user provided');
        return;
      }

      // Determine category and severity
      const category = options.category || determineCategoryFromAction(action);
      const severity =
        options.severity ||
        ACTIVITY_CATEGORIES[category]?.defaultSeverity ||
        'low';

      const logEntry: AdminActivityLog = {
        id: generateLogId(),
        userId: currentUser.id,
        username: currentUser.username,
        sessionId: currentUser.sessionId,
        action,
        entity,
        entityId: options.entityId,
        changes: options.changes,
        metadata: {
          ...options.metadata,
          timestamp: new Date().toISOString(),
          url:
            typeof window !== 'undefined'
              ? window.location.pathname
              : undefined,
        },
        timestamp: new Date(),
        severity,
        category,
        status: options.status || 'success',
        duration: options.duration,
        // Browser info (if available)
        userAgent:
          typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        ipAddress: undefined, // Would be set by server
      };

      if (!shouldLog(logEntry)) return;

      // Add to buffer
      logBuffer.current.push(logEntry);
      setLogs(prev => [...prev, logEntry]);

      // Trigger immediate callback
      fullConfig.onLogEntry?.(logEntry);

      // Flush if buffer is full
      if (logBuffer.current.length >= fullConfig.bufferSize) {
        flushLogs();
      }
    },
    [currentUser, generateLogId, shouldLog, fullConfig]
  );

  // Determine category from action
  function determineCategoryFromAction(
    action: string
  ): AdminActivityLog['category'] {
    for (const [category, config] of Object.entries(ACTIVITY_CATEGORIES)) {
      if (config.actions.some(a => action.includes(a))) {
        return category as keyof typeof ACTIVITY_CATEGORIES;
      }
    }
    return 'system'; // default fallback
  }

  // Flush logs to storage
  const flushLogs = useCallback(async () => {
    if (logBuffer.current.length === 0) return;

    const logsToFlush = [...logBuffer.current];
    logBuffer.current = [];

    try {
      switch (fullConfig.storage) {
        case 'localStorage':
          const existing = JSON.parse(
            localStorage.getItem('admin_activity_logs') || '[]'
          );
          const combined = [...existing, ...logsToFlush];

          // Apply retention policy
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - fullConfig.retentionDays);
          const filtered = combined.filter(
            log => new Date(log.timestamp) > cutoffDate
          );

          localStorage.setItem('admin_activity_logs', JSON.stringify(filtered));
          break;

        case 'api':
          if (fullConfig.apiEndpoint) {
            await fetch(fullConfig.apiEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ logs: logsToFlush }),
            });
          }
          break;

        case 'memory':
        default:
          // Already stored in state
          break;
      }

      fullConfig.onLogBatch?.(logsToFlush);
    } catch (error) {
      console.error('Failed to flush activity logs:', error);
      // Re-add failed logs to buffer
      logBuffer.current.unshift(...logsToFlush);
    }
  }, [fullConfig]);

  // Set up flush timer
  useEffect(() => {
    if (fullConfig.flushInterval > 0) {
      flushTimer.current = setInterval(flushLogs, fullConfig.flushInterval);

      return () => {
        if (flushTimer.current) {
          clearInterval(flushTimer.current);
          flushLogs(); // Flush remaining logs
        }
      };
    }
  }, [flushLogs, fullConfig.flushInterval]);

  // Convenience methods for common admin actions
  const logUserAction = useCallback(
    (action: string, details?: any) => {
      logActivity(action, 'user', {
        category: 'auth',
        metadata: details,
      });
    },
    [logActivity]
  );

  const logDataOperation = useCallback(
    (
      operation: 'create' | 'read' | 'update' | 'delete',
      entity: string,
      entityId?: string,
      changes?: Record<string, { from: any; to: any }>
    ) => {
      logActivity(operation, entity, {
        entityId,
        changes,
        category: 'data',
        severity: operation === 'delete' ? 'medium' : 'low',
      });
    },
    [logActivity]
  );

  const logSecurityEvent = useCallback(
    (event: string, details?: any) => {
      logActivity(event, 'security', {
        category: 'security',
        severity: 'critical',
        metadata: details,
      });
    },
    [logActivity]
  );

  const logSystemEvent = useCallback(
    (event: string, details?: any) => {
      logActivity(event, 'system', {
        category: 'system',
        severity: 'medium',
        metadata: details,
      });
    },
    [logActivity]
  );

  const logConfigChange = useCallback(
    (setting: string, from: any, to: any) => {
      logActivity('settings_change', 'configuration', {
        changes: { [setting]: { from, to } },
        category: 'config',
        severity: 'high',
      });
    },
    [logActivity]
  );

  // Search and filter logs
  const searchLogs = useCallback(
    (criteria: {
      action?: string;
      entity?: string;
      userId?: string;
      category?: AdminActivityLog['category'];
      severity?: AdminActivityLog['severity'];
      status?: AdminActivityLog['status'];
      dateFrom?: Date;
      dateTo?: Date;
      textSearch?: string;
    }) => {
      return logs.filter(log => {
        if (criteria.action && !log.action.includes(criteria.action))
          return false;
        if (criteria.entity && !log.entity.includes(criteria.entity))
          return false;
        if (criteria.userId && log.userId !== criteria.userId) return false;
        if (criteria.category && log.category !== criteria.category)
          return false;
        if (criteria.severity && log.severity !== criteria.severity)
          return false;
        if (criteria.status && log.status !== criteria.status) return false;
        if (criteria.dateFrom && log.timestamp < criteria.dateFrom)
          return false;
        if (criteria.dateTo && log.timestamp > criteria.dateTo) return false;
        if (criteria.textSearch) {
          const searchText = criteria.textSearch.toLowerCase();
          const searchableText = [
            log.action,
            log.entity,
            log.username,
            JSON.stringify(log.metadata),
          ]
            .join(' ')
            .toLowerCase();
          if (!searchableText.includes(searchText)) return false;
        }
        return true;
      });
    },
    [logs]
  );

  // Get activity statistics
  const getActivityStats = useCallback(() => {
    const stats = {
      totalLogs: logs.length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      recentActivity: logs.slice(-10).reverse(),
      topActions: {} as Record<string, number>,
    };

    logs.forEach(log => {
      stats.byCategory[log.category] =
        (stats.byCategory[log.category] || 0) + 1;
      stats.bySeverity[log.severity] =
        (stats.bySeverity[log.severity] || 0) + 1;
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
      stats.byUser[log.username] = (stats.byUser[log.username] || 0) + 1;
      stats.topActions[log.action] = (stats.topActions[log.action] || 0) + 1;
    });

    return stats;
  }, [logs]);

  // Export logs
  const exportLogs = useCallback(
    (format: 'json' | 'csv' = 'json') => {
      if (format === 'json') {
        return JSON.stringify(logs, null, 2);
      } else {
        const headers = [
          'ID',
          'Timestamp',
          'User',
          'Action',
          'Entity',
          'Entity ID',
          'Category',
          'Severity',
          'Status',
          'Duration',
          'Changes',
          'Metadata',
        ];

        const csvRows = [
          headers.join(','),
          ...logs.map(log =>
            [
              log.id,
              log.timestamp.toISOString(),
              log.username,
              log.action,
              log.entity,
              log.entityId || '',
              log.category,
              log.severity,
              log.status,
              log.duration || '',
              JSON.stringify(log.changes || {}),
              JSON.stringify(log.metadata || {}),
            ]
              .map(field => `"${field}"`)
              .join(',')
          ),
        ];

        return csvRows.join('\n');
      }
    },
    [logs]
  );

  return {
    logs,
    isLogging,
    setIsLogging,
    logActivity,
    logUserAction,
    logDataOperation,
    logSecurityEvent,
    logSystemEvent,
    logConfigChange,
    searchLogs,
    getActivityStats,
    exportLogs,
    flushLogs,
  };
};

export default useAdminActivityLogging;
