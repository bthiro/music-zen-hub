import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useSupabaseData() {
  const { professor } = useAuth();
  const [alunos, setAlunos] = useState<any[]>([]);
  const [aulas, setAulas] = useState<any[]>([]);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!professor?.id) return;
    
    setLoading(true);
    try {
      // Buscar alunos
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select('*')
        .eq('professor_id', professor.id)
        .order('nome');

      if (alunosError) throw alunosError;

      // Buscar aulas com dados do aluno
      const { data: aulasData, error: aulasError } = await supabase
        .from('aulas')
        .select(`
          *,
          aluno:alunos(id, nome, instrumento)
        `)
        .eq('professor_id', professor.id)
        .order('data_hora', { ascending: false });

      if (aulasError) throw aulasError;

      // Buscar pagamentos com dados do aluno
      const { data: pagamentosData, error: pagamentosError } = await supabase
        .from('pagamentos')
        .select(`
          *,
          aluno:alunos(id, nome)
        `)
        .eq('professor_id', professor.id)
        .order('data_vencimento', { ascending: false });

      if (pagamentosError) throw pagamentosError;

      setAlunos(alunosData || []);
      setAulas(aulasData || []);
      setPagamentos(pagamentosData || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (professor?.id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [professor?.id]);

  // Funções CRUD para alunos
  const adicionarAluno = async (dadosAluno: any) => {
    if (!professor?.id) return { error: 'Professor não encontrado' };

    const { data, error } = await supabase
      .from('alunos')
      .insert([{ ...dadosAluno, professor_id: professor.id }])
      .select()
      .single();

    if (!error) {
      await fetchData();
    }
    return { data, error };
  };

  const atualizarAluno = async (id: string, dadosAluno: any) => {
    const { data, error } = await supabase
      .from('alunos')
      .update(dadosAluno)
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      await fetchData();
    }
    return { data, error };
  };

  const removerAluno = async (id: string) => {
    const { error } = await supabase
      .from('alunos')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchData();
    }
    return { error };
  };

  // Funções CRUD para aulas
  const adicionarAula = async (dadosAula: any) => {
    if (!professor?.id) return { error: 'Professor não encontrado' };

    // Validar se todos os campos obrigatórios estão presentes
    if (!dadosAula.aluno_id || !dadosAula.data_hora) {
      return { error: 'Campos obrigatórios não preenchidos' };
    }

    // Se a data da aula for futura, definir status como 'agendada'
    const aulaData = new Date(dadosAula.data_hora);
    const hoje = new Date();
    
    const aulaComStatus = {
      ...dadosAula,
      professor_id: professor.id,
      status: aulaData > hoje ? 'agendada' : (dadosAula.status || 'agendada')
    };

    const { data, error } = await supabase
      .from('aulas')
      .insert([aulaComStatus])
      .select()
      .single();

    if (!error) {
      await fetchData();
    }
    return { data, error };
  };

  const atualizarAula = async (id: string, dadosAula: any) => {
    // Se a data da aula for futura, manter status como 'agendada' ou 'reagendada'
    const aulaData = new Date(dadosAula.data_hora);
    const hoje = new Date();
    
    let updatedData = { ...dadosAula };
    
    if (aulaData > hoje && !updatedData.status) {
      updatedData.status = 'agendada';
    } else if (aulaData > hoje && updatedData.status === 'concluida') {
      updatedData.status = 'agendada';
    }

    const { data, error } = await supabase
      .from('aulas')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      await fetchData();
    }
    return { data, error };
  };

  const removerAula = async (id: string) => {
    const { error } = await supabase
      .from('aulas')
      .delete()
      .eq('id', id);

    if (!error) {
      await fetchData();
    }
    return { error };
  };

  // Funções CRUD para pagamentos
  const adicionarPagamento = async (dadosPagamento: any) => {
    if (!professor?.id) return { error: 'Professor não encontrado' };

    const { data, error } = await supabase
      .from('pagamentos')
      .insert([{ ...dadosPagamento, professor_id: professor.id }])
      .select()
      .single();

    if (!error) {
      await fetchData();
    }
    return { data, error };
  };

  const atualizarPagamento = async (id: string, dadosPagamento: any) => {
    const { data, error } = await supabase
      .from('pagamentos')
      .update(dadosPagamento)
      .eq('id', id)
      .select()
      .single();

    if (!error) {
      await fetchData();
    }
    return { data, error };
  };

  return {
    // Data
    alunos,
    aulas,
    pagamentos,
    loading,
    error,
    
    // Actions
    refetch: fetchData,
    
    // Alunos
    adicionarAluno,
    atualizarAluno,
    removerAluno,
    
    // Aulas
    adicionarAula,
    atualizarAula,
    removerAula,
    
    // Pagamentos
    adicionarPagamento,
    atualizarPagamento,
  };
}