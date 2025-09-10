import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Pagamento {
  id: string;
  alunoId: string;
  aluno: string;
  valor: number;
  vencimento: string;
  pagamento: string | null;
  status: "pago" | "pendente" | "atrasado" | "cancelado" | "reembolsado";
  mes: string;
  formaPagamento?: "pix" | "cartao" | "dinheiro" | "mercado_pago";
  metodoPagamento?: string;
  professor_id?: string;
  // Additional fields for compatibility
  data_vencimento?: string;
  data_pagamento?: string;
  dataPagamento?: string;
  mercado_pago_payment_id?: string;
  eligible_to_schedule?: boolean;
}

export function usePagamentos() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadPagamentos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          alunos!inner(nome)
        `)
        .order('data_vencimento', { ascending: false });

      if (error) {
        console.error('Erro ao carregar pagamentos:', error);
        toast({
          title: "Erro ao carregar pagamentos",
          description: "Verifique sua conexão e tente novamente.",
          variant: "destructive"
        });
        return;
      }

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

        return {
          id: pagamento.id,
          alunoId: pagamento.aluno_id,
          aluno: pagamento.alunos?.nome || '',
          valor: Number(pagamento.valor),
          vencimento: pagamento.data_vencimento,
          pagamento: pagamento.data_pagamento,
          status,
          mes: mes.charAt(0).toUpperCase() + mes.slice(1),
          formaPagamento: pagamento.forma_pagamento as "pix" | "cartao" | "dinheiro" | "mercado_pago" | undefined,
          metodoPagamento: pagamento.referencia_externa,
          professor_id: pagamento.professor_id,
          mercado_pago_payment_id: pagamento.mercado_pago_payment_id,
          eligible_to_schedule: pagamento.eligible_to_schedule
        };
      }) || [];

      setPagamentos(pagamentosFormatados);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast({
        title: "Erro ao carregar pagamentos",
        description: "Erro interno da aplicação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const marcarPagamento = async (
    id: string, 
    dataPagamento: string, 
    formaPagamento?: string, 
    metodoPagamento?: string
  ) => {
    try {
      const { error } = await supabase
        .from('pagamentos')
        .update({
          data_pagamento: dataPagamento,
          status: 'pago',
          forma_pagamento: formaPagamento,
          referencia_externa: metodoPagamento
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao marcar pagamento:', error);
        toast({
          title: "Erro ao marcar pagamento",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Pagamento marcado como pago!"
      });

      await loadPagamentos();
    } catch (error) {
      console.error('Erro ao marcar pagamento:', error);
      toast({
        title: "Erro ao marcar pagamento",
        description: "Erro interno da aplicação.",
        variant: "destructive"
      });
    }
  };

  const addPagamento = async (novoPagamento: Omit<Pagamento, "id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      const { data: professor } = await supabase
        .from('professores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!professor) {
        toast({
          title: "Erro",
          description: "Professor não encontrado.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('pagamentos')
        .insert([{
          aluno_id: novoPagamento.alunoId,
          professor_id: professor.id,
          valor: novoPagamento.valor,
          data_vencimento: novoPagamento.vencimento,
          status: novoPagamento.status || 'pendente',
          forma_pagamento: novoPagamento.formaPagamento,
          referencia_externa: novoPagamento.metodoPagamento
        }]);

      if (error) {
        console.error('Erro ao adicionar pagamento:', error);
        toast({
          title: "Erro ao adicionar pagamento",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Pagamento adicionado com sucesso!"
      });

      await loadPagamentos();
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
      toast({
        title: "Erro ao adicionar pagamento",
        description: "Erro interno da aplicação.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadPagamentos();
  }, []);

  return {
    pagamentos,
    loading,
    marcarPagamento,
    addPagamento,
    refetch: loadPagamentos
  };
}