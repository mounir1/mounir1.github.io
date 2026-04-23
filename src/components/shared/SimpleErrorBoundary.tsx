import React, { Component, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class SimpleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught an error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-8">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
            <p className="mb-6 text-muted-foreground">
              Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export as default ErrorBoundary
export const ErrorBoundary = SimpleErrorBoundary;
export default SimpleErrorBoundary;
