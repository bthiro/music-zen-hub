import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useProfessorProfile } from "@/hooks/useProfessorProfile";
import Dashboard from "@/pages/Dashboard";
import Alunos from "@/pages/Alunos";
import Pagamentos from "@/pages/Pagamentos";
import Aulas from "@/pages/Aulas";
import Relatorios from "@/pages/Relatorios";
import Configuracoes from "@/pages/Configuracoes";
import Ferramentas from "@/pages/Ferramentas";
import IaMusical from "@/pages/IaMusical";
import Lousa from "@/pages/Lousa";
import SessaoAoVivo from "@/pages/SessaoAoVivo";
import Perfil from "@/pages/Perfil";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Component for module access control
function ModuleGuard({ 
  children, 
  module
}: { 
  children: React.ReactNode;
  module: string;
}) {
  const { profile, loading: profileLoading } = useProfessorProfile();
  
  // Show loading while checking access
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando módulos...</p>
        </div>
      </div>
    );
  }

  // If no profile, allow access (better than blocking)
  if (!profile) {
    console.warn('[ModuleGuard] No profile found, allowing access to module:', module);
    return <>{children}</>;
  }

  // Check if module exists and is enabled, or if no modules defined (allow access)
  const modules = (profile as any)?.modules || {};
  const hasAccess = !modules || 
                   typeof modules !== 'object' || 
                   modules[module] === true ||
                   modules[module] === undefined; // Allow undefined modules

  console.log('[ModuleGuard] Module access check:', { 
    module, 
    hasAccess, 
    modules,
    profileId: profile?.id 
  });

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertTriangle className="h-16 w-16 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Acesso Restrito</h3>
            <p className="text-muted-foreground mt-2">
              Este módulo não está disponível no seu plano atual.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function ProfessorRouter() {
  return (
    <Routes>
      {/* Main dashboard route - should show calendar */}
      <Route index element={
        <ModuleGuard module="dashboard">
          <Dashboard />
        </ModuleGuard>
      } />
      <Route path="dashboard" element={
        <ModuleGuard module="dashboard">
          <Dashboard />
        </ModuleGuard>
      } />
      <Route path="/alunos" element={<Alunos />} />
      <Route path="/pagamentos" element={
        <ModuleGuard module="pagamentos">
          <Pagamentos />
        </ModuleGuard>
      } />
      <Route path="/aulas" element={
        <ModuleGuard module="agenda">
          <Aulas />
        </ModuleGuard>
      } />
      <Route path="/agenda" element={
        <ModuleGuard module="agenda">
          <Aulas />
        </ModuleGuard>
      } />
      <Route path="/relatorios" element={
        <ModuleGuard module="dashboard">
          <Relatorios />
        </ModuleGuard>
      } />
      <Route path="/configuracoes" element={<Configuracoes />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/ferramentas" element={
        <ModuleGuard module="ferramentas">
          <Ferramentas />
        </ModuleGuard>
      } />
      <Route path="/ferramentas/lousa" element={
        <ModuleGuard module="lousa">
          <Lousa />
        </ModuleGuard>
      } />
      <Route path="/lousa" element={
        <ModuleGuard module="lousa">
          <Lousa />
        </ModuleGuard>
      } />
      <Route path="/ia-musical" element={
        <ModuleGuard module="ia">
          <IaMusical />
        </ModuleGuard>
      } />
      <Route path="/ia" element={
        <ModuleGuard module="ia">
          <IaMusical />
        </ModuleGuard>
      } />
      <Route path="/sessao-ao-vivo" element={
        <ModuleGuard module="agenda">
          <SessaoAoVivo />
        </ModuleGuard>
      } />
      <Route path="/materiais" element={
        <ModuleGuard module="materiais">
          <Layout>
            <Card>
              <CardHeader>
                <CardTitle>Materiais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Módulo de materiais em desenvolvimento...</p>
              </CardContent>
            </Card>
          </Layout>
        </ModuleGuard>
      } />
      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
}