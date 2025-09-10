import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AulaDialog } from "@/components/dialogs/AulaDialog";
import { CobrancaDialog } from "@/components/dialogs/CobrancaDialog";
import { MercadoPagoDialog } from "@/components/dialogs/MercadoPagoDialog";
import { PaymentStatusDisplay } from "@/components/PaymentStatusDisplay";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, CheckCircle, XCircle, Clock, MessageCircle, CreditCard, TrendingUp } from "lucide-react";
import { useState } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { supabase } from "@/integrations/supabase/client";

export default function Pagamentos() {
  const { pagamentos, loading, refetch } = usePagamentos();
  const { toast } = useToast();
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [aulaDialogOpen, setAulaDialogOpen] = useState(false);
  const [cobrancaDialogOpen, setCobrancaDialogOpen] = useState(false);
  const [mercadoPagoDialogOpen, setMercadoPagoDialogOpen] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<{id: string, nome: string} | null>(null);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<any>(null);

  const pagamentosFiltrados = pagamentos.filter(pagamento => {
    if (filtroStatus === "todos") return true;
    return pagamento.status === filtroStatus;
  });

  const handleScheduleClass = (alunoId: string, alunoName: string) => {
    setAlunoSelecionado({ id: alunoId, nome: alunoName });
    setAulaDialogOpen(true);
  };

  const handleReprocessPayment = async (paymentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mercado-pago-reprocess', {
        body: { payment_id: paymentId }
      });
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Status do pagamento atualizado!"
      });
      
      refetch();
    } catch (error) {
      console.error('Erro ao reprocessar pagamento:', error);
      toast({
        title: "Erro",
        description: "Falha ao verificar status do pagamento",
        variant: "destructive"
      });
    }
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
                  {/* Header com nome do aluno */}
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold flex-1">{pagamento.aluno}</h3>
                  </div>
                  
                  {/* Grid responsivo de informações */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">Período:</p>
                      <p>{pagamento.mes}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Vencimento:</p>
                      <p>{new Date(pagamento.vencimento).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Pagamento:</p>
                      <p>{pagamento.pagamento ? new Date(pagamento.pagamento).toLocaleDateString('pt-BR') : "Não realizado"}</p>
                    </div>
                  </div>
                  
                  {/* Status display com ações automáticas */}
                  <PaymentStatusDisplay 
                    pagamento={pagamento}
                    onScheduleClass={handleScheduleClass}
                    onReprocessPayment={handleReprocessPayment}
                  />
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