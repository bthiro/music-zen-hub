import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Gate } from "@/components/Gate";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfessorApp from "./pages/ProfessorApp";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/google/callback" element={<AuthCallback />} />
            
            {/* Protected admin routes */}
            <Route path="/admin/*" element={
              <Gate allowedRoles={['admin']}>
                <AdminDashboard />
              </Gate>
            } />
            
            {/* Protected professor routes */}
            <Route path="/app/*" element={
              <Gate allowedRoles={['professor']} requireActiveStatus>
                <ProfessorApp />
              </Gate>
            } />
            
            {/* Root redirect based on auth */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
  </QueryClientProvider>
);

export default App;
