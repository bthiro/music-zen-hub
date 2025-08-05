import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { StatsCard } from "@/components/ui/stats-card";
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
  Legend,
  Area,
  AreaChart
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, Calendar, Eye } from "lucide-react";

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
      receitaPotencial: aulasMes * 200 // Assumindo valor médio de R$200 por aula
    });
  }

  // Calcular métricas atuais
  const mesAtual = hoje.getMonth();
  const receitaMesAtual = dadosMensais[dadosMensais.length - 1]?.receita || 0;
  const receitaMesAnterior = dadosMensais[dadosMensais.length - 2]?.receita || 0;
  const aulasMesAtual = dadosMensais[dadosMensais.length - 1]?.aulas || 0;
  const aulasMesAnterior = dadosMensais[dadosMensais.length - 2]?.aulas || 0;

  const crescimentoReceita = receitaMesAnterior > 0 ? 
    ((receitaMesAtual - receitaMesAnterior) / receitaMesAnterior) * 100 : 0;
  const crescimentoAulas = aulasMesAnterior > 0 ? 
    ((aulasMesAtual - aulasMesAnterior) / aulasMesAnterior) * 100 : 0;

  // Encontrar melhor mês
  const melhorMesReceita = dadosMensais.reduce((max, atual) => 
    atual.receita > max.receita ? atual : max, dadosMensais[0] || { mes: 'N/A', receita: 0 });
  const melhorMesAulas = dadosMensais.reduce((max, atual) => 
    atual.aulas > max.aulas ? atual : max, dadosMensais[0] || { mes: 'N/A', aulas: 0 });

  // Dados dos pagamentos por status
  const statusPagamentos = [
    {
      name: 'Pagos',
      value: pagamentos.filter(p => p.status === 'pago').length,
      total: pagamentos.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.valor, 0),
      fill: '#22c55e'
    },
    {
      name: 'Pendentes',
      value: pagamentos.filter(p => p.status === 'pendente').length,
      total: pagamentos.filter(p => p.status === 'pendente').reduce((sum, p) => sum + p.valor, 0),
      fill: '#f59e0b'
    },
    {
      name: 'Atrasados',
      value: pagamentos.filter(p => p.status === 'atrasado').length,
      total: pagamentos.filter(p => p.status === 'atrasado').reduce((sum, p) => sum + p.valor, 0),
      fill: '#ef4444'
    }
  ];

  // Paleta de cores moderna
  const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* Hero Metrics com StatsCard unificado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Receita do Mês"
          value={`R$ ${receitaMesAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtitle="Receita atual"
          icon={DollarSign}
          color="green"
          trend={{
            value: Math.abs(crescimentoReceita),
            direction: crescimentoReceita >= 0 ? 'up' : 'down',
            label: 'vs mês anterior'
          }}
        />

        <StatsCard
          title="Aulas do Mês"
          value={aulasMesAtual}
          subtitle="Aulas realizadas"
          icon={Calendar}
          color="blue"
          trend={{
            value: Math.abs(crescimentoAulas),
            direction: crescimentoAulas >= 0 ? 'up' : 'down',
            label: 'vs mês anterior'
          }}
        />

        <StatsCard
          title="Melhor Mês (Receita)"
          value={melhorMesReceita.mes}
          subtitle={`R$ ${melhorMesReceita.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="purple"
          badge={{
            text: "Record",
            variant: "success"
          }}
        />

        <StatsCard
          title="Melhor Mês (Aulas)"
          value={melhorMesAulas.mes}
          subtitle={`${melhorMesAulas.aulas} aulas realizadas`}
          icon={ArrowUpRight}
          color="yellow"
          badge={{
            text: "Top",
            variant: "outline"
          }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Revenue Area Chart */}
        <Card className="card-modern border-none shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Eye className="h-5 w-5 text-primary" />
              Evolução da Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dadosMensais}>
                <defs>
                  <linearGradient id="receitaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
                />
                <Area 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#receitaGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status dos Pagamentos - Modern Pie Chart */}
        <Card className="card-modern border-none shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <DollarSign className="h-5 w-5 text-primary" />
              Status dos Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={statusPagamentos}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPagamentos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name, props) => [
                    `${value} pagamentos`,
                    `R$ ${props.payload.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  ]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Bar Chart */}
      <Card className="card-modern border-none shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <BarChart className="h-5 w-5 text-primary" />
            Performance Mensal Comparativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={dadosMensais} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="mes" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  name === 'receita' ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : value,
                  name === 'receita' ? 'Receita Realizada' : 'Quantidade de Aulas'
                ]}
              />
              <Legend />
              <Bar 
                dataKey="receita" 
                fill="#22c55e" 
                name="Receita Realizada"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="aulas" 
                fill="#3b82f6" 
                name="Quantidade de Aulas"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}