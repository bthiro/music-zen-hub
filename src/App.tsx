import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppProvider } from "@/contexts/AppContext";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
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
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;