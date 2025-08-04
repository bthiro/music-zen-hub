import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AulaDialog } from "@/components/dialogs/AulaDialog";
import { PagamentoDialog } from "@/components/dialogs/PagamentoDialog";
import { CobrancaDialog } from "@/components/dialogs/CobrancaDialog";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, CheckCircle, XCircle, Clock, MessageCircle, CreditCard } from "lucide-react";
import { useState } from "react";

export default function Pagamentos() {
  const { pagamentos, alunos } = useApp();
  const { toast } = useToast();
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [aulaDialogOpen, setAulaDialogOpen] = useState(false);
  const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);
  const [cobrancaDialogOpen, setCobrancaDialogOpen] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<{id: string, nome: string} | null>(null);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<any>(null);

  const pagamentosFiltrados = pagamentos.filter(pagamento => {
    if (filtroStatus === "todos") return true;
    return pagamento.status === filtroStatus;
  });

  const handleMarcarPago = (pagamento: any) => {
    setPagamentoSelecionado(pagamento);
    setPagamentoDialogOpen(true);
  };

  const handleCobrarAluno = (pagamento: any) => {
    const aluno = alunos.find(a => a.id === pagamento.alunoId);
    if (!aluno) {
      toast({
        title: "Erro",
        description: "Aluno não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    setPagamentoSelecionado({
      aluno: {
        nome: aluno.nome,
        telefone: aluno.telefone,
        email: aluno.email
      },
      pagamento: {
        valor: pagamento.valor,
        vencimento: pagamento.vencimento,
        mes: pagamento.mes
      }
    });
    setCobrancaDialogOpen(true);
  };

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
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Pagamentos</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
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
                        {pagamento.formaPagamento && (
                          <p className="text-xs text-muted-foreground">
                            via {pagamento.formaPagamento.toUpperCase()}
                            {pagamento.metodoPagamento && ` (${pagamento.metodoPagamento})`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {pagamento.status !== "pago" && (
                      <>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleCobrarAluno(pagamento)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Cobrar
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleMarcarPago(pagamento)}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Marcar como Pago
                        </Button>
                      </>
                    )}
                    {pagamento.status === "pago" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setAlunoSelecionado({ id: pagamento.alunoId, nome: pagamento.aluno });
                          setAulaDialogOpen(true);
                        }}
                      >
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

      <AulaDialog 
        open={aulaDialogOpen} 
        onOpenChange={setAulaDialogOpen}
        alunoId={alunoSelecionado?.id}
        alunoNome={alunoSelecionado?.nome}
      />

      {pagamentoSelecionado && (
        <PagamentoDialog
          open={pagamentoDialogOpen}
          onOpenChange={setPagamentoDialogOpen}
          pagamentoId={pagamentoSelecionado.id}
          alunoNome={pagamentoSelecionado.aluno}
          valor={pagamentoSelecionado.valor}
        />
      )}

      {pagamentoSelecionado && (
        <CobrancaDialog
          open={cobrancaDialogOpen}
          onOpenChange={setCobrancaDialogOpen}
          aluno={pagamentoSelecionado.aluno}
          pagamento={pagamentoSelecionado.pagamento}
        />
      )}
    </Layout>
  );
}