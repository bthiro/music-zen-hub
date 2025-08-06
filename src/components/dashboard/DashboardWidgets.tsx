import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Bell, 
  TrendingUp,
  BookOpen,
  MessageCircle,
  Play,
  Send
} from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { formatarData, formatarDataHora } from '@/lib/utils';

interface Widget {
  id: string;
  title: string;
  type: 'stats' | 'list' | 'chart' | 'notifications';
  position: { x: number; y: number };
  size: { width: number; height: number };
  enabled: boolean;
}

interface DashboardWidgetsProps {
  widgets: Widget[];
  onWidgetUpdate: (widgets: Widget[]) => void;
}

export function DashboardWidgets({ widgets, onWidgetUpdate }: DashboardWidgetsProps) {
  const { alunos, aulas, pagamentos, loading } = useSupabaseData();
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  // Calcular estatísticas
  const hoje = new Date().toISOString().split('T')[0];
  const aulasDoDia = aulas.filter(aula => 
    aula.data_hora.startsWith(hoje) && 
    aula.status !== 'cancelada'
  );

  const proximasAulas = aulas
    .filter(aula => {
      const dataAula = new Date(aula.data_hora);
      const agora = new Date();
      const emTresDias = new Date();
      emTresDias.setDate(agora.getDate() + 3);
      return dataAula >= agora && dataAula <= emTresDias && aula.status !== 'cancelada';
    })
    .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
    .slice(0, 5);

  const pagamentosPendentes = pagamentos.filter(p => p.status === 'pendente' || p.status === 'atrasado');
  
  const receitaMes = pagamentos
    .filter(p => {
      const dataPagamento = new Date(p.data_pagamento || p.created_at);
      const mesAtual = new Date().getMonth();
      const anoAtual = new Date().getFullYear();
      return dataPagamento.getMonth() === mesAtual && 
             dataPagamento.getFullYear() === anoAtual &&
             p.status === 'pago';
    })
    .reduce((total, p) => total + Number(p.valor), 0);

  const alunosAtivos = alunos.filter(a => a.ativo).length;

  const renderWidget = (widget: Widget) => {
    if (!widget.enabled) return null;

    const baseClasses = "transition-all duration-200 hover:shadow-md cursor-move";
    
    switch (widget.id) {
      case 'proximas-aulas':
        return (
          <Card key={widget.id} className={baseClasses}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Próximas Aulas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {proximasAulas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma aula agendada</p>
              ) : (
                proximasAulas.map((aula) => {
                  const aluno = alunos.find(a => a.id === aula.aluno_id);
                  return (
                    <div key={aula.id} className="flex items-center justify-between py-1">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{aluno?.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatarDataHora(aula.data_hora)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          <Play className="h-3 w-3 mr-1" />
                          Iniciar
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 text-xs">
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        );

      case 'alunos-pendentes':
        return (
          <Card key={widget.id} className={baseClasses}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Pagamentos Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pagamentosPendentes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum pagamento pendente</p>
              ) : (
                pagamentosPendentes.slice(0, 5).map((pagamento) => {
                  const aluno = alunos.find(a => a.id === pagamento.aluno_id);
                  const diasAtraso = Math.floor(
                    (new Date().getTime() - new Date(pagamento.data_vencimento).getTime()) / 
                    (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div key={pagamento.id} className="flex items-center justify-between py-1">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{aluno?.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {Number(pagamento.valor).toFixed(2)}
                          {diasAtraso > 0 && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              {diasAtraso} dias
                            </Badge>
                          )}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-xs">
                        <Send className="h-3 w-3 mr-1" />
                        Cobrar
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        );

      case 'estatisticas-financeiras':
        return (
          <Card key={widget.id} className={baseClasses}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Receita do mês</span>
                  <span className="font-medium">R$ {receitaMes.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pendentes</span>
                  <span className="text-destructive">
                    R$ {pagamentosPendentes.reduce((t, p) => t + Number(p.valor), 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Alunos ativos</span>
                  <span className="font-medium">{alunosAtivos}</span>
                </div>
              </div>
              <Progress value={alunosAtivos > 0 ? (receitaMes / (alunosAtivos * 150)) * 100 : 0} />
            </CardContent>
          </Card>
        );

      case 'progresso-alunos':
        return (
          <Card key={widget.id} className={baseClasses}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Progresso dos Alunos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alunos.slice(0, 4).map((aluno) => {
                const aulasRealizadas = aulas.filter(a => 
                  a.aluno_id === aluno.id && 
                  a.status === 'realizada'
                ).length;
                
                const progresso = Math.min((aulasRealizadas / 10) * 100, 100);
                
                return (
                  <div key={aluno.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{aluno.nome}</span>
                      <span>{aulasRealizadas} aulas</span>
                    </div>
                    <Progress value={progresso} className="h-1" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );

      case 'notificacoes':
        return (
          <Card key={widget.id} className={baseClasses}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                {aulasDoDia.length > 0 && (
                  <div className="text-xs p-2 bg-muted rounded">
                    {aulasDoDia.length} aula{aulasDoDia.length > 1 ? 's' : ''} hoje
                  </div>
                )}
                {pagamentosPendentes.length > 0 && (
                  <div className="text-xs p-2 bg-destructive/10 text-destructive rounded">
                    {pagamentosPendentes.length} pagamento{pagamentosPendentes.length > 1 ? 's' : ''} pendente{pagamentosPendentes.length > 1 ? 's' : ''}
                  </div>
                )}
                <div className="text-xs p-2 bg-muted rounded">
                  Sistema atualizado
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {widgets.filter(w => w.enabled).map(renderWidget)}
    </div>
  );
}