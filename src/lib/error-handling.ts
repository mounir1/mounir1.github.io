import React from 'react';
import { toast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { ZodError } from 'zod';

// Error types for better categorization
export enum ErrorType {
  VALIDATION = 'validation',
  FIREBASE = 'firebase',
  NETWORK = 'network',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  UNKNOWN = 'unknown',
}

// Standard error structure
export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
  field?: string;
}

// Firebase error messages mapping
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'auth/user-not-found': 'No user found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests':
    'Too many failed login attempts. Please try again later.',
  'auth/network-request-failed':
    'Network error. Please check your internet connection.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',

  // Firestore errors
  'firestore/permission-denied':
    "You don't have permission to perform this action.",
  'firestore/not-found': 'The requested document was not found.',
  'firestore/already-exists': 'This document already exists.',
  'firestore/resource-exhausted': 'Quota exceeded. Please try again later.',
  'firestore/failed-precondition': 'Operation failed due to invalid state.',
  'firestore/aborted': 'Operation was aborted due to conflict.',
  'firestore/out-of-range': 'Invalid parameter value provided.',
  'firestore/unimplemented': 'This operation is not supported.',
  'firestore/internal': 'Internal server error. Please try again.',
  'firestore/unavailable': 'Service is temporarily unavailable.',
  'firestore/data-loss': 'Data corruption detected.',
  'firestore/unauthenticated': 'Please sign in to continue.',
  'firestore/deadline-exceeded': 'Operation timed out. Please try again.',
  'firestore/cancelled': 'Operation was cancelled.',

  // Storage errors
  'storage/object-not-found': 'File not found.',
  'storage/bucket-not-found': 'Storage bucket not found.',
  'storage/project-not-found': 'Project configuration error.',
  'storage/quota-exceeded': 'Storage quota exceeded.',
  'storage/unauthenticated': 'Please sign in to upload files.',
  'storage/unauthorized': "You don't have permission to access this file.",
  'storage/retry-limit-exceeded': 'Upload failed. Please try again.',
  'storage/invalid-checksum': 'File upload corrupted. Please try again.',
  'storage/canceled': 'Upload was cancelled.',
  'storage/invalid-event-name': 'Invalid operation.',
  'storage/invalid-url': 'Invalid file URL.',
  'storage/invalid-argument': 'Invalid file or path.',
  'storage/no-default-bucket': 'No storage bucket configured.',
  'storage/cannot-slice-blob': 'File processing error.',
  'storage/server-file-wrong-size': 'File size mismatch.',
};

// Network error detection
const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('ERR_NETWORK') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      error.message.includes('Network request failed')
    );
  }
  return false;
};

// Parse and categorize errors
export const parseError = (error: unknown): AppError => {
  // Validation errors (Zod)
  if (error instanceof ZodError) {
    const firstError = error.errors[0];
    return {
      type: ErrorType.VALIDATION,
      message: firstError?.message || 'Validation failed',
      details: error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', '),
      field: firstError?.path.join('.'),
    };
  }

  // Firebase errors
  if (error instanceof FirebaseError) {
    const friendlyMessage = FIREBASE_ERROR_MESSAGES[error.code];

    let type = ErrorType.FIREBASE;
    if (
      error.code.includes('permission-denied') ||
      error.code.includes('unauthorized')
    ) {
      type = ErrorType.PERMISSION;
    } else if (error.code.includes('not-found')) {
      type = ErrorType.NOT_FOUND;
    }

    return {
      type,
      message: friendlyMessage || 'An error occurred with the database',
      details: error.message,
      code: error.code,
    };
  }

  // Network errors
  if (isNetworkError(error)) {
    return {
      type: ErrorType.NETWORK,
      message:
        'Network error. Please check your internet connection and try again.',
      details: error instanceof Error ? error.message : String(error),
    };
  }

  // Generic JavaScript errors
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'An unexpected error occurred',
      details: error.stack,
    };
  }

  // Unknown error types
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred',
    details: String(error),
  };
};

// Toast notification for errors
export const showErrorToast = (
  error: unknown,
  customMessage?: string
): void => {
  const appError = parseError(error);

  toast({
    title: customMessage || getErrorTitle(appError.type),
    description: appError.message,
    variant: 'destructive',
  });

  // Log detailed error for debugging
  console.error('Error details:', {
    type: appError.type,
    message: appError.message,
    details: appError.details,
    code: appError.code,
    field: appError.field,
    originalError: error,
  });
};

// Get appropriate error title based on type
const getErrorTitle = (type: ErrorType): string => {
  switch (type) {
    case ErrorType.VALIDATION:
      return 'Validation Error';
    case ErrorType.FIREBASE:
      return 'Database Error';
    case ErrorType.NETWORK:
      return 'Network Error';
    case ErrorType.PERMISSION:
      return 'Permission Denied';
    case ErrorType.NOT_FOUND:
      return 'Not Found';
    default:
      return 'Error';
  }
};

// Success toast helper
export const showSuccessToast = (
  message: string,
  description?: string
): void => {
  toast({
    title: message,
    description,
    className:
      'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50',
  });
};

