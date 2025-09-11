import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';

interface PaymentData {
  id: string;
  aluno_id: string;
  professor_id: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  forma_pagamento?: string;
  tipo_pagamento: 'mensal' | 'avulso' | 'pacote';
  descricao?: string;
  referencia_externa?: string;
  mercado_pago_payment_id?: string;
  mercado_pago_status?: string;
  eligible_to_schedule: boolean;
  manual_payment_reason?: string;
  manual_payment_by?: string;
  manual_payment_at?: string;
  payment_precedence: 'automatic' | 'manual' | 'refunded' | 'cancelled' | 'chargeback';
  created_at: string;
  updated_at: string;
  // Dados relacionados
  aluno?: {
    nome: string;
    email?: string;
  };
}

export function useEnhancedPayments() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  // Carregar pagamentos
  const loadPayments = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuário não autenticado');

      // Obter ID do professor
      const { data: professor, error: profError } = await supabase
        .from('professores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profError || !professor) throw new Error('Professor não encontrado');

      // Carregar pagamentos com dados do aluno
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          aluno:alunos (
            nome,
            email
          )
        `)
        .eq('professor_id', professor.id)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;

      // Processar status baseado na data de vencimento
      const processedPayments = data?.map(payment => {
        let status = payment.status;
        
        if (status === 'pendente') {
          const hoje = new Date();
          const vencimento = new Date(payment.data_vencimento);
          
          if (hoje > vencimento) {
            status = 'atrasado';
          }
        }

        return {
          ...payment,
          status,
          aluno: payment.aluno
        };
      }) || [];

      setPayments(processedPayments);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast({
        title: 'Erro ao carregar pagamentos',
        description: 'Não foi possível carregar os dados de pagamento.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Marcar pagamento como pago manualmente
  const markPaymentAsManual = async (
    paymentId: string, 
    reason: string,
    paymentDate?: string
  ) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuário não autenticado');

      // Verificar se o pagamento não foi já pago
      const { data: currentPayment, error: fetchError } = await supabase
        .from('pagamentos')
        .select('status, payment_precedence')
        .eq('id', paymentId)
        .single();

      if (fetchError) throw fetchError;

      if (currentPayment.status === 'pago') {
        toast({
          title: 'Pagamento já processado',
          description: 'Este pagamento já foi marcado como pago.',
          variant: 'destructive'
        });
        return false;
      }

      // Atualizar pagamento
      const { data, error } = await supabase
        .from('pagamentos')
        .update({
          status: 'pago',
          data_pagamento: paymentDate || new Date().toISOString().split('T')[0],
          forma_pagamento: 'manual',
          eligible_to_schedule: true,
          manual_payment_reason: reason,
          manual_payment_by: user.id,
          manual_payment_at: new Date().toISOString(),
          payment_precedence: 'manual',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      await logAction('pagamento_manual', 'pagamentos', paymentId, {
        reason,
        valor: data.valor,
        data_pagamento: data.data_pagamento,
        marked_by: user.id
      });

      toast({
        title: 'Pagamento confirmado!',
        description: `Pagamento marcado como pago manualmente. Motivo: ${reason}`
      });

      await loadPayments();
      return true;
    } catch (error) {
      console.error('Erro ao marcar pagamento manual:', error);
      toast({
        title: 'Erro ao confirmar pagamento',
        description: 'Não foi possível marcar o pagamento como pago.',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Processar webhook do Mercado Pago
  const processWebhookUpdate = async (
    externalReference: string,
    newStatus: string,
    paymentData?: any
  ) => {
    try {
      // Buscar pagamento pela referência externa
      const { data: payment, error: fetchError } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('referencia_externa', externalReference)
        .single();

      if (fetchError) throw fetchError;

      // Verificar precedência - manual nunca é rebaixado por automático
      if (payment.payment_precedence === 'manual' && 
          ['approved', 'pending'].includes(newStatus)) {
        console.log('Pagamento manual não pode ser rebaixado por webhook automático');
        return false;
      }

      let updateData: any = {
        mercado_pago_status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Mapear status do Mercado Pago
      switch (newStatus) {
        case 'approved':
          updateData.status = 'pago';
          updateData.data_pagamento = new Date().toISOString().split('T')[0];
          updateData.eligible_to_schedule = true;
          updateData.payment_precedence = 'automatic';
          break;
        
        case 'pending':
        case 'in_process':
          updateData.status = 'pendente';
          updateData.eligible_to_schedule = false;
          break;
          
        case 'cancelled':
          updateData.status = 'cancelado';
          updateData.eligible_to_schedule = false;
          updateData.payment_precedence = 'cancelled';
          break;
          
        case 'refunded':
          updateData.status = 'cancelado';
          updateData.eligible_to_schedule = false;
          updateData.payment_precedence = 'refunded';
          break;
          
        case 'charged_back':
          updateData.status = 'cancelado';
          updateData.eligible_to_schedule = false;
          updateData.payment_precedence = 'chargeback';
          break;
      }

      // Adicionar dados do pagamento se disponíveis
      if (paymentData) {
        updateData.mercado_pago_payment_id = paymentData.id;
        if (paymentData.transaction_details?.total_paid_amount) {
          updateData.valor = paymentData.transaction_details.total_paid_amount;
        }
      }

      const { error: updateError } = await supabase
        .from('pagamentos')
        .update(updateData)
        .eq('id', payment.id);

      if (updateError) throw updateError;

      await logAction('pagamento_webhook', 'pagamentos', payment.id, {
        status_anterior: payment.status,
        status_novo: updateData.status,
        mercado_pago_status: newStatus,
        payment_data: paymentData
      });

      // Notificar sobre mudanças críticas
      if (['refunded', 'cancelled', 'charged_back'].includes(newStatus)) {
        toast({
          title: 'Atenção: Pagamento Invalidado',
          description: `Um pagamento foi ${newStatus === 'refunded' ? 'estornado' : 
                       newStatus === 'cancelled' ? 'cancelado' : 'contestado'}.`,
          variant: 'destructive'
        });
      }

      await loadPayments();
      return true;
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return false;
    }
  };

  // Reprocessar pagamento (verificar status no Mercado Pago)
  const reprocessPayment = async (paymentId: string) => {
    try {
      toast({
        title: 'Reprocessando...',
        description: 'Verificando status no Mercado Pago...'
      });

      const { data, error } = await supabase.functions.invoke('mercado-pago-reprocess', {
        body: { payment_id: paymentId }
      });

      if (error) throw error;

      toast({
        title: 'Status atualizado!',
        description: 'Pagamento verificado com o Mercado Pago.'
      });

      await loadPayments();
      return true;
    } catch (error) {
      console.error('Erro ao reprocessar pagamento:', error);
      toast({
        title: 'Erro no reprocessamento',
        description: 'Não foi possível verificar o status no Mercado Pago.',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Criar pagamento
  const createPayment = async (paymentData: {
    aluno_id: string;
    valor: number;
    data_vencimento: string;
    tipo_pagamento: 'mensal' | 'avulso' | 'pacote';
    descricao?: string;
  }) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuário não autenticado');

      // Obter ID do professor
      const { data: professor, error: profError } = await supabase
        .from('professores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profError || !professor) throw new Error('Professor não encontrado');

      const { data, error } = await supabase
        .from('pagamentos')
        .insert({
          ...paymentData,
          professor_id: professor.id,
          status: 'pendente',
          eligible_to_schedule: false,
          payment_precedence: 'automatic'
        })
        .select()
        .single();

      if (error) throw error;

      await logAction('pagamento_criado', 'pagamentos', data.id, paymentData);

      toast({
        title: 'Pagamento criado!',
        description: 'Novo pagamento adicionado à lista.'
      });

      await loadPayments();
      return data;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: 'Erro ao criar pagamento',
        description: 'Não foi possível criar o pagamento.',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    loadPayments();
  }, []);

  return {
    payments,
    loading,
    markPaymentAsManual,
    processWebhookUpdate,
    reprocessPayment,
    createPayment,
    refetch: loadPayments
  };
}