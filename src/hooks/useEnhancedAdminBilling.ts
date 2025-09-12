import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';
import { supabase } from '@/integrations/supabase/client';

interface AdminBillingData {
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

export function useEnhancedAdminBilling() {
  const [cobrancas, setCobrancas] = useState<AdminBillingData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logAction } = useAuditLog();

  const fetchCobrancas = async () => {
    try {
      setLoading(true);
      
      // Fetch billing data with better error handling
      const { data, error } = await supabase
        .from('cobrancas_professor')
        .select(`
          *,
          professores (
            nome,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Enhanced Admin Billing] Fetch error:', error);
        throw error;
      }

      // Handle the case where professors data might be missing
      const processedData = data?.map(item => ({
        ...item,
        professores: Array.isArray(item.professores) 
          ? item.professores[0] || null 
          : item.professores || null
      })) || [];

      setCobrancas(processedData);
    } catch (error: any) {
      console.error('[Enhanced Admin Billing] Error:', error);
      toast({
        title: 'Erro ao carregar cobranças',
        description: error.message || 'Não foi possível carregar as cobranças.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createCobranca = async (data: {
    professor_id: string;
    valor: number;
    data_vencimento: string;
    descricao: string;
  }) => {
    try {
      const { error } = await supabase
        .from('cobrancas_professor')
        .insert({
          ...data,
          competencia: new Date(data.data_vencimento).toISOString().slice(0, 7), // YYYY-MM
          status: 'pendente',
          plano_nome: 'personalizado'
        });

      if (error) throw error;

      await logAction('cobranca_criada', 'cobrancas_professor', 'new', data);
      
      toast({
        title: 'Cobrança criada',
        description: 'Nova cobrança adicionada com sucesso.',
      });

      await fetchCobrancas();
    } catch (error: any) {
      console.error('[Enhanced Admin Billing] Create error:', error);
      toast({
        title: 'Erro ao criar cobrança',
        description: error.message || 'Não foi possível criar a cobrança.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const markAsPaid = async (cobrancaId: string) => {
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

      await logAction('cobranca_paga_manual', 'cobrancas_professor', cobrancaId);
      
      toast({
        title: 'Cobrança confirmada',
        description: 'Cobrança marcada como paga com sucesso.',
      });

      await fetchCobrancas();
    } catch (error: any) {
      console.error('[Enhanced Admin Billing] Mark paid error:', error);
      toast({
        title: 'Erro ao marcar como pago',
        description: error.message || 'Não foi possível confirmar o pagamento.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const generatePaymentLink = async (cobrancaId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mercado-pago-admin', {
        body: { cobranca_id: cobrancaId }
      });

      if (error) throw error;

      if (data?.success) {
        await logAction('link_pagamento_gerado', 'cobrancas_professor', cobrancaId, {
          payment_link: data.payment_link
        });
        
        toast({
          title: 'Link gerado',
          description: 'Link de pagamento criado com sucesso.',
        });

        await fetchCobrancas();
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('[Enhanced Admin Billing] Generate link error:', error);
      toast({
        title: 'Erro ao gerar link',
        description: error.message || 'Não foi possível gerar o link de pagamento.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const softDelete = async (cobrancaId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('cobrancas_professor')
        .update({
          status: 'cancelado',
          manual_payment_reason: reason || 'Cancelado pelo admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', cobrancaId);

      if (error) throw error;

      await logAction('cobranca_cancelada', 'cobrancas_professor', cobrancaId, {
        reason: reason || 'Cancelado pelo admin'
      });
      
      toast({
        title: 'Cobrança cancelada',
        description: 'Cobrança removida com sucesso.',
      });

      await fetchCobrancas();
    } catch (error: any) {
      console.error('[Enhanced Admin Billing] Soft delete error:', error);
      toast({
        title: 'Erro ao cancelar cobrança',
        description: error.message || 'Não foi possível cancelar a cobrança.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCobrancas();
  }, []);

  return {
    cobrancas,
    loading,
    createCobranca,
    markAsPaid,
    generatePaymentLink,
    softDelete,
    refetch: fetchCobrancas
  };
}