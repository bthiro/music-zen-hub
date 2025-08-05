import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Users, DollarSign, BookOpen, Plus, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { format, isAfter, isSameDay, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

export default function SupabaseDashboard() {
  const { professor } = useAuth();
  const { alunos, aulas, pagamentos, loading } = useSupabaseData();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Calcular estatísticas
  const hoje = new Date();
  const amanha = addDays(hoje, 1);
  
  const aulasHoje = aulas.filter(aula => 
    isSameDay(new Date(aula.data_hora), hoje)
  );
  
  const proximasAulas = aulas.filter(aula => 
    isAfter(new Date(aula.data_hora), hoje)
  ).slice(0, 5);
  
  const pagamentosPendentes = pagamentos.filter(p => p.status === 'pendente');
  const totalRecebido = pagamentos
    .filter(p => p.status === 'pago')
    .reduce((acc, p) => acc + Number(p.valor), 0);
  
  const alunosAtivos = alunos.filter(a => a.ativo);

  const formatarData = (data: string) => {
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatarDataHora = (data: string) => {
    return format(new Date(data), "dd/MM 'às' HH:mm", { locale: ptBR });
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Saudação */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Olá, {professor?.nome || 'Professor'}! 👋
            </h1>
            <p className="text-muted-foreground">
              Aqui está um resumo das suas atividades hoje
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/alunos">
                <Plus className="h-4 w-4 mr-2" />
                Novo Aluno
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/aulas">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Aula
              </Link>
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alunosAtivos.length}</div>
              <p className="text-xs text-muted-foreground">
                {alunos.length - alunosAtivos.length > 0 && 
                  `${alunos.length - alunosAtivos.length} inativos`
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aulas Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{aulasHoje.length}</div>
              <p className="text-xs text-muted-foreground">
                {aulasHoje.length > 0 ? 'Preparado para o dia!' : 'Nenhuma aula agendada'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatarValor(totalRecebido)}
              </div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pagamentosPendentes.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Pagamentos a receber
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Aulas Hoje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Aulas de Hoje
              </CardTitle>
              <CardDescription>
                {format(hoje, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {aulasHoje.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma aula agendada para hoje</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aulasHoje.map((aula) => (
                    <div key={aula.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{aula.aluno?.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(aula.data_hora), 'HH:mm')} • {aula.aluno?.instrumento}
                        </p>
                        {aula.tema && (
                          <p className="text-xs text-muted-foreground mt-1">{aula.tema}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {aula.presenca ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próximas Aulas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Próximas Aulas
              </CardTitle>
              <CardDescription>
                Suas próximas 5 aulas agendadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proximasAulas.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma aula agendada</p>
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link to="/aulas">Agendar Nova Aula</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {proximasAulas.map((aula) => (
                    <div key={aula.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{aula.aluno?.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatarDataHora(aula.data_hora)} • {aula.aluno?.instrumento}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/aulas">Ver Todas as Aulas</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagamentos Pendentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pagamentos Pendentes
              </CardTitle>
              <CardDescription>
                Pagamentos aguardando confirmação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pagamentosPendentes.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Todos os pagamentos em dia!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pagamentosPendentes.slice(0, 5).map((pagamento) => (
                    <div key={pagamento.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{pagamento.aluno?.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Vence em: {formatarData(pagamento.data_vencimento)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatarValor(Number(pagamento.valor))}</p>
                        <p className="text-xs text-muted-foreground">{pagamento.status}</p>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/pagamentos">Ver Todos os Pagamentos</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo Rápido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resumo Rápido
              </CardTitle>
              <CardDescription>
                Ações rápidas e estatísticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{aulas.length}</p>
                  <p className="text-xs text-muted-foreground">Total de Aulas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(alunos.map(a => a.instrumento).filter(Boolean)).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Instrumentos</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/lousa">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Abrir Lousa Musical
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/ferramentas">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ferramentas
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}