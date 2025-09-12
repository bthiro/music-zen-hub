import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Gate } from "@/components/Gate";
import { SafeNavigation } from "@/utils/navigation";
import AuthPage from "./pages/AuthPage";
import ResetPassword from "./pages/ResetPassword";
import Logout from "./pages/Logout";
import { AdminRouter } from "@/components/AdminRouter";
import { ProfessorRouter } from "@/components/ProfessorRouter";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

function AppRouter() {
  const navigate = useNavigate();
  
  useEffect(() => {
    SafeNavigation.setNavigate(navigate);
  }, [navigate]);

  return (
    <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/google/callback" element={<AuthCallback />} />
            <Route path="/logout" element={<Logout />} />
            
            {/* Protected admin routes */}
            <Route path="/admin/*" element={
              <Gate allowedRoles={['admin']}>
                <AdminRouter />
              </Gate>
            } />
            
            {/* Protected professor routes */}
            <Route path="/app/*" element={
              <Gate allowedRoles={['professor']} requireActiveStatus>
                <ProfessorRouter />
              </Gate>
            } />
            
            {/* Root redirect based on auth */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
