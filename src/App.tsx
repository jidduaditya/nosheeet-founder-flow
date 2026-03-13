import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import { RequireAuth, RedirectIfAuth, RequireAuthOnly } from "@/components/AuthGuard";
import AppLayout from "@/components/AppLayout";

// Onboarding
import Login from "@/pages/Login";
import ProfileSetup from "@/pages/ProfileSetup";
import PermissionsPage from "@/pages/PermissionsPage";
import ConnectChannels from "@/pages/ConnectChannels";
import AiScanning from "@/pages/AiScanning";

// App
import Dashboard from "@/pages/Dashboard";
import Contacts from "@/pages/Contacts";
import ContactDetail from "@/pages/ContactDetail";
import Deals from "@/pages/Deals";
import DealDetail from "@/pages/DealDetail";
import Reminders from "@/pages/Reminders";
import MergeRequests from "@/pages/MergeRequests";
import Integrations from "@/pages/Integrations";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public / Onboarding */}
            <Route path="/login" element={<RedirectIfAuth><Login /></RedirectIfAuth>} />
            <Route path="/profile-setup" element={<RequireAuthOnly><ProfileSetup /></RequireAuthOnly>} />
            <Route path="/permissions" element={<RequireAuthOnly><PermissionsPage /></RequireAuthOnly>} />
            <Route path="/connect-channels" element={<RequireAuthOnly><ConnectChannels /></RequireAuthOnly>} />
            <Route path="/ai-scanning" element={<RequireAuthOnly><AiScanning /></RequireAuthOnly>} />

            {/* Protected App */}
            <Route element={<RequireAuth><AppLayout><Routes><Route path="*" element={null} /></Routes></AppLayout></RequireAuth>}>
              {/* Nested won't work this way, use wrapper */}
            </Route>

            {/* Protected routes with layout */}
            <Route path="/" element={<RequireAuth><AppLayout><Dashboard /></AppLayout></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><AppLayout><Dashboard /></AppLayout></RequireAuth>} />
            <Route path="/contacts" element={<RequireAuth><AppLayout><Contacts /></AppLayout></RequireAuth>} />
            <Route path="/contacts/:id" element={<RequireAuth><AppLayout><ContactDetail /></AppLayout></RequireAuth>} />
            <Route path="/deals" element={<RequireAuth><AppLayout><Deals /></AppLayout></RequireAuth>} />
            <Route path="/deals/:id" element={<RequireAuth><AppLayout><DealDetail /></AppLayout></RequireAuth>} />
            <Route path="/reminders" element={<RequireAuth><AppLayout><Reminders /></AppLayout></RequireAuth>} />
            <Route path="/merge-requests" element={<RequireAuth><AppLayout><MergeRequests /></AppLayout></RequireAuth>} />
            <Route path="/integrations" element={<RequireAuth><AppLayout><Integrations /></AppLayout></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><AppLayout><SettingsPage /></AppLayout></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
