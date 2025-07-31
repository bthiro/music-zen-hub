import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Calendar, AlertCircle } from "lucide-react";

export default function Dashboard() {
  // Mock data - later will come from actual data
  const stats = {
    totalAlunos: 12,
    pagamentosRecebidos: 2400,
    aulasMes: 48,
    pagamentosPendentes: 3
  };

  const proximasAulas = [
    { aluno: "João Silva", data: "2024-02-01", horario: "14:00", status: "confirmada" },
    { aluno: "Maria Santos", data: "2024-02-01", horario: "15:30", status: "confirmada" },
    { aluno: "Pedro Costa", data: "2024-02-02", horario: "09:00", status: "pendente" },
  ];

  const pagamentosPendentes = [
    { aluno: "Ana Oliveira", valor: 200, diasAtraso: 5 },
    { aluno: "Carlos Lima", valor: 180, diasAtraso: 2 },
  ];

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

        <div className="grid gap-4 md:grid-cols-2">
          {/* Próximas Aulas */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Aulas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proximasAulas.map((aula, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{aula.aluno}</p>
                      <p className="text-sm text-muted-foreground">
                        {aula.data} às {aula.horario}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      aula.status === 'confirmada' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {aula.status}
                    </div>
                  </div>
                ))}
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
                {pagamentosPendentes.map((pagamento, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{pagamento.aluno}</p>
                      <p className="text-sm text-muted-foreground">
                        {pagamento.diasAtraso} dias de atraso
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">R$ {pagamento.valor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}