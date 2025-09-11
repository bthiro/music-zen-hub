import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreVertical,
  Copy,
  CreditCard,
  CheckCircle,
  DollarSign,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const cobrancaSchema = z.object({
  professor_id: z.string().min(1, 'Professor obrigatório'),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  data_vencimento: z.string().min(1, 'Data de vencimento obrigatória'),
  descricao: z.string().min(1, 'Descrição obrigatória'),
});

type CobrancaFormData = z.infer<typeof cobrancaSchema>;

interface Cobranca {
  id: string;
  professor_id: string;
  plano_nome: string;
  competencia: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: string;
  descricao: string;
  link_pagamento?: string;
  professores: {
    nome: string;
    email: string;
  } | null;
}

interface Professor {
  id: string;
  nome: string;
  email: string;
  plano: string;
}

export default function AdminProfessorBilling({ embedded = false }: { embedded?: boolean }) {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<CobrancaFormData>({
    resolver: zodResolver(cobrancaSchema),
    defaultValues: {
      professor_id: '',
      valor: 0,
      data_vencimento: '',
      descricao: '',
    },
  });

  const fetchData = async () => {
    try {
      // Fetch professor billings with left join to handle missing professors
      const { data: cobrancasData, error: cobrancasError } = await supabase
        .from('cobrancas_professor')
        .select(`
          *,
          professores (nome, email)
        `)
        .order('created_at', { ascending: false });

      if (cobrancasError) throw cobrancasError;

      // Fetch professors for the form
      const { data: professoresData, error: professoresError } = await supabase
        .from('professores')
        .select('id, nome, email, plano')
        .eq('status', 'ativo')
        .order('nome');

      if (professoresError) throw professoresError;

      // Cast to get proper type handling from Supabase
      const cobrancasWithProfessors = cobrancasData?.map(cobranca => ({
        ...cobranca,
        professores: Array.isArray(cobranca.professores) ? cobranca.professores[0] : cobranca.professores
      })) || [];
      
      setCobrancas(cobrancasWithProfessors as Cobranca[]);
      setProfessores(professoresData || []);
    } catch (error: any) {
      console.error('[AdminBilling] Error fetching data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar cobranças',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCobranca = async (data: CobrancaFormData) => {
    try {
      const { error } = await supabase
        .from('cobrancas_professor')
        .insert({
          professor_id: data.professor_id,
          valor: data.valor,
          data_vencimento: data.data_vencimento,
          descricao: data.descricao,
          competencia: format(parseISO(data.data_vencimento), 'yyyy-MM'),
          status: 'pendente'
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Cobrança criada com sucesso',
      });

      setCreateDialogOpen(false);
      form.reset();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar cobrança: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleGeneratePaymentLink = async (cobrancaId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mercado-pago-admin', {
        body: { cobranca_id: cobrancaId },
        method: 'POST'
      });

      if (error) throw error;

      if (data.payment_link) {
        toast({
          title: 'Sucesso',
          description: 'Link de pagamento gerado com sucesso',
        });
        fetchData();
      }
    } catch (error: any) {
      console.error('[AdminBilling] Error generating payment link:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar link de pagamento: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleMarkAsPaid = async (cobrancaId: string) => {
    try {
      const { error } = await supabase
        .from('cobrancas_professor')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0],
          payment_precedence: 'manual',
          manual_payment_by: (await supabase.auth.getUser()).data.user?.id,
          manual_payment_at: new Date().toISOString(),
          manual_payment_reason: 'Marcado como pago pelo admin'
        })
        .eq('id', cobrancaId);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Cobrança marcada como paga',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao marcar como pago: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado',
      description: `${label} copiado para a área de transferência`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-500';
      case 'pendente': return 'bg-yellow-500';
      case 'vencido': return 'bg-red-500';
      case 'cancelado': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'pendente': return 'Pendente';
      case 'vencido': return 'Vencido';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  // Calculate statistics
  const stats = {
    total: cobrancas.length,
    pendente: cobrancas.filter(c => c.status === 'pendente').length,
    pago: cobrancas.filter(c => c.status === 'pago').length,
    valorTotal: cobrancas.reduce((sum, c) => sum + Number(c.valor), 0),
    valorPago: cobrancas.filter(c => c.status === 'pago').reduce((sum, c) => sum + Number(c.valor), 0)
  };

  if (loading) {
    const content = (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Cobrança de Professores</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );

    return embedded ? content : <Layout>{content}</Layout>;
  }

  const content = (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Cobrança de Professores</h2>
            <p className="text-muted-foreground">
              Gerencie as assinaturas e cobranças dos professores
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Cobrança
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Cobrança</DialogTitle>
                <DialogDescription>
                  Preencha os dados da nova cobrança para o professor
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleCreateCobranca)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="professor_id">Professor</Label>
                  <select {...form.register('professor_id')} className="w-full p-2 border rounded-md">
                    <option value="">Selecione um professor</option>
                    {professores.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nome} - {prof.plano}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.professor_id && (
                    <p className="text-sm text-destructive">{form.formState.errors.professor_id.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    {...form.register('valor', { valueAsNumber: true })} 
                  />
                  {form.formState.errors.valor && (
                    <p className="text-sm text-destructive">{form.formState.errors.valor.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Input type="date" {...form.register('data_vencimento')} />
                  {form.formState.errors.data_vencimento && (
                    <p className="text-sm text-destructive">{form.formState.errors.data_vencimento.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input {...form.register('descricao')} />
                  {form.formState.errors.descricao && (
                    <p className="text-sm text-destructive">{form.formState.errors.descricao.message}</p>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Cobrança</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {embedded && (
        <div className="flex items-center justify-between mb-4">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Cobrança
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Cobrança</DialogTitle>
                <DialogDescription>
                  Preencha os dados da nova cobrança para o professor
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleCreateCobranca)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="professor_id">Professor</Label>
                  <select {...form.register('professor_id')} className="w-full p-2 border rounded-md">
                    <option value="">Selecione um professor</option>
                    {professores.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nome} - {prof.plano}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.professor_id && (
                    <p className="text-sm text-destructive">{form.formState.errors.professor_id.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    {...form.register('valor', { valueAsNumber: true })} 
                  />
                  {form.formState.errors.valor && (
                    <p className="text-sm text-destructive">{form.formState.errors.valor.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Input type="date" {...form.register('data_vencimento')} />
                  {form.formState.errors.data_vencimento && (
                    <p className="text-sm text-destructive">{form.formState.errors.data_vencimento.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input {...form.register('descricao')} />
                  {form.formState.errors.descricao && (
                    <p className="text-sm text-destructive">{form.formState.errors.descricao.message}</p>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Cobrança</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cobranças</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendente}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pago}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Recebido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.valorPago.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing List */}
      <div className="space-y-4">
        {cobrancas.map((cobranca) => (
          <Card key={cobranca.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <h4 className="font-medium">{cobranca.professores?.nome || 'Professor não encontrado'}</h4>
                  <p className="text-sm text-muted-foreground">{cobranca.professores?.email || ''}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {cobranca.descricao} • {cobranca.competencia}
                  </p>
                </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold">R$ {Number(cobranca.valor).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">
                      Vence: {format(parseISO(cobranca.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  <Badge className={`${getStatusColor(cobranca.status)} text-white`}>
                    {getStatusLabel(cobranca.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  {cobranca.link_pagamento && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(cobranca.link_pagamento!, 'Link de pagamento')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Link
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {!cobranca.link_pagamento && cobranca.status === 'pendente' && (
                        <DropdownMenuItem 
                          onClick={() => handleGeneratePaymentLink(cobranca.id)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Gerar Link MP
                        </DropdownMenuItem>
                      )}
                      {cobranca.status === 'pendente' && (
                        <DropdownMenuItem 
                          onClick={() => handleMarkAsPaid(cobranca.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar como Pago
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {cobrancas.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhuma cobrança encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  return embedded ? content : <Layout>{content}</Layout>;
}