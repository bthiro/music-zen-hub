import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { Users, DollarSign, Calendar, AlertCircle, ExternalLink, CalendarDays } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral das suas aulas particulares
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAlunos}</div>
              <p className="text-xs text-muted-foreground">
                Alunos ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.pagamentosRecebidos}</div>
              <p className="text-xs text-muted-foreground">
                Pagamentos recebidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aulas do Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.aulasMes}</div>
              <p className="text-xs text-muted-foreground">
                Aulas agendadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendências</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pagamentosPendentes}</div>
              <p className="text-xs text-muted-foreground">
                Pagamentos em atraso
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Calendário e Aulas do Dia */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Calendário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={{
                  hasClass: datasComAulas
                }}
                modifiersStyles={{
                  hasClass: { backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }
                }}
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Aulas de Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {aulasDoDia.map((aula) => (
                  <div key={aula.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-lg">{aula.aluno}</p>
                      <p className="text-sm text-muted-foreground">
                        {aula.horario} - {formatarDataCompleta(aula.data)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Hoje
                      </div>
                      {aula.linkMeet && (
                        <Button size="sm" variant="default" asChild>
                          <a href={aula.linkMeet} target="_blank" rel="noopener noreferrer">
                            Entrar <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {aulasDoDia.length === 0 && (
                  <div className="text-center py-8">
                    <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Nenhuma aula agendada para hoje</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Próximas Aulas */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Aulas (3 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proximasAulas.map((aula) => (
                  <div key={aula.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{aula.aluno}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatarData(aula.data)} às {aula.horario}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        agendada
                      </div>
                      {aula.linkMeet && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={aula.linkMeet} target="_blank" rel="noopener noreferrer">
                            Meet <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {proximasAulas.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhuma aula agendada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pagamentos Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pagamentosPendentes.map((pagamento) => (
                  <div key={pagamento.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{pagamento.aluno}</p>
                      <p className="text-sm text-muted-foreground">
                        Vence em {formatarData(pagamento.vencimento)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">R$ {pagamento.valor}</p>
                    </div>
                  </div>
                ))}
                {pagamentosPendentes.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Todos os pagamentos em dia! 🎉
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}