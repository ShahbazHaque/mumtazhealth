import { Suspense, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { PageLoadingSkeleton } from './PageLoadingSkeleton';

interface RouteErrorBoundaryProps {
  children: ReactNode;
  variant?: 'dashboard' | 'tracker' | 'content' | 'simple';
}

/**
 * Wraps route components with error boundary and suspense for consistent error handling
 * and loading states across all routes.
 */
export function RouteErrorBoundary({ 
  children, 
  variant = 'simple' 
}: RouteErrorBoundaryProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoadingSkeleton variant={variant} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export default RouteErrorBoundary;
