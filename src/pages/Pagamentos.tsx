import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AulaDialog } from "@/components/dialogs/AulaDialog";
import { PagamentoDialog } from "@/components/dialogs/PagamentoDialog";
import { CobrancaDialog } from "@/components/dialogs/CobrancaDialog";
import { MercadoPagoDialog } from "@/components/dialogs/MercadoPagoDialog";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, CheckCircle, XCircle, Clock, MessageCircle, CreditCard, TrendingUp } from "lucide-react";
import { useState } from "react";
import { StatsCard } from "@/components/ui/stats-card";

export default function Pagamentos() {
  const { pagamentos, alunos } = useApp();
  const { toast } = useToast();
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [aulaDialogOpen, setAulaDialogOpen] = useState(false);
  const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);
  const [cobrancaDialogOpen, setCobrancaDialogOpen] = useState(false);
  const [mercadoPagoDialogOpen, setMercadoPagoDialogOpen] = useState(false);
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

  const handleCobrarMercadoPago = (pagamento: any) => {
    const aluno = alunos.find(a => a.id === pagamento.alunoId);
    if (!aluno) {
      toast({
        title: "Erro",
        description: "Aluno não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    setAlunoSelecionado({
      id: aluno.id,
      nome: aluno.nome
    });
    setPagamentoSelecionado(pagamento);
    setMercadoPagoDialogOpen(true);
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
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-display">Pagamentos</h2>
          <p className="text-muted-foreground">
            Controle de mensalidades e pagamentos
          </p>
        </div>

        {/* Resumo financeiro com design unificado */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Recebido"
            value={`R$ ${totalPago}`}
            subtitle="Pagamentos confirmados"
            icon={DollarSign}
            color="green"
            badge={{ text: "Recebido", variant: "success" }}
            trend={{ value: 15, direction: 'up', label: 'vs mês anterior' }}
          />
          
          <StatsCard
            title="Pendente"
            value={`R$ ${totalPendente}`}
            subtitle="Aguardando pagamento"
            icon={Clock}
            color="yellow"
            badge={{ text: "Pendente", variant: "outline" }}
          />
          
          <StatsCard
            title="Total Esperado"
            value={`R$ ${totalPago + totalPendente}`}
            subtitle="Receita total projetada"
            icon={TrendingUp}
            color="blue"
          />
          
          <StatsCard
            title="Taxa de Recebimento"
            value={`${totalPago + totalPendente > 0 ? ((totalPago / (totalPago + totalPendente)) * 100).toFixed(1) : 0}%`}
            subtitle="Eficiência de cobrança"
            icon={CheckCircle}
            color="purple"
            trend={{ value: 8, direction: 'up', label: 'melhoria' }}
          />
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

        {/* Lista de pagamentos responsiva */}
        <div className="grid gap-4">
          {pagamentosFiltrados.map((pagamento) => (
            <Card key={pagamento.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                  {/* Header com status */}
                  <div className="flex items-center gap-3">
                    {getStatusIcon(pagamento.status)}
                    <h3 className="text-lg font-semibold flex-1">{pagamento.aluno}</h3>
                    <Badge className={getStatusColor(pagamento.status)}>
                      {pagamento.status}
                    </Badge>
                  </div>
                  
                  {/* Grid responsivo de informações */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
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
                  {/* Ações em layout vertical para mobile */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0 sm:ml-4 w-full sm:w-auto">
                    {pagamento.status !== "pago" && (
                      <>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleCobrarMercadoPago(pagamento)}
                          className="w-full sm:w-auto text-xs bg-[#009EE3] hover:bg-[#0080B8] text-white border-0"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Mercado Pago
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleCobrarAluno(pagamento)}
                          className="w-full sm:w-auto text-xs"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Cobrar WhatsApp
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleMarcarPago(pagamento)}
                          className="w-full sm:w-auto text-xs"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
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
                        className="w-full sm:w-auto text-xs"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
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
          alunoId={pagamentoSelecionado.alunoId}
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

      {alunoSelecionado && pagamentoSelecionado && (
        <MercadoPagoDialog
          open={mercadoPagoDialogOpen}
          onOpenChange={setMercadoPagoDialogOpen}
          alunoId={alunoSelecionado.id}
          alunoNome={alunoSelecionado.nome}
          valorSugerido={pagamentoSelecionado.valor}
        />
      )}
    </Layout>
  );
}