import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Aula {
  id: string;
  alunoId: string;
  aluno: string;
  data: string;
  horario: string;
  horarioFim?: string;
  duracaoMinutos?: number;
  status: "agendada" | "realizada" | "cancelada";
  linkMeet?: string;
  observacoes?: string;
  observacoesAula?: string;
  materiaisPdf?: string[];
  professor_id?: string;
}

export function useAulas() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadAulas = async () => {
    try {
      console.log('[Aulas] loadAulas called at', new Date().toISOString());
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[Aulas] No user session. Skipping fetch.');
        setLoading(false);
        return;
      }

      // Check role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!roleData?.role || roleData.role !== 'professor') {
        console.log('[Aulas] User role is not professor. Skipping fetch.');
        setLoading(false);
        return;
      }

      // Check professor status
      const { data: profile } = await supabase
        .from('professores')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile || profile.status !== 'ativo') {
        console.log('[Aulas] Professor status is not ativo. Skipping fetch.');
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('aulas')
        .select(`
          *,
          alunos!inner(nome)
        `)
        .order('data_hora', { ascending: false });

      if (error) {
        console.error('Erro ao carregar aulas:', error);
        toast({
          title: "Erro ao carregar aulas",
          description: "Verifique sua conexão e tente novamente.",
          variant: "destructive"
        });
        return;
      }

      const aulasFormatadas = data?.map(aula => {
        const dataHora = new Date(aula.data_hora);
        const materiaisParsed = typeof aula.materiais === 'string' 
          ? JSON.parse(aula.materiais || '[]') 
          : aula.materiais || [];

        return {
          id: aula.id,
          alunoId: aula.aluno_id,
          aluno: aula.alunos?.nome || '',
          data: dataHora.toISOString().split('T')[0],
          horario: dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          duracaoMinutos: aula.duracao_minutos || 50,
          status: aula.status as "agendada" | "realizada" | "cancelada",
          linkMeet: aula.link_meet,
          observacoes: aula.tema,
          observacoesAula: aula.feedback,
          materiaisPdf: Array.isArray(materiaisParsed) ? materiaisParsed : [],
          professor_id: aula.professor_id
        };
      }) || [];

      setAulas(aulasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
      toast({
        title: "Erro ao carregar aulas",
        description: "Erro interno da aplicação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAula = async (novaAula: Omit<Aula, "id">) => {
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

      const dataHoraCompleta = new Date(`${novaAula.data}T${novaAula.horario}`);

      const { error } = await supabase
        .from('aulas')
        .insert([{
          aluno_id: novaAula.alunoId,
          professor_id: professor.id,
          data_hora: dataHoraCompleta.toISOString(),
          duracao_minutos: novaAula.duracaoMinutos || 50,
          status: novaAula.status || 'agendada',
          link_meet: novaAula.linkMeet,
          tema: novaAula.observacoes,
          materiais: JSON.stringify(novaAula.materiaisPdf || [])
        }]);

      if (error) {
        console.error('Erro ao adicionar aula:', error);
        toast({
          title: "Erro ao adicionar aula",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Aula agendada com sucesso!"
      });

      await loadAulas();
    } catch (error) {
      console.error('Erro ao adicionar aula:', error);
      toast({
        title: "Erro ao adicionar aula",
        description: "Erro interno da aplicação.",
        variant: "destructive"
      });
    }
  };

  const updateAula = async (id: string, aulaAtualizada: Partial<Aula>) => {
    try {
      const updateData: any = {};
      
      if (aulaAtualizada.data && aulaAtualizada.horario) {
        const dataHoraCompleta = new Date(`${aulaAtualizada.data}T${aulaAtualizada.horario}`);
        updateData.data_hora = dataHoraCompleta.toISOString();
      }
      
      if (aulaAtualizada.duracaoMinutos) updateData.duracao_minutos = aulaAtualizada.duracaoMinutos;
      if (aulaAtualizada.status) updateData.status = aulaAtualizada.status;
      if (aulaAtualizada.linkMeet !== undefined) updateData.link_meet = aulaAtualizada.linkMeet;
      if (aulaAtualizada.observacoes !== undefined) updateData.tema = aulaAtualizada.observacoes;
      if (aulaAtualizada.observacoesAula !== undefined) updateData.feedback = aulaAtualizada.observacoesAula;
      if (aulaAtualizada.materiaisPdf !== undefined) {
        updateData.materiais = JSON.stringify(aulaAtualizada.materiaisPdf);
      }

      const { error } = await supabase
        .from('aulas')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar aula:', error);
        toast({
          title: "Erro ao atualizar aula",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      await loadAulas();
    } catch (error) {
      console.error('Erro ao atualizar aula:', error);
      toast({
        title: "Erro ao atualizar aula",
        description: "Erro interno da aplicação.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadAulas();
  }, []);

  return {
    aulas,
    loading,
    addAula,
    updateAula,
    refetch: loadAulas
  };
}