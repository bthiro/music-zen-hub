import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import AdminDashboard from "@/pages/AdminDashboard";
import { GlobalPaymentsView } from "@/components/GlobalPaymentsView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone } from "lucide-react";
import PerfilAdmin from "@/pages/PerfilAdmin";

// Admin Global Alunos View
function AdminAlunosView() {
  const { professores, loading } = useAdmin();

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Alunos (Visão Global)</h2>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Alunos (Visão Global)</h2>
            <p className="text-muted-foreground">
              Todos os alunos do sistema por professor
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {professores.map((professor) => (
            <Card key={professor.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {professor.nome}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {professor.email}
                      {professor.telefone && (
                        <>
                          <Phone className="h-4 w-4 ml-2" />
                          {professor.telefone}
                        </>
                      )}
                    </p>
                  </div>
                  <Badge 
                    variant={professor.status === 'ativo' ? 'default' : 'secondary'}
                    className={
                      professor.status === 'ativo' ? 'bg-green-500' :
                      professor.status === 'suspenso' ? 'bg-yellow-500' : 'bg-red-500'
                    }
                  >
                    {professor.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Plano: <span className="font-medium">{professor.plano}</span></p>
                  <p>Limite de alunos: <span className="font-medium">{professor.limite_alunos}</span></p>
                  <p className="mt-2">
                    Para ver os alunos específicos deste professor, use a funcionalidade de "Impersonar (Read-only)" na aba Professores.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

// Admin Configurações
function AdminConfiguracoes() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Configurações Administrativas</h2>
            <p className="text-muted-foreground">
              Configurações globais do sistema
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Configurações globais em desenvolvimento...
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export function AdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/professores" element={<AdminDashboard />} />
      <Route path="/professores/novo" element={<AdminDashboard />} />
      <Route path="/pagamentos" element={
        <Layout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Pagamentos (Visão Global)</h2>
                <p className="text-muted-foreground">
                  Todos os pagamentos do sistema
                </p>
              </div>
            </div>
            <GlobalPaymentsView />
          </div>
        </Layout>
      } />
      <Route path="/alunos" element={<AdminAlunosView />} />
      <Route path="/configuracoes" element={<AdminConfiguracoes />} />
      <Route path="/perfil" element={
        <Layout>
          <PerfilAdmin />
        </Layout>
      } />
    </Routes>
  );
}