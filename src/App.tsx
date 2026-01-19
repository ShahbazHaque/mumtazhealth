import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { MumtazWisdomGuide } from "@/components/MumtazWisdomGuide";
import ErrorBoundary from "@/components/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import { useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Tracker from "./pages/Tracker";
import Admin from "./pages/Admin";
import Onboarding from "./pages/Onboarding";
import MonthlySummary from "./pages/MonthlySummary";
import Bookings from "./pages/Bookings";
import ContentLibrary from "./pages/ContentLibrary";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import ConditionTracker from "./pages/ConditionTracker";
import MyDailyPractice from "./pages/MyDailyPractice";
import ResetPassword from "./pages/ResetPassword";
import HormonalTransitionTracker from "./pages/HormonalTransitionTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Route change logger for debugging
function RouteLogger() {
  const location = useLocation();
  
  useEffect(() => {
    console.log('[Router] Navigation to:', location.pathname, location.search);
  }, [location]);
  
  return null;
}

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
                <Tracker />
              </RouteErrorBoundary>
            } />
            <Route path="/auth" element={
              <RouteErrorBoundary variant="simple">
                <Auth />
              </RouteErrorBoundary>
            } />
            <Route path="/onboarding" element={
              <RouteErrorBoundary variant="simple">
                <Onboarding />
              </RouteErrorBoundary>
            } />
            <Route path="/summary" element={
              <RouteErrorBoundary variant="simple">
                <MonthlySummary />
              </RouteErrorBoundary>
            } />
            <Route path="/bookings" element={
              <RouteErrorBoundary variant="simple">
                <Bookings />
              </RouteErrorBoundary>
            } />
            <Route path="/content" element={
              <RouteErrorBoundary variant="content">
                <ContentLibrary />
              </RouteErrorBoundary>
            } />
            <Route path="/content-library" element={
              <RouteErrorBoundary variant="content">
                <ContentLibrary />
              </RouteErrorBoundary>
            } />
            <Route path="/insights" element={
              <RouteErrorBoundary variant="simple">
                <Insights />
              </RouteErrorBoundary>
            } />
            <Route path="/settings" element={
              <RouteErrorBoundary variant="simple">
                <Settings />
              </RouteErrorBoundary>
            } />
            <Route path="/condition-tracker" element={
              <RouteErrorBoundary variant="simple">
                <ConditionTracker />
              </RouteErrorBoundary>
            } />
            <Route path="/my-daily-practice" element={
              <RouteErrorBoundary variant="simple">
                <MyDailyPractice />
              </RouteErrorBoundary>
            } />
            <Route path="/reset-password" element={
              <RouteErrorBoundary variant="simple">
                <ResetPassword />
              </RouteErrorBoundary>
            } />
            <Route path="/hormonal-transition" element={
              <RouteErrorBoundary variant="simple">
                <HormonalTransitionTracker />
              </RouteErrorBoundary>
            } />
            <Route path="/admin" element={
              <RouteErrorBoundary variant="simple">
                <Admin />
              </RouteErrorBoundary>
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