// Warning toast helper
export const showWarningToast = (
  message: string,
  description?: string
): void => {
  toast({
    title: message,
    description,
    className:
      'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-50',
  });
};

// Info toast helper
export const showInfoToast = (message: string, description?: string): void => {
  toast({
    title: message,
    description,
    className:
      'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-50',
  });
};

// Loading state management
interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export class LoadingManager {
  private static instance: LoadingManager;
  private loadingStates: Map<string, LoadingState> = new Map();
  private listeners: Set<(states: Map<string, LoadingState>) => void> =
    new Set();

  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  setLoading(
    key: string,
    isLoading: boolean,
    message?: string,
    progress?: number
  ): void {
    if (isLoading) {
      this.loadingStates.set(key, { isLoading, message, progress });
    } else {
      this.loadingStates.delete(key);
    }
    this.notifyListeners();
  }

  getLoading(key: string): LoadingState | undefined {
    return this.loadingStates.get(key);
  }

  isAnyLoading(): boolean {
    return Array.from(this.loadingStates.values()).some(
      state => state.isLoading
    );
  }

  getAllLoadingStates(): Map<string, LoadingState> {
    return new Map(this.loadingStates);
  }

  subscribe(listener: (states: Map<string, LoadingState>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(new Map(this.loadingStates)));
  }
}

// Loading hook creator
export const createLoadingHook = () => {
  const loadingManager = LoadingManager.getInstance();

  return {
    setLoading: (
      key: string,
      isLoading: boolean,
      message?: string,
      progress?: number
    ) => {
      loadingManager.setLoading(key, isLoading, message, progress);
    },
    getLoading: (key: string) => loadingManager.getLoading(key),
    isAnyLoading: () => loadingManager.isAnyLoading(),
    getAllLoadingStates: () => loadingManager.getAllLoadingStates(),
  };
};

// Error boundary helper (returns a function that can be used in React components)
export const withErrorBoundary = <T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) => {
  const WrappedComponent = (props: T) => {
    try {
      return React.createElement(Component, props);
    } catch (error) {
      console.error('Component error:', error);
      showErrorToast(error, 'Component Error');

      if (fallback) {
        return React.createElement(fallback, {
          error: error as Error,
          resetError: () => window.location.reload(),
        });
      }

      return React.createElement(
        'div',
        {
          className: 'flex items-center justify-center p-8 text-center',
        },
        React.createElement(
          'div',
          null,
          React.createElement(
            'h3',
            {
              className: 'text-lg font-semibold mb-2',
            },
            'Something went wrong'
          ),
          React.createElement(
            'p',
            {
              className: 'text-muted-foreground mb-4',
            },
            'An error occurred while rendering this component.'
          ),
          React.createElement(
            'button',
            {
              onClick: () => window.location.reload(),
              className:
                'px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90',
            },
            'Reload Page'
          )
        )
      );
    }
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Async operation wrapper with error handling
export const handleAsyncOperation = async <T>(
  operation: () => Promise<T>,
  options: {
    loadingKey?: string;
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    showLoading?: boolean;
    showSuccess?: boolean;
    showError?: boolean;
  } = {}
): Promise<T | null> => {
  const {
    loadingKey = 'operation',
    loadingMessage = 'Processing...',
    successMessage,
    errorMessage,
    showLoading = true,
    showSuccess = true,
    showError = true,
  } = options;

  const loadingManager = LoadingManager.getInstance();

  try {
    if (showLoading) {
      loadingManager.setLoading(loadingKey, true, loadingMessage);
    }

    const result = await operation();

    if (successMessage && showSuccess) {
      showSuccessToast(successMessage);
    }

    return result;
  } catch (error) {
    if (showError) {
      showErrorToast(error, errorMessage);
    }
    return null;
  } finally {
    if (showLoading) {
      loadingManager.setLoading(loadingKey, false);
    }
  }
};

// Retry mechanism for failed operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve =>
        setTimeout(resolve, delay * Math.pow(2, attempt - 1))
      );
    }
  }

  throw lastError;
};

// Form error helper
export const getFormFieldError = (
  error: unknown,
  fieldName: string
): string | undefined => {
  if (error instanceof ZodError) {
    const fieldError = error.errors.find(e => e.path.includes(fieldName));
    return fieldError?.message;
  }

  const appError = parseError(error);
  if (appError.type === ErrorType.VALIDATION && appError.field === fieldName) {
    return appError.message;
  }

  return undefined;
};

// Network status checker
export const checkNetworkStatus = (): boolean => {
  return navigator.onLine;
};

// Offline handler
export const handleOfflineOperation = (operationName: string): void => {
  if (!checkNetworkStatus()) {
    showWarningToast(
      "You're offline",
      `${operationName} will be performed when your connection is restored.`
    );
  }
};

export default {
  parseError,
  showErrorToast,
  showSuccessToast,
  showWarningToast,
  showInfoToast,
  LoadingManager,
  createLoadingHook,
  withErrorBoundary,
  handleAsyncOperation,
  retryOperation,
  getFormFieldError,
  checkNetworkStatus,
  handleOfflineOperation,
};
