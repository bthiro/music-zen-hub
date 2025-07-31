import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Download,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Relatorios() {
  const { alunos, pagamentos, aulas } = useApp();

  // Calcular dados para relatórios
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
    a.download = `relatorio-aulas-${hoje.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
            <p className="text-muted-foreground">
              Análises e métricas do seu negócio
            </p>
          </div>
          <Button onClick={exportarCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Métricas Financeiras */}
        <div>
          <h3 className="text-xl font-semibold mb-4">📊 Financeiro</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {dadosFinanceiros.receitaMensal.toFixed(2)}
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
                  R$ {dadosFinanceiros.receitaTotal.toFixed(2)}
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
                  R$ {dadosFinanceiros.pendencias.toFixed(2)}
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
                  R$ {dadosFinanceiros.ticketMedio.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Métricas de Aulas */}
        <div>
          <h3 className="text-xl font-semibold mb-4">🎵 Aulas</h3>
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
        <div>
          <h3 className="text-xl font-semibold mb-4">👥 Resumo por Aluno</h3>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {alunos.map(aluno => {
                  const aulasAluno = aulas.filter(a => a.alunoId === aluno.id);
                  const pagamentosAluno = pagamentos.filter(p => p.alunoId === aluno.id);
                  const totalPago = pagamentosAluno
                    .filter(p => p.status === "pago")
                    .reduce((sum, p) => sum + p.valor, 0);
                  
                  return (
                    <div key={aluno.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{aluno.nome}</h4>
                        <div className="text-sm text-muted-foreground">
                          {aulasAluno.length} aulas • R$ {totalPago} pagos
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">R$ {aluno.mensalidade}</div>
                        <div className="text-sm text-muted-foreground">mensalidade</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}