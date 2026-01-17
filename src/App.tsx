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
import ConditionTracker from "./pages/ConditionTracker";
import MyDailyPractice from "./pages/MyDailyPractice";
import ResetPassword from "./pages/ResetPassword";
import HormonalTransitionTracker from "./pages/HormonalTransitionTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <MumtazWisdomGuide />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/summary" element={<MonthlySummary />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/content" element={<ContentLibrary />} />
        <Route path="/content-library" element={<ContentLibrary />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/condition-tracker" element={<ConditionTracker />} />
        <Route path="/my-daily-practice" element={<MyDailyPractice />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/hormonal-transition" element={<HormonalTransitionTracker />} />
        <Route path="/admin" element={<Admin />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
