import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialDashboard } from "@/components/reports/FinancialDashboard";
import { AccountingReport } from "@/components/reports/AccountingReport";
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
    // Dados dos alunos
    const csvAlunos = [
      ['Nome', 'Email', 'Telefone', 'Mensalidade', 'Status'],
      ...alunos.map(a => [a.nome, a.email, a.telefone || '', a.mensalidade, a.status])
    ].map(row => row.join(';')).join('\n');

    // Dados dos pagamentos
    const csvPagamentos = [
      ['Aluno', 'Valor', 'Vencimento', 'Pagamento', 'Status'],
      ...pagamentos.map(p => [p.aluno, p.valor, p.vencimento, p.pagamento || '', p.status])
    ].map(row => row.join(';')).join('\n');

    // Criar arquivo combinado
    const csvCompleto = `ALUNOS\n${csvAlunos}\n\nPAGAMENTOS\n${csvPagamentos}`;
    
    const blob = new Blob([csvCompleto], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-geral-${hoje.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Relatórios Gerenciais</h2>
            <p className="text-muted-foreground">
              Análises financeiras, contábeis e operacionais completas
            </p>
          </div>
          <Button onClick={exportarCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV Geral
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="contabil" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contábil
            </TabsTrigger>
            <TabsTrigger value="operacional" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Operacional
            </TabsTrigger>
            <TabsTrigger value="resumo" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Resumo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="contabil">
            <AccountingReport />
          </TabsContent>

          <TabsContent value="operacional" className="space-y-6">
            {/* Métricas de Aulas */}
            <div>
              <h3 className="text-xl font-semibold mb-4">🎵 Métricas Operacionais</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Aulas do Mês</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dadosAulas.aulasMes}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Realizadas</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{dadosAulas.aulasRealizadas}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{dadosAulas.aulasCanceladas}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa Comparecimento</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dadosAulas.taxaComparecimento}%</div>
                  </CardContent>
                </Card>
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
            {/* Resumo Executivo */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {dadosFinanceiros.receitaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {dadosFinanceiros.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendências</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {dadosFinanceiros.pendencias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {dadosFinanceiros.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
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