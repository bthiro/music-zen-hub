import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from './useAuditLog';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/types/auth';

export interface AdminStats {
  totalProfessores: number;
  professoresAtivos: number;
  professoresSuspensos: number;
  professoresInativos: number;
  totalAlunos: number;
  aulasNoMes: number;
  pagamentosPendentes: number;
  pagamentosPagos: number;
  receitaTotal: number;
}

export function useAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [professores, setProfessores] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { logAction } = useAuditLog();
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      // Fetch professors stats
      const { data: professoresData } = await supabase
        .from('professores')
        .select('status');

      // Fetch students count
      const { data: alunosData } = await supabase
        .from('alunos')
        .select('id', { count: 'exact', head: true });

      // Fetch current month lessons
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data: aulasData } = await supabase
        .from('aulas')
        .select('id', { count: 'exact', head: true })
        .gte('data_hora', startOfMonth.toISOString())
        .lte('data_hora', endOfMonth.toISOString());

      // Fetch payments stats
      const { data: pagamentosData } = await supabase
        .from('pagamentos')
        .select('status, valor');

      const professoresStats = professoresData?.reduce((acc, prof) => {
        acc[prof.status] = (acc[prof.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const pagamentosStats = pagamentosData?.reduce((acc, pag) => {
        if (pag.status === 'pago') {
          acc.pagos++;
          acc.receita += Number(pag.valor);
        } else if (pag.status === 'pendente' || pag.status === 'atrasado') {
          acc.pendentes++;
        }
        return acc;
      }, { pagos: 0, pendentes: 0, receita: 0 }) || { pagos: 0, pendentes: 0, receita: 0 };

      setStats({
        totalProfessores: professoresData?.length || 0,
        professoresAtivos: professoresStats.ativo || 0,
        professoresSuspensos: professoresStats.suspenso || 0,
        professoresInativos: professoresStats.inativo || 0,
        totalAlunos: alunosData?.length || 0,
        aulasNoMes: aulasData?.length || 0,
        pagamentosPendentes: pagamentosStats.pendentes,
        pagamentosPagos: pagamentosStats.pagos,
        receitaTotal: pagamentosStats.receita,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas",
        variant: "destructive",
      });
    }
  };

  const fetchProfessores = async () => {
    try {
      const { data, error } = await supabase
        .from('professores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfessores(data || []);
    } catch (error) {
      console.error('Error fetching professores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os professores",
        variant: "destructive",
      });
    }
  };

  const updateProfessorStatus = async (professorId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('professores')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', professorId);

      if (error) throw error;

      // Update local state
      setProfessores(prev => 
        prev.map(prof => 
          prof.id === professorId 
            ? { ...prof, status: status as any, updated_at: new Date().toISOString() }
            : prof
        )
      );

      // Log action
      await logAction(
        'professor_status_updated',
        'professores',
        professorId,
        { new_status: status }
      );

      toast({
        title: "Sucesso",
        description: `Status do professor atualizado para ${status}`,
      });

      // Refresh stats
      await fetchStats();
    } catch (error) {
      console.error('Error updating professor status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do professor",
        variant: "destructive",
      });
    }
  };

  const updateProfessorModules = async (professorId: string, modules: Record<string, boolean>) => {
    try {
      const { error } = await supabase
        .from('professores')
        .update({ modules, updated_at: new Date().toISOString() })
        .eq('id', professorId);

      if (error) throw error;

      // Update local state
      setProfessores(prev => 
        prev.map(prof => 
          prof.id === professorId 
            ? { ...prof, modules, updated_at: new Date().toISOString() }
            : prof
        )
      );

      // Log action
      await logAction(
        'professor_modules_updated',
        'professores',
        professorId,
        { modules }
      );

      toast({
        title: "Sucesso",
        description: "Módulos do professor atualizados",
      });
    } catch (error) {
      console.error('Error updating professor modules:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os módulos do professor",
        variant: "destructive",
      });
    }
  };

  const createProfessor = async (professorData: {
    nome: string;
    email: string;
    telefone?: string;
    plano?: string;
    limite_alunos?: number;
    modules?: Record<string, boolean>;
  }) => {
    try {
      // First create auth user (this would need to be done via admin API)
      // For now, just create the professor record
      const { data, error } = await supabase
        .from('professores')
        .insert([{
          ...professorData,
          status: 'ativo',
          plano: professorData.plano || 'basico',
          limite_alunos: professorData.limite_alunos || 50,
          modules: professorData.modules || {
            dashboard: true,
            ia: false,
            ferramentas: true,
            agenda: true,
            pagamentos: true,
            materiais: true,
            lousa: true
          }
        }])
        .select()
        .single();

      if (error) throw error;

      setProfessores(prev => [data, ...prev]);

      await logAction(
        'professor_created',
        'professores',
        data.id,
        { nome: professorData.nome, email: professorData.email }
      );

      toast({
        title: "Sucesso",
        description: "Professor criado com sucesso",
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error creating professor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o professor",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchProfessores()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    stats,
    professores,
    loading,
    updateProfessorStatus,
    updateProfessorModules,
    createProfessor,
    refreshStats: fetchStats,
    refreshProfessores: fetchProfessores,
  };
}