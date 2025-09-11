import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  DollarSign, 
  UserCheck,
} from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { StatsCard } from "@/components/ui/stats-card";

export default function AdminOverview() {
  const { stats, loading } = useAdmin();

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
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
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h2>
            <p className="text-muted-foreground">
              Visão geral do sistema e métricas principais
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Professores"
            value={stats?.totalProfessores || 0}
            subtitle="Cadastrados"
            icon={Users}
            color="blue"
          />
          <StatsCard 
            title="Professores Ativos"
            value={stats?.professoresAtivos || 0}
            subtitle="Em funcionamento"
            icon={UserCheck}
            color="green"
          />
          <StatsCard 
            title="Total Alunos"
            value={stats?.totalAlunos || 0}
            subtitle="No sistema"
            icon={Users}
            color="purple"
          />
          <StatsCard 
            title="Receita Total"
            value={`R$ ${(stats?.receitaTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            subtitle="Pagamentos recebidos"
            icon={DollarSign}
            color="green"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Professores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Ativos</span>
                  </div>
                  <span className="font-medium">{stats?.professoresAtivos}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Suspensos</span>
                  </div>
                  <span className="font-medium">{stats?.professoresSuspensos}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Inativos</span>
                  </div>
                  <span className="font-medium">{stats?.professoresInativos}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Pagamentos Recebidos</span>
                  <span className="font-medium text-green-600">{stats?.pagamentosPagos}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pagamentos Pendentes</span>
                  <span className="font-medium text-yellow-600">{stats?.pagamentosPendentes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Aulas no Mês</span>
                  <span className="font-medium">{stats?.aulasNoMes}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}