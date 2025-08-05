import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import Pagamentos from "./pages/Pagamentos";
import Aulas from "./pages/Aulas";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import IaMusical from "./pages/IaMusical";
import Lousa from "./pages/Lousa";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/aulas" element={<Aulas />} />
            <Route path="/alunos" element={<Alunos />} />
            <Route path="/pagamentos" element={<Pagamentos />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/lousa" element={<Lousa />} />
            <Route path="/ia-musical" element={<IaMusical />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
