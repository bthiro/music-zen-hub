import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

export function FinancialDashboard() {
  const { pagamentos, aulas, alunos } = useApp();

  // Calcular dados dos últimos 6 meses
  const hoje = new Date();
  const dadosMensais = [];
  
  for (let i = 5; i >= 0; i--) {
    const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const mesString = mes.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    
    const receitaMes = pagamentos
      .filter(p => {
        if (!p.pagamento) return false;
        const dataPagamento = new Date(p.pagamento);
        return dataPagamento.getMonth() === mes.getMonth() && 
               dataPagamento.getFullYear() === mes.getFullYear();
      })
      .reduce((sum, p) => sum + p.valor, 0);

    const aulasMes = aulas.filter(a => {
      const dataAula = new Date(a.data);
      return dataAula.getMonth() === mes.getMonth() && 
             dataAula.getFullYear() === mes.getFullYear();
    }).length;

    dadosMensais.push({
      mes: mesString,
      receita: receitaMes,
      aulas: aulasMes,
      receitaFormatada: `R$ ${receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    });
  }

  // Dados para o gráfico de pizza - Status dos pagamentos
  const statusPagamentos = [
    {
      name: 'Pagos',
      value: pagamentos.filter(p => p.status === 'pago').length,
      valor: pagamentos.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.valor, 0),
      color: '#22c55e'
    },
    {
      name: 'Pendentes',
      value: pagamentos.filter(p => p.status === 'pendente').length,
      valor: pagamentos.filter(p => p.status === 'pendente').reduce((sum, p) => sum + p.valor, 0),
      color: '#f59e0b'
    },
    {
      name: 'Atrasados',
      value: pagamentos.filter(p => p.status === 'atrasado').length,
      valor: pagamentos.filter(p => p.status === 'atrasado').reduce((sum, p) => sum + p.valor, 0),
      color: '#ef4444'
    }
  ];

  // Calcular métricas principais
  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();
  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
  const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

  const receitaMesAtual = dadosMensais[5]?.receita || 0;
  const receitaMesAnterior = dadosMensais[4]?.receita || 0;
  const crescimentoReceita = receitaMesAnterior > 0 ? 
    ((receitaMesAtual - receitaMesAnterior) / receitaMesAnterior * 100) : 0;

  const aulasMesAtual = dadosMensais[5]?.aulas || 0;
  const aulasMesAnterior = dadosMensais[4]?.aulas || 0;
  const crescimentoAulas = aulasMesAnterior > 0 ? 
    ((aulasMesAtual - aulasMesAnterior) / aulasMesAnterior * 100) : 0;

  // Identificar melhor mês
  const melhorMesReceita = dadosMensais.reduce((max, mes) => 
    mes.receita > max.receita ? mes : max, dadosMensais[0] || { mes: '', receita: 0 });
  
  const melhorMesAulas = dadosMensais.reduce((max, mes) => 
    mes.aulas > max.aulas ? mes : max, dadosMensais[0] || { mes: '', aulas: 0 });

  return (
    <div className="space-y-6">
      {/* Highlights Comparativos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {receitaMesAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-xs flex items-center ${crescimentoReceita >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {crescimentoReceita >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(crescimentoReceita).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aulas do Mês</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aulasMesAtual}</div>
            <div className={`text-xs flex items-center ${crescimentoAulas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {crescimentoAulas >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(crescimentoAulas).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Mês (Receita)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{melhorMesReceita.mes}</div>
            <div className="text-xs text-muted-foreground">
              R$ {melhorMesReceita.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Melhor Mês (Aulas)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{melhorMesAulas.mes}</div>
            <div className="text-xs text-muted-foreground">
              {melhorMesAulas.aulas} aulas realizadas
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Receita vs Aulas */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal - Receita vs Aulas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'receita' ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : value,
                    name === 'receita' ? 'Receita' : 'Aulas'
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="receita" fill="#22c55e" name="Receita" />
                <Line yAxisId="right" type="monotone" dataKey="aulas" stroke="#3b82f6" strokeWidth={3} name="Aulas" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status dos Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusPagamentos}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusPagamentos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} pagamentos`,
                    `R$ ${props.payload.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Evolução Receita por Mês - Gráfico de Barras */}
      <Card>
        <CardHeader>
          <CardTitle>Receita Mensal - Últimos 6 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosMensais}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
              />
              <Bar dataKey="receita" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}