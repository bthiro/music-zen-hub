import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Interfaces mantidas iguais
export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  nivel?: string;
  instrumento?: string;
  valor_mensalidade?: number;
  mensalidade?: number; // Alias para compatibilidade
  dia_vencimento?: number;
  duracao_aula?: number;
  duracaoAula?: number; // Alias para compatibilidade
  tipo_cobranca?: string;
  tipoCobranca?: string; // Alias para compatibilidade
  observacoes?: string;
  status: "ativo" | "inativo" | "pendente";
  data_nascimento?: string;
  dataCadastro?: string; // Alias para compatibilidade
  responsavel_nome?: string;
  responsavel_telefone?: string;
  professor_id?: string;
}

export interface Pagamento {
  id: string;
  alunoId: string;
  aluno?: string;
  valor: number;
  dataVencimento: string;
  vencimento?: string; // Alias para compatibilidade
  dataPagamento?: string;
  pagamento?: string | null; // Alias para compatibilidade
  status: "pendente" | "pago" | "atrasado";
  formaPagamento?: string;
  metodoPagamento?: string;
  linkPagamento?: string;
  referencia?: string;
  descricao?: string;
  mes?: string; // Para compatibilidade
  professor_id?: string;
}

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

interface Professor {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone?: string;
  bio?: string;
  especialidades?: string;
  plano?: string;
  limite_alunos?: number;
}

interface AppContextType {
  // Auth
  professor: Professor | null;
  loading: boolean;
  
  // Alunos
  alunos: Aluno[];
  addAluno: (aluno: Omit<Aluno, "id">) => Promise<void>;
  updateAluno: (id: string, aluno: Partial<Aluno>) => Promise<void>;
  deleteAluno: (id: string) => Promise<void>;
  
  // Pagamentos
  pagamentos: Pagamento[];
  marcarPagamento: (id: string, dataPagamento: string, formaPagamento?: string, metodoPagamento?: string) => Promise<void>;
  addPagamento: (pagamento: Omit<Pagamento, "id">) => Promise<void>;
  
  // Aulas
  aulas: Aula[];
  addAula: (aula: Omit<Aula, "id">) => Promise<void>;
  updateAula: (id: string, aula: Partial<Aula>) => Promise<void>;
  
  // Utility
  getAlunoById: (id: string) => Aluno | undefined;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Inicializar dados quando professor logar
  useEffect(() => {
    const initializeData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadProfessorData();
        await loadAllData();
      }
      setLoading(false);
    };

