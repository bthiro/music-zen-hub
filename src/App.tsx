import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import SupabaseAlunos from "./pages/SupabaseAlunos";
import Pagamentos from "./pages/Pagamentos";
import Aulas from "./pages/Aulas";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import IaMusical from "./pages/IaMusical";
import Lousa from "./pages/Lousa";
import Ferramentas from "./pages/Ferramentas";
import SessaoAoVivo from "./pages/SessaoAoVivo";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/aulas" element={
                <ProtectedRoute>
                  <Aulas />
                </ProtectedRoute>
              } />
              <Route path="/sessao-ao-vivo" element={
                <ProtectedRoute>
                  <SessaoAoVivo />
                </ProtectedRoute>
              } />
              <Route path="/alunos" element={
                <ProtectedRoute>
                  <SupabaseAlunos />
                </ProtectedRoute>
              } />
              <Route path="/pagamentos" element={
                <ProtectedRoute>
                  <Pagamentos />
                </ProtectedRoute>
              } />
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <Relatorios />
                </ProtectedRoute>
              } />
              <Route path="/lousa" element={
                <ProtectedRoute>
                  <Lousa />
                </ProtectedRoute>
              } />
              <Route path="/ferramentas" element={
                <ProtectedRoute>
                  <Ferramentas />
                </ProtectedRoute>
              } />
              <Route path="/ia-musical" element={
                <ProtectedRoute>
                  <IaMusical />
                </ProtectedRoute>
              } />
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
