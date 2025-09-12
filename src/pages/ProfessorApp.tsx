import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  Plus, 
  CheckCircle,
  Clock,
  BookOpen,
  Settings
} from "lucide-react";
import { useProfessorData } from "@/hooks/useProfessorData";
import { useAuthContext } from "@/contexts/AuthContext";
import { StatsCard } from "@/components/ui/stats-card";
import { MercadoPagoButton } from "@/components/MercadoPagoButton";
import { PaymentStatusDisplay } from "@/components/PaymentStatusDisplay";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

const alunoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  data_nascimento: z.string().optional(),
  endereco: z.string().optional(),
  instrumento: z.string().optional(),
  nivel: z.string().optional(),
  valor_mensalidade: z.number().min(0).optional(),
  dia_vencimento: z.number().min(1).max(31).optional(),
  duracao_aula: z.number().min(15).optional(),
  observacoes: z.string().optional(),
});

type AlunoFormData = z.infer<typeof alunoSchema>;

export default function ProfessorApp() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    stats, 
    alunos, 
    pagamentos, 
    loading, 
    marcarPagamentoPago,
    addAluno 
  } = useProfessorData();
  
  const [addAlunoDialogOpen, setAddAlunoDialogOpen] = useState(false);
  const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState<any>(null);

  const alunoForm = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      instrumento: '',
      nivel: 'iniciante',
      valor_mensalidade: 200,
      dia_vencimento: 5,
      duracao_aula: 50,
    },
  });

  const handleAddAluno = async (data: AlunoFormData) => {
    const { error } = await addAluno({
      ...data,
      email: data.email || null,
      data_nascimento: data.data_nascimento || null,
      ativo: true,
    } as any);
    
    if (!error) {
      setAddAlunoDialogOpen(false);
      alunoForm.reset();
    }
  };

  const handleScheduleClass = (alunoId: string, alunoName: string) => {
    toast({
      title: "Agendar Aula",
      description: `Pagamento confirmado! Você pode agendar aulas para ${alunoName}`,
    });
    // TODO: Navigate to scheduling interface or open scheduling modal
  };

  const handleReprocessPayment = async (paymentId: string) => {
    try {
      toast({
        title: "Verificando pagamento",
        description: "Consultando status no Mercado Pago...",
      });

      const { data, error } = await supabase.functions.invoke('mercado-pago-reprocess', {
        body: { payment_id: paymentId }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Status atualizado",
          description: `Pagamento ${data.payment_id}: ${data.old_status} → ${data.new_status}`,
        });
        
        // Reload data to show updated status
        navigate(0); // React Router equivalent of reload
      }
    } catch (error) {
      console.error('Erro ao reprocessar pagamento:', error);
      toast({
        title: "Erro",
        description: "Falha ao verificar status do pagamento",
        variant: "destructive"
      });
    }
  };

  const handleMarcarPago = async (formaPagamento: string) => {
    if (selectedPagamento) {
      await marcarPagamentoPago(selectedPagamento.id, formaPagamento);
      setPagamentoDialogOpen(false);
      setSelectedPagamento(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-500';
      case 'pendente': return 'bg-yellow-500';
      case 'atrasado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  // Check which modules are enabled
  const modules = user?.profile?.modules || {
    dashboard: true,
    pagamentos: true,
    agenda: true,
    materiais: true,
    ferramentas: true,
    lousa: true,
    ia: false
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard do Professor</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Olá, {user?.profile?.nome || user?.email}!
            </h2>
            <p className="text-muted-foreground">
              Gerencie suas aulas e alunos
            </p>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            {modules.dashboard && <TabsTrigger value="dashboard">Dashboard</TabsTrigger>}
            <TabsTrigger value="alunos">Alunos</TabsTrigger>
            {modules.pagamentos && <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>}
            {modules.agenda && <TabsTrigger value="agenda">Agenda</TabsTrigger>}
            {modules.materiais && <TabsTrigger value="materiais">Materiais</TabsTrigger>}
            {(modules.ferramentas || modules.lousa || modules.ia) && (
              <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
            )}
          </TabsList>

          {modules.dashboard && (
            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard 
                  title="Alunos Ativos"
                  value={stats?.alunosAtivos || 0}
                  subtitle="Cadastrados"
                  icon={Users}
                  color="blue"
                />
                <StatsCard 
                  title="Aulas na Semana"
                  value={stats?.aulasNaSemana || 0}
                  subtitle="Agendadas"
                  icon={Calendar}
                  color="purple"
                />
                <StatsCard 
                  title="Pagamentos Pendentes"
                  value={stats?.pagamentosPendentes || 0}
                  subtitle="Aguardando confirmação"
                  icon={AlertCircle}
                  color="yellow"
                  badge={stats?.pagamentosPendentes ? {
                    text: "Ação necessária",
                    variant: "destructive"
                  } : undefined}
                />
                <StatsCard 
                  title="Próximos Eventos"
                  value={stats?.proximosEventos || 0}
                  subtitle="Esta semana"
                  icon={Clock}
                  color="green"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Dialog open={addAlunoDialogOpen} onOpenChange={setAddAlunoDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Novo Aluno
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Adicionar Novo Aluno</DialogTitle>
                          <DialogDescription>
                            Preencha os dados do novo aluno
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={alunoForm.handleSubmit(handleAddAluno)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="nome">Nome Completo *</Label>
                              <Input {...alunoForm.register('nome')} />
                              {alunoForm.formState.errors.nome && (
                                <p className="text-sm text-destructive">{alunoForm.formState.errors.nome.message}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input type="email" {...alunoForm.register('email')} />
                              {alunoForm.formState.errors.email && (
                                <p className="text-sm text-destructive">{alunoForm.formState.errors.email.message}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="telefone">Telefone</Label>
                              <Input {...alunoForm.register('telefone')} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                              <Input type="date" {...alunoForm.register('data_nascimento')} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="instrumento">Instrumento</Label>
                              <Input {...alunoForm.register('instrumento')} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="nivel">Nível</Label>
                              <Select onValueChange={(value) => alunoForm.setValue('nivel', value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o nível" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="iniciante">Iniciante</SelectItem>
                                  <SelectItem value="intermediario">Intermediário</SelectItem>
                                  <SelectItem value="avancado">Avançado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="valor_mensalidade">Mensalidade (R$)</Label>
                              <Input 
                                type="number" 
                                step="0.01"
                                {...alunoForm.register('valor_mensalidade', { valueAsNumber: true })} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dia_vencimento">Dia do Vencimento</Label>
                              <Input 
                                type="number" 
                                min="1" 
                                max="31"
                                {...alunoForm.register('dia_vencimento', { valueAsNumber: true })} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="duracao_aula">Duração da Aula (min)</Label>
                              <Input 
                                type="number" 
                                min="15"
                                {...alunoForm.register('duracao_aula', { valueAsNumber: true })} 
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="endereco">Endereço</Label>
                            <Input {...alunoForm.register('endereco')} />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea {...alunoForm.register('observacoes')} />
                          </div>

                          <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setAddAlunoDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button type="submit">Adicionar Aluno</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Primeira Aula
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pagamentos Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pagamentos.slice(0, 3).map((pagamento) => (
                        <div key={pagamento.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{pagamento.aluno}</p>
                            <p className="text-xs text-muted-foreground">
                              Vence em {formatDate(pagamento.vencimento)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(pagamento.status)} text-white`}>
                              {pagamento.status}
                            </Badge>
                            <span className="font-medium">{formatCurrency(pagamento.valor)}</span>
                          </div>
                        </div>
                      ))}
                      {pagamentos.length === 0 && (
                        <p className="text-center text-muted-foreground py-4 text-sm">
                          Nenhum pagamento encontrado
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          <TabsContent value="alunos" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Meus Alunos</h3>
              <Dialog open={addAlunoDialogOpen} onOpenChange={setAddAlunoDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Aluno
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {alunos.map((aluno) => (
                <Card key={aluno.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{aluno.nome}</h4>
                      <Badge variant={aluno.status === "ativo" ? "default" : "secondary"}>
                        {aluno.status === "ativo" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {aluno.email && <p>📧 {aluno.email}</p>}
                      {aluno.telefone && <p>📱 {aluno.telefone}</p>}
                      {aluno.instrumento && <p>🎵 {aluno.instrumento}</p>}
                      {aluno.nivel && <p>📚 {aluno.nivel}</p>}
                      {aluno.mensalidade && (
                        <p>💰 {formatCurrency(aluno.mensalidade)}/mês</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {modules.pagamentos && (
            <TabsContent value="pagamentos" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Gestão de Pagamentos</h3>
              </div>

              <div className="space-y-4">
                {pagamentos.map((pagamento) => (
                  <Card key={pagamento.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{pagamento.aluno}</h4>
                          <p className="text-sm text-muted-foreground">
                            Vencimento: {formatDate(pagamento.vencimento)}
                          </p>
                          {pagamento.pagamento && (
                            <p className="text-sm text-green-600">
                              Pago em: {formatDate(pagamento.pagamento)}
                            </p>
                          )}
                        </div>
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

              <Dialog open={pagamentoDialogOpen} onOpenChange={setPagamentoDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar Pagamento</DialogTitle>
                    <DialogDescription>
                      Marcar pagamento de {selectedPagamento?.aluno} como recebido
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-lg font-medium">
                        {formatCurrency(selectedPagamento?.valor || 0)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={() => handleMarcarPago('pix')} className="w-full">
                        PIX
                      </Button>
                      <Button onClick={() => handleMarcarPago('dinheiro')} variant="outline" className="w-full">
                        Dinheiro
                      </Button>
                      <Button onClick={() => handleMarcarPago('cartao')} variant="outline" className="w-full">
                        Cartão
                      </Button>
                      <Button onClick={() => handleMarcarPago('transferencia')} variant="outline" className="w-full">
                        Transferência
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          )}

          {modules.agenda && (
            <TabsContent value="agenda">
              <Card>
                <CardHeader>
                  <CardTitle>Agenda de Aulas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sistema de agendamento em desenvolvimento...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {modules.materiais && (
            <TabsContent value="materiais">
              <Card>
                <CardHeader>
                  <CardTitle>Materiais Didáticos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gestão de materiais em desenvolvimento...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(modules.ferramentas || modules.lousa || modules.ia) && (
            <TabsContent value="ferramentas">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {modules.lousa && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Lousa Digital</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Quadro interativo para aulas
                      </p>
                      <Button className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Abrir Lousa
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {modules.ferramentas && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Metrônomo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Ferramenta de tempo musical
                      </p>
                      <Button className="w-full" variant="outline">
                        Abrir Metrônomo
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {modules.ia && (
                  <Card>
                    <CardHeader>
                      <CardTitle>IA Musical</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Assistente inteligente
                      </p>
                      <Button className="w-full" variant="outline">
                        Conversar com IA
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}