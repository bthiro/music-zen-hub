import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, DollarSign, AlertCircle, CheckCircle, Clock, Filter, MessageSquare, ExternalLink } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function SupabasePagamentos() {
  const { session } = useAuth();
  const { pagamentos, alunos, loading, adicionarPagamento, atualizarPagamento } = useSupabaseData();
  const { toast } = useToast();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [pagamentoEdicao, setPagamentoEdicao] = useState<any>(null);

  const pagamentosFiltrados = pagamentos.filter(pagamento => {
    const matchBusca = 
      pagamento.aluno?.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      pagamento.valor?.toString().includes(busca);
    
    const matchStatus = filtroStatus === 'todos' || pagamento.status === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  const calcularResumo = () => {
    const total = pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
    const pago = pagamentos.filter(p => p.status === 'pago').reduce((acc, p) => acc + Number(p.valor), 0);
    const pendente = pagamentos.filter(p => p.status === 'pendente').reduce((acc, p) => acc + Number(p.valor), 0);
    const atrasado = pagamentos.filter(p => p.status === 'atrasado').reduce((acc, p) => acc + Number(p.valor), 0);
    
    return { total, pago, pendente, atrasado };
  };

  const resumo = calcularResumo();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'atrasado':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'atrasado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatarData = (data: string) => {
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleNovoPagamento = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const dadosPagamento = {
      aluno_id: formData.get('aluno_id') as string,
      valor: parseFloat(formData.get('valor') as string),
      data_vencimento: formData.get('data_vencimento') as string,
      status: 'pendente',
    };

    try {
      const { error } = await adicionarPagamento(dadosPagamento);
      if (error) throw error;

      toast({
        title: 'Pagamento criado!',
        description: 'O pagamento foi criado com sucesso.',
      });

      setDialogAberto(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar pagamento.',
        variant: 'destructive',
      });
    }
  };

  const handleGerarLinkPagamento = async (pagamento: any, gateway: 'mercadopago' | 'infinitepay') => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('create-payment-link', {
        body: {
          pagamento_id: pagamento.id,
          gateway: gateway,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        // Abrir link em nova aba
        window.open(data.link_pagamento, '_blank');
        
        toast({
          title: 'Link gerado!',
          description: `Link de pagamento criado via ${gateway.toUpperCase()}.`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao gerar link de pagamento.',
        variant: 'destructive',
      });
    }
  };

  const handleEnviarLembrete = async (pagamento: any) => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          aluno_id: pagamento.aluno_id,
          tipo_mensagem: 'lembrete_pagamento',
          dados_extra: {
            valor: formatarValor(Number(pagamento.valor)),
            vencimento: formatarData(pagamento.data_vencimento),
            link_pagamento: pagamento.link_pagamento,
          },
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Lembrete enviado!',
          description: `WhatsApp enviado para ${pagamento.aluno?.nome}.`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar lembrete.',
        variant: 'destructive',
      });
    }
  };

  const handleMarcarComoPago = async (pagamento: any) => {
    try {
      const { error } = await atualizarPagamento(pagamento.id, {
        status: 'pago',
        data_pagamento: new Date().toISOString().split('T')[0],
        forma_pagamento: 'Confirmado manualmente'
      });

      if (error) throw error;

      toast({
        title: 'Pagamento confirmado!',
        description: `Pagamento de ${pagamento.aluno?.nome} marcado como pago.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao confirmar pagamento.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
            <p className="text-muted-foreground">
              Gerencie os pagamentos dos seus alunos
            </p>
          </div>
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Pagamento</DialogTitle>
                <DialogDescription>
                  Adicione um novo pagamento para um aluno
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleNovoPagamento} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aluno_id">Aluno</Label>
                  <Select name="aluno_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {alunos.map(aluno => (
                        <SelectItem key={aluno.id} value={aluno.id}>
                          {aluno.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input
                    id="valor"
                    name="valor"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Input
                    id="data_vencimento"
                    name="data_vencimento"
                    type="date"
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Criar Pagamento
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarValor(resumo.total)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recebido</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatarValor(resumo.pago)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatarValor(resumo.pendente)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasado</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatarValor(resumo.atrasado)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por aluno ou valor..."
              className="pl-8"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Pagamentos */}
        {pagamentosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {busca || filtroStatus !== 'todos' ? 'Nenhum pagamento encontrado' : 'Nenhum pagamento cadastrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {busca || filtroStatus !== 'todos' 
                  ? 'Tente ajustar seus filtros.'
                  : 'Comece criando um novo pagamento.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pagamentosFiltrados.map((pagamento) => (
              <Card key={pagamento.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(pagamento.status)}
                        <h3 className="font-semibold text-lg">
                          {pagamento.aluno?.nome || 'Aluno não encontrado'}
                        </h3>
                        <Badge className={getStatusColor(pagamento.status)}>
                          {pagamento.status.charAt(0).toUpperCase() + pagamento.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>Valor: {formatarValor(Number(pagamento.valor))}</span>
                        <span>Vencimento: {formatarData(pagamento.data_vencimento)}</span>
                        {pagamento.data_pagamento && (
                          <span>Pago em: {formatarData(pagamento.data_pagamento)}</span>
                        )}
                        {pagamento.forma_pagamento && (
                          <span>Forma: {pagamento.forma_pagamento}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {pagamento.status === 'pendente' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarcarComoPago(pagamento)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marcar como Pago
                        </Button>
                      )}
                      
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGerarLinkPagamento(pagamento, 'mercadopago')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Mercado Pago
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGerarLinkPagamento(pagamento, 'infinitepay')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          InfinitePay
                        </Button>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEnviarLembrete(pagamento)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Lembrete WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}