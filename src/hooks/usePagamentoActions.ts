import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';

export function usePagamentoActions() {
  const { toast } = useToast();
  const { logAction } = useAuditLog();
  const [loading, setLoading] = useState(false);

  const criarRenovacao = async (pagamento: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: professor } = await supabase
        .from('professores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!professor) throw new Error('Professor não encontrado');

      // Calcular próxima data de vencimento
      const dataAtual = new Date(pagamento.data_vencimento);
      let proximaData: Date;

      switch (pagamento.tipo_pagamento) {
        case 'mensal':
          proximaData = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, dataAtual.getDate());
          break;
        case 'quinzenal':
          proximaData = new Date(dataAtual.getTime() + (15 * 24 * 60 * 60 * 1000));
          break;
        case 'pacote_4':
          proximaData = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, dataAtual.getDate());
          break;
        default:
          proximaData = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, dataAtual.getDate());
      }

      const renovacaoData = {
        professor_id: professor.id,
        aluno_id: pagamento.aluno_id,
        tipo_pagamento: pagamento.tipo_pagamento,
        valor: pagamento.valor,
        data_vencimento: proximaData.toISOString().split('T')[0],
        descricao: `Renovação - ${pagamento.descricao || 'Pagamento mensal'}`,
        status: 'pendente',
        payment_precedence: 'automatic'
      };

      const { data, error } = await supabase
        .from('pagamentos')
        .insert(renovacaoData)
        .select()
        .single();

      if (error) throw error;

      await logAction('pagamento_renovado', 'pagamentos', data.id, {
        pagamento_original_id: pagamento.id,
        tipo: pagamento.tipo_pagamento,
        valor: pagamento.valor
      });

      toast({
        title: 'Renovação criada!',
        description: 'Nova cobrança gerada para o próximo período.'
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar renovação:', error);
      toast({
        title: 'Falha ao criar renovação',
        description: error.message || 'Não foi possível gerar a renovação.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const marcarComoPago = async (pagamentoId: string, motivo: string) => {
    setLoading(true);
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('pagamentos')
        .update({
          status: 'pago',
          data_pagamento: hoje,
          forma_pagamento: 'manual',
          manual_payment_reason: motivo,
          eligible_to_schedule: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', pagamentoId);

      if (error) throw error;

      await logAction('pagamento_manual', 'pagamentos', pagamentoId, {
        motivo,
        data_pagamento: hoje
      });

      toast({
        title: 'Pagamento confirmado!',
        description: 'Marcado como pago manualmente.'
      });

      return true;
    } catch (error) {
      console.error('Erro ao marcar pagamento:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível marcar como pago.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const excluirPagamento = async (pagamento: any) => {
    setLoading(true);
    try {
      // Verificar se o pagamento pode ser excluído
      if (pagamento.status === 'pago') {
        throw new Error('Não é possível excluir pagamentos já realizados. Contate o suporte para estornos.');
      }

      // Verificar se há aulas vinculadas
      const { data: aulas } = await supabase
        .from('aulas')
        .select('id')
        .eq('aluno_id', pagamento.aluno_id)
        .eq('status', 'agendada');

      if (aulas && aulas.length > 0) {
        throw new Error('Não é possível excluir pagamentos com aulas agendadas.');
      }

      // Soft delete
      const { error } = await supabase
        .from('pagamentos')
        .update({
          status: 'cancelado',
          updated_at: new Date().toISOString()
        })
        .eq('id', pagamento.id);

      if (error) throw error;

      await logAction('pagamento_excluido', 'pagamentos', pagamento.id, {
        motivo: 'Exclusão pelo professor',
        valor: pagamento.valor,
        aluno_id: pagamento.aluno_id
      });

      toast({
        title: 'Pagamento excluído!',
        description: 'Pagamento removido com sucesso.'
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir o pagamento.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    criarRenovacao,
    marcarComoPago,
    excluirPagamento,
    loading
  };
}