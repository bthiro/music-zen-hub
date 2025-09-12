import { CleanLayout } from "@/components/CleanLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { Users, DollarSign, Calendar, AlertCircle, ExternalLink, CalendarDays, Crown } from "lucide-react";
import { CalendarWidget } from "@/components/CalendarWidget";
import { StatsCard } from "@/components/ui/stats-card";
import { t } from "@/constants/translations";
import { useState } from "react";
import { useProfessorPlan } from "@/hooks/useProfessorPlan";
import { Badge } from "@/components/ui/badge";
import { useConversionMetrics } from "@/hooks/useConversionMetrics";

export default function Dashboard() {
  const { alunos, pagamentos, aulas } = useApp();
  const { planInfo, currentStudentCount, isFreePlan } = useProfessorPlan();
  const { trackEvent } = useConversionMetrics();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleUpgradeClick = () => {
    trackEvent('upgrade_click', { feature: 'dashboard_banner', from_free_plan: true });
    // TODO: Implementar modal de checkout
  };

  // Calcular estatísticas dinâmicas
  const stats = {
    totalAlunos: alunos.filter(a => a.status === "ativo").length,
    pagamentosRecebidos: pagamentos
      .filter(p => p.status === "pago")
      .reduce((sum, p) => sum + p.valor, 0),
    aulasMes: aulas.filter(a => {
      const hoje = new Date();
      const dataAula = new Date(a.data);
      return dataAula.getMonth() === hoje.getMonth() && 
             dataAula.getFullYear() === hoje.getFullYear();
    }).length,
    pagamentosPendentes: pagamentos.filter(p => p.status !== "pago").length
  };

  // Aulas do dia atual
  const hoje = new Date();
  const aulasDoDia = aulas
    .filter(aula => {
      const dataAula = new Date(aula.data);
      return dataAula.toDateString() === hoje.toDateString() && aula.status === "agendada";
    })
    .sort((a, b) => a.horario.localeCompare(b.horario));

  const proximasAulas = aulas
    .filter(aula => {
      const dataAula = new Date(aula.data);
      return dataAula >= hoje && aula.status === "agendada";
    })
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3);

  // Datas com aulas para destacar no calendário
  const datasComAulas = aulas
    .filter(aula => aula.status === "agendada")
    .map(aula => new Date(aula.data));

  const formatarDataCompleta = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const pagamentosPendentes = pagamentos
    .filter(p => p.status === "atrasado")
    .slice(0, 3);

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <CleanLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-display">{t('navigation.dashboard')}</h2>
            <p className="text-muted-foreground">
              {t('business.dashboardOverview')}
            </p>
          </div>
          
          {/* Plan Info */}
          {planInfo && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">
                  {currentStudentCount}/{planInfo.limite_alunos} alunos
                </div>
                <div className="text-xs text-muted-foreground">
                  Plano {planInfo.nome}
                </div>
              </div>
              <Badge 
                variant={isFreePlan() ? "secondary" : "default"}
                className={isFreePlan() ? "bg-amber-100 text-amber-800 border-amber-200" : ""}
              >
                {isFreePlan() && <Crown className="h-3 w-3 mr-1" />}
                {planInfo.nome}
              </Badge>
            </div>
          )}
        </div>

        {/* Free Plan Upgrade Banner */}
        {isFreePlan() && (
          <Card className="border-2 border-dashed border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Crown className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900">Maximize seu potencial!</h3>
                  <p className="text-sm text-amber-700">
                    Desbloqueie alunos ilimitados, IA e integração com Mercado Pago
                  </p>
                </div>
              </div>
              <Button onClick={handleUpgradeClick} className="bg-amber-600 hover:bg-amber-700">
                <Crown className="mr-2 h-4 w-4" />
                Fazer Upgrade
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title={t('business.totalStudents')}
            value={stats.totalAlunos}
            subtitle={t('business.activeStudents')}
            icon={Users}
            color="blue"
          />

          <StatsCard 
            title={t('business.monthlyRevenue')}
            value={`R$ ${stats.pagamentosRecebidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            subtitle={t('business.receivedPayments')}
            icon={DollarSign}
            color="green"
            trend={{
              value: 12,
              direction: 'up',
              label: t('business.vsPreviousMonth')
            }}
          />

          <StatsCard 
            title={t('business.monthlyLessons')}
            value={stats.aulasMes}
            subtitle={t('business.scheduledLessons')}
            icon={Calendar}
            color="purple"
          />

          <StatsCard 
            title={t('business.pendingPayments')}
            value={stats.pagamentosPendentes}
            subtitle={t('business.overduePayments')}
            icon={AlertCircle}
            color="red"
            badge={stats.pagamentosPendentes > 0 ? {
              text: t('common.attention'),
              variant: "destructive"
            } : undefined}
          />
        </div>

        {/* Calendar Integration */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
                {t('navigation.schedule')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <CalendarWidget />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">{t('business.todaysLessons')}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="space-y-3">
                {aulasDoDia.map((aula) => (
                  <div key={aula.id} className="flex flex-col p-3 border rounded-lg bg-muted/50 gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{aula.aluno}</p>
                      <p className="text-xs text-muted-foreground">
                        {aula.horario} - {formatarDataCompleta(aula.data)}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-between items-center">
                      <div className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">
                        {t('business.today')}
                      </div>
                      {aula.linkMeet && (
                        <Button size="sm" variant="default" asChild className="text-xs">
                          <a href={aula.linkMeet} target="_blank" rel="noopener noreferrer">
                            Meet
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {aulasDoDia.length === 0 && (
                  <div className="text-center py-6">
                    <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-sm">{t('business.noLessonsToday')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {/* Próximas Aulas */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">{t('business.upcomingLessons')} (3 dias)</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="space-y-3">
                {proximasAulas.map((aula) => (
                  <div key={aula.id} className="flex flex-col p-3 border rounded-lg gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{aula.aluno}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatarData(aula.data)} às {aula.horario}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-between items-center">
                      <div className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                        {t('status.scheduled')}
                      </div>
                      {aula.linkMeet && (
                        <Button size="sm" variant="outline" asChild className="text-xs">
                          <a href={aula.linkMeet} target="_blank" rel="noopener noreferrer">
                            Meet <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {proximasAulas.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    {t('business.noScheduledLessons')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pagamentos Pendentes */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">{t('business.pendingPayments')}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="space-y-3">
                {pagamentosPendentes.map((pagamento) => (
                  <div key={pagamento.id} className="flex flex-col p-3 border rounded-lg gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{pagamento.aluno}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence em {formatarData(pagamento.vencimento)}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-destructive text-sm">R$ {pagamento.valor}</p>
                    </div>
                  </div>
                ))}
                {pagamentosPendentes.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    {t('business.allPaymentsCurrent')} 🎉
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CleanLayout>
  );
}