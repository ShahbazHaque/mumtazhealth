import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MumtazWisdomGuide } from "@/components/MumtazWisdomGuide";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <MumtazWisdomGuide />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/summary" element={<MonthlySummary />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/content" element={<ContentLibrary />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
