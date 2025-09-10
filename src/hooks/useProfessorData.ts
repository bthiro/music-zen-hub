import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useAuditLog } from './useAuditLog';
import { useToast } from '@/hooks/use-toast';
import type { Aluno, Aula, Pagamento } from '@/contexts/AppContext';

export interface ProfessorStats {
  alunosAtivos: number;
  aulasNaSemana: number;
  pagamentosPendentes: number;
  proximosEventos: number;
}

export function useProfessorData() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<ProfessorStats | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  const fetchProfessorId = async () => {
    if (!user?.id) return null;
    
    const { data } = await supabase
      .from('professores')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    return data?.id;
  };

  const fetchStats = async () => {
    try {
      const professorId = await fetchProfessorId();
      if (!professorId) return;

      // Fetch active students
      const { data: alunosData } = await supabase
        .from('alunos')
        .select('id')
        .eq('professor_id', professorId)
        .eq('ativo', true);

      // Fetch this week's lessons
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const { data: aulasData } = await supabase
        .from('aulas')
        .select('id')
        .eq('professor_id', professorId)
        .gte('data_hora', startOfWeek.toISOString())
        .lte('data_hora', endOfWeek.toISOString());

      // Fetch pending payments
      const { data: pagamentosData } = await supabase
        .from('pagamentos')
        .select('id')
        .eq('professor_id', professorId)
        .in('status', ['pendente', 'atrasado']);

      setStats({
        alunosAtivos: alunosData?.length || 0,
        aulasNaSemana: aulasData?.length || 0,
        pagamentosPendentes: pagamentosData?.length || 0,
        proximosEventos: 0, // TODO: Implement
      });
    } catch (error) {
      console.error('Error fetching professor stats:', error);
    }
  };

  const fetchAlunos = async () => {
    try {
      const professorId = await fetchProfessorId();
      if (!professorId) return;

      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('professor_id', professorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlunos(data || []);
    } catch (error) {
      console.error('Error fetching alunos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alunos",
        variant: "destructive",
      });
    }
  };

  const fetchPagamentos = async () => {
    try {
      const professorId = await fetchProfessorId();
      if (!professorId) return;

      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          alunos(nome)
        `)
        .eq('professor_id', professorId)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;
      
      const formattedPagamentos = data?.map(pag => ({
        ...pag,
        aluno: pag.alunos?.nome || 'Aluno não encontrado'
      })) || [];
      
      setPagamentos(formattedPagamentos as any);
    } catch (error) {
      console.error('Error fetching pagamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pagamentos",
        variant: "destructive",
      });
    }
  };

  const marcarPagamentoPago = async (pagamentoId: string, formaPagamento: string) => {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .update({
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0],
          forma_pagamento: formaPagamento,
          updated_at: new Date().toISOString()
        })
        .eq('id', pagamentoId)
        .eq('status', 'pendente') // Only update if still pending
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Atenção",
          description: "Este pagamento já foi processado",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setPagamentos(prev => 
        prev.map(pag => 
          pag.id === pagamentoId 
            ? { ...pag, status: 'pago', data_pagamento: new Date().toISOString().split('T')[0], forma_pagamento: formaPagamento }
            : pag
        )
      );

      // Log action
      await logAction(
        'pagamento_recebido',
        'pagamentos',
        pagamentoId,
        { forma_pagamento: formaPagamento, valor: data.valor }
      );

      toast({
        title: "Sucesso",
        description: "Pagamento marcado como recebido",
      });

      // Refresh stats
      await fetchStats();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar o pagamento como pago",
        variant: "destructive",
      });
    }
  };

  const addAluno = async (alunoData: Omit<Aluno, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const professorId = await fetchProfessorId();
      if (!professorId) return;

      const { data, error } = await supabase
        .from('alunos')
        .insert([{
          ...alunoData,
          professor_id: professorId
        }])
        .select()
        .single();

      if (error) throw error;

      setAlunos(prev => [data, ...prev]);

      // Log action
      await logAction(
        'aluno_criado',
        'alunos',
        data.id,
        { nome: alunoData.nome, email: alunoData.email }
      );

      // Create monthly payment automatically
      try {
        await supabase.rpc('criar_pagamento_mensal');
      } catch (paymentError) {
        console.error('Error creating monthly payment:', paymentError);
      }

      toast({
        title: "Sucesso",
        description: "Aluno adicionado com sucesso",
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error adding aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o aluno",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    if (user?.role === 'professor') {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchAlunos(), fetchPagamentos()]);
        setLoading(false);
      };

      loadData();
    }
  }, [user]);

  return {
    stats,
    alunos,
    aulas,
    pagamentos,
    loading,
    marcarPagamentoPago,
    addAluno,
    refreshData: async () => {
      await Promise.all([fetchStats(), fetchAlunos(), fetchPagamentos()]);
    }
  };
}