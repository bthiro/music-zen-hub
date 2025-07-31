import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";

// Mock data
const pagamentosData = [
  {
    id: 1,
    aluno: "João Silva",
    valor: 200,
    vencimento: "2024-02-01",
    pagamento: "2024-01-30",
    status: "pago",
    mes: "Fevereiro 2024"
  },
  {
    id: 2,
    aluno: "Maria Santos",
    valor: 180,
    vencimento: "2024-02-01",
    pagamento: null,
    status: "pendente",
    mes: "Fevereiro 2024"
  },
  {
    id: 3,
    aluno: "Pedro Costa",
    valor: 220,
    vencimento: "2024-01-01",
    pagamento: null,
    status: "atrasado",
    mes: "Janeiro 2024"
  },
  {
    id: 4,
    aluno: "Ana Oliveira",
    valor: 200,
    vencimento: "2024-02-01",
    pagamento: "2024-02-01",
    status: "pago",
    mes: "Fevereiro 2024"
  }
];

export default function Pagamentos() {
  const [pagamentos] = useState(pagamentosData);
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const pagamentosFiltrados = pagamentos.filter(pagamento => {
    if (filtroStatus === "todos") return true;
    return pagamento.status === filtroStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pago":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pendente":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "atrasado":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pago":
        return "bg-green-100 text-green-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "atrasado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalPago = pagamentos
    .filter(p => p.status === "pago")
    .reduce((sum, p) => sum + p.valor, 0);

  const totalPendente = pagamentos
    .filter(p => p.status !== "pago")
    .reduce((sum, p) => sum + p.valor, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pagamentos</h2>
          <p className="text-muted-foreground">
            Controle de mensalidades e pagamentos
          </p>
        </div>

        {/* Resumo financeiro */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">R$ {totalPago}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">R$ {totalPendente}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Esperado</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalPago + totalPendente}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                variant={filtroStatus === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroStatus("todos")}
              >
                Todos
              </Button>
              <Button
                variant={filtroStatus === "pago" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroStatus("pago")}
              >
                Pagos
              </Button>
              <Button
                variant={filtroStatus === "pendente" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroStatus("pendente")}
              >
                Pendentes
              </Button>
              <Button
                variant={filtroStatus === "atrasado" ? "default" : "outline"}
                size="sm"
                onClick={() => setFiltroStatus("atrasado")}
              >
                Atrasados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de pagamentos */}
        <div className="grid gap-4">
          {pagamentosFiltrados.map((pagamento) => (
            <Card key={pagamento.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(pagamento.status)}
                      <h3 className="text-lg font-semibold">{pagamento.aluno}</h3>
                      <Badge className={getStatusColor(pagamento.status)}>
                        {pagamento.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium text-foreground">Período:</p>
                        <p>{pagamento.mes}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Valor:</p>
                        <p className="text-lg font-semibold text-foreground">R$ {pagamento.valor}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Vencimento:</p>
                        <p>{pagamento.vencimento}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Pagamento:</p>
                        <p>{pagamento.pagamento || "Não realizado"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {pagamento.status !== "pago" && (
                      <Button size="sm">
                        Marcar como Pago
                      </Button>
                    )}
                    {pagamento.status === "pago" && (
                      <Button variant="outline" size="sm">
                        Agendar Aulas
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}