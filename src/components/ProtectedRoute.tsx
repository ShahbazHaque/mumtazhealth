import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If true, redirects authenticated users away (for auth pages) */
  redirectIfAuthenticated?: boolean;
  /** Where to redirect if auth check fails */
  redirectTo?: string;
}

/**
 * Wrapper component that protects routes requiring authentication.
 *
 * Usage:
 * - Wrap protected routes: <ProtectedRoute><Settings /></ProtectedRoute>
 * - For auth pages (redirect logged-in users): <ProtectedRoute redirectIfAuthenticated redirectTo="/">
 */
export function ProtectedRoute({
  children,
  redirectIfAuthenticated = false,
  redirectTo = "/auth"
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoadingSkeleton variant="simple" />;
  }

  // For auth pages - redirect authenticated users to home
  if (redirectIfAuthenticated && isAuthenticated) {
    const from = (location.state as { from?: Location })?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  // For protected pages - redirect unauthenticated users to auth
  if (!redirectIfAuthenticated && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