    initializeData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await loadProfessorData();
          await loadAllData();
        } else if (event === 'SIGNED_OUT') {
          setProfessor(null);
          setAlunos([]);
          setPagamentos([]);
          setAulas([]);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfessorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: professorData, error } = await supabase
        .from('professores')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao carregar professor:', error);
        return;
      }

      if (professorData) {
        setProfessor(professorData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do professor:', error);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadAlunos(),
      loadPagamentos(),
      loadAulas()
    ]);
  };

  const loadAlunos = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .order('nome');

      if (error) throw error;

      const formattedAlunos = data?.map(aluno => ({
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email || '',
        telefone: aluno.telefone,
        endereco: aluno.endereco,
        nivel: aluno.nivel,
        instrumento: aluno.instrumento,
        valor_mensalidade: aluno.valor_mensalidade,
        dia_vencimento: aluno.dia_vencimento,
        duracao_aula: aluno.duracao_aula || 50,
        tipo_cobranca: aluno.tipo_cobranca,
        observacoes: aluno.observacoes,
        status: aluno.ativo ? "ativo" : "inativo" as "ativo" | "inativo",
        data_nascimento: aluno.data_nascimento,
        responsavel_nome: aluno.responsavel_nome,
        responsavel_telefone: aluno.responsavel_telefone,
        professor_id: aluno.professor_id
      })) || [];

      setAlunos(formattedAlunos);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    }
  };

  const loadPagamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          alunos!inner(nome)
        `)
        .order('data_vencimento', { ascending: false });

      if (error) throw error;

      const formattedPagamentos = data?.map(pagamento => ({
        id: pagamento.id,
        alunoId: pagamento.aluno_id,
        aluno: pagamento.alunos?.nome,
        valor: Number(pagamento.valor),
        dataVencimento: pagamento.data_vencimento,
        dataPagamento: pagamento.data_pagamento,
        status: pagamento.status as "pendente" | "pago" | "atrasado",
        formaPagamento: pagamento.forma_pagamento,
        metodoPagamento: pagamento.tipo_pagamento,
        linkPagamento: pagamento.link_pagamento,
        referencia: pagamento.referencia_externa,
        descricao: pagamento.descricao,
        professor_id: pagamento.professor_id
      })) || [];

      setPagamentos(formattedPagamentos);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    }
  };

  const loadAulas = async () => {
    try {
      const { data, error } = await supabase
        .from('aulas')
        .select(`
          *,
          alunos!inner(nome)
        `)
        .order('data_hora', { ascending: false });

      if (error) throw error;

      const formattedAulas = data?.map(aula => {
        const dataHora = new Date(aula.data_hora);
        return {
          id: aula.id,
          alunoId: aula.aluno_id,
          aluno: aula.alunos?.nome || '',
          data: dataHora.toISOString().split('T')[0],
          horario: dataHora.toTimeString().slice(0, 5),
          duracaoMinutos: aula.duracao_minutos,
          status: aula.status as "agendada" | "realizada" | "cancelada",
          linkMeet: aula.link_meet,
          observacoes: aula.tema,
          observacoesAula: aula.feedback,
          materiaisPdf: aula.materiais ? JSON.parse(aula.materiais as string) : [],
          professor_id: aula.professor_id
        };
      }) || [];

      setAulas(formattedAulas);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
    }
  };

  // Funções para alunos
  const addAluno = async (novoAluno: Omit<Aluno, "id">) => {
    try {
      if (!professor) throw new Error('Professor não encontrado');

      const { data, error } = await supabase
        .from('alunos')
        .insert({
          nome: novoAluno.nome,
          email: novoAluno.email,
          telefone: novoAluno.telefone,
          endereco: novoAluno.endereco,
          nivel: novoAluno.nivel,
          instrumento: novoAluno.instrumento,
          valor_mensalidade: novoAluno.valor_mensalidade,
          dia_vencimento: novoAluno.dia_vencimento,
          duracao_aula: novoAluno.duracao_aula,
          tipo_cobranca: novoAluno.tipo_cobranca,
          observacoes: novoAluno.observacoes,
          ativo: novoAluno.status === "ativo",
          data_nascimento: novoAluno.data_nascimento,
          responsavel_nome: novoAluno.responsavel_nome,
          responsavel_telefone: novoAluno.responsavel_telefone,
          professor_id: professor.id
        })
        .select()
        .single();

      if (error) throw error;

      await loadAlunos(); // Recarregar lista
      toast({
        title: 'Sucesso',
        description: 'Aluno adicionado com sucesso!'
      });
    } catch (error: any) {
      console.error('Erro ao adicionar aluno:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateAluno = async (id: string, alunoAtualizado: Partial<Aluno>) => {
    try {
      const { error } = await supabase
        .from('alunos')
        .update({
          nome: alunoAtualizado.nome,
          email: alunoAtualizado.email,
          telefone: alunoAtualizado.telefone,
          endereco: alunoAtualizado.endereco,
          nivel: alunoAtualizado.nivel,
          instrumento: alunoAtualizado.instrumento,
          valor_mensalidade: alunoAtualizado.valor_mensalidade,
          dia_vencimento: alunoAtualizado.dia_vencimento,
          duracao_aula: alunoAtualizado.duracao_aula,
          tipo_cobranca: alunoAtualizado.tipo_cobranca,
          observacoes: alunoAtualizado.observacoes,
          ativo: alunoAtualizado.status === "ativo",
          data_nascimento: alunoAtualizado.data_nascimento,
          responsavel_nome: alunoAtualizado.responsavel_nome,
          responsavel_telefone: alunoAtualizado.responsavel_telefone
        })
        .eq('id', id);

      if (error) throw error;

      await loadAlunos(); // Recarregar lista
      toast({
        title: 'Sucesso',
        description: 'Aluno atualizado com sucesso!'
      });
    } catch (error: any) {
      console.error('Erro ao atualizar aluno:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteAluno = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadAlunos(); // Recarregar lista
      toast({
        title: 'Sucesso',
        description: 'Aluno removido com sucesso!'
      });
    } catch (error: any) {
      console.error('Erro ao deletar aluno:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Funções para pagamentos
  const marcarPagamento = async (id: string, dataPagamento: string, formaPagamento?: string, metodoPagamento?: string) => {
    try {
      const { error } = await supabase
        .from('pagamentos')
        .update({
          data_pagamento: dataPagamento,
          forma_pagamento: formaPagamento,
          tipo_pagamento: metodoPagamento,
          status: 'pago'
        })
        .eq('id', id);

      if (error) throw error;

      await loadPagamentos(); // Recarregar lista
      toast({
        title: 'Sucesso',
        description: 'Pagamento marcado como pago!'
      });
    } catch (error: any) {
      console.error('Erro ao marcar pagamento:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const addPagamento = async (novoPagamento: Omit<Pagamento, "id">) => {
    try {
      if (!professor) throw new Error('Professor não encontrado');

      const { error } = await supabase
        .from('pagamentos')
        .insert({
          aluno_id: novoPagamento.alunoId,
          valor: novoPagamento.valor,
          data_vencimento: novoPagamento.dataVencimento,
          data_pagamento: novoPagamento.dataPagamento,
          status: novoPagamento.status,
          forma_pagamento: novoPagamento.formaPagamento,
          tipo_pagamento: novoPagamento.metodoPagamento,
          link_pagamento: novoPagamento.linkPagamento,
          referencia_externa: novoPagamento.referencia,
          descricao: novoPagamento.descricao,
          professor_id: professor.id
        });

      if (error) throw error;

      await loadPagamentos(); // Recarregar lista
      toast({
        title: 'Sucesso',
        description: 'Pagamento adicionado com sucesso!'
      });
    } catch (error: any) {
      console.error('Erro ao adicionar pagamento:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Funções para aulas
  const addAula = async (novaAula: Omit<Aula, "id">) => {
    try {
      if (!professor) throw new Error('Professor não encontrado');

      const dataHora = new Date(`${novaAula.data}T${novaAula.horario}:00`);

      const { error } = await supabase
        .from('aulas')
        .insert({
          aluno_id: novaAula.alunoId,
          professor_id: professor.id,
          data_hora: dataHora.toISOString(),
          duracao_minutos: novaAula.duracaoMinutos || 50,
          status: novaAula.status,
          link_meet: novaAula.linkMeet,
          tema: novaAula.observacoes,
          feedback: novaAula.observacoesAula,
          materiais: JSON.stringify(novaAula.materiaisPdf || [])
        });

      if (error) throw error;

      await loadAulas(); // Recarregar lista
      toast({
        title: 'Sucesso',
        description: 'Aula agendada com sucesso!'
      });
    } catch (error: any) {
      console.error('Erro ao adicionar aula:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const updateAula = async (id: string, aulaAtualizada: Partial<Aula>) => {
    try {
      const updateData: any = {};

      if (aulaAtualizada.data && aulaAtualizada.horario) {
        const dataHora = new Date(`${aulaAtualizada.data}T${aulaAtualizada.horario}:00`);
        updateData.data_hora = dataHora.toISOString();
      }

      if (aulaAtualizada.duracaoMinutos !== undefined) updateData.duracao_minutos = aulaAtualizada.duracaoMinutos;
      if (aulaAtualizada.status !== undefined) updateData.status = aulaAtualizada.status;
      if (aulaAtualizada.linkMeet !== undefined) updateData.link_meet = aulaAtualizada.linkMeet;
      if (aulaAtualizada.observacoes !== undefined) updateData.tema = aulaAtualizada.observacoes;
      if (aulaAtualizada.observacoesAula !== undefined) updateData.feedback = aulaAtualizada.observacoesAula;
      if (aulaAtualizada.materiaisPdf !== undefined) updateData.materiais = JSON.stringify(aulaAtualizada.materiaisPdf);

      const { error } = await supabase
        .from('aulas')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await loadAulas(); // Recarregar lista
    } catch (error: any) {
      console.error('Erro ao atualizar aula:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Utility functions
  const getAlunoById = (id: string) => {
    return alunos.find(aluno => aluno.id === id);
  };

  const refreshData = async () => {
    setLoading(true);
    await loadAllData();
    setLoading(false);
  };

  return (
    <AppContext.Provider value={{
      professor,
      loading,
      alunos,
      addAluno,
      updateAluno,
      deleteAluno,
      pagamentos,
      marcarPagamento,
      addPagamento,
      aulas,
      addAula,
      updateAula,
      getAlunoById,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}