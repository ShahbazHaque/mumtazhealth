import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    console.error('[ErrorBoundary] Caught error:', error.message);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    console.log('[ErrorBoundary] Retrying...');
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoHome = () => {
    console.log('[ErrorBoundary] Navigating to home...');
    // Use window.location to force a full page reload and clear any corrupted state
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md border-none shadow-xl bg-card/95 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <Logo size="lg" className="mx-auto" />
              <div className="p-3 rounded-full bg-destructive/10 w-fit mx-auto">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl text-foreground">
                Something went wrong
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                We encountered an unexpected error. Please try again or return to the home page.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={this.handleRetry}
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full gap-2"
              >
                <Home className="h-4 w-4" />
                Go to Home
              </Button>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 rounded-lg bg-muted text-xs">
                  <summary className="cursor-pointer text-muted-foreground font-medium">
                    Error Details (Dev Only)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-destructive overflow-auto max-h-40">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
