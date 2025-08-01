import { createContext, useContext, useState, ReactNode } from "react";

// Interfaces
export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  mensalidade: number;
  observacoes?: string;
  status: "ativo" | "inativo" | "pendente";
  dataCadastro: string;
}

export interface Pagamento {
  id: string;
  alunoId: string;
  aluno: string;
  valor: number;
  vencimento: string;
  pagamento: string | null;
  status: "pago" | "pendente" | "atrasado";
  mes: string;
}

export interface Aula {
  id: string;
  alunoId: string;
  aluno: string;
  data: string;
  horario: string;
  status: "agendada" | "realizada" | "cancelada";
  linkMeet?: string;
  observacoes?: string;
  observacoesAula?: string;
  materiaisPdf?: string[];
}

interface AppContextType {
  // Alunos
  alunos: Aluno[];
  addAluno: (aluno: Omit<Aluno, "id" | "dataCadastro">) => void;
  updateAluno: (id: string, aluno: Partial<Aluno>) => void;
  deleteAluno: (id: string) => void;
  
  // Pagamentos
  pagamentos: Pagamento[];
  marcarPagamento: (id: string, dataPagamento: string) => void;
  
  // Aulas
  aulas: Aula[];
  addAula: (aula: Omit<Aula, "id">) => void;
  updateAula: (id: string, aula: Partial<Aula>) => void;
  
  // Utility
  getAlunoById: (id: string) => Aluno | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Dados iniciais
const alunosIniciais: Aluno[] = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao@email.com",
    telefone: "(11) 99999-9999",
    mensalidade: 200,
    status: "ativo",
    dataCadastro: "2024-01-15",
    observacoes: "Prefere aulas de manhã"
  },
  {
    id: "2",
    nome: "Maria Santos",
    email: "maria@email.com",
    telefone: "(11) 88888-8888",
    mensalidade: 180,
    status: "ativo",
    dataCadastro: "2024-01-10",
    observacoes: "Iniciante, muito dedicada"
  },
  {
    id: "3",
    nome: "Pedro Costa",
    email: "pedro@email.com",
    telefone: "(11) 77777-7777",
    mensalidade: 220,
    status: "pendente",
    dataCadastro: "2024-01-05",
    observacoes: "Falta há 2 semanas"
  }
];

const pagamentosIniciais: Pagamento[] = [
  {
    id: "1",
    alunoId: "1",
    aluno: "João Silva",
    valor: 200,
    vencimento: "2024-02-01",
    pagamento: "2024-01-30",
    status: "pago",
    mes: "Fevereiro 2024"
  },
  {
    id: "2",
    alunoId: "2",
    aluno: "Maria Santos",
    valor: 180,
    vencimento: "2024-02-01",
    pagamento: null,
    status: "pendente",
    mes: "Fevereiro 2024"
  },
  {
    id: "3",
    alunoId: "3",
    aluno: "Pedro Costa",
    valor: 220,
    vencimento: "2024-01-01",
    pagamento: null,
    status: "atrasado",
    mes: "Janeiro 2024"
  }
];

const aulasIniciais: Aula[] = [
  {
    id: "1",
    alunoId: "1",
    aluno: "João Silva",
    data: "2024-02-05",
    horario: "14:00",
    status: "realizada",
    linkMeet: "https://meet.google.com/abc-defg-hij",
    observacoesAula: "Aula muito produtiva! João está progredindo bem nos acordes básicos. Revisamos Dó maior e Sol maior, e começamos a praticar as transições entre eles.",
    materiaisPdf: ["Exercícios de Acordes Básicos.pdf", "Partitura - Imagine - John Lennon.pdf"]
  },
  {
    id: "2",
    alunoId: "2",
    aluno: "Maria Santos",
    data: "2024-02-05",
    horario: "15:30",
    status: "agendada",
    linkMeet: "https://meet.google.com/xyz-1234-567"
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [alunos, setAlunos] = useState<Aluno[]>(alunosIniciais);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>(pagamentosIniciais);
  const [aulas, setAulas] = useState<Aula[]>(aulasIniciais);

  // Funções para alunos
  const addAluno = (novoAluno: Omit<Aluno, "id" | "dataCadastro">) => {
    const aluno: Aluno = {
      ...novoAluno,
      id: Date.now().toString(),
      dataCadastro: new Date().toISOString().split('T')[0]
    };
    setAlunos(prev => [...prev, aluno]);
    
    // Criar pagamento para o mês atual
    const hoje = new Date();
    const proximoVencimento = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 5);
    
    const novoPagamento: Pagamento = {
      id: Date.now().toString() + "_pag",
      alunoId: aluno.id,
      aluno: aluno.nome,
      valor: aluno.mensalidade,
      vencimento: proximoVencimento.toISOString().split('T')[0],
      pagamento: null,
      status: "pendente",
      mes: `${proximoVencimento.toLocaleString('pt-BR', { month: 'long' })} ${proximoVencimento.getFullYear()}`
    };
    
    setPagamentos(prev => [...prev, novoPagamento]);
  };

  const updateAluno = (id: string, alunoAtualizado: Partial<Aluno>) => {
    setAlunos(prev => prev.map(aluno => 
      aluno.id === id ? { ...aluno, ...alunoAtualizado } : aluno
    ));
  };

  const deleteAluno = (id: string) => {
    setAlunos(prev => prev.filter(aluno => aluno.id !== id));
    setPagamentos(prev => prev.filter(pagamento => pagamento.alunoId !== id));
    setAulas(prev => prev.filter(aula => aula.alunoId !== id));
  };

  // Funções para pagamentos
  const marcarPagamento = (id: string, dataPagamento: string) => {
    setPagamentos(prev => prev.map(pagamento => 
      pagamento.id === id 
        ? { ...pagamento, pagamento: dataPagamento, status: "pago" as const }
        : pagamento
    ));
  };

  // Funções para aulas
  const addAula = (novaAula: Omit<Aula, "id">) => {
    const aula: Aula = {
      ...novaAula,
      id: Date.now().toString()
    };
    setAulas(prev => [...prev, aula]);
  };

  const updateAula = (id: string, aulaAtualizada: Partial<Aula>) => {
    setAulas(prev => prev.map(aula => 
      aula.id === id ? { ...aula, ...aulaAtualizada } : aula
    ));
  };

  // Utility functions
  const getAlunoById = (id: string) => {
    return alunos.find(aluno => aluno.id === id);
  };

  return (
    <AppContext.Provider value={{
      alunos,
      addAluno,
      updateAluno,
      deleteAluno,
      pagamentos,
      marcarPagamento,
      aulas,
      addAula,
      updateAula,
      getAlunoById
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
