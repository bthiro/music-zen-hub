import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { Calendar, Users, BookOpen, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { GoogleCalendarIntegration } from '@/components/GoogleCalendarIntegration';
import { DashboardWidgets } from '@/components/dashboard/DashboardWidgets';
import { DashboardConfig } from '@/components/dashboard/DashboardConfig';
import { formatarData, formatarDataCompleta } from '@/lib/utils';

export default function Dashboard() {
  const { alunos, pagamentos, aulas, loading } = useSupabaseData();
  const [widgets, setWidgets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dashboardTheme, setDashboardTheme] = useState('default');

  // Configuração padrão de widgets
  useEffect(() => {
    setWidgets([
      { id: 'proximas-aulas', title: 'Próximas Aulas', type: 'list', position: { x: 0, y: 0 }, size: { width: 1, height: 1 }, enabled: true },
      { id: 'alunos-pendentes', title: 'Pagamentos Pendentes', type: 'list', position: { x: 1, y: 0 }, size: { width: 1, height: 1 }, enabled: true },
      { id: 'estatisticas-financeiras', title: 'Resumo Financeiro', type: 'stats', position: { x: 2, y: 0 }, size: { width: 1, height: 1 }, enabled: true },
      { id: 'progresso-alunos', title: 'Progresso dos Alunos', type: 'chart', position: { x: 0, y: 1 }, size: { width: 1, height: 1 }, enabled: true },
      { id: 'notificacoes', title: 'Notificações', type: 'notifications', position: { x: 1, y: 1 }, size: { width: 1, height: 1 }, enabled: true }
    ]);
  }, []);

  const handleWidgetUpdate = (newWidgets) => {
    setWidgets(newWidgets);
  };

  const handleThemeChange = (newTheme) => {
    setDashboardTheme(newTheme);
  };

  // Calcular estatísticas
  const totalAlunos = alunos.filter(a => a.ativo).length;
  
  const pagamentosRecebidos = pagamentos
    .filter(p => {
      const dataPagamento = new Date(p.data_pagamento || p.created_at);
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();
      return dataPagamento.getMonth() === mesAtual && 
             dataPagamento.getFullYear() === anoAtual &&
             p.status === 'pago';
    })
    .reduce((total, p) => total + Number(p.valor), 0);

  const aulasMes = aulas.filter(a => {
    const dataAula = new Date(a.data_hora);
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    return dataAula.getMonth() === mesAtual && 
           dataAula.getFullYear() === anoAtual &&
           a.status === 'realizada';
  }).length;

  const pagamentosPendentes = pagamentos.filter(p => 
    p.status === 'pendente' || p.status === 'atrasado'
  ).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <DashboardConfig
          widgets={widgets}
          onWidgetUpdate={handleWidgetUpdate}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          theme={dashboardTheme}
          onThemeChange={handleThemeChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Alunos"
            value={totalAlunos.toString()}
            subtitle="alunos cadastrados"
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Pagamentos Recebidos"
            value={`R$ ${pagamentosRecebidos.toFixed(2)}`}
            subtitle="no mês atual"
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Aulas do Mês"
            value={aulasMes.toString()}
            subtitle="aulas realizadas"
            icon={BookOpen}
            color="purple"
          />
          <StatsCard
            title="Pendências"
            value={pagamentosPendentes.toString()}
            subtitle="pagamentos pendentes"
            icon={AlertCircle}
            color="red"
          />
        </div>

        <DashboardWidgets
          widgets={widgets}
          onWidgetUpdate={handleWidgetUpdate}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Google Calendar
            </CardTitle>
            <CardDescription>
              Sincronize suas aulas com o Google Calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleCalendarIntegration />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}