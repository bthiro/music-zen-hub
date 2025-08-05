import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialDashboard } from "@/components/reports/FinancialDashboard";
import { AccountingReport } from "@/components/reports/AccountingReport";
import { StatsCard } from "@/components/ui/stats-card";
import { useApp } from "@/contexts/AppContext";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Download,
  BarChart3,
  FileText,
  PieChart
} from "lucide-react";

export default function Relatorios() {
  const { alunos, pagamentos, aulas } = useApp();

  // Calcular dados para relatórios básicos
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const dadosFinanceiros = {
    receitaMensal: pagamentos
      .filter(p => {
        const dataPagamento = p.pagamento ? new Date(p.pagamento) : null;
        return dataPagamento && 
               dataPagamento.getMonth() === mesAtual && 
               dataPagamento.getFullYear() === anoAtual;
      })
      .reduce((sum, p) => sum + p.valor, 0),
    
    receitaTotal: pagamentos
      .filter(p => p.status === "pago")
      .reduce((sum, p) => sum + p.valor, 0),
    
    pendencias: pagamentos
      .filter(p => p.status !== "pago")
      .reduce((sum, p) => sum + p.valor, 0),
    
    ticketMedio: alunos.length > 0 ? 
      alunos.reduce((sum, a) => sum + a.mensalidade, 0) / alunos.length : 0
  };

  const dadosAulas = {
    aulasMes: aulas.filter(a => {
      const dataAula = new Date(a.data);
      return dataAula.getMonth() === mesAtual && 
             dataAula.getFullYear() === anoAtual;
    }).length,
    
    aulasRealizadas: aulas.filter(a => a.status === "realizada").length,
    aulasCanceladas: aulas.filter(a => a.status === "cancelada").length,
    
    taxaComparecimento: aulas.length > 0 ? 
      (aulas.filter(a => a.status === "realizada").length / aulas.length * 100).toFixed(1) : 0
  };

  const exportarCSV = () => {
    // Dados dos alunos com codificação UTF-8 BOM para Excel
    const csvAlunos = [
      ['Nome', 'Email', 'Telefone', 'Cidade', 'Estado', 'País', 'Mensalidade', 'Status'],
      ...alunos.map(a => [
        a.nome, 
        a.email, 
        a.telefone || '', 
        a.cidade || '', 
        a.estado || '', 
        a.pais || 'Brasil', 
        a.mensalidade, 
        a.status
      ])
    ].map(row => row.join(';')).join('\n');

    // Dados dos pagamentos
    const csvPagamentos = [
      ['Aluno', 'Valor', 'Vencimento', 'Pagamento', 'Status'],
      ...pagamentos.map(p => [p.aluno, p.valor, p.vencimento, p.pagamento || '', p.status])
    ].map(row => row.join(';')).join('\n');

    // Criar arquivo combinado com BOM para UTF-8
    const csvCompleto = `\uFEFFALUNOS\n${csvAlunos}\n\nPAGAMENTOS\n${csvPagamentos}`;
    
    const blob = new Blob([csvCompleto], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-geral-${hoje.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Relatórios Gerenciais</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Análises financeiras, contábeis e operacionais completas
            </p>
          </div>
          <Button onClick={exportarCSV} className="w-full sm:w-auto btn-mobile">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exportar CSV Geral</span>
            <span className="sm:hidden">Exportar CSV</span>
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="operacional" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Operacional</span>
              <span className="sm:hidden">Operacional</span>
            </TabsTrigger>
            <TabsTrigger value="resumo" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <PieChart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="contabil" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Contábil</span>
              <span className="sm:hidden">Contábil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="operacional" className="space-y-6">
            {/* Métricas de Aulas */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4">🎵 Métricas Operacionais</h3>
              <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Aulas do Mês"
                  value={dadosAulas.aulasMes}
                  subtitle="Agendadas este mês"
                  icon={Calendar}
                  color="blue"
                />

                <StatsCard
                  title="Realizadas"
                  value={dadosAulas.aulasRealizadas}
                  subtitle="Total realizadas"
                  icon={Calendar}
                  color="green"
                  badge={{ text: "Sucesso", variant: "success" }}
                />

                <StatsCard
                  title="Canceladas"
                  value={dadosAulas.aulasCanceladas}
                  subtitle="Total canceladas"
                  icon={Calendar}
                  color="red"
                  badge={dadosAulas.aulasCanceladas > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
                />

                <StatsCard
                  title="Taxa Comparecimento"
                  value={`${dadosAulas.taxaComparecimento}%`}
                  subtitle="Aulas realizadas"
                  icon={TrendingUp}
                  color="purple"
                  trend={{
                    value: Number(dadosAulas.taxaComparecimento),
                    direction: Number(dadosAulas.taxaComparecimento) >= 80 ? 'up' : 'down',
                    label: Number(dadosAulas.taxaComparecimento) >= 80 ? 'Excelente' : 'Precisa melhorar'
                  }}
                />
              </div>
            </div>

            {/* Resumo por Aluno */}
            <Card>
              <CardHeader>
                <CardTitle>👥 Performance por Aluno</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alunos.map(aluno => {
                    const aulasAluno = aulas.filter(a => a.alunoId === aluno.id);
                    const pagamentosAluno = pagamentos.filter(p => p.alunoId === aluno.id);
                    const totalPago = pagamentosAluno
                      .filter(p => p.status === "pago")
                      .reduce((sum, p) => sum + p.valor, 0);
                    const pendente = pagamentosAluno
                      .filter(p => p.status !== "pago")
                      .reduce((sum, p) => sum + p.valor, 0);
                    const aulasRealizadas = aulasAluno.filter(a => a.status === "realizada").length;
                    const aulasCanceladas = aulasAluno.filter(a => a.status === "cancelada").length;
                    
                    return (
                      <div key={aluno.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{aluno.nome}</h4>
                          <div className="text-sm text-muted-foreground">
                            {aulasAluno.length} aulas agendadas • {aulasRealizadas} realizadas • {aulasCanceladas} canceladas
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-medium text-green-600">
                            R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pagos
                          </div>
                          {pendente > 0 && (
                            <div className="text-sm text-red-600">
                              R$ {pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendente
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            Mensalidade: R$ {aluno.mensalidade.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resumo" className="space-y-6">
            {/* Resumo Executivo - Visão Analítica */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Receita Total"
                value={`R$ ${dadosFinanceiros.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle="Histórico completo"
                icon={TrendingUp}
                color="blue"
              />

              <StatsCard
                title="Pendências"
                value={`R$ ${dadosFinanceiros.pendencias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle="Valores em aberto"
                icon={DollarSign}
                color="red"
                badge={{ text: "Atenção", variant: "destructive" }}
              />

              <StatsCard
                title="Ticket Médio"
                value={`R$ ${dadosFinanceiros.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle="Valor médio por aluno"
                icon={BarChart3}
                color="purple"
              />

              <StatsCard
                title="Taxa Inadimplência"
                value={`${((pagamentos.filter(p => p.status === 'atrasado').length / pagamentos.length) * 100 || 0).toFixed(1)}%`}
                subtitle="Pagamentos atrasados"
                icon={FileText}
                color="yellow"
                badge={{ text: pagamentos.filter(p => p.status === 'atrasado').length > 0 ? "Monitorar" : "OK", variant: pagamentos.filter(p => p.status === 'atrasado').length > 0 ? "destructive" : "success" }}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>📈 Resumo Executivo Analítico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-3">Indicadores Financeiros</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total de Alunos Ativos:</span>
                        <span className="font-medium">{alunos.filter(a => a.status === 'ativo').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Receita Potencial Mensal:</span>
                        <span className="font-medium">
                          R$ {alunos.reduce((sum, a) => sum + a.mensalidade, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Eficiência de Cobrança:</span>
                        <span className="font-medium">
                          {((dadosFinanceiros.receitaTotal / (alunos.reduce((sum, a) => sum + a.mensalidade, 0) * 12)) * 100 || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Indicadores Operacionais</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total de Aulas:</span>
                        <span className="font-medium">{aulas.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aulas por Aluno (média):</span>
                        <span className="font-medium">
                          {alunos.length > 0 ? (aulas.length / alunos.length).toFixed(1) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de Comparecimento:</span>
                        <span className="font-medium">
                          {dadosAulas.taxaComparecimento}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contabil">
            <AccountingReport />
          </TabsContent>

          <TabsContent value="old-resumo" className="space-y-6">
            {/* Resumo Executivo */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Receita do Mês"
                value={`R$ ${dadosFinanceiros.receitaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle="Pagamentos recebidos"
                icon={DollarSign}
                color="green"
                trend={{ value: 15, direction: 'up', label: 'vs mês anterior' }}
              />

              <StatsCard
                title="Receita Total"
                value={`R$ ${dadosFinanceiros.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle="Histórico completo"
                icon={TrendingUp}
                color="blue"
              />

              <StatsCard
                title="Pendências"
                value={`R$ ${dadosFinanceiros.pendencias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle="Valores em aberto"
                icon={DollarSign}
                color="red"
                badge={{ text: "Atenção", variant: "destructive" }}
              />

              <StatsCard
                title="Ticket Médio"
                value={`R$ ${dadosFinanceiros.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle="Valor médio por aluno"
                icon={BarChart3}
                color="purple"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>📈 Resumo Executivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-3">Indicadores Financeiros</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total de Alunos Ativos:</span>
                        <span className="font-medium">{alunos.filter(a => a.status === 'ativo').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Receita Potencial Mensal:</span>
                        <span className="font-medium">
                          R$ {alunos.reduce((sum, a) => sum + a.mensalidade, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de Inadimplência:</span>
                        <span className="font-medium">
                          {((pagamentos.filter(p => p.status === 'atrasado').length / pagamentos.length) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Indicadores Operacionais</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total de Aulas:</span>
                        <span className="font-medium">{aulas.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Aulas por Aluno (média):</span>
                        <span className="font-medium">
                          {alunos.length > 0 ? (aulas.length / alunos.length).toFixed(1) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de Cancelamento:</span>
                        <span className="font-medium">
                          {aulas.length > 0 ? ((aulas.filter(a => a.status === 'cancelada').length / aulas.length) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}