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
        if (!p.data_pagamento || p.status !== 'pago') return false;
        const dataPagamento = new Date(p.data_pagamento);
        return dataPagamento.getMonth() === mes.getMonth() && 
               dataPagamento.getFullYear() === mes.getFullYear();
      })
      .reduce((sum, p) => sum + Number(p.valor || 0), 0);

    const aulasMes = aulas.filter(a => {
      if (!a.data) return false;
      const dataAula = new Date(`${a.data}T${a.horario || '00:00'}`);
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
      {/* Hero Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-modern border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Receita do Mês</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800 dark:text-green-200">
              R$ {receitaMesAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-xs flex items-center mt-2 ${crescimentoReceita >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {crescimentoReceita >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(crescimentoReceita).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Aulas do Mês</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">{aulasMesAtual}</div>
            <div className={`text-xs flex items-center mt-2 ${crescimentoAulas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {crescimentoAulas >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(crescimentoAulas).toFixed(1)}% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern border-none shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Melhor Mês (Receita)</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
              <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">{melhorMesReceita.mes}</div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              R$ {melhorMesReceita.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern border-none shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Melhor Mês (Aulas)</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
              <ArrowUpRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800 dark:text-orange-200">{melhorMesAulas.mes}</div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              {melhorMesAulas.aulas} aulas realizadas
            </div>
          </CardContent>
        </Card>
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