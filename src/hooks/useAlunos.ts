import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  mensalidade: number;
  duracaoAula: 30 | 50;
  observacoes?: string;
  status: "ativo" | "inativo" | "pendente";
  dataCadastro: string;
  tipoCobranca?: "mensal" | "aula_unica";
  professor_id?: string;
}

export function useAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadAlunos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao carregar alunos:', error);
        toast({
          title: "Erro ao carregar alunos",
          description: "Verifique sua conexão e tente novamente.",
          variant: "destructive"
        });
        return;
      }

      const alunosFormatados = data?.map(aluno => ({
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email || '',
        telefone: aluno.telefone,
        cidade: aluno.endereco ? aluno.endereco.split(',')[0] : undefined,
        estado: aluno.endereco ? aluno.endereco.split(',')[1] : undefined,
        pais: aluno.endereco ? aluno.endereco.split(',')[2] : undefined,
        mensalidade: Number(aluno.valor_mensalidade) || 0,
        duracaoAula: (aluno.duracao_aula as 30 | 50) || 50,
        observacoes: aluno.observacoes,
        status: (aluno.ativo ? "ativo" : "inativo") as "ativo" | "inativo" | "pendente",
        dataCadastro: new Date(aluno.created_at).toISOString().split('T')[0],
        tipoCobranca: (aluno.tipo_cobranca as "mensal" | "aula_unica") || "mensal",
        professor_id: aluno.professor_id
      })) || [];

      setAlunos(alunosFormatados);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      toast({
        title: "Erro ao carregar alunos",
        description: "Erro interno da aplicação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAluno = async (novoAluno: Omit<Aluno, "id" | "dataCadastro">) => {
    try {
      // Primeiro, pegar o professor_id do usuário logado
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

      const { data, error } = await supabase
        .from('alunos')
        .insert([{
          nome: novoAluno.nome,
          email: novoAluno.email,
          telefone: novoAluno.telefone,
          endereco: [novoAluno.cidade, novoAluno.estado, novoAluno.pais].filter(Boolean).join(','),
          valor_mensalidade: novoAluno.mensalidade,
          duracao_aula: novoAluno.duracaoAula,
          observacoes: novoAluno.observacoes,
          tipo_cobranca: novoAluno.tipoCobranca || 'mensal',
          professor_id: professor.id,
          ativo: novoAluno.status === "ativo"
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar aluno:', error);
        toast({
          title: "Erro ao adicionar aluno",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Aluno adicionado com sucesso!"
      });

      // Gera automaticamente o pagamento do mês atual para alunos ativos
      try {
        await supabase.rpc('criar_pagamento_mensal');
        console.log('Pagamentos do mês atual verificados/criados');
      } catch (e) {
        console.warn('Falha ao criar pagamento mensal via RPC:', e);
      }

      await loadAlunos();
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      toast({
        title: "Erro ao adicionar aluno",
        description: "Erro interno da aplicação.",
        variant: "destructive"
      });
    }
  };

  const updateAluno = async (id: string, alunoAtualizado: Partial<Aluno>) => {
    try {
      const updateData: any = {};
      
      if (alunoAtualizado.nome) updateData.nome = alunoAtualizado.nome;
      if (alunoAtualizado.email) updateData.email = alunoAtualizado.email;
      if (alunoAtualizado.telefone !== undefined) updateData.telefone = alunoAtualizado.telefone;
      if (alunoAtualizado.cidade || alunoAtualizado.estado || alunoAtualizado.pais) {
        updateData.endereco = [alunoAtualizado.cidade, alunoAtualizado.estado, alunoAtualizado.pais].filter(Boolean).join(',');
      }
      if (alunoAtualizado.mensalidade) updateData.valor_mensalidade = alunoAtualizado.mensalidade;
      if (alunoAtualizado.duracaoAula) updateData.duracao_aula = alunoAtualizado.duracaoAula;
      if (alunoAtualizado.observacoes !== undefined) updateData.observacoes = alunoAtualizado.observacoes;
      if (alunoAtualizado.tipoCobranca) updateData.tipo_cobranca = alunoAtualizado.tipoCobranca;
      if (alunoAtualizado.status) updateData.ativo = alunoAtualizado.status === "ativo";

      const { error } = await supabase
        .from('alunos')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar aluno:', error);
        toast({
          title: "Erro ao atualizar aluno",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Aluno atualizado com sucesso!"
      });

      await loadAlunos();
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      toast({
        title: "Erro ao atualizar aluno",
        description: "Erro interno da aplicação.",
        variant: "destructive"
      });
    }
  };

  const deleteAluno = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alunos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar aluno:', error);
        toast({
          title: "Erro ao deletar aluno",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Aluno removido com sucesso!"
      });

      await loadAlunos();
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      toast({
        title: "Erro ao deletar aluno",
        description: "Erro interno da aplicação.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadAlunos();
  }, []);

  return {
    alunos,
    loading,
    addAluno,
    updateAluno,
    deleteAluno,
    refetch: loadAlunos
  };
}