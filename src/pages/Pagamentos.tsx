import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AulaDialog } from "@/components/dialogs/AulaDialog";
import { CobrancaDialog } from "@/components/dialogs/CobrancaDialog";
import { MercadoPagoDialog } from "@/components/dialogs/MercadoPagoDialog";
import { PagamentoCRUDDialog } from "@/components/dialogs/PagamentoCRUDDialog";
import { usePagamentoActions } from "@/hooks/usePagamentoActions";
import { PaymentStatusDisplay } from "@/components/PaymentStatusDisplay";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Plus,
  MoreVertical,
  Trash2,
  Edit,
  RotateCcw,
  Check,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { StatsCard } from "@/components/ui/stats-card";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Pagamentos() {
  const { pagamentos, loading, refetch } = usePagamentos();
  const { criarRenovacao, marcarComoPago, excluirPagamento, loading: actionLoading } = usePagamentoActions();
  const { toast } = useToast();
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [aulaDialogOpen, setAulaDialogOpen] = useState(false);
  const [cobrancaDialogOpen, setCobrancaDialogOpen] = useState(false);
  const [mercadoPagoDialogOpen, setMercadoPagoDialogOpen] = useState(false);
  const [pagamentoCRUDOpen, setPagamentoCRUDOpen] = useState(false);
  const [pagamentoCRUDMode, setPagamentoCRUDMode] = useState<'create' | 'edit'>('create');
  const [selectedPagamento, setSelectedPagamento] = useState<any>(null);
  const [alunoSelecionado, setAlunoSelecionado] = useState<{id: string, nome: string} | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleManualPayment = async (pagamentoId: string) => {
    setProcessingId(pagamentoId);
    try {
      const { error } = await supabase
        .from('pagamentos')
        .update({ 
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0],
          forma_pagamento: 'manual',
          manual_payment_by: (await supabase.auth.getUser()).data.user?.id,
          manual_payment_at: new Date().toISOString(),
          manual_payment_reason: 'Marcado como pago pelo professor',
          eligible_to_schedule: true
        })
        .eq('id', pagamentoId);

      if (error) throw error;

      toast({
        title: 'Pagamento confirmado!',
        description: 'Agora você pode agendar aulas para este aluno.'
      });

      refetch();
    } catch (error) {
      console.error('Erro ao marcar pagamento:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao marcar pagamento como pago.',
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRenewPayment = async (pagamento: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: professor } = await supabase
        .from('professores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!professor) throw new Error('Professor não encontrado');

      // Calcular próximo vencimento
      const dataVencimento = new Date(pagamento.data_vencimento);
      const proximoVencimento = new Date(dataVencimento);
      
      if (pagamento.tipo_pagamento === 'mensal') {
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
      } else if (pagamento.tipo_pagamento === 'quinzenal') {
        proximoVencimento.setDate(proximoVencimento.getDate() + 15);
      } else {
        proximoVencimento.setMonth(proximoVencimento.getMonth() + 1);
      }

      const { error } = await supabase
        .from('pagamentos')
        .insert({
          professor_id: professor.id,
          aluno_id: pagamento.aluno_id,
          tipo_pagamento: pagamento.tipo_pagamento,
          valor: pagamento.valor,
          data_vencimento: proximoVencimento.toISOString().split('T')[0],
          descricao: `Renovação - ${pagamento.tipo_pagamento}`,
          status: 'pendente',
          payment_precedence: 'automatic'
        });

      if (error) throw error;

      toast({
        title: 'Renovação criada!',
        description: 'Novo pagamento gerado para o próximo período.'
      });

      refetch();
    } catch (error) {
      console.error('Erro ao renovar pagamento:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar renovação.',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePayment = async (pagamentoId: string) => {
    setProcessingId(pagamentoId);
    try {
      // Verificar se existem aulas vinculadas
      const { data: aulas } = await supabase
        .from('aulas')
        .select('id')
        .eq('aula_id', pagamentoId);

      if (aulas && aulas.length > 0) {
        throw new Error('Não é possível excluir pagamento com aulas vinculadas');
      }

      // Soft delete
      const { error } = await supabase
        .from('pagamentos')
        .update({ 
          status: 'cancelado',
          updated_at: new Date().toISOString()
        })
        .eq('id', pagamentoId);

      if (error) throw error;

      toast({
        title: 'Pagamento excluído',
        description: 'Pagamento removido com sucesso.'
      });

      refetch();
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao excluir pagamento.',
        variant: 'destructive'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreatePayment = () => {
    setPagamentoCRUDMode('create');
    setSelectedPagamento(null);
    setPagamentoCRUDOpen(true);
  };

  const handleEditPayment = (pagamento: any) => {
    setPagamentoCRUDMode('edit');
    setSelectedPagamento(pagamento);
    setPagamentoCRUDOpen(true);
  };

  const totalPago = pagamentos
    .filter(p => p.status === "pago")
    .reduce((sum, p) => sum + p.valor, 0);

  const totalPendente = pagamentos
    .filter(p => p.status !== "pago" && p.status !== "cancelado")
    .reduce((sum, p) => sum + p.valor, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-display">Pagamentos</h2>
            <p className="text-muted-foreground">
              Gerencie mensalidades e cobranças dos seus alunos
            </p>
          </div>
          
          <Button onClick={handleCreatePayment}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pagamento
          </Button>
        </div>

        {/* Resumo financeiro */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Recebido"
            value={`R$ ${totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            subtitle="Pagamentos confirmados"
            icon={DollarSign}
            color="green"
            badge={{ text: "Recebido", variant: "success" }}
            trend={{ value: 15, direction: 'up', label: 'vs mês anterior' }}
          />
          
          <StatsCard
            title="Pendente"
            value={`R$ ${totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            subtitle="Aguardando pagamento"
            icon={Clock}
            color="yellow"
            badge={{ text: "Pendente", variant: "outline" }}
          />
          
          <StatsCard
            title="Total Esperado"
            value={`R$ ${(totalPago + totalPendente).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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

        {/* Lista de pagamentos */}
        <div className="grid gap-4">
          {pagamentosFiltrados.map((pagamento) => (
            <Card key={pagamento.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                  {/* Header com nome do aluno e ações */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{pagamento.aluno}</h3>
                      <Badge variant="outline" className="capitalize">
                        {pagamento.formaPagamento?.replace('_', ' ') || 'Mensal'}
                      </Badge>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPayment(pagamento)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        
                        {pagamento.status === 'pendente' && (
                          <DropdownMenuItem 
                            onClick={() => handleManualPayment(pagamento.id)}
                            disabled={processingId === pagamento.id}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Marcar como Pago
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => handleRenewPayment(pagamento)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Renovar
                        </DropdownMenuItem>
                        
                        {pagamento.status === 'pendente' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Pagamento</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePayment(pagamento.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Grid de informações */}
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
                  
                  {/* Status display com ações */}
                  <PaymentStatusDisplay 
                    pagamento={pagamento}
                    onScheduleClass={handleScheduleClass}
                    onReprocessPayment={handleReprocessPayment}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          
          {pagamentosFiltrados.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium mb-2">Nenhum pagamento encontrado</p>
                <p className="text-muted-foreground mb-4">
                  {filtroStatus === 'todos' 
                    ? 'Comece criando um novo pagamento para seus alunos.'
                    : `Não há pagamentos com status "${filtroStatus}".`
                  }
                </p>
                {filtroStatus === 'todos' && (
                  <Button onClick={handleCreatePayment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Pagamento
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AulaDialog 
        open={aulaDialogOpen} 
        onOpenChange={setAulaDialogOpen}
        alunoId={alunoSelecionado?.id}
        alunoNome={alunoSelecionado?.nome}
      />

      <PagamentoCRUDDialog
        open={pagamentoCRUDOpen}
        onOpenChange={setPagamentoCRUDOpen}
        pagamento={selectedPagamento}
        mode={pagamentoCRUDMode}
        onSuccess={refetch}
      />

      {selectedPagamento && (
        <CobrancaDialog
          open={cobrancaDialogOpen}
          onOpenChange={setCobrancaDialogOpen}
          aluno={selectedPagamento.aluno}
          pagamento={selectedPagamento.pagamento}
        />
      )}

      {alunoSelecionado && selectedPagamento && (
        <MercadoPagoDialog
          open={mercadoPagoDialogOpen}
          onOpenChange={setMercadoPagoDialogOpen}
          alunoId={alunoSelecionado.id}
          alunoNome={alunoSelecionado.nome}
          valorSugerido={selectedPagamento.valor}
        />
      )}
    </Layout>
  );
}