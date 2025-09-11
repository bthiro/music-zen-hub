import { CleanLayout } from "@/components/CleanLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { Users, DollarSign, Calendar, AlertCircle, ExternalLink, CalendarDays } from "lucide-react";
import { CalendarWidget } from "@/components/CalendarWidget";
import { StatsCard } from "@/components/ui/stats-card";
import { useState } from "react";

export default function Dashboard() {
  const { alunos, pagamentos, aulas } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral das suas aulas particulares
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total de Alunos"
            value={stats.totalAlunos}
            subtitle="Alunos ativos"
            icon={Users}
            color="blue"
          />

          <StatsCard 
            title="Receita do Mês"
            value={`R$ ${stats.pagamentosRecebidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            subtitle="Pagamentos recebidos"
            icon={DollarSign}
            color="green"
            trend={{
              value: 12,
              direction: 'up',
              label: 'vs mês anterior'
            }}
          />

          <StatsCard 
            title="Aulas do Mês"
            value={stats.aulasMes}
            subtitle="Aulas agendadas"
            icon={Calendar}
            color="purple"
          />

          <StatsCard 
            title="Pendências"
            value={stats.pagamentosPendentes}
            subtitle="Pagamentos em atraso"
            icon={AlertCircle}
            color="red"
            badge={stats.pagamentosPendentes > 0 ? {
              text: "Atenção",
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
                Agenda
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <CalendarWidget />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Aulas de Hoje</CardTitle>
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
                        Hoje
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
                    <p className="text-muted-foreground text-sm">Nenhuma aula agendada para hoje</p>
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
              <CardTitle className="text-base sm:text-lg">Próximas Aulas (3 dias)</CardTitle>
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
                        agendada
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
                    Nenhuma aula agendada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pagamentos Pendentes */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Pagamentos Pendentes</CardTitle>
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
                    Todos os pagamentos em dia! 🎉
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