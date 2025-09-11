import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaymentStatusDisplay } from "@/components/PaymentStatusDisplay";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';
import type { Pagamento } from '@/hooks/usePagamentos';

export function GlobalPaymentsView() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [professorFilter, setProfessorFilter] = useState('todos');
  const [professores, setProfessores] = useState<Array<{id: string, nome: string}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPagamentos();
    loadProfessores();
  }, []);

  const loadProfessores = async () => {
    try {
      const { data, error } = await supabase
        .from('professores')
        .select('id, nome')
        .eq('status', 'ativo');

      if (error) throw error;
      setProfessores(data || []);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    }
  };

  const loadPagamentos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          alunos!inner(nome),
          professores!inner(nome)
        `)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;

      const pagamentosFormatados = data?.map(pagamento => {
        const vencimento = new Date(pagamento.data_vencimento);
        const mes = vencimento.toLocaleDateString('pt-BR', { 
          month: 'long', 
          year: 'numeric' 
        });

        // Determinar status baseado na data de vencimento e status do banco
        let status: "pago" | "pendente" | "atrasado" | "cancelado" | "reembolsado" = pagamento.status as any;
        if (status === 'pendente' && vencimento < new Date()) {
          status = 'atrasado';
        }

        // Mask sensitive data for admin view
        const maskEmail = (email: string) => {
          if (!email || email.length < 3) return email;
          const [local, domain] = email.split('@');
          if (!domain) return email;
          return `${local.substring(0, 2)}***@${domain}`;
        };

        return {
          id: pagamento.id,
          alunoId: pagamento.aluno_id,
          aluno: maskEmail(pagamento.alunos?.nome || ''), // Mask student name/email if it's an email
          valor: Number(pagamento.valor),
          vencimento: pagamento.data_vencimento,
          pagamento: pagamento.data_pagamento,
          status,
          mes: mes.charAt(0).toUpperCase() + mes.slice(1),
          formaPagamento: pagamento.forma_pagamento as "pix" | "cartao" | "dinheiro" | "mercado_pago" | undefined,
          // Hide sensitive payment data from admin
          metodoPagamento: '***', // Hide external reference
          professor_id: pagamento.professor_id,
          mercado_pago_payment_id: pagamento.mercado_pago_payment_id ? '***' : null, // Hide MP payment ID
          eligible_to_schedule: pagamento.eligible_to_schedule,
          professorNome: pagamento.professores?.nome || ''
        };
      }) || [];

      setPagamentos(pagamentosFormatados);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast({
        title: "Erro ao carregar pagamentos",
        description: "Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
      
      loadPagamentos();
    } catch (error) {
      console.error('Erro ao reprocessar pagamento:', error);
      toast({
        title: "Erro",
        description: "Falha ao verificar status do pagamento",
        variant: "destructive"
      });
    }
  };

  const exportToCsv = () => {
    const csvContent = [
      ['Professor', 'Aluno', 'Período', 'Valor', 'Vencimento', 'Pagamento', 'Status', 'Forma', 'Elegível Agendamento'].join(','),
      ...filteredPagamentos.map(p => [
        p.professorNome,
        p.aluno,
        p.mes,
        `R$ ${p.valor}`,
        new Date(p.vencimento).toLocaleDateString('pt-BR'),
        p.pagamento ? new Date(p.pagamento).toLocaleDateString('pt-BR') : 'Não realizado',
        p.status,
        p.formaPagamento || 'N/A',
        p.eligible_to_schedule ? 'Sim' : 'Não'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pagamentos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPagamentos = pagamentos.filter(pagamento => {
    const matchesSearch = pagamento.aluno.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pagamento.professorNome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || pagamento.status === statusFilter;
    const matchesProfessor = professorFilter === 'todos' || pagamento.professor_id === professorFilter;
    
    return matchesSearch && matchesStatus && matchesProfessor;
  });

  const stats = {
    total: filteredPagamentos.length,
    pago: filteredPagamentos.filter(p => p.status === 'pago').length,
    pendente: filteredPagamentos.filter(p => p.status === 'pendente').length,
    atrasado: filteredPagamentos.filter(p => p.status === 'atrasado').length,
    valorTotal: filteredPagamentos.reduce((sum, p) => sum + p.valor, 0),
    valorPago: filteredPagamentos.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.valor, 0)
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Pagamentos Globais</h3>
        <div className="flex gap-2">
          <Button onClick={loadPagamentos} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={exportToCsv} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total de Pagamentos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.pago}</div>
            <p className="text-xs text-muted-foreground">Pagos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendente}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.atrasado}</div>
            <p className="text-xs text-muted-foreground">Atrasados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por aluno ou professor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="reembolsado">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={professorFilter} onValueChange={setProfessorFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Professor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Professores</SelectItem>
                {professores.map(professor => (
                  <SelectItem key={professor.id} value={professor.id}>
                    {professor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pagamentos */}
      <div className="space-y-4">
        {filteredPagamentos.map((pagamento) => (
          <Card key={pagamento.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{pagamento.aluno}</h4>
                    <p className="text-sm text-muted-foreground">Professor: {pagamento.professorNome}</p>
                    <p className="text-xs text-muted-foreground">
                      Ref: {pagamento.metodoPagamento} {pagamento.mercado_pago_payment_id && `| MP: ${pagamento.mercado_pago_payment_id}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {pagamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-sm text-muted-foreground">{pagamento.mes}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>Vencimento: {new Date(pagamento.vencimento).toLocaleDateString('pt-BR')}</p>
                    {pagamento.pagamento && (
                      <p>Pagamento: {new Date(pagamento.pagamento).toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {pagamento.eligible_to_schedule && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Elegível Agendamento
                      </Badge>
                    )}
                    <PaymentStatusDisplay 
                      pagamento={pagamento}
                      onReprocessPayment={handleReprocessPayment}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredPagamentos.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}