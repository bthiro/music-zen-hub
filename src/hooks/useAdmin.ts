import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from './useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { getOrigin } from '@/utils/navigation';
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

  const inviteProfessor = async (professorId: string, email: string) => {
    try {
      console.log('[useAdmin] Inviting professor:', { professorId, email });
      
      const { data: result, error } = await supabase.functions.invoke('admin-invite-professor', {
        body: {
          professor_id: professorId,
          email,
          redirect_url: `${getOrigin()}/auth/reset-password`
        }
      });

      if (error) {
        console.error('[useAdmin] Edge function error:', error);
        throw new Error(error.message || 'Erro na função de convite');
      }

      if (!result.success) {
        console.error('[useAdmin] Edge function returned error:', result.error);
        throw new Error(result.error || result.message || 'Erro desconhecido');
      }

      await logAction(
        'professor_invited',
        'professores',
        professorId,
        { email, method: result.method }
      );

      if (result.method === 'email') {
        toast({
          title: "Convite Enviado",
          description: `Convite enviado por email para ${email}`,
        });
      } else {
        toast({
          title: "Link Gerado",
          description: "Link de acesso copiado para área de transferência",
        });
        // Copy link to clipboard
        if (result.link && navigator.clipboard) {
          await navigator.clipboard.writeText(result.link);
        }
      }

      return { data: result, error: null };
    } catch (error: any) {
      console.error('[useAdmin] Error inviting professor:', error);
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível enviar convite",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const resetProfessorPassword = async (professorId: string, email: string) => {
    try {
      console.log('[useAdmin] Resetting professor password:', { professorId, email });
      
      const { data: result, error } = await supabase.functions.invoke('admin-reset-professor-password', {
        body: {
          professor_id: professorId,
          email,
          redirect_url: `${getOrigin()}/auth/reset-password`
        }
      });

      if (error) {
        console.error('[useAdmin] Edge function error:', error);
        throw new Error(error.message || 'Erro na função de reset');
      }

      if (!result.success) {
        console.error('[useAdmin] Edge function returned error:', result.error);
        throw new Error(result.error || result.message || 'Erro desconhecido');
      }

      await logAction(
        'professor_password_reset_requested',
        'professores',
        professorId,
        { email, method: result.method }
      );

      if (result.method === 'email') {
        toast({
          title: "Link Enviado",
          description: `Link de redefinição enviado por email para ${email}`,
        });
      } else {
        toast({
          title: "Link Gerado",
          description: "Link de redefinição copiado para área de transferência",
        });
        // Copy link to clipboard
        if (result.link && navigator.clipboard) {
          await navigator.clipboard.writeText(result.link);
        }
      }

      return { data: result, error: null };
    } catch (error: any) {
      console.error('[useAdmin] Error resetting professor password:', error);
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível enviar link de redefinição",
        variant: "destructive",
      });
      return { data: null, error };
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
      console.log('[useAdmin] Creating professor via edge function:', professorData);
      
      // Call edge function to create professor with admin privileges
      const { data: result, error } = await supabase.functions.invoke('admin-create-professor', {
        body: {
          nome: professorData.nome,
          email: professorData.email,
          telefone: professorData.telefone,
          plano: professorData.plano || 'basico',
          limite_alunos: professorData.limite_alunos || 50
        }
      });

      if (error) {
        console.error('[useAdmin] Edge function error:', error);
        throw new Error(error.message || 'Erro na função de criação');
      }

      if (!result.success) {
        console.error('[useAdmin] Edge function returned error:', result.error);
        throw new Error(result.error || result.message || 'Erro desconhecido');
      }

      console.log('[useAdmin] Professor created successfully:', result.professor);

      // Update local state
      setProfessores(prev => [result.professor, ...prev]);

      await logAction(
        'professor_created',
        'professores',
        result.professor.id,
        { nome: professorData.nome, email: professorData.email, auth_user_id: result.auth_user_id }
      );

      toast({
        title: "Sucesso",
        description: `Professor criado com sucesso! Email: ${professorData.email}`,
      });

      return { data: result.professor, error: null };
    } catch (error: any) {
      console.error('[useAdmin] Error creating professor:', error);
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível criar o professor",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateProfessor = async (professorId: string, data: {
    nome?: string;
    email?: string;
    telefone?: string;
    plano?: string;
    limite_alunos?: number;
    modules?: Record<string, boolean>;
  }) => {
    try {
      setLoading(true);

      // Check if reducing student limit and current active students exceed new limit
      if (data.limite_alunos !== undefined) {
        const { data: studentsData, error: studentsError } = await supabase
          .from('alunos')
          .select('id')
          .eq('professor_id', professorId)
          .eq('ativo', true);

        if (studentsError) {
          console.error('Error checking students:', studentsError);
          throw new Error('Erro ao verificar alunos ativos');
        }

        const activeStudents = studentsData?.length || 0;
        if (activeStudents > data.limite_alunos) {
          throw new Error(`Não é possível reduzir o limite para ${data.limite_alunos}. Professor tem ${activeStudents} alunos ativos.`);
        }
      }

      const { error } = await supabase
        .from('professores')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', professorId);

      if (error) {
        console.error('Error updating professor:', error);
        throw new Error('Erro ao atualizar professor');
      }

      // Update local state
      setProfessores(prev => prev.map(prof => 
        prof.id === professorId 
          ? { ...prof, ...data }
          : prof
      ));

      // Log audit
      await logAction(
        'professor_atualizado',
        'professores',
        professorId,
        data
      );

      toast({
        title: 'Professor atualizado',
        description: 'Dados do professor foram atualizados com sucesso',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating professor:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível atualizar o professor',
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteProfessor = async (professorId: string, transferToId?: string) => {
    try {
      setLoading(true);

      // Check for active students
      const { data: studentsData, error: studentsError } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('professor_id', professorId)
        .eq('ativo', true);

      if (studentsError) {
        console.error('Error checking students:', studentsError);
        throw new Error('Erro ao verificar alunos do professor');
      }

      const activeStudents = studentsData?.length || 0;

      // If has active students and no transfer professor specified
      if (activeStudents > 0 && !transferToId) {
        throw new Error(`Professor tem ${activeStudents} alunos ativos. Escolha um professor para transferir os alunos.`);
      }

      // Transfer students if specified
      if (transferToId && activeStudents > 0) {
        const { error: transferError } = await supabase
          .from('alunos')
          .update({ professor_id: transferToId })
          .eq('professor_id', professorId)
          .eq('ativo', true);

        if (transferError) {
          console.error('Error transferring students:', transferError);
          throw new Error('Erro ao transferir alunos');
        }
      }

      // Soft delete professor
      const { error } = await supabase
        .from('professores')
        .update({ 
          status: 'excluido',
          updated_at: new Date().toISOString()
        })
        .eq('id', professorId);

      if (error) {
        console.error('Error deleting professor:', error);
        throw new Error('Erro ao excluir professor');
      }

      // Update local state
      setProfessores(prev => prev.map(prof => 
        prof.id === professorId 
          ? { ...prof, status: 'excluido' as any }
          : prof
      ));

      // Log audit
      await logAction(
        'professor_excluido',
        'professores',
        professorId,
        { 
          students_transferred: activeStudents,
          transfer_to: transferToId 
        }
      );

      toast({
        title: 'Professor excluído',
        description: activeStudents > 0 
          ? `Professor excluído e ${activeStudents} alunos transferidos`
          : 'Professor excluído com sucesso',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting professor:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir o professor',
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const exportProfessores = () => {
    try {
      const csvData = professores
        .filter(prof => prof.status !== 'excluido' as any)
        .map(prof => ({
          Nome: prof.nome,
          Email: prof.email,
          Telefone: prof.telefone || 'N/A',
          Plano: prof.plano || 'Básico',
          Status: prof.status || 'Ativo',
          'Limite Alunos': prof.limite_alunos || 20,
          'Data Criação': new Date(prof.created_at).toLocaleDateString('pt-BR'),
          'Último Acesso': (prof as any).ultimo_acesso 
            ? new Date((prof as any).ultimo_acesso).toLocaleDateString('pt-BR')
            : 'Nunca'
        }));

      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `professores_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast({
        title: 'Exportação concluída',
        description: `${csvData.length} professores exportados para CSV`,
      });

      // Log audit
      logAction(
        'professores_exportados',
        'professores',
        undefined,
        { total_exported: csvData.length }
      );

    } catch (error: any) {
      console.error('Error exporting professors:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar os dados',
        variant: 'destructive'
      });
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
    updateProfessor,
    deleteProfessor,
    exportProfessores,
    inviteProfessor,
    resetProfessorPassword,
    refreshStats: fetchStats,
    refreshProfessores: fetchProfessores,
  };
}