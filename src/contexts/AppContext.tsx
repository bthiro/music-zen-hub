import { createContext, useContext, ReactNode } from "react";
import { useAlunos, type Aluno } from "@/hooks/useAlunos";
import { useAulas, type Aula } from "@/hooks/useAulas";
import { usePagamentos, type Pagamento } from "@/hooks/usePagamentos";

// Re-export interfaces for backward compatibility
export type { Aluno, Aula, Pagamento };

interface AppContextType {
  // Alunos
  alunos: Aluno[];
  addAluno: (aluno: Omit<Aluno, "id" | "dataCadastro">) => void;
  updateAluno: (id: string, aluno: Partial<Aluno>) => void;
  deleteAluno: (id: string) => void;
  
  // Pagamentos
  pagamentos: Pagamento[];
  marcarPagamento: (id: string, dataPagamento: string, formaPagamento?: string, metodoPagamento?: string) => void;
  addPagamento: (pagamento: Omit<Pagamento, "id">) => void;
  
  // Aulas
  aulas: Aula[];
  addAula: (aula: Omit<Aula, "id">) => void;
  updateAula: (id: string, aula: Partial<Aula>) => void;
  
  // Utility
  getAlunoById: (id: string) => Aluno | undefined;
  
  // Loading states
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const alunosHook = useAlunos();
  const aulasHook = useAulas();
  const pagamentosHook = usePagamentos();

  // Utility functions
  const getAlunoById = (id: string) => {
    return alunosHook.alunos.find(aluno => aluno.id === id);
  };

  const loading = alunosHook.loading || aulasHook.loading || pagamentosHook.loading;

  return (
    <AppContext.Provider value={{
      // Alunos
      alunos: alunosHook.alunos,
      addAluno: alunosHook.addAluno,
      updateAluno: alunosHook.updateAluno,
      deleteAluno: alunosHook.deleteAluno,
      
      // Pagamentos
      pagamentos: pagamentosHook.pagamentos,
      marcarPagamento: pagamentosHook.marcarPagamento,
      addPagamento: pagamentosHook.addPagamento,
      
      // Aulas
      aulas: aulasHook.aulas,
      addAula: aulasHook.addAula,
      updateAula: aulasHook.updateAula,
      
      // Utility
      getAlunoById,
      loading
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
