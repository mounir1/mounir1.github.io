import { toast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';
import { z } from 'zod';

// Error types for better error handling
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory =
  | 'validation'
  | 'network'
  | 'auth'
  | 'permission'
  | 'storage'
  | 'unknown';

export interface AppError {
  id: string;
  message: string;
  details?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  action?: string;
  recoverable: boolean;
  retryable: boolean;
  userMessage: string;
  technicalMessage?: string;
}

// Firebase error code mappings
const FIREBASE_ERROR_MESSAGES: Record<
  string,
  { message: string; severity: ErrorSeverity; recoverable: boolean }
> = {
  'auth/user-not-found': {
    message: 'No user account found with these credentials',
    severity: 'medium',
    recoverable: true,
  },
  'auth/wrong-password': {
    message: 'Incorrect password. Please try again',
    severity: 'medium',
    recoverable: true,
  },
  'auth/invalid-email': {
    message: 'Please enter a valid email address',
    severity: 'low',
    recoverable: true,
  },
  'auth/user-disabled': {
    message: 'This account has been disabled. Please contact support',
    severity: 'high',
    recoverable: false,
  },
  'auth/too-many-requests': {
    message: 'Too many failed attempts. Please try again later',
    severity: 'medium',
    recoverable: true,
  },
  'permission-denied': {
    message: "You don't have permission to perform this action",
    severity: 'high',
    recoverable: false,
  },
  'not-found': {
    message: 'The requested resource was not found',
    severity: 'medium',
    recoverable: true,
  },
  'already-exists': {
    message: 'A resource with this identifier already exists',
    severity: 'medium',
    recoverable: true,
  },
  'resource-exhausted': {
    message: 'Service quota exceeded. Please try again later',
    severity: 'high',
    recoverable: true,
  },
  unavailable: {
    message: 'Service is temporarily unavailable. Please try again',
    severity: 'medium',
    recoverable: true,
  },
  cancelled: {
    message: 'Operation was cancelled',
    severity: 'low',
    recoverable: true,
  },
  'deadline-exceeded': {
    message: 'Operation timed out. Please try again',
    severity: 'medium',
    recoverable: true,
  },
  'invalid-argument': {
    message: 'Invalid data provided. Please check your input',
    severity: 'medium',
    recoverable: true,
  },
  'failed-precondition': {
    message:
      'Operation failed due to system state. Please refresh and try again',
    severity: 'medium',
    recoverable: true,
  },
};

// Network error handling
const NETWORK_ERROR_MESSAGES: Record<
  string,
  { message: string; severity: ErrorSeverity }
> = {
  NetworkError: {
    message: 'Network connection lost. Please check your internet connection',
    severity: 'high',
  },
  TimeoutError: {
    message: 'Request timed out. Please try again',
    severity: 'medium',
  },
  AbortError: {
    message: 'Request was cancelled',
    severity: 'low',
  },
};

// Generate unique error ID
const generateErrorId = (): string => {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Enhanced error parser
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorHistory: AppError[] = [];
  private maxHistorySize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Parse any error into a standardized AppError
  parseError(error: unknown, context?: string): AppError {
    const timestamp = new Date();
    const id = generateErrorId();

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');

      return {
        id,
        message: 'Validation failed',
        details: validationErrors,
        category: 'validation',
        severity: 'medium',
        timestamp,
        action: context,
        recoverable: true,
        retryable: false,
        userMessage: 'Please correct the highlighted fields and try again',
        technicalMessage: validationErrors,
      };
    }

    // Handle Firebase errors
    if (error instanceof FirebaseError) {
      const errorInfo = FIREBASE_ERROR_MESSAGES[error.code] || {
        message: 'An unexpected error occurred',
        severity: 'medium' as ErrorSeverity,
        recoverable: true,
      };

      return {
        id,
        message: error.message,
        details: error.code,
        category: error.code.startsWith('auth/') ? 'auth' : 'storage',
        severity: errorInfo.severity,
        timestamp,
        action: context,
        recoverable: errorInfo.recoverable,
        retryable: errorInfo.recoverable,
        userMessage: errorInfo.message,
        technicalMessage: `Firebase Error: ${error.code} - ${error.message}`,
      };
    }

    // Handle network errors
    if (error instanceof Error) {
      const networkError = NETWORK_ERROR_MESSAGES[error.name];
      if (networkError) {
        return {
          id,
          message: error.message,
          details: error.name,
          category: 'network',
          severity: networkError.severity,
          timestamp,
          action: context,
          recoverable: true,
          retryable: true,
          userMessage: networkError.message,
          technicalMessage: error.message,
        };
      }

      // Handle permission errors
      if (error.message.toLowerCase().includes('permission')) {
        return {
          id,
          message: error.message,
          category: 'permission',
          severity: 'high',
          timestamp,
          action: context,
          recoverable: false,
          retryable: false,
          userMessage: "You don't have permission to perform this action",
          technicalMessage: error.message,
        };
      }

      // Generic error handling
      return {
        id,
        message: error.message,
        category: 'unknown',
        severity: 'medium',
        timestamp,
        action: context,
        recoverable: true,
        retryable: true,
        userMessage: 'Something went wrong. Please try again',
        technicalMessage: error.message,
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        id,
        message: error,
        category: 'unknown',
        severity: 'medium',
        timestamp,
        action: context,
        recoverable: true,
        retryable: true,
        userMessage: error,
        technicalMessage: error,
      };
    }

    // Handle unknown errors
    return {
      id,
      message: 'An unknown error occurred',
      category: 'unknown',
      severity: 'medium',
      timestamp,
      action: context,
      recoverable: true,
      retryable: true,
      userMessage: 'Something unexpected happened. Please try again',
      technicalMessage: JSON.stringify(error),
    };
  }

  // Store error in history
  private addToHistory(error: AppError): void {
    this.errorHistory.unshift(error);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.pop();
    }
  }

  // Handle error with appropriate user feedback
  handleError(
    error: unknown,
    context?: string,
    options?: {
      showToast?: boolean;
      logToConsole?: boolean;
      retryAction?: () => void;
      fallbackAction?: () => void;
    }
  ): AppError {
    const appError = this.parseError(error, context);
    this.addToHistory(appError);

    const {
      showToast = true,
      logToConsole = true,
      retryAction,
      fallbackAction,
    } = options || {};

    // Log to console if requested
    if (logToConsole) {
      console.error(
        `[${appError.category.toUpperCase()}] ${appError.message}`,
        {
          id: appError.id,
          context,
          details: appError.details,
          technicalMessage: appError.technicalMessage,
          originalError: error,
        }
      );
    }

    // Show toast notification if requested
    if (showToast) {
      const toastConfig = this.getToastConfig(
        appError,
        retryAction,
        fallbackAction
      );
      toast(toastConfig);
    }

    return appError;
  }

  // Generate toast configuration based on error
  private getToastConfig(
    error: AppError,
    retryAction?: () => void,
    fallbackAction?: () => void
  ) {
    const baseConfig = {
      title: this.getErrorTitle(error),
      description: error.userMessage,
      variant: this.getToastVariant(error.severity) as
        | 'default'
        | 'destructive',
    };

    // Add action buttons for recoverable errors
    if (error.recoverable || error.retryable) {
      const actions: any[] = [];

      if (error.retryable && retryAction) {
        actions.push({
          label: 'Retry',
          onClick: retryAction,
        });
      }

      if (fallbackAction) {
        actions.push({
          label: 'Continue',
          onClick: fallbackAction,
        });
      }

      return {
        ...baseConfig,
        action: actions.length > 0 ? actions[0] : undefined,
      };
    }

    return baseConfig;
  }

  private getErrorTitle(error: AppError): string {
    switch (error.category) {
      case 'validation':
        return 'Validation Error';
      case 'network':
        return 'Connection Issue';
      case 'auth':
        return 'Authentication Error';
      case 'permission':
        return 'Access Denied';
      case 'storage':
        return 'Data Error';
      default:
        return 'Error';
    }
  }

  private getToastVariant(severity: ErrorSeverity): string {
    return ['high', 'critical'].includes(severity) ? 'destructive' : 'default';
  }

  // Recovery suggestions based on error type
  getRecoverySuggestions(error: AppError): string[] {
    const suggestions: string[] = [];

    switch (error.category) {
      case 'network':
        suggestions.push(
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a moment and try again'
        );
        break;
      case 'auth':
        suggestions.push(
          'Check your login credentials',
          'Clear browser cache and cookies',
          'Try logging out and back in'
        );
        break;
      case 'validation':
        suggestions.push(
          'Review the highlighted fields',
          'Check for required information',
          'Ensure data formats are correct'
        );
        break;
      case 'permission':
        suggestions.push(
          'Contact your administrator',
          'Check your account permissions',
          'Try a different account'
        );
        break;
      default:
        suggestions.push(
          'Try again in a few moments',
          'Refresh the page',
          'Contact support if the issue persists'
        );
    }

    return suggestions;
  }

  // Get error history
  getErrorHistory(): AppError[] {
    return [...this.errorHistory];
  }

  // Clear error history
  clearHistory(): void {
    this.errorHistory = [];
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recent: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const byCategory: Record<ErrorCategory, number> = {
      validation: 0,
      network: 0,
      auth: 0,
      permission: 0,
      storage: 0,
      unknown: 0,
    };

    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    let recent = 0;

    this.errorHistory.forEach(error => {
      byCategory[error.category]++;
      bySeverity[error.severity]++;
      if (error.timestamp > oneHourAgo) {
        recent++;
      }
    });

    return {
      total: this.errorHistory.length,
      byCategory,
      bySeverity,
      recent,
    };
  }
}

// Convenience functions
export const errorHandler = ErrorHandler.getInstance();

export const handleError = (
  error: unknown,
  context?: string,
  options?: Parameters<typeof errorHandler.handleError>[2]
): AppError => {
  return errorHandler.handleError(error, context, options);
};

export const parseError = (error: unknown, context?: string): AppError => {
  return errorHandler.parseError(error, context);
};

export const getRecoverySuggestions = (error: AppError): string[] => {
  return errorHandler.getRecoverySuggestions(error);
};

// Error boundary helper
export const logErrorToBoundary = (error: Error, errorInfo: any): void => {
  const appError = errorHandler.parseError(error, 'React Error Boundary');
  console.error('React Error Boundary caught an error:', {
    error: appError,
    errorInfo,
    componentStack: errorInfo.componentStack,
  });
};

export default ErrorHandler;
