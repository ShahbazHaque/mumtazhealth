import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { MumtazWisdomGuide } from "@/components/MumtazWisdomGuide";
import ErrorBoundary from "@/components/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { lazy, Suspense, useEffect } from "react";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Eagerly loaded pages (critical path)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages (code-splitting for smaller initial bundle)
const Tracker = lazy(() => import("./pages/Tracker"));
const Admin = lazy(() => import("./pages/Admin"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const MonthlySummary = lazy(() => import("./pages/MonthlySummary"));
const Bookings = lazy(() => import("./pages/Bookings"));
const ContentLibrary = lazy(() => import("./pages/ContentLibrary"));
const Insights = lazy(() => import("./pages/Insights"));
const Settings = lazy(() => import("./pages/Settings"));
const ConditionTracker = lazy(() => import("./pages/ConditionTracker"));
const MyDailyPractice = lazy(() => import("./pages/MyDailyPractice"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const HormonalTransitionTracker = lazy(() => import("./pages/HormonalTransitionTracker"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Route change logger for debugging (only in development)
function RouteLogger() {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[Router] Navigation to:', location.pathname, location.search);
    }
  }, [location]);

  return null;
}

// Suspense wrapper for lazy-loaded routes
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoadingSkeleton variant="simple" />}>
    {children}
  </Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LoadingProvider>
          <RouteLogger />
          <MumtazWisdomGuide />
          <Routes>
            <Route path="/" element={
              <RouteErrorBoundary variant="dashboard">
                <Index />
              </RouteErrorBoundary>
            } />
            <Route path="/tracker" element={
              <RouteErrorBoundary variant="tracker">
                <LazyRoute><Tracker /></LazyRoute>
              </RouteErrorBoundary>
            } />
            <Route path="/auth" element={
              <ProtectedRoute redirectIfAuthenticated redirectTo="/">
                <RouteErrorBoundary variant="simple">
                  <Auth />
                </RouteErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/onboarding" element={
              <RouteErrorBoundary variant="simple">
                <LazyRoute><Onboarding /></LazyRoute>
              </RouteErrorBoundary>
            } />
            <Route path="/summary" element={
              <ProtectedRoute>
                <RouteErrorBoundary variant="simple">
                  <LazyRoute><MonthlySummary /></LazyRoute>
                </RouteErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <RouteErrorBoundary variant="simple">
                <LazyRoute><Bookings /></LazyRoute>
              </RouteErrorBoundary>
            } />
            <Route path="/content" element={
              <RouteErrorBoundary variant="content">
                <LazyRoute><ContentLibrary /></LazyRoute>
              </RouteErrorBoundary>
            } />
            <Route path="/content-library" element={
              <RouteErrorBoundary variant="content">
                <LazyRoute><ContentLibrary /></LazyRoute>
              </RouteErrorBoundary>
            } />
            <Route path="/insights" element={
              <ProtectedRoute>
                <RouteErrorBoundary variant="simple">
                  <LazyRoute><Insights /></LazyRoute>
                </RouteErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <RouteErrorBoundary variant="simple">
                  <LazyRoute><Settings /></LazyRoute>
                </RouteErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/condition-tracker" element={
              <ProtectedRoute>
                <RouteErrorBoundary variant="simple">
                  <LazyRoute><ConditionTracker /></LazyRoute>
                </RouteErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/my-daily-practice" element={
              <ProtectedRoute>
                <RouteErrorBoundary variant="simple">
                  <LazyRoute><MyDailyPractice /></LazyRoute>
                </RouteErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/reset-password" element={
              <RouteErrorBoundary variant="simple">
                <LazyRoute><ResetPassword /></LazyRoute>
              </RouteErrorBoundary>
            } />
            <Route path="/hormonal-transition" element={
              <ProtectedRoute>
                <RouteErrorBoundary variant="simple">
                  <LazyRoute><HormonalTransitionTracker /></LazyRoute>
                </RouteErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <RouteErrorBoundary variant="simple">
                  <LazyRoute><Admin /></LazyRoute>
                </RouteErrorBoundary>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LoadingProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
