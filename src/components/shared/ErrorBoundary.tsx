/**
 * Enhanced Error Boundary Component
 * Consolidated error boundary with comprehensive error handling and recovery options
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';

// Simple error boundary alias for backward compatibility - defined at the end of this file

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  isExpanded: boolean;
  copied: boolean;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  enableRetry?: boolean;
  enableReport?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  maxRetries?: number;
  title?: string;
  description?: string;
  className?: string;
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  errorId: string;
  onRetry: () => void;
  onReport?: () => void;
  onGoHome?: () => void;
  showErrorDetails: boolean;
  enableRetry: boolean;
  enableReport: boolean;
  retryCount: number;
  maxRetries: number;
  title?: string;
  description?: string;
  className?: string;
}

const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReport,
  onGoHome,
  showErrorDetails,
  enableRetry,
  enableReport,
  retryCount,
  maxRetries,
  title,
  description,
  className,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const errorDetails = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    errorId,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  const handleCopyError = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(errorDetails, null, 2)
      );
      setCopied(true);
      toast({
        title: 'Error details copied',
        description: 'Error information has been copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy error details to clipboard',
        variant: 'destructive',
      });
    }
  };

  const canRetry = enableRetry && retryCount < maxRetries;

  return (
    <div className={`flex items-center justify-center p-8 ${className || ''}`}>
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          <CardTitle className="text-xl">
            {title || 'Something went wrong'}
          </CardTitle>

          <CardDescription className="text-base">
            {description ||
              'We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error ID for reference */}
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertDescription>
              Error ID: <code className="font-mono text-xs">{errorId}</code>
            </AlertDescription>
          </Alert>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {canRetry && (
              <Button onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
                {retryCount > 0 && (
                  <span className="text-xs opacity-75">
                    ({retryCount}/{maxRetries})
                  </span>
                )}
              </Button>
            )}

            {onGoHome && (
              <Button
                variant="outline"
                onClick={onGoHome}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            )}

            {enableReport && onReport && (
              <Button
                variant="outline"
                onClick={onReport}
                className="flex items-center gap-2"
              >
                <Bug className="h-4 w-4" />
                Report Issue
              </Button>
            )}

            {showErrorDetails && (
              <Button
                variant="ghost"
                onClick={handleCopyError}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy Error Details
              </Button>
            )}
          </div>

          {/* Error details */}
          {showErrorDetails && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span>Error Details</span>
                  <span className="text-xs">
                    {isExpanded ? 'Hide' : 'Show'}
                  </span>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-2">
                <div className="rounded-md bg-muted p-4">
                  <h4 className="mb-2 text-sm font-semibold">Error Message:</h4>
                  <p className="font-mono text-sm text-destructive">
                    {error.message}
                  </p>
                </div>

                {error.stack && (
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="mb-2 text-sm font-semibold">Stack Trace:</h4>
                    <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {errorInfo.componentStack && (
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="mb-2 text-sm font-semibold">
                      Component Stack:
                    </h4>
                    <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {!canRetry && retryCount >= maxRetries && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Maximum retry attempts reached. Please refresh the page or
                contact support.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryCount = 0;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isExpanded: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (
      hasError &&
      prevProps.children !== this.props.children &&
      resetOnPropsChange
    ) {
      this.resetErrorBoundary();
    }

    if (hasError && resetKeys && resetKeys.length > 0) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    this.retryCount = 0;
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      isExpanded: false,
      copied: false,
    });
  };

  handleRetry = () => {
    this.retryCount++;
    this.resetErrorBoundary();
  };

  handleReport = () => {
    const { error, errorInfo, errorId } = this.state;
    if (!error || !errorInfo) return;

    // Here you could integrate with error reporting services
    // like Sentry, Bugsnag, etc.
    console.log('Reporting error:', { error, errorInfo, errorId });

    toast({
      title: 'Error reported',
      description: "Thank you for reporting this issue. We'll look into it.",
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const {
      children,
      fallback,
      showErrorDetails = true,
      enableRetry = true,
      enableReport = true,
      maxRetries = 3,
      title,
      description,
      className,
    } = this.props;

    const { hasError, error, errorInfo, errorId } = this.state;

    if (hasError && error && errorInfo) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorBoundaryFallback
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          onRetry={this.handleRetry}
          onReport={enableReport ? this.handleReport : undefined}
          onGoHome={this.handleGoHome}
          showErrorDetails={showErrorDetails}
          enableRetry={enableRetry}
          enableReport={enableReport}
          retryCount={this.retryCount}
          maxRetries={maxRetries}
          title={title}
          description={description}
          className={className}
        />
      );
    }

    return children;
  }
}
