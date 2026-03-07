import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';

// Error types
export interface AppError {
  id: string;
  type:
    | 'network'
    | 'validation'
    | 'authorization'
    | 'server'
    | 'client'
    | 'unknown';
  message: string;
  details?: string;
  timestamp: Date;
  action?: string; // Which action caused the error
  retry?: () => void;
  dismissible?: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Loading state types
export interface LoadingState {
  id: string;
  action: string;
  message?: string;
  progress?: number; // 0-100
  startTime: Date;
  cancellable?: boolean;
  onCancel?: () => void;
}

// Global state interface
export interface GlobalState {
  errors: AppError[];
  loadingStates: LoadingState[];
  isOnline: boolean;
  lastActivity: Date | null;
}

// State actions
type StateAction =
  | { type: 'ADD_ERROR'; payload: Omit<AppError, 'id' | 'timestamp'> }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'ADD_LOADING'; payload: Omit<LoadingState, 'id' | 'startTime'> }
  | {
      type: 'UPDATE_LOADING';
      payload: { id: string; progress?: number; message?: string };
    }
  | { type: 'REMOVE_LOADING'; payload: string }
  | { type: 'CLEAR_LOADING' }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'UPDATE_ACTIVITY' };

// Options for async action handling
export interface AsyncActionOptions {
  errorMessage?: string;
  loadingMessage?: string;
  showLoading?: boolean;
  showErrors?: boolean;
  retryable?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

// Initial state
const initialState: GlobalState = {
  errors: [],
  loadingStates: [],
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastActivity: null,
};

// State reducer
function stateReducer(state: GlobalState, action: StateAction): GlobalState {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [
          ...state.errors,
          {
            ...action.payload,
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
          },
        ],
      };

    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
      };

    case 'ADD_LOADING':
      return {
        ...state,
        loadingStates: [
          ...state.loadingStates,
          {
            ...action.payload,
            id: `loading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startTime: new Date(),
          },
        ],
      };

    case 'UPDATE_LOADING':
      return {
        ...state,
        loadingStates: state.loadingStates.map(loading =>
          loading.id === action.payload.id
            ? { ...loading, ...action.payload }
            : loading
        ),
      };

    case 'REMOVE_LOADING':
      return {
        ...state,
        loadingStates: state.loadingStates.filter(
          loading => loading.id !== action.payload
        ),
      };

    case 'CLEAR_LOADING':
      return {
        ...state,
        loadingStates: [],
      };

    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload,
      };

    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date(),
      };

    default:
      return state;
  }
}

// Context type
interface GlobalStateContextType {
  state: GlobalState;
  actions: {
    addError: (error: Omit<AppError, 'id' | 'timestamp'>) => string;
    removeError: (errorId: string) => void;
    clearErrors: () => void;
    addLoading: (loading: Omit<LoadingState, 'id' | 'startTime'>) => string;
    updateLoading: (
      id: string,
      updates: { progress?: number; message?: string }
    ) => void;
    removeLoading: (loadingId: string) => void;
    clearLoading: () => void;
    updateActivity: () => void;
    handleAsyncAction: (
      action: string,
      asyncFn: () => Promise<any>,
      options?: AsyncActionOptions
    ) => Promise<any>;
  };
}

// Create context
const GlobalStateContext = createContext<GlobalStateContextType | null>(null);

// Provider props
interface GlobalStateProviderProps {
  children: React.ReactNode;
  errorDisplayDuration?: number; // Auto-dismiss errors after this time (ms)
  maxErrors?: number; // Maximum number of errors to keep
  activityTimeout?: number; // Consider user inactive after this time (ms)
}

// Provider component
export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({
  children,
  errorDisplayDuration = 10000, // 10 seconds
  maxErrors = 10,
  activityTimeout = 300000, // 5 minutes
}) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () =>
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
    const handleOffline = () =>
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Activity tracking
  useEffect(() => {
    const updateActivity = () => dispatch({ type: 'UPDATE_ACTIVITY' });

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // Auto-dismiss errors
  useEffect(() => {
    const dismissibleErrors = state.errors.filter(
      error => error.dismissible !== false
    );

    if (dismissibleErrors.length > 0) {
      const timeouts = dismissibleErrors.map(error => {
        return setTimeout(() => {
          dispatch({ type: 'REMOVE_ERROR', payload: error.id });
        }, errorDisplayDuration);
      });

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [state.errors, errorDisplayDuration]);

  // Limit number of errors
  useEffect(() => {
    if (state.errors.length > maxErrors) {
      const errorsToRemove = state.errors
        .slice(0, state.errors.length - maxErrors)
        .map(error => error.id);

      errorsToRemove.forEach(errorId => {
        dispatch({ type: 'REMOVE_ERROR', payload: errorId });
      });
    }
  }, [state.errors, maxErrors]);

  // Actions
  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>) => {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    dispatch({ type: 'ADD_ERROR', payload: error });
    return errorId;
  }, []);

  const removeError = useCallback((errorId: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: errorId });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const addLoading = useCallback(
    (loading: Omit<LoadingState, 'id' | 'startTime'>) => {
      const loadingId = `loading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      dispatch({ type: 'ADD_LOADING', payload: loading });
      return loadingId;
    },
    []
  );

  const updateLoading = useCallback(
    (id: string, updates: { progress?: number; message?: string }) => {
      dispatch({ type: 'UPDATE_LOADING', payload: { id, ...updates } });
    },
    []
  );

  const removeLoading = useCallback((loadingId: string) => {
    dispatch({ type: 'REMOVE_LOADING', payload: loadingId });
  }, []);

  const clearLoading = useCallback(() => {
    dispatch({ type: 'CLEAR_LOADING' });
  }, []);

  const updateActivity = useCallback(() => {
    dispatch({ type: 'UPDATE_ACTIVITY' });
  }, []);

  // Generic async action handler
  const handleAsyncAction = useCallback(
    async (
      action: string,
      asyncFn: () => Promise<any>,
      options: AsyncActionOptions = {}
    ): Promise<any> => {
      const {
        errorMessage = `Failed to ${action}`,
        loadingMessage = `${action}...`,
        showLoading = true,
        showErrors = true,
        retryable = true,
        onError,
        onSuccess,
      } = options;

      let loadingId: string | null = null;

      try {
        // Start loading
        if (showLoading) {
          loadingId = addLoading({
            action,
            message: loadingMessage,
            cancellable: false,
          });
        }

        // Execute action
        const result = await asyncFn();

        // Success callback
        onSuccess?.();

        return result;
      } catch (error) {
        // Error handling
        const errorObj: Omit<AppError, 'id' | 'timestamp'> = {
          type: getErrorType(error),
          message: errorMessage,
          details: error instanceof Error ? error.message : String(error),
          action,
          severity: getSeverityFromError(error),
          dismissible: true,
        };

        // Add retry function if retryable
        if (retryable) {
          errorObj.retry = () => handleAsyncAction(action, asyncFn, options);
        }

        if (showErrors) {
          addError(errorObj);
        }

        // Error callback
        onError?.(error instanceof Error ? error : new Error(String(error)));

        throw error;
      } finally {
        // Stop loading
        if (loadingId) {
          removeLoading(loadingId);
        }

        // Update activity
        updateActivity();
      }
    },
    [addError, addLoading, removeLoading, updateActivity]
  );

  // Context value
  const contextValue: GlobalStateContextType = {
    state,
    actions: {
      addError,
      removeError,
      clearErrors,
      addLoading,
      updateLoading,
      removeLoading,
      clearLoading,
      updateActivity,
      handleAsyncAction,
    },
  };

  return (
    <GlobalStateContext.Provider value={contextValue}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Hook to use global state
export const useGlobalState = (): GlobalStateContextType => {
  const context = useContext(GlobalStateContext);

  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }

  return context;
};

// Convenience hooks
export const useErrors = () => {
  const { state, actions } = useGlobalState();
  return {
    errors: state.errors,
    addError: actions.addError,
    removeError: actions.removeError,
    clearErrors: actions.clearErrors,
    hasErrors: state.errors.length > 0,
    criticalErrors: state.errors.filter(e => e.severity === 'critical'),
    hasCriticalErrors: state.errors.some(e => e.severity === 'critical'),
  };
};

export const useLoading = () => {
  const { state, actions } = useGlobalState();
  return {
    loadingStates: state.loadingStates,
    addLoading: actions.addLoading,
    updateLoading: actions.updateLoading,
    removeLoading: actions.removeLoading,
    clearLoading: actions.clearLoading,
    isLoading: state.loadingStates.length > 0,
    isActionLoading: (action: string) =>
      state.loadingStates.some(l => l.action === action),
  };
};

export const useAsyncAction = () => {
  const { actions } = useGlobalState();
  return actions.handleAsyncAction;
};

export const useConnectionStatus = () => {
  const { state } = useGlobalState();
  return {
    isOnline: state.isOnline,
    isOffline: !state.isOnline,
  };
};

export const useUserActivity = () => {
  const { state, actions } = useGlobalState();
  return {
    lastActivity: state.lastActivity,
    updateActivity: actions.updateActivity,
    isIdle: state.lastActivity
      ? Date.now() - state.lastActivity.getTime() > 300000
      : false,
  };
};

// Utility functions
function getErrorType(error: any): AppError['type'] {
  if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
    return 'network';
  }
  if (error?.status === 401 || error?.status === 403) {
    return 'authorization';
  }
  if (error?.status >= 400 && error?.status < 500) {
    return 'client';
  }
  if (error?.status >= 500) {
    return 'server';
  }
  if (error?.name === 'ValidationError') {
    return 'validation';
  }
  return 'unknown';
}

function getSeverityFromError(error: any): AppError['severity'] {
  const type = getErrorType(error);

  switch (type) {
    case 'authorization':
    case 'server':
      return 'critical';
    case 'network':
      return 'high';
    case 'validation':
    case 'client':
      return 'medium';
    default:
      return 'low';
  }
}

export default GlobalStateProvider;
