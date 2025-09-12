import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';

export function usePagamentoActions() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  // Excluir pagamento (soft delete)
  const excluirPagamento = async (pagamentoId: string, motivo?: string) => {
    try {
      setLoading(true);

      // Verificar se existe e não está pago
      const { data: pagamento, error: fetchError } = await supabase
        .from('pagamentos')
        .select('id, status, aluno_id, valor')
        .eq('id', pagamentoId)
        .single();

      if (fetchError) {
        throw new Error('Pagamento não encontrado');
      }

      if (pagamento.status === 'pago') {
        throw new Error('Não é possível excluir um pagamento já confirmado');
      }

      // Verificar se há aulas associadas
      const { data: aulasAssociadas, error: aulasError } = await supabase
        .from('aulas')
        .select('id')
        .eq('pagamento_id', pagamentoId)
        .limit(1);

      if (aulasError) {
        console.warn('Erro ao verificar aulas associadas:', aulasError);
      }

      if (aulasAssociadas && aulasAssociadas.length > 0) {
        throw new Error('Não é possível excluir um pagamento com aulas agendadas');
      }

      // Soft delete - marcar como cancelado
      const { error: updateError } = await supabase
        .from('pagamentos')
        .update({
          status: 'cancelado',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: motivo || 'Excluído pelo professor',
          updated_at: new Date().toISOString()
        })
        .eq('id', pagamentoId);

      if (updateError) {
        console.error('Erro ao cancelar pagamento:', updateError);
        throw new Error('Erro ao excluir pagamento: ' + updateError.message);
      }

      // Log da ação
      await logAction('pagamento_excluido', 'pagamentos', pagamentoId, {
        motivo: motivo || 'Excluído pelo professor',
        valor_cancelado: pagamento.valor,
        aluno_id: pagamento.aluno_id
      });

      toast({
        title: 'Pagamento excluído',
        description: 'O pagamento foi cancelado com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir o pagamento.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Marcar como pago manualmente
  const marcarComoPago = async (pagamentoId: string, motivo: string, dataPagamento?: string) => {
    try {
      setLoading(true);

      const dataAtual = dataPagamento || new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('pagamentos')
        .update({
          status: 'pago',
          data_pagamento: dataAtual,
          payment_precedence: 'manual',
          manual_payment_by: (await supabase.auth.getUser()).data.user?.id,
          manual_payment_at: new Date().toISOString(),
          manual_payment_reason: motivo,
          updated_at: new Date().toISOString()
        })
        .eq('id', pagamentoId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao marcar como pago:', error);
        throw new Error('Erro ao confirmar pagamento: ' + error.message);
      }

      await logAction('pagamento_manual', 'pagamentos', pagamentoId, {
        motivo,
        data_pagamento: dataAtual
      });

      toast({
        title: 'Pagamento confirmado',
        description: 'O pagamento foi marcado como pago.',
      });

      return data;
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast({
        title: 'Erro ao confirmar',
        description: error.message || 'Não foi possível confirmar o pagamento.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Criar renovação
  const criarRenovacao = async (pagamento: any) => {
    try {
      setLoading(true);

      // Calcular próxima data de vencimento
      const dataAtual = new Date(pagamento.data_vencimento);
      let proximaData = new Date(dataAtual);

      switch (pagamento.tipo_pagamento) {
        case 'mensal':
          proximaData.setMonth(proximaData.getMonth() + 1);
          break;
        case 'semanal':
          proximaData.setDate(proximaData.getDate() + 7);
          break;
        case 'quinzenal':
          proximaData.setDate(proximaData.getDate() + 15);
          break;
        default:
          throw new Error('Tipo de pagamento não suporta renovação automática');
      }

      const novaRenovacao = {
        professor_id: pagamento.professor_id,
        aluno_id: pagamento.aluno_id,
        valor: pagamento.valor,
        data_vencimento: proximaData.toISOString().split('T')[0],
        tipo_pagamento: pagamento.tipo_pagamento,
        descricao: `Renovação - ${pagamento.descricao || 'Mensalidade'}`,
        status: 'pendente',
        payment_mode: pagamento.payment_mode || 'manual'
      };

      const { data, error } = await supabase
        .from('pagamentos')
        .insert(novaRenovacao)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar renovação:', error);
        throw new Error('Erro ao criar renovação: ' + error.message);
      }

      await logAction('renovacao_criada', 'pagamentos', data.id, {
        pagamento_original: pagamento.id,
        nova_data_vencimento: novaRenovacao.data_vencimento,
        valor: novaRenovacao.valor
      });

      toast({
        title: 'Renovação criada',
        description: `Nova cobrança criada com vencimento em ${proximaData.toLocaleDateString('pt-BR')}.`,
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar renovação:', error);
      toast({
        title: 'Erro na renovação',
        description: error.message || 'Não foi possível criar a renovação.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    excluirPagamento,
    marcarComoPago,
    criarRenovacao,
    loading
  };
}