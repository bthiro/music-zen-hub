import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useAuthContext } from "@/contexts/AuthContext";
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
import { Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Component for module access control
function ModuleGuard({ 
  children, 
  moduleKey, 
  moduleName 
}: { 
  children: React.ReactNode;
  moduleKey: string;
  moduleName: string;
}) {
  const { user } = useAuthContext();
  const modules = user?.profile?.modules || {};
  
  if (!modules[moduleKey]) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{moduleName}</h2>
              <p className="text-muted-foreground">Módulo não disponível</p>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Acesso Restrito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Este módulo não está habilitado em seu plano atual. Entre em contato com o administrador 
                para mais informações sobre como ativar este recurso.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return <>{children}</>;
}

export function ProfessorRouter() {
  return (
    <Routes>
      {/* Main dashboard route - should show calendar */}
      <Route path="/" element={
        <ModuleGuard moduleKey="dashboard" moduleName="Dashboard">
          <Dashboard />
        </ModuleGuard>
      } />
      <Route path="/dashboard" element={
        <ModuleGuard moduleKey="dashboard" moduleName="Dashboard">
          <Dashboard />
        </ModuleGuard>
      } />
      <Route path="/alunos" element={<Alunos />} />
      <Route path="/pagamentos" element={
        <ModuleGuard moduleKey="pagamentos" moduleName="Pagamentos">
          <Pagamentos />
        </ModuleGuard>
      } />
      <Route path="/aulas" element={
        <ModuleGuard moduleKey="agenda" moduleName="Aulas">
          <Aulas />
        </ModuleGuard>
      } />
      <Route path="/agenda" element={
        <ModuleGuard moduleKey="agenda" moduleName="Agenda">
          <Aulas />
        </ModuleGuard>
      } />
      <Route path="/relatorios" element={
        <ModuleGuard moduleKey="dashboard" moduleName="Relatórios">
          <Relatorios />
        </ModuleGuard>
      } />
      <Route path="/configuracoes" element={<Configuracoes />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/ferramentas" element={
        <ModuleGuard moduleKey="ferramentas" moduleName="Ferramentas">
          <Ferramentas />
        </ModuleGuard>
      } />
      <Route path="/ferramentas/lousa" element={
        <ModuleGuard moduleKey="lousa" moduleName="Lousa Digital">
          <Lousa />
        </ModuleGuard>
      } />
      <Route path="/lousa" element={
        <ModuleGuard moduleKey="lousa" moduleName="Lousa Digital">
          <Lousa />
        </ModuleGuard>
      } />
      <Route path="/ia-musical" element={
        <ModuleGuard moduleKey="ia" moduleName="IA Musical">
          <IaMusical />
        </ModuleGuard>
      } />
      <Route path="/ia" element={
        <ModuleGuard moduleKey="ia" moduleName="IA Musical">
          <IaMusical />
        </ModuleGuard>
      } />
      <Route path="/sessao-ao-vivo" element={
        <ModuleGuard moduleKey="agenda" moduleName="Sessão ao Vivo">
          <SessaoAoVivo />
        </ModuleGuard>
      } />
      <Route path="/materiais" element={
        <ModuleGuard moduleKey="materiais" moduleName="Materiais">
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
    </Routes>
  );
}