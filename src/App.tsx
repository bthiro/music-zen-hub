import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppProvider } from "@/contexts/AppContext";
import { useUserRole } from "@/hooks/useUserRole";

import Dashboard from "./pages/Dashboard";
import Aulas from "./pages/Aulas";
import SessaoAoVivo from "./pages/SessaoAoVivo";
import Alunos from "./pages/Alunos";
import Pagamentos from "./pages/Pagamentos";
import Relatorios from "./pages/Relatorios";
import Lousa from "./pages/Lousa";
import Ferramentas from "./pages/Ferramentas";
import IaMusical from "./pages/IaMusical";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

function AppRoutes() {
  const { userRole, loading } = useUserRole();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Admin routes
  if (userRole === 'admin') {
    return (
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  // Teacher routes
  if (userRole === 'teacher') {
    return (
      <AppProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/aulas" element={<Aulas />} />
          <Route path="/sessao-ao-vivo" element={<SessaoAoVivo />} />
          <Route path="/alunos" element={<Alunos />} />
          <Route path="/pagamentos" element={<Pagamentos />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/lousa" element={<Lousa />} />
          <Route path="/ferramentas" element={<Ferramentas />} />
          <Route path="/ia-musical" element={<IaMusical />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProvider>
    );
  }

  // No role or invalid role - redirect to login
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppRoutes />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;